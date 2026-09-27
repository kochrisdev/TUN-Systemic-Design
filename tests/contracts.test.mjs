import test from 'node:test';
import assert from 'node:assert/strict';
import { proposalFingerprint, proposalBlockReason, effectiveReceiptStatus, safeDetailsUrl,
  parseTimestamp, displayTimestamp, agentLabels, consequenceLabels } from '../packages/react/dist/contracts.js';
const proposal = {
  id: 'publish-1', version: '1', action: 'Publish report', target: 'Public workspace',
  actor: { id: 'writer', name: 'Writer', type: 'agent' }, consequence: 'C3',
  effect: 'The report becomes public.', authority: 'Publish once.',
  recovery: { kind: 'irreversible', description: 'Copies may remain.' },
};
const receipt = {
  id: 'receipt-1', action: proposal.action, actor: proposal.actor, target: proposal.target,
  timestamp: '2026-09-27T08:00:00Z', status: 'completed', summary: 'Host reports completion.',
  verification: { state: 'verified', detail: 'Host read back the stored record.' }, recovery: proposal.recovery,
};
test('proposal without expiry can be reviewed', () => assert.equal(proposalBlockReason(proposal, 0), null));
test('empty target blocks approval', () => assert.match(proposalBlockReason({ ...proposal, target: ' ' }, 0), /incomplete/));
test('unknown consequence blocks approval', () => assert.match(proposalBlockReason({ ...proposal, consequence: 'C9' }, 0), /invalid/));
test('empty authority blocks approval', () => assert.match(proposalBlockReason({ ...proposal, authority: '' }, 0), /incomplete/));
test('invalid recovery blocks approval', () => assert.match(proposalBlockReason({ ...proposal, recovery: { ...proposal.recovery, kind: 'magic' } }, 0), /invalid/));
test('exact expiry blocks approval', () => assert.match(proposalBlockReason({ ...proposal, expiresAt: '2026-09-27T08:00:00Z' }, Date.parse('2026-09-27T08:00:00Z')), /expired/));
test('before expiry remains reviewable', () => assert.equal(proposalBlockReason({ ...proposal, expiresAt: '2026-09-27T08:00:00Z' }, Date.parse('2026-09-27T07:59:59Z')), null));
test('bad expiry blocks approval', () => assert.match(proposalBlockReason({ ...proposal, expiresAt: 'tomorrow' }, 0), /invalid/));
test('timezone-free expiry blocks approval', () => assert.match(proposalBlockReason({ ...proposal, expiresAt: '2026-09-27T08:00:00' }, 0), /invalid/));
for (const [field, value] of [['version','2'],['action','Send report'],['target','Other workspace'],['effect','Different effect'],['authority','Publish repeatedly'],['consequence','C4']]) {
  test(`fingerprint changes with ${field}`, () => assert.notEqual(proposalFingerprint(proposal), proposalFingerprint({ ...proposal, [field]: value })));
}
test('fingerprint changes with actor', () => assert.notEqual(proposalFingerprint(proposal), proposalFingerprint({ ...proposal, actor: { ...proposal.actor, id: 'other' } })));
test('fingerprint changes with recovery', () => assert.notEqual(proposalFingerprint(proposal), proposalFingerprint({ ...proposal, recovery: { kind: 'reversible', description: 'Restore prior version.' } })));
test('fingerprint ignores object property order', () => assert.equal(proposalFingerprint(proposal), proposalFingerprint({ target: proposal.target, ...proposal })));
test('verified completion is displayed', () => assert.equal(effectiveReceiptStatus(receipt), 'completed'));
test('unverified completion is downgraded', () => assert.equal(effectiveReceiptStatus({ ...receipt, verification: { state: 'pending', detail: 'Awaiting readback.' } }), 'pending-verification'));
test('empty verification evidence is downgraded', () => assert.equal(effectiveReceiptStatus({ ...receipt, verification: { state: 'verified', detail: ' ' } }), 'pending-verification'));
test('unverified reversal is downgraded', () => assert.equal(effectiveReceiptStatus({ ...receipt, status: 'reversed', verification: { state: 'unavailable', detail: 'Unavailable.' } }), 'pending-verification'));
test('partial completion stays partial', () => assert.equal(effectiveReceiptStatus({ ...receipt, status: 'partially-completed' }), 'partially-completed'));
for (const url of ['javascript:alert(1)', 'data:text/html,hi', '//evil.example/a', '/\\evil.example', 'https://user:pass@example.com', ' https://example.com', 'https://example.com/\nhi']) {
  test(`unsafe record link is blocked: ${JSON.stringify(url)}`, () => assert.equal(safeDetailsUrl(url), undefined));
}
test('https record link works', () => assert.equal(safeDetailsUrl('https://example.com/a'), 'https://example.com/a'));
test('root-relative record link works', () => assert.equal(safeDetailsUrl('/audit/1'), '/audit/1'));
test('invalid timestamp is not fabricated', () => assert.equal(displayTimestamp('bad'), 'Time unavailable'));
test('offset timestamp is normalized to UTC', () => assert.equal(displayTimestamp('2026-09-27T15:00:00+07:00'), '2026-09-27 08:00:00 UTC'));
test('timezone is required', () => assert.equal(parseTimestamp('2026-09-27T08:00:00'), null));
test('all 11 agent states have labels', () => assert.equal(Object.keys(agentLabels).length, 11));
test('all five consequence classes have labels', () => assert.deepEqual(Object.keys(consequenceLabels), ['C0','C1','C2','C3','C4']));
