from http.server import BaseHTTPRequestHandler

from cms_backend import handle_portfolio_get, handle_portfolio_post


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        handle_portfolio_get(self)

    def do_POST(self):
        handle_portfolio_post(self)

