from http.server import BaseHTTPRequestHandler

from cms_backend import handle_logout


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        handle_logout(self)

