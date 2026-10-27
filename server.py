#!/usr/bin/env python3
"""Local preview server for the portfolio and its authenticated CMS API."""

import http.server
import socketserver
from pathlib import Path
from urllib.parse import urlsplit

from cms_backend import (
    handle_login,
    handle_logout,
    handle_portfolio_get,
    handle_portfolio_post,
    handle_session,
)

PORT = 8000


class PortfolioHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).resolve().parent), **kwargs)

    def do_GET(self):
        route = urlsplit(self.path).path
        if route == "/api/portfolio":
            return handle_portfolio_get(self)
        if route == "/api/auth/session":
            return handle_session(self)
        return super().do_GET()

    def do_POST(self):
        route = urlsplit(self.path).path
        if route == "/api/auth/login":
            return handle_login(self)
        if route == "/api/auth/logout":
            return handle_logout(self)
        if route == "/api/portfolio":
            return handle_portfolio_post(self)
        self.send_error(404)

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('', PORT), PortfolioHandler) as httpd:
        print(f"Portfolio Server running at http://localhost:{PORT}/ and http://127.0.0.1:{PORT}/")
        httpd.serve_forever()
