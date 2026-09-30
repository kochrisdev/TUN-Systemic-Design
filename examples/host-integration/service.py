"""Local TUN pilot: real authorization/ledger, deliberately local sandbox provider.

No model calls, arbitrary tool execution, or remote publication. The two SQLite
files commit independently so a provider effect can survive a lost host response.
"""
from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import sqlite3
import time
import uuid


class Denied(Exception):
    def __init__(self, status: int, message: str):
        self.status, self.message = status, message
        super().__init__(message)


def canonical(value: object) -> str:
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False, allow_nan=False)


def digest(value: str) -> str:
    return hashlib.sha256(value.encode('utf-8')).hexdigest()


def stamp(value: float | None = None) -> str:
    return datetime.fromtimestamp(time.time() if value is None else value, timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')


def fields(value: object, required: set[str], optional: set[str] = frozenset()) -> dict:
    if type(value) is not dict or not required <= value.keys() or value.keys() - required - optional:
        raise Denied(400, 'Unsupported or missing request fields.')
    return value


def text(value: object, maximum: int = 4000) -> str:
    if not isinstance(value, str) or not value.strip() or len(value) > maximum or '\x00' in value:
        raise Denied(400, 'A bounded, nonempty text value is required.')
    return value  # Never silently change the reviewed content.


def identifier(value: object) -> str:
    if not isinstance(value, str):
        raise Denied(400, 'Invalid identifier.')
    try:
        if str(uuid.UUID(value)) != value:
            raise ValueError()
    except ValueError:
        raise Denied(400, 'Invalid identifier.') from None
    return value


def version(value: object) -> int:
    if not isinstance(value, str) or not value.isascii() or not value.isdigit() or len(value) > 6 or str(int(value)) != value or int(value) < 1:
        raise Denied(400, 'Invalid proposal version.')
    return int(value)


@contextmanager
def database(path: Path, write: bool = False):
    connection = sqlite3.connect(path, timeout=5, isolation_level=None)
    connection.row_factory = sqlite3.Row
    try:
        connection.execute('PRAGMA foreign_keys=ON')
        connection.execute('BEGIN IMMEDIATE' if write else 'BEGIN')
        yield connection
        connection.commit()
    except BaseException:
        connection.rollback()
        raise
    finally:
        connection.close()


class SandboxBoard:
    """Local provider with durable idempotency and independently queried readback."""
    def __init__(self, path: Path):
        self.path = path
        with database(path, True) as db:
            db.execute('CREATE TABLE IF NOT EXISTS effects (operation_id TEXT PRIMARY KEY, tenant TEXT NOT NULL, payload TEXT NOT NULL, recorded_at TEXT NOT NULL)')
            db.execute('CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, tenant TEXT NOT NULL, content TEXT NOT NULL, active INTEGER NOT NULL)')

    def apply(self, operation_id: str, tenant: str, payload: dict) -> None:
        encoded = canonical(payload)
        with database(self.path, True) as db:
            previous = db.execute('SELECT * FROM effects WHERE operation_id=?', (operation_id,)).fetchone()
            if previous:
                if previous['tenant'] != tenant or previous['payload'] != encoded:
                    raise Denied(409, 'Provider operation identity conflicts with its parameters.')
                return
            if payload['kind'] == 'publish':
                db.execute('INSERT INTO posts VALUES (?,?,?,1)', (operation_id, tenant, payload['content']))
            else:
                original = db.execute('SELECT * FROM posts WHERE id=? AND tenant=?', (payload['target'], tenant)).fetchone()
                if not original or original['content'] != payload['content']:
                    raise Denied(409, 'Withdrawal target does not match the reviewed record.')
                db.execute('UPDATE posts SET active=0 WHERE id=? AND tenant=?', (payload['target'], tenant))
            db.execute('INSERT INTO effects VALUES (?,?,?,?)', (operation_id, tenant, encoded, stamp()))

    def observe(self, operation_id: str, tenant: str, expected: dict) -> dict | None:
        with database(self.path) as db:
            effect = db.execute('SELECT * FROM effects WHERE operation_id=? AND tenant=?', (operation_id, tenant)).fetchone()
            if not effect or effect['payload'] != canonical(expected):
                return None
            target = operation_id if expected['kind'] == 'publish' else expected['target']
            post = db.execute('SELECT * FROM posts WHERE id=? AND tenant=?', (target, tenant)).fetchone()
            if not post or post['content'] != expected['content']:
                return None
            if expected['kind'] == 'withdraw' and post['active']:
                return None
            return {'operationId': operation_id, 'recordedAt': effect['recorded_at'], 'readAt': stamp(), 'active': bool(post['active'])}

    def posts(self, tenant: str) -> list[dict]:
        with database(self.path) as db:
            return [dict(row) for row in db.execute('SELECT id,content,active FROM posts WHERE tenant=? ORDER BY rowid DESC LIMIT 100', (tenant,))]


class Host:
    def __init__(self, directory: Path):
        directory.mkdir(parents=True, exist_ok=True, mode=0o700)
        self.path = directory / 'host.sqlite3'
        self.provider = SandboxBoard(directory / 'sandbox-board.sqlite3')
        with database(self.path, True) as db:
            db.execute('CREATE TABLE IF NOT EXISTS principals (id TEXT PRIMARY KEY, tenant TEXT NOT NULL, name TEXT NOT NULL, token_hash TEXT UNIQUE NOT NULL, can_write INTEGER NOT NULL, can_admin INTEGER NOT NULL)')
            db.execute('CREATE TABLE IF NOT EXISTS proposals (id TEXT NOT NULL, version INTEGER NOT NULL, tenant TEXT NOT NULL, owner TEXT NOT NULL, payload TEXT NOT NULL, expires REAL NOT NULL, state TEXT NOT NULL, PRIMARY KEY(id,version))')
            db.execute('CREATE TABLE IF NOT EXISTS operations (id TEXT PRIMARY KEY, proposal_id TEXT NOT NULL, version INTEGER NOT NULL, tenant TEXT NOT NULL, actor TEXT NOT NULL, payload TEXT NOT NULL, state TEXT NOT NULL, receipt TEXT, UNIQUE(proposal_id,version))')
            db.execute('CREATE TABLE IF NOT EXISTS events (sequence INTEGER PRIMARY KEY AUTOINCREMENT, tenant TEXT NOT NULL, actor TEXT NOT NULL, resource TEXT NOT NULL, event TEXT NOT NULL, at TEXT NOT NULL)')

    def provision(self, name: str, tenant: str, token: str, write: bool, admin: bool = False) -> None:
        # CLI/test bootstrap only. Restarting never restores a revoked grant.
        with database(self.path, True) as db:
            db.execute('INSERT OR IGNORE INTO principals VALUES (?,?,?,?,?,?)', (name, tenant, name, digest(token), int(write), int(admin)))

    def principal(self, db, token: str, write: bool = False):
        principal = db.execute('SELECT * FROM principals WHERE token_hash=?', (digest(token),)).fetchone()
        if not principal:
            raise Denied(401, 'A valid local access token is required.')
        if write and not principal['can_write']:
            raise Denied(403, 'The server denies this action: write permission is revoked or absent.')
        return principal

    def event(self, db, principal, resource: str, event: str) -> None:
        db.execute('INSERT INTO events (tenant,actor,resource,event,at) VALUES (?,?,?,?,?)', (principal['tenant'], principal['id'], resource, event, stamp()))

    def proposal(self, db, principal, pid: str, revision: int):
        row = db.execute('SELECT * FROM proposals WHERE id=? AND version=? AND tenant=?', (pid, revision, principal['tenant'])).fetchone()
        if not row:
            raise Denied(404, 'Record not found in this tenant.')
        return row

    def operation(self, db, principal, oid: str):
        row = db.execute('SELECT * FROM operations WHERE id=? AND tenant=?', (oid, principal['tenant'])).fetchone()
        if not row:
            raise Denied(404, 'Record not found in this tenant.')
        return row

    def eligible(self, db, principal, proposal) -> None:
        newest = db.execute('SELECT MAX(version) FROM proposals WHERE id=?', (proposal['id'],)).fetchone()[0]
        if proposal['owner'] != principal['id']:
            raise Denied(403, 'Only this proposal\'s operator may decide or execute it.')
        if proposal['version'] != newest or proposal['state'] not in ('awaiting', 'approved'):
            raise Denied(409, 'The proposal is no longer eligible; review its current version.')
        if time.time() >= proposal['expires']:
            raise Denied(409, 'The server clock says this proposal has expired.')

    def create(self, token: str, request: dict) -> dict:
        fields(request, {'kind'}, {'content', 'target'})
        kind = request['kind']
        if kind not in ('publish', 'withdraw'):
            raise Denied(400, 'Unsupported sandbox operation.')
        with database(self.path, True) as db:
            principal = self.principal(db, token, True)
            if kind == 'publish':
                fields(request, {'kind', 'content'})
                payload = {'kind': kind, 'content': text(request['content']), 'target': 'sandbox-board'}
            else:
                fields(request, {'kind', 'target'})
                original = self.operation(db, principal, identifier(request['target']))
                body = json.loads(original['payload'])
                if original['state'] != 'verified' or body['kind'] != 'publish':
                    raise Denied(409, 'Withdraw only a verified publication.')
                payload = {'kind': kind, 'content': body['content'], 'target': original['id']}
            unresolved = db.execute("SELECT id FROM operations WHERE tenant=? AND actor=? AND payload=? AND state IN ('authorized','outcome-unknown','pending-verification')", (principal['tenant'], principal['id'], canonical(payload))).fetchone()
            if unresolved:
                raise Denied(409, 'Inspect the equivalent existing operation before preparing another.')
            pid = str(uuid.uuid4())
            db.execute('INSERT INTO proposals VALUES (?,?,?,?,?,?,?)', (pid, 1, principal['tenant'], principal['id'], canonical(payload), time.time() + 600, 'awaiting'))
            self.event(db, principal, pid, 'proposal-created')
            return {'proposalId': pid, 'proposalVersion': '1'}

    def revise(self, token: str, pid: str, request: dict) -> dict:
        fields(request, {'proposalVersion', 'content'})
        revision, content = version(request['proposalVersion']), text(request['content'])
        with database(self.path, True) as db:
            principal = self.principal(db, token, True)
            proposal = self.proposal(db, principal, pid, revision)
            self.eligible(db, principal, proposal)
            body = json.loads(proposal['payload'])
            operation = db.execute('SELECT state FROM operations WHERE proposal_id=? AND version=?', (pid, revision)).fetchone()
            if body['kind'] != 'publish' or (operation and operation['state'] != 'authorized'):
                raise Denied(409, 'Already-dispatched work cannot be revised away.')
            body['content'] = content
            db.execute("UPDATE proposals SET state='superseded' WHERE id=? AND version=?", (pid, revision))
            db.execute("UPDATE operations SET state='cancelled' WHERE proposal_id=? AND version=? AND state='authorized'", (pid, revision))
            db.execute('INSERT INTO proposals VALUES (?,?,?,?,?,?,?)', (pid, revision + 1, principal['tenant'], principal['id'], canonical(body), time.time() + 600, 'awaiting'))
            self.event(db, principal, pid, 'proposal-revised-and-old-approval-invalidated')
            return {'proposalId': pid, 'proposalVersion': str(revision + 1)}

    def decide(self, token: str, request: dict) -> dict:
        fields(request, {'proposalId', 'proposalVersion', 'decision'})
        pid, revision = identifier(request['proposalId']), version(request['proposalVersion'])
        if request['decision'] not in ('approve', 'reject'):
            raise Denied(400, 'Unsupported decision.')
        with database(self.path, True) as db:
            principal = self.principal(db, token, True)
            proposal = self.proposal(db, principal, pid, revision)
            self.eligible(db, principal, proposal)
            existing = db.execute('SELECT * FROM operations WHERE proposal_id=? AND version=?', (pid, revision)).fetchone()
            if existing:
                if request['decision'] != 'approve':
                    raise Denied(409, 'Use cancellation for an already authorized operation.')
                return {'operationId': existing['id']}  # Stable across tabs/restarts.
            if request['decision'] == 'reject':
                db.execute("UPDATE proposals SET state='rejected' WHERE id=? AND version=?", (pid, revision))
                self.event(db, principal, pid, 'proposal-rejected')
                return {'operationId': None}
            oid = str(uuid.uuid4())
            db.execute("UPDATE proposals SET state='approved' WHERE id=? AND version=?", (pid, revision))
            db.execute('INSERT INTO operations VALUES (?,?,?,?,?,?,?,NULL)', (oid, pid, revision, principal['tenant'], principal['id'], proposal['payload'], 'authorized'))
            self.event(db, principal, oid, 'action-authorized-not-executed')
            return {'operationId': oid}

    def execute(self, token: str, oid: str, request: dict) -> bool:
        fields(request, set(), {'fault'})
        fault = request.get('fault', 'none')
        if fault not in ('none', 'drop-ack', 'before-write'):
            raise Denied(400, 'Unsupported local fault scenario.')
        with database(self.path, True) as db:
            principal = self.principal(db, token, True)
            operation = self.operation(db, principal, oid)
            proposal = self.proposal(db, principal, operation['proposal_id'], operation['version'])
            self.eligible(db, principal, proposal)
            if operation['state'] != 'authorized':
                return False  # Status inspection, never redispatch an ambiguous effect.
            if fault != 'none' and not principal['can_admin']:
                raise Denied(403, 'Only the local administrator can select fault injection.')
            db.execute("UPDATE operations SET state='outcome-unknown' WHERE id=?", (oid,))
            self.event(db, principal, oid, 'dispatch-reserved-durably')
        # Independent commits intentionally expose the lost-ack/crash window.
        # The second host write transaction serializes local revocation with this
        # short local provider commit. Do not hold this lock over remote network I/O.
        with database(self.path, True) as db:
            principal = self.principal(db, token, True)
            operation = self.operation(db, principal, oid)
            proposal = self.proposal(db, principal, operation['proposal_id'], operation['version'])
            self.eligible(db, principal, proposal)
            if fault == 'before-write':
                self.event(db, principal, oid, 'test-provider-unavailable-before-write')
                return False
            self.provider.apply(oid, principal['tenant'], json.loads(operation['payload']))
            self.event(db, principal, oid, 'provider-returned-not-verification')
            if fault != 'drop-ack':
                db.execute("UPDATE operations SET state='pending-verification' WHERE id=?", (oid,))
            return fault == 'drop-ack'

    def verify(self, token: str, oid: str) -> None:
        with database(self.path, True) as db:
            principal = self.principal(db, token)  # Revoked writers may still reconcile.
            operation = self.operation(db, principal, oid)
            if operation['state'] == 'verified':
                return
            if operation['state'] not in ('outcome-unknown', 'pending-verification'):
                raise Denied(409, 'There is no dispatched operation to verify.')
            body = json.loads(operation['payload'])
            observation = self.provider.observe(oid, principal['tenant'], body)
            if observation is None:
                db.execute("UPDATE operations SET state='outcome-unknown' WHERE id=?", (oid,))
                self.event(db, principal, oid, 'readback-missing-or-mismatched-no-receipt')
                return
            author = db.execute('SELECT name FROM principals WHERE id=?', (operation['actor'],)).fetchone()
            receipt = {
                'id': oid, 'action': 'Publish local project update' if body['kind'] == 'publish' else 'Withdraw local project update',
                'actor': {'id': operation['actor'], 'name': author['name'], 'type': 'human'},
                'target': 'Local sandbox board', 'timestamp': observation['recordedAt'], 'status': 'completed',
                'summary': 'The sandbox publication was read back from the provider store.' if body['kind'] == 'publish' else 'The sandbox post is withdrawn. The original history is retained.',
                'verification': {'state': 'verified', 'detail': 'Server readback matched operation identity, tenant and exact canonical content at ' + observation['readAt'] + '.'},
                'recovery': {'kind': 'reversible' if body['kind'] == 'publish' else 'compensatable', 'description': 'A withdrawal needs its own reviewed and authorized proposal. Audit history is retained.' if body['kind'] == 'publish' else 'Republishing is a new action, not erasure of this history.'},
            }
            db.execute("UPDATE operations SET state='verified',receipt=? WHERE id=?", (canonical(receipt), oid))
            self.event(db, principal, oid, 'server-readback-verified')

    def cancel(self, token: str, oid: str) -> None:
        with database(self.path, True) as db:
            principal = self.principal(db, token)
            operation = self.operation(db, principal, oid)
            if operation['actor'] != principal['id']:
                raise Denied(403, 'Only the approving operator may cancel.')
            if operation['state'] != 'authorized':
                raise Denied(409, 'Cancellation is only available before dispatch. Reconcile dispatched work.')
            db.execute("UPDATE operations SET state='cancelled' WHERE id=?", (oid,))
            self.event(db, principal, oid, 'cancelled-before-dispatch')

    def permission(self, token: str, request: dict) -> None:
        fields(request, {'canWrite'})
        if type(request['canWrite']) is not bool:
            raise Denied(400, 'canWrite must be a boolean.')
        with database(self.path, True) as db:
            principal = self.principal(db, token)
            if not principal['can_admin']:
                raise Denied(403, 'Only the local administrator can change this fixture grant.')
            db.execute('UPDATE principals SET can_write=? WHERE id=?', (int(request['canWrite']), principal['id']))
            self.event(db, principal, principal['id'], 'write-permission-restored' if request['canWrite'] else 'write-permission-revoked')

    def snapshot(self, token: str) -> dict:
        with database(self.path) as db:
            principal = self.principal(db, token)
            proposals = []
            for row in db.execute('SELECT * FROM proposals WHERE tenant=? ORDER BY rowid DESC LIMIT 100', (principal['tenant'],)):
                body = json.loads(row['payload'])
                proposals.append({'proposal': {
                    'id': row['id'], 'version': str(row['version']), 'actor': {'id': row['owner'], 'name': row['owner'], 'type': 'human'},
                    'action': 'Publish local project update' if body['kind'] == 'publish' else 'Withdraw local project update',
                    'target': 'Local sandbox board' if body['kind'] == 'publish' else 'Sandbox post ' + body['target'],
                    'consequence': 'C1', 'effect': 'Write one durable local board post.' if body['kind'] == 'publish' else 'Remove the post from the active board; keep its historical record.',
                    'authority': 'Current tenant write permission, checked again by the server at dispatch.',
                    'recovery': {'kind': 'reversible' if body['kind'] == 'publish' else 'compensatable', 'description': 'A separately approved withdrawal removes the active post. Operation and audit history are retained.' if body['kind'] == 'publish' else 'A separate publication can restore visibility; it creates new history.'},
                    'contentPreview': body['content'], 'expiresAt': stamp(row['expires'])},
                    'state': row['state'], 'kind': body['kind']})
            operations = [{'id': r['id'], 'proposalId': r['proposal_id'], 'proposalVersion': str(r['version']), 'state': r['state'], 'receipt': json.loads(r['receipt']) if r['receipt'] and r['state'] == 'verified' else None}
                          for r in db.execute('SELECT * FROM operations WHERE tenant=? ORDER BY rowid DESC LIMIT 100', (principal['tenant'],))]
            events = [dict(r) for r in db.execute('SELECT sequence,actor,resource,event,at FROM events WHERE tenant=? ORDER BY sequence DESC LIMIT 100', (principal['tenant'],))]
            session = {'id': principal['id'], 'tenant': principal['tenant'], 'canWrite': bool(principal['can_write']), 'canAdmin': bool(principal['can_admin'])}
        return {'session': session, 'proposals': proposals, 'operations': operations, 'events': events}
