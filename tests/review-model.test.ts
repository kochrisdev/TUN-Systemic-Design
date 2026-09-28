import { describe, expect, it } from 'vitest';
import { beginDemoDecision, changeDemoContext, changeDemoIntent, createDemoProposal, initialDemo,
  openDemoReview, prepareDemo, reconcileDemo, recordDemoAction, reviewDemoPlan, reviseDemoPlan } from '../examples/react/review-model.js';
import type { DecisionRequest } from '../packages/react/src/contracts.js';
function ready() {
  const s = createDemoProposal(reviewDemoPlan(prepareDemo(initialDemo())));
  return openDemoReview(s, s.proposal!.id, s.proposal!.version);
}
const requestFor = (s: ReturnType<typeof ready>): DecisionRequest => ({ proposalId: s.proposal!.id, proposalVersion: s.proposal!.version, decision: 'approve' });
describe('local host review contracts', () => {
  it('preparing a plan is not proposal creation or approval', () => {
    const s = prepareDemo(initialDemo()); expect(s.plan).not.toBeNull(); expect(s.proposal).toBeNull(); expect(s.approval).toBe('awaiting'); expect(s.receipts).toEqual([]);
  });
  it('approach review cannot authorize publication', () => {
    const s = reviewDemoPlan(prepareDemo(initialDemo())); expect(s.planReviewed).toBe(true); expect(s.proposal).toBeNull(); expect(s.approval).toBe('awaiting');
  });
  it('proposal creation requires prior approach review', () => { const s = prepareDemo(initialDemo()); expect(createDemoProposal(s)).toBe(s); });
  it('opening review changes no action records', () => { const s = ready(); expect(s.phase).toBe('reviewing'); expect(s.approval).toBe('awaiting'); expect(s.ledger).toEqual({}); });
  for (const availability of ['missing', 'restricted', 'stale'] as const) {
    it(`${availability} notes block plan generation`, () => { const s = changeDemoContext(initialDemo(), availability); expect(prepareDemo(s).plan).toBeNull(); });
    it(`${availability} context invalidates earlier approval`, () => { const s = ready(); const changed = changeDemoContext(s, availability); expect(changed.reviewOpen).toBe(false); expect(changed.proposalStatus).toBe('superseded'); expect(() => beginDemoDecision(changed, requestFor(s))).toThrow(); });
  }
  it('changing intent invalidates a proposal', () => { const s = ready(); const next = changeDemoIntent(s, 'Different goal'); expect(next.plan).toBeNull(); expect(next.proposalStatus).toBe('superseded'); });
  it('revised plans need review and a new proposal', () => {
    const s = ready(); const changed = reviseDemoPlan(s); expect(changed.plan!.version).not.toBe(s.plan!.version); expect(changed.planReviewed).toBe(false);
    expect(changed.proposalStatus).toBe('superseded'); expect(createDemoProposal(changed)).toBe(changed);
    const next = createDemoProposal(reviewDemoPlan(changed)); expect(next.proposal!.version).not.toBe(s.proposal!.version); expect(next.proposal!.contentPreview).toContain('Scope reminder');
  });
  it('a stale proposal request is rejected', () => { const s = ready(); expect(() => beginDemoDecision(s, { ...requestFor(s), proposalVersion: 'old' })).toThrow(); });
  it('rejection creates no execution record', () => { const s = ready(); const next = beginDemoDecision(s, { ...requestFor(s), decision: 'reject' }); expect(next.phase).toBe('rejected'); expect(next.receipts).toEqual([]); expect(next.ledger).toEqual({}); });
  it('same-version decision cannot be submitted twice', () => { const s = ready(); const request = requestFor(s); expect(() => beginDemoDecision(beginDemoDecision(s, request), request)).toThrow(); });
  it('expiry is rechecked immediately before execution', () => {
    const s = ready(); const request = requestFor(s); const pending = beginDemoDecision(s, request);
    expect(() => recordDemoAction(pending, request, Date.parse(s.proposal!.expiresAt!))).toThrow(); expect(pending.ledger).toEqual({});
  });
  it('duplicate in-memory writes are idempotent per proposal version', () => {
    const s = ready(); const request = requestFor(s); const stored = recordDemoAction(beginDemoDecision(s, request), request);
    expect(recordDemoAction(stored, request)).toBe(stored); expect(Object.keys(stored.ledger)).toHaveLength(1); expect(stored.receipts).toEqual([]);
  });
  it('lost acknowledgement is reconciled rather than resubmitted', () => {
    const s = ready(); const request = requestFor(s); const stored = recordDemoAction(beginDemoDecision(s, request), request);
    const unknown = { ...stored, phase: 'unknown' as const }; expect(createDemoProposal(unknown)).toBe(unknown);
    const resolved = reconcileDemo(unknown); expect(resolved.receipts).toHaveLength(1); expect(resolved.phase).toBe('completed'); expect(resolved.reviewOpen).toBe(false);
    expect(reconcileDemo(resolved)).toBe(resolved); expect(Object.keys(resolved.ledger)).toHaveLength(1);
  });
  it('unknown outcome without a record stays unknown', () => { const unknown = { ...ready(), phase: 'unknown' as const }; expect(reconcileDemo(unknown).phase).toBe('unknown'); });
  for (const phase of ['pending', 'unknown'] as const) {
    it(`mutations are blocked while ${phase}`, () => { const s = { ...ready(), phase }; expect(prepareDemo(s)).toBe(s); expect(reviseDemoPlan(s)).toBe(s); expect(changeDemoContext(s, 'missing')).toBe(s); expect(changeDemoIntent(s, 'Changed')).toBe(s); });
  }
  it('context changes do not erase historical receipts', () => {
    const s = ready(); const request = requestFor(s); const complete = reconcileDemo(recordDemoAction(beginDemoDecision(s, request), request));
    const changed = changeDemoContext(complete, 'missing'); expect(changed.receipts).toHaveLength(1); expect(changed.ledger).toEqual(complete.ledger);
  });
  it('changed context references block an otherwise valid request', () => { const s = ready(); expect(() => beginDemoDecision({ ...s, context: { ...s.context, version: 'changed' } }, requestFor(s))).toThrow(); });
});
