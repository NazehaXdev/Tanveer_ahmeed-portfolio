import base64
import hmac
import json
import os
import time
import urllib.error
import urllib.request
from http.cookies import SimpleCookie
from pathlib import Path
from urllib.parse import urlsplit


ROOT_DIR = Path(__file__).resolve().parent
DATA_FILE = ROOT_DIR / "assets" / "data" / "portfolio_data.json"
GITHUB_API_URL = (
    "https://api.github.com/repos/NazehaXdev/"
    "Tanveer_ahmeed-portfolio/contents/assets/data/portfolio_data.json"
)
SESSION_COOKIE = "tanveer_cms_session"
SESSION_LIFETIME = 8 * 60 * 60
MAX_REQUEST_BYTES = 1_000_000


class RequestError(Exception):
    def __init__(self, status, message):
        super().__init__(message)
        self.status = status


def _send_json(handler, status, payload, headers=None):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Cache-Control", "no-store")
    handler.send_header("Content-Length", str(len(body)))
    for name, value in (headers or {}).items():
        handler.send_header(name, value)
    handler.end_headers()
    handler.wfile.write(body)


def _read_json(handler):
    try:
        content_length = int(handler.headers.get("Content-Length", "0"))
    except ValueError as exc:
        raise RequestError(400, "Invalid request size.") from exc

    if content_length <= 0 or content_length > MAX_REQUEST_BYTES:
        raise RequestError(413, "Request body is missing or too large.")

    try:
        payload = json.loads(handler.rfile.read(content_length))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise RequestError(400, "Request body must be valid JSON.") from exc

    if not isinstance(payload, dict):
        raise RequestError(400, "Request body must be a JSON object.")
    return payload


def _same_origin(handler):
    origin = handler.headers.get("Origin", "")
    host = handler.headers.get("X-Forwarded-Host") or handler.headers.get("Host", "")
    parsed = urlsplit(origin)
    return parsed.scheme in ("http", "https") and parsed.netloc.casefold() == host.casefold()


def _session_secret():
    secret = os.environ.get("CMS_SESSION_SECRET", "")
    if len(secret) < 32:
        raise RequestError(503, "CMS_SESSION_SECRET must be set to at least 32 characters.")
    return secret.encode("utf-8")


def _session_signature(expiration):
    return hmac.new(
        _session_secret(), expiration.encode("ascii"), digestmod="sha256"
    ).hexdigest()


def _has_session(handler):
    cookies = SimpleCookie()
    cookies.load(handler.headers.get("Cookie", ""))
    morsel = cookies.get(SESSION_COOKIE)
    if morsel is None:
        return False

    try:
        expiration, signature = morsel.value.split(".", 1)
        if int(expiration) <= int(time.time()):
            return False
        expected = _session_signature(expiration)
    except (ValueError, RequestError):
        return False

    return hmac.compare_digest(signature, expected)


def _cookie_header(handler, value, max_age):
    host = handler.headers.get("X-Forwarded-Host") or handler.headers.get("Host", "")
    hostname = urlsplit(f"//{host}").hostname
    secure = "" if hostname in ("localhost", "127.0.0.1") else "; Secure"
    return (
        f"{SESSION_COOKIE}={value}; Path=/; HttpOnly; SameSite=Strict; "
        f"Max-Age={max_age}{secure}"
    )


def _require_same_origin(handler):
    if not _same_origin(handler):
        raise RequestError(403, "Request origin is not allowed.")


