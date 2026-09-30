"""Real loopback HTTP and independent on-disk SQLite stores; no fetch mocks."""
from concurrent.futures import ThreadPoolExecutor
from http.client import HTTPConnection, RemoteDisconnected
import json
from pathlib import Path
import sys
import tempfile
import threading
import unittest
import uuid

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from server import LocalServer
from service import Host, database, canonical, Denied


class HostIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)
        self.host = Host(self.directory)
        self.host.provision('operator', 'tenant-one', 'operator-test-token', True, True)
        self.host.provision('reviewer', 'tenant-one', 'reviewer-test-token', False)
        self.host.provision('outsider', 'tenant-two', 'outsider-test-token', True)
        self.start()
        self.addCleanup(self.stop)

    def start(self):
        self.server = LocalServer(self.host, 0)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def stop(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=3)

    def call(self, path, data=None, token='operator-test-token', headers=None, raw=None):
        conn = HTTPConnection('127.0.0.1', self.server.server_port, timeout=5)
        body = raw if raw is not None else json.dumps(data) if data is not None else None
        request_headers = {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}
        request_headers.update(headers or {})
        try:
            conn.request('POST' if body is not None else 'GET', path, body=body, headers=request_headers)
            response = conn.getresponse()
            return response.status, json.loads(response.read())
        finally:
            conn.close()

    def snapshot(self):
        code, value = self.call('/api/snapshot')
        self.assertEqual(code, 200)
        return value

    def create(self, content='A real local project update'):
        code, proposal = self.call('/api/proposals', {'kind': 'publish', 'content': content})
        self.assertEqual(code, 201, proposal)
        return proposal

    def approve(self, proposal=None):
        proposal = proposal or self.create()
        code, operation = self.call('/api/decisions', {**proposal, 'decision': 'approve'})
        self.assertEqual(code, 200, operation)
        return operation['operationId']

    def execute(self, oid, fault='none'):
        return self.call(f'/api/operations/{oid}/execute', {'fault': fault})

    def verify(self, oid):
        return self.call(f'/api/operations/{oid}/verify', {})

    def operation(self, oid):
        return next(o for o in self.snapshot()['operations'] if o['id'] == oid)

    def test_approval_records_authority_but_neither_effect_nor_receipt(self):
        oid = self.approve()
        self.assertEqual(self.operation(oid)['state'], 'authorized')
        self.assertIsNone(self.operation(oid)['receipt'])
        self.assertEqual(self.host.provider.posts('tenant-one'), [])

    def test_provider_success_is_not_a_receipt_until_separate_readback(self):
        oid = self.approve()
        self.assertEqual(self.execute(oid)[0], 200)
        self.assertEqual(len(self.host.provider.posts('tenant-one')), 1)
        self.assertEqual(self.operation(oid)['state'], 'pending-verification')
        self.assertIsNone(self.operation(oid)['receipt'])
        self.assertEqual(self.verify(oid)[0], 200)
        verified = self.operation(oid)
        self.assertEqual(verified['state'], 'verified')
        self.assertEqual(verified['receipt']['verification']['state'], 'verified')
        self.assertIn('Server readback matched', verified['receipt']['verification']['detail'])

    def test_new_proposal_cannot_hide_an_equivalent_unresolved_operation(self):
        content = 'Same unresolved publication'
        oid = self.approve(self.create(content))
        self.execute(oid,'before-write')
        self.assertEqual(self.call('/api/proposals',{'kind':'publish','content':content})[0],409)
        self.assertEqual(len(self.snapshot()['operations']),1)

    def test_reads_and_reconnect_do_not_verify(self):
        oid = self.approve()
        self.execute(oid)
        for _ in range(3):
            self.assertIsNone(self.operation(oid)['receipt'])
        self.assertEqual(self.operation(oid)['state'], 'pending-verification')

    def test_rejection_creates_no_operation(self):
        proposal = self.create()
        self.assertEqual(self.call('/api/decisions', {**proposal, 'decision': 'reject'})[0], 200)
        self.assertEqual(self.snapshot()['operations'], [])
        self.assertEqual(self.call('/api/decisions', {**proposal, 'decision': 'approve'})[0], 409)

    def test_direct_execution_without_approval_is_denied(self):
        self.assertEqual(self.execute(str(uuid.uuid4()))[0], 404)
        self.assertEqual(self.host.provider.posts('tenant-one'), [])

    def test_readonly_principal_cannot_create_or_approve_or_dispatch(self):
        proposal = self.create()
        oid = self.approve(proposal)
        for path, payload in [('/api/proposals', {'kind':'publish','content':'bad'}), ('/api/decisions', {**proposal, 'decision':'approve'}), (f'/api/operations/{oid}/execute', {})]:
            with self.subTest(path=path):
                self.assertEqual(self.call(path, payload, token='reviewer-test-token')[0], 403)
        self.assertEqual(self.host.provider.posts('tenant-one'), [])

    def test_untrusted_authority_and_receipt_fields_are_rejected(self):
        proposal = self.create()
        self.assertEqual(self.call('/api/decisions', {**proposal, 'decision':'approve','authority':'administrator'})[0],400)
        oid = self.approve(proposal)
        self.assertEqual(self.call(f'/api/operations/{oid}/execute', {'target':'evil'})[0],400)
        self.assertEqual(self.call(f'/api/operations/{oid}/verify', {'verified':True})[0],400)
        self.assertIsNone(self.operation(oid)['receipt'])

    def test_tenant_isolation_covers_decisions_operations_status_and_board(self):
        proposal = self.create()
        oid = self.approve(proposal)
        self.execute(oid)
        for path, payload in [('/api/decisions', {**proposal, 'decision':'approve'}), (f'/api/operations/{oid}/execute',{}), (f'/api/operations/{oid}/verify',{})]:
            self.assertEqual(self.call(path, payload, token='outsider-test-token')[0],404)
        code, snapshot = self.call('/api/snapshot', token='outsider-test-token')
        self.assertEqual(code,200)
        self.assertEqual(snapshot['operations'],[])
        self.assertEqual(snapshot['proposals'],[])
        self.assertEqual(self.call('/api/board',token='outsider-test-token')[1]['posts'],[])

    def test_stale_revision_invalidates_existing_approval(self):
        proposal = self.create()
        oid = self.approve(proposal)
        code, revised = self.call(f'/api/proposals/{proposal["proposalId"]}/revise', {'proposalVersion':'1','content':'Different reviewed content'})
        self.assertEqual(code,200)
        self.assertEqual(revised['proposalVersion'],'2')
        self.assertEqual(self.execute(oid)[0],409)
        self.assertEqual(self.call('/api/decisions',{**proposal,'decision':'approve'})[0],409)
        self.assertEqual(self.operation(oid)['state'],'cancelled')
        self.assertEqual(self.host.provider.posts('tenant-one'),[])

    def test_dispatch_cannot_be_erased_by_revision(self):
        proposal = self.create()
        oid = self.approve(proposal)
        self.execute(oid)
        code, _ = self.call(f'/api/proposals/{proposal["proposalId"]}/revise', {'proposalVersion':'1','content':'Erase old effect'})
        self.assertEqual(code,409)
        self.assertEqual(len(self.host.provider.posts('tenant-one')),1)

    def test_revoked_grant_blocks_queued_dispatch_and_survives_restart(self):
        oid = self.approve()
        self.assertEqual(self.call('/api/session/permission',{'canWrite':False})[0],200)
        self.assertEqual(self.execute(oid)[0],403)
        self.stop()
        self.host = Host(self.directory)
        self.host.provision('operator','tenant-one','operator-test-token',True,True)
        self.start()
        self.assertFalse(self.snapshot()['session']['canWrite'])
        self.assertEqual(self.execute(oid)[0],403)
        self.assertEqual(self.host.provider.posts('tenant-one'),[])

    def test_server_clock_rechecks_expiry_at_dispatch(self):
        proposal = self.create()
        oid = self.approve(proposal)
        with database(self.host.path,True) as db:
            db.execute('UPDATE proposals SET expires=0 WHERE id=?',(proposal['proposalId'],))
        self.assertEqual(self.execute(oid)[0],409)
        self.assertEqual(self.host.provider.posts('tenant-one'),[])

    def test_concurrent_approvals_and_dispatches_have_one_durable_effect(self):
        proposal = self.create()
        with ThreadPoolExecutor(max_workers=6) as pool:
            ids = list(pool.map(lambda _: self.approve(proposal),range(6)))
        self.assertEqual(len(set(ids)),1)
        with ThreadPoolExecutor(max_workers=6) as pool:
            results = list(pool.map(lambda _: self.execute(ids[0])[0],range(6)))
        self.assertEqual(results,[200]*6)
        self.assertEqual(len(self.host.provider.posts('tenant-one')),1)
        self.assertEqual(len(self.snapshot()['operations']),1)

    def test_provider_rejects_operation_key_reuse_with_different_content(self):
        oid = str(uuid.uuid4())
        self.host.provider.apply(oid,'tenant-one',{'kind':'publish','content':'one','target':'sandbox-board'})
        with self.assertRaises(Denied):
            self.host.provider.apply(oid,'tenant-one',{'kind':'publish','content':'two','target':'sandbox-board'})
        self.assertEqual(len(self.host.provider.posts('tenant-one')),1)

    def test_actual_lost_http_ack_reconciles_without_redispatch(self):
        oid = self.approve()
        with self.assertRaises((RemoteDisconnected,ConnectionResetError)):
            self.execute(oid,'drop-ack')
        self.assertEqual(self.operation(oid)['state'],'outcome-unknown')
        self.assertIsNone(self.operation(oid)['receipt'])
        self.assertEqual(len(self.host.provider.posts('tenant-one')),1)
        self.execute(oid)
        self.assertEqual(self.operation(oid)['state'],'outcome-unknown')
        self.verify(oid)
        self.assertEqual(self.operation(oid)['state'],'verified')
        self.assertEqual(len(self.host.provider.posts('tenant-one')),1)

    def test_crash_window_provider_commit_survives_host_restart(self):
        oid = self.approve()
        # Stop before provider write: the durable reservation is already unknown.
        self.execute(oid,'before-write')
        with database(self.host.path) as db:
            op = db.execute('SELECT * FROM operations WHERE id=?',(oid,)).fetchone()
            payload = json.loads(op['payload'])
        # Model a process that commits only at the provider, then exits before
        # writing any further host state. Both stores are actual independent DBs.
        self.host.provider.apply(oid,'tenant-one',payload)
        self.stop()
        self.host = Host(self.directory)
        self.start()
        self.assertEqual(self.operation(oid)['state'],'outcome-unknown')
        self.verify(oid)
        self.assertEqual(self.operation(oid)['state'],'verified')
        self.assertEqual(len(self.host.provider.posts('tenant-one')),1)

    def test_absent_readback_stays_unknown_and_never_retries(self):
        oid = self.approve()
        self.execute(oid,'before-write')
        self.verify(oid)
        self.execute(oid)
        self.assertEqual(self.operation(oid)['state'],'outcome-unknown')
        self.assertIsNone(self.operation(oid)['receipt'])
        self.assertEqual(self.host.provider.posts('tenant-one'),[])

    def test_mismatched_provider_content_cannot_create_a_receipt(self):
        oid = self.approve()
        self.execute(oid)
        with database(self.host.provider.path,True) as db:
            db.execute('UPDATE posts SET content=? WHERE id=?',('tampered',oid))
        self.verify(oid)
        self.assertIsNone(self.operation(oid)['receipt'])
        self.assertEqual(self.operation(oid)['state'],'outcome-unknown')

    def test_revocation_does_not_block_readonly_reconciliation(self):
        oid = self.approve()
        self.execute(oid)
        self.call('/api/session/permission',{'canWrite':False})
        self.assertEqual(self.verify(oid)[0],200)
        self.assertIsNotNone(self.operation(oid)['receipt'])

    def test_cancellation_before_dispatch_preserves_no_effect(self):
        oid = self.approve()
        self.assertEqual(self.call(f'/api/operations/{oid}/cancel',{})[0],200)
        self.execute(oid)
        self.assertEqual(self.operation(oid)['state'],'cancelled')
        self.assertEqual(self.host.provider.posts('tenant-one'),[])
        self.assertEqual(self.verify(oid)[0],409)

    def test_cancel_does_not_claim_to_stop_already_dispatched_work(self):
        oid = self.approve()
        self.execute(oid)
        self.assertEqual(self.call(f'/api/operations/{oid}/cancel',{})[0],409)
        self.assertEqual(self.operation(oid)['state'],'pending-verification')

    def test_withdrawal_is_a_separate_approved_and_verified_operation(self):
        oid = self.approve()
        self.execute(oid)
        self.verify(oid)
        original_receipt = self.operation(oid)['receipt']
        code, proposal = self.call('/api/proposals',{'kind':'withdraw','target':oid})
        self.assertEqual(code,201)
        wid = self.approve(proposal)
        self.assertEqual(self.host.provider.posts('tenant-one')[0]['active'],1)
        self.execute(wid)
        self.assertIsNone(self.operation(wid)['receipt'])
        self.assertEqual(self.host.provider.posts('tenant-one')[0]['active'],0)
        self.verify(wid)
        self.assertIsNotNone(self.operation(wid)['receipt'])
        self.assertEqual(self.operation(oid)['receipt'],original_receipt)
        self.assertEqual(len(self.snapshot()['operations']),2)

    def test_authentication_is_required_for_private_reads(self):
        self.assertEqual(self.call('/api/snapshot',token='wrong')[0],401)
        self.assertEqual(self.call('/api/board',token='wrong')[0],401)

    def test_cross_origin_and_dns_rebinding_are_denied(self):
        self.assertEqual(self.call('/api/snapshot',headers={'Origin':'https://other.example'})[0],403)
        self.assertEqual(self.call('/api/snapshot',headers={'Host':'other.example'})[0],403)

    def test_malformed_unknown_and_oversized_payloads_fail_before_effect(self):
        for raw, expected in [('null',400),('{"kind":"publish","content":null}',400),('{"kind":"publish","kind":"withdraw","content":"x"}',400),('{"kind":"publish","content":"x","verified":true}',400),('['*1000,400),('x'*20000,413)]:
            with self.subTest(raw=raw[:60]):
                self.assertEqual(self.call('/api/proposals',raw=raw)[0],expected)
        self.assertEqual(self.host.provider.posts('tenant-one'),[])

    def test_reviewer_cannot_escalate_permissions(self):
        self.assertEqual(self.call('/api/session/permission',{'canWrite':True},token='reviewer-test-token')[0],403)

    def test_audit_events_are_durable_and_contain_no_tokens_or_content(self):
        proposal = self.create('Sensitive synthetic content')
        oid = self.approve(proposal)
        self.execute(oid)
        self.verify(oid)
        events = self.snapshot()['events']
        self.assertIn('server-readback-verified',[e['event'] for e in events])
        serialized = json.dumps(events)
        self.assertNotIn('Sensitive synthetic content',serialized)
        self.assertNotIn('operator-test-token',serialized)

    def test_database_and_credentials_cannot_be_served_as_static_files(self):
        for path in ['/../service.py','/.data/host.sqlite3','/assets/../../service.py']:
            self.assertEqual(self.call(path)[0],404)


if __name__ == '__main__':
    unittest.main()
