import base64
import io
import json
import os
import unittest
from unittest.mock import patch

import cms_backend


class FakeHandler:
    def __init__(self, headers=None, body=None):
        body = body or b""
        self.headers = {
            "Host": "portfolio.example",
            "Content-Length": str(len(body)),
            **(headers or {}),
        }
        self.rfile = io.BytesIO(body)
        self.wfile = io.BytesIO()
        self.status = None
        self.response_headers = {}

    def send_response(self, status):
        self.status = status

    def send_header(self, name, value):
        self.response_headers[name] = value

    def end_headers(self):
        pass

    def payload(self):
        return json.loads(self.wfile.getvalue())


class CmsBackendTests(unittest.TestCase):
    def setUp(self):
        self.environment = patch.dict(
            os.environ,
            {
                "CMS_EMAIL": "owner@example.com",
                "CMS_PASSWORD": "test-only-password-123",
                "CMS_SESSION_SECRET": "test-session-secret-" * 3,
                "GITHUB_TOKEN": "test-token",
            },
            clear=True,
        )
        self.environment.start()
        self.addCleanup(self.environment.stop)

    def login_handler(self, email="owner@example.com", password="test-only-password-123"):
        body = json.dumps({"email": email, "password": password}).encode("utf-8")
        return FakeHandler(
            {
                "Origin": "https://portfolio.example",
                "Content-Type": "application/json",
            },
            body,
        )

    def test_login_sets_http_only_signed_session_cookie(self):
        login = self.login_handler()
        cms_backend.handle_login(login)

        self.assertEqual(login.status, 200)
        cookie = login.response_headers["Set-Cookie"]
        self.assertIn("HttpOnly", cookie)
        self.assertIn("SameSite=Strict", cookie)
        self.assertIn("Secure", cookie)

        session = FakeHandler({"Cookie": cookie.split(";", 1)[0]})
        cms_backend.handle_session(session)
        self.assertEqual(session.status, 200)

    def test_login_rejects_cross_origin_and_invalid_credentials(self):
        cross_origin = self.login_handler()
        cross_origin.headers["Origin"] = "https://attacker.example"
        cms_backend.handle_login(cross_origin)
        self.assertEqual(cross_origin.status, 403)

        invalid = self.login_handler(password="not-the-password")
        cms_backend.handle_login(invalid)
        self.assertEqual(invalid.status, 401)

    def test_public_portfolio_does_not_expose_auth_data(self):
        response = FakeHandler()
        cms_backend.handle_portfolio_get(response)

        self.assertEqual(response.status, 200)
        self.assertNotIn("auth", response.payload())

    def test_portfolio_update_requires_signed_session(self):
        body = json.dumps({"personal": {"name": "Owner"}}).encode("utf-8")
        response = FakeHandler(
            {
                "Origin": "https://portfolio.example",
                "Content-Type": "application/json",
            },
            body,
        )
        cms_backend.handle_portfolio_post(response)
        self.assertEqual(response.status, 401)

    def test_authorized_update_commits_public_data_to_github(self):
        expiration = str(int(cms_backend.time.time()) + cms_backend.SESSION_LIFETIME)
        signature = cms_backend._session_signature(expiration)
        body = json.dumps(
            {"personal": {"name": "Updated owner"}, "auth": {"passwordHash": "discard"}}
        ).encode("utf-8")
        response = FakeHandler(
            {
                "Origin": "https://portfolio.example",
                "Cookie": f"{cms_backend.SESSION_COOKIE}={expiration}.{signature}",
                "Content-Type": "application/json",
            },
            body,
        )

        with patch.object(cms_backend, "_github_request", side_effect=[{"sha": "old"}, {}]) as request:
            cms_backend.handle_portfolio_post(response)

        self.assertEqual(response.status, 200)
        self.assertEqual(request.call_count, 2)
        committed = request.call_args_list[1].args[2]
        decoded = json.loads(base64.b64decode(committed["content"]))
        self.assertNotIn("auth", decoded)
        self.assertEqual(decoded["personal"]["name"], "Updated owner")


if __name__ == "__main__":
    unittest.main()
