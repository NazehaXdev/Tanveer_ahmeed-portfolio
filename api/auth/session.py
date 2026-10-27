from http.server import BaseHTTPRequestHandler

from cms_backend import handle_session


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        handle_session(self)

