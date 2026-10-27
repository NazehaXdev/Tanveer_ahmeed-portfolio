from http.server import BaseHTTPRequestHandler

from cms_backend import handle_login


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        handle_login(self)

