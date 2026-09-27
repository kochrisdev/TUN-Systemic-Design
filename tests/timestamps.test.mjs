import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTimestamp, displayTimestamp, proposalBlockReason } from '../packages/react/dist/contracts.js';
const proposal = {
  id: 'expiry-review', version: '1', action: 'Publish report', target: 'Public workspace',
  actor: { id: 'writer', name: 'Writer', type: 'agent' }, consequence: 'C3',
  effect: 'The report becomes public.', authority: 'Publish once.',
  recovery: { kind: 'irreversible', description: 'Copies may remain.' },
};
for (const value of [
  '2026-02-30T08:00:00Z', '2026-02-29T08:00:00Z', '1900-02-29T08:00:00Z',
  '2026-04-31T08:00:00Z', '2026-13-01T08:00:00Z', '2026-00-01T08:00:00Z',
  '2026-09-00T08:00:00Z', '2026-09-27T24:00:00Z', '2026-09-27T08:60:00Z',
  '2026-09-27T08:00:60Z', '2026-09-27T08:00:00-00:00', '2026-09-27T08:00:00.1234Z',
]) {
  test(`rejects invalid or unsupported absolute timestamp: ${value}`, () => assert.equal(parseTimestamp(value), null));
}
for (const value of ['2000-02-29T08:00:00Z', '2024-02-29T08:00:00Z', '2026-02-28T08:00:00Z', '2026-09-27T15:00:00.123+07:00']) {
  test(`preserves valid instant: ${value}`, () => assert.equal(parseTimestamp(value), Date.parse(value)));
}
test('non-string timestamp fails closed', () => assert.equal(parseTimestamp(null), null));
for (const now of [NaN, Infinity, -Infinity]) {
  test(`unavailable clock blocks approval: ${now}`, () => assert.match(proposalBlockReason(proposal, now), /clock is unavailable/));
}
test('invalid calendar expiry blocks approval rather than rolling forward', () => {
  assert.match(proposalBlockReason({ ...proposal, expiresAt: '2026-02-30T08:00:00Z' }, 0), /expiry is invalid/);
});
test('invalid calendar receipt date is unavailable rather than normalized', () => {
  assert.equal(displayTimestamp('2026-02-30T08:00:00Z'), 'Time unavailable');
});
