#!/usr/bin/env python3
"""Loopback-only reference host. Python 3.10+, no third-party server packages."""
from __future__ import annotations

import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import mimetypes
import os
from pathlib import Path
import secrets
import signal
import socket
import sqlite3
import tempfile
from urllib.parse import unquote, urlsplit

from service import Denied, Host, fields, identifier

BASE = Path(__file__).resolve().parent
MAX_BODY = 16_384


def unique_pairs(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('Duplicate JSON key')
        result[key] = value
    return result


def reject_constant(_):
    raise ValueError('Non-JSON number')


class LocalServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True

    def __init__(self, host: Host, port: int, static_root: Path | None = None):
        self.host, self.static_root = host, (static_root or BASE / 'dist').resolve()
        super().__init__(('127.0.0.1', port), Handler)
        self.origin = f'http://127.0.0.1:{self.server_port}'


class Handler(BaseHTTPRequestHandler):
    server: LocalServer
    server_version = 'TUNLocalPilot'
    sys_version = ''

    def setup(self):
        super().setup()
        self.connection.settimeout(5)

    def log_message(self, *_):
        pass  # No credentials, content, or identifiers in access logs.

    def send(self, status: int, payload: bytes, content_type: str = 'application/json'):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'")
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(payload)

    def json(self, status: int, payload: object):
        self.send(status, json.dumps(payload, ensure_ascii=False, allow_nan=False).encode())

    def check_origin(self):
        # Prevent cross-origin browser calls and DNS rebinding of a local pilot.
        if self.headers.get('Host') != self.server.origin.removeprefix('http://'):
            raise Denied(403, 'Use the printed 127.0.0.1 origin.')
        if self.headers.get('Origin') not in (None, self.server.origin) or self.headers.get('Sec-Fetch-Site') == 'cross-site':
            raise Denied(403, 'Cross-origin access is not allowed.')

    def token(self) -> str:
        authorization = self.headers.get('Authorization', '')
        if not authorization.startswith('Bearer ') or len(authorization) > 256:
            raise Denied(401, 'A valid local access token is required.')
        return authorization[7:]

    def body(self) -> dict:
        if self.headers.get('Transfer-Encoding') is not None:
            raise Denied(400, 'Chunked requests are not supported by this local host.')
        if self.headers.get('Content-Type', '').split(';')[0].strip() != 'application/json':
            raise Denied(415, 'Use application/json.')
        lengths = self.headers.get_all('Content-Length', [])
        if len(lengths) != 1 or len(lengths[0]) > 10 or not lengths[0].isascii() or not lengths[0].isdigit():
            raise Denied(400, 'One valid Content-Length is required.')
        length = int(lengths[0])
        if length > MAX_BODY:
            raise Denied(413, 'Request exceeds the local pilot size limit.')
        raw = self.rfile.read(length)
        if len(raw) != length:
            raise Denied(400, 'Incomplete request body.')
        try:
            value = json.loads(raw.decode('utf-8'), object_pairs_hook=unique_pairs, parse_constant=reject_constant)
        except (ValueError, UnicodeError, RecursionError):
            raise Denied(400, 'Malformed JSON request.') from None
        if type(value) is not dict:
            raise Denied(400, 'The request must be an object.')
        return value

    def do_GET(self):
        self.dispatch()

    def do_POST(self):
        self.dispatch()

    def dispatch(self):
        try:
            self.check_origin()
            path = urlsplit(self.path).path
            if self.command == 'GET' and path == '/health':
                self.json(200, {'service': 'tun-local-host', 'ready': True})
                return
            if not path.startswith('/api/'):
                if self.command != 'GET':
                    raise Denied(405, 'Method not supported.')
                self.static(path)
                return
            token = self.token()
            # Authenticate before reading a body. Each domain command also checks
            # the principal inside its transaction, including at dispatch.
            self.server.host.snapshot(token)
            if self.command == 'GET':
                if path == '/api/snapshot':
                    self.json(200, self.server.host.snapshot(token))
                elif path == '/api/board':
                    session = self.server.host.snapshot(token)['session']
                    self.json(200, {'posts': self.server.host.provider.posts(session['tenant'])})
                else:
                    raise Denied(404, 'Route not found.')
                return
            data = self.body()
            host = self.server.host
            if path == '/api/proposals':
                self.json(201, host.create(token, data))
            elif path == '/api/decisions':
                self.json(200, host.decide(token, data))
            elif path == '/api/session/permission':
                host.permission(token, data)
                self.json(200, {'updated': True})
            else:
                parts = path.strip('/').split('/')
                if len(parts) != 4:
                    raise Denied(404, 'Route not found.')
                _, family, key, action = parts
                identifier(key)
                if family == 'proposals' and action == 'revise':
                    self.json(200, host.revise(token, key, data))
                elif family == 'operations' and action in ('execute', 'verify', 'cancel'):
                    if action == 'execute':
                        drop = host.execute(token, key, data)
                        if drop:
                            # Real transport loss AFTER a real sandbox database commit.
                            self.close_connection = True
                            self.connection.shutdown(socket.SHUT_RDWR)
                            self.connection.close()
                            return
                    else:
                        fields(data, set())
                        getattr(host, action)(token, key)
                    self.json(200, {'accepted': True})  # Not an execution receipt.
                else:
                    raise Denied(404, 'Route not found.')
        except Denied as error:
            self.json(error.status, {'error': error.message})
        except (BrokenPipeError, ConnectionResetError):
            return
        except (sqlite3.Error, OSError, ValueError, TypeError, OverflowError):
            self.json(503, {'error': 'The local service could not confirm this request. Inspect server records before retrying.'})

    def static(self, path: str):
        relative = 'index.html' if path == '/' else unquote(path).lstrip('/')
        target = (self.server.static_root / relative).resolve()
        if (relative != 'index.html' and not relative.startswith('assets/')) or not target.is_relative_to(self.server.static_root) or not target.is_file():
            raise Denied(404, 'Build the host UI and open the printed root URL.')
        self.send(200, target.read_bytes(), mimetypes.guess_type(target.name)[0] or 'application/octet-stream')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4180)
    parser.add_argument('--data-dir', type=Path, default=BASE / '.data')
    parser.add_argument('--ephemeral', action='store_true', help='Temporary data for isolated tests')
    parser.add_argument('--token-file', type=Path, help='Write local test tokens to a private, ignored file; never an artifact')
    parser.add_argument('--quiet', action='store_true')
    args = parser.parse_args()
    os.umask(0o077)
    temporary = tempfile.TemporaryDirectory(prefix='tun-host-') if args.ephemeral else None
    directory = Path(temporary.name) if temporary else args.data_dir
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    credentials = directory / 'local-access.json'
    if credentials.exists():
        tokens = json.loads(credentials.read_text())
    else:
        tokens = {'operator': secrets.token_urlsafe(32), 'reviewer': secrets.token_urlsafe(32)}
        credentials.write_text(json.dumps(tokens))
        credentials.chmod(0o600)
    host = Host(directory)
    host.provision('Local operator', 'pilot-tenant', tokens['operator'], True, True)
    host.provision('Read-only reviewer', 'pilot-tenant', tokens['reviewer'], False)
    if args.token_file:
        args.token_file.write_text(json.dumps(tokens))
        args.token_file.chmod(0o600)
    server = LocalServer(host, args.port)
    if not args.quiet:
        print(f'Local TUN pilot: {server.origin}\nOperator token: {tokens["operator"]}\nReviewer token: {tokens["reviewer"]}\nSandbox records: {directory.resolve()}\nKeep these tokens private. No external service is connected.', flush=True)
    def terminate(*_):
        raise KeyboardInterrupt
    signal.signal(signal.SIGTERM, terminate)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        if args.token_file:
            args.token_file.unlink(missing_ok=True)
        if temporary:
            temporary.cleanup()


if __name__ == '__main__':
    main()