def handle_login(handler):
    try:
        _require_same_origin(handler)
        payload = _read_json(handler)
        configured_email = os.environ.get("CMS_EMAIL", "").strip().casefold()
        configured_password = os.environ.get("CMS_PASSWORD", "")
        if not configured_email or len(configured_password) < 16:
            raise RequestError(
                503,
                "CMS_EMAIL and a CMS_PASSWORD of at least 16 characters must be configured.",
            )
        _session_secret()

        email = str(payload.get("email", "")).strip().casefold()
        password = str(payload.get("password", ""))
        email_valid = hmac.compare_digest(email, configured_email)
        password_valid = hmac.compare_digest(password, configured_password)
        if not (email_valid and password_valid):
            raise RequestError(401, "Invalid email or password.")

        expiration = str(int(time.time()) + SESSION_LIFETIME)
        session = f"{expiration}.{_session_signature(expiration)}"
        _send_json(
            handler,
            200,
            {"success": True},
            {"Set-Cookie": _cookie_header(handler, session, SESSION_LIFETIME)},
        )
    except RequestError as exc:
        _send_json(handler, exc.status, {"error": str(exc)})


def handle_logout(handler):
    try:
        _require_same_origin(handler)
        _send_json(
            handler,
            200,
            {"success": True},
            {"Set-Cookie": _cookie_header(handler, "", 0)},
        )
    except RequestError as exc:
        _send_json(handler, exc.status, {"error": str(exc)})


def handle_session(handler):
    if _has_session(handler):
        _send_json(handler, 200, {"authenticated": True})
    else:
        _send_json(handler, 401, {"authenticated": False})


def _public_data(data):
    if not isinstance(data, dict):
        raise RequestError(400, "Portfolio data must be a JSON object.")
    if not isinstance(data.get("personal"), dict):
        raise RequestError(400, "Portfolio data is missing personal details.")

    clean_data = dict(data)
    clean_data.pop("auth", None)
    return clean_data


def handle_portfolio_get(handler):
    try:
        with DATA_FILE.open("r", encoding="utf-8") as data_file:
            data = _public_data(json.load(data_file))
        _send_json(handler, 200, data)
    except FileNotFoundError:
        _send_json(handler, 404, {"error": "Portfolio data was not found."})
    except (OSError, json.JSONDecodeError) as exc:
        print(f"Portfolio data read failed: {exc}")
        _send_json(handler, 500, {"error": "Portfolio data could not be loaded."})
    except RequestError as exc:
        _send_json(handler, exc.status, {"error": str(exc)})


def _github_request(method, token, body=None):
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Tanveer-Portfolio-CMS",
    }
    encoded_body = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        encoded_body = json.dumps(body, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        GITHUB_API_URL, data=encoded_body, headers=headers, method=method
    )
    with urllib.request.urlopen(request, timeout=15) as response:
        return json.loads(response.read())


def handle_portfolio_post(handler):
    try:
        _require_same_origin(handler)
        if not _has_session(handler):
            raise RequestError(401, "Please sign in again to save changes.")
        data = _public_data(_read_json(handler))

        token = os.environ.get("GITHUB_TOKEN", "")
        if not token:
            raise RequestError(503, "GITHUB_TOKEN is not configured in Vercel.")

        current_file = _github_request("GET", token)
        content = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
        _github_request(
            "PUT",
            token,
            {
                "message": "Update portfolio content from admin CMS",
                "content": base64.b64encode(content.encode("utf-8")).decode("ascii"),
                "sha": current_file["sha"],
                "branch": "main",
            },
        )
        _send_json(
            handler,
            200,
            {
                "success": True,
                "serverSynced": True,
                "message": "Portfolio update committed. Vercel will redeploy it shortly.",
            },
        )
    except RequestError as exc:
        _send_json(handler, exc.status, {"error": str(exc)})
    except urllib.error.HTTPError as exc:
        if exc.code == 409:
            _send_json(
                handler,
                409,
                {"error": "Portfolio changed elsewhere. Reload the page and try again."},
            )
        elif exc.code in (401, 403):
            _send_json(
                handler,
                502,
                {"error": "GitHub rejected the configured token or repository permissions."},
            )
        else:
            print(f"GitHub portfolio update failed with status {exc.code}.")
            _send_json(handler, 502, {"error": "GitHub could not save the portfolio update."})
    except (urllib.error.URLError, TimeoutError, KeyError, json.JSONDecodeError) as exc:
        print(f"GitHub portfolio update failed: {exc}")
        _send_json(handler, 502, {"error": "GitHub could not save the portfolio update."})
