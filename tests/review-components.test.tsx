import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApprovalGate, ContextPanel, PlanView, ProposalCard, type ActionProposal, type ContextSnapshot, type ContextSource, type TaskPlan } from '../packages/react/src/index.js';
const source: ContextSource = { id: 'notes', label: 'Project notes', kind: 'note', scope: 'This task', persistence: 'session', provenance: 'provided', availability: 'available', usage: 'not-used', summary: 'Notes to inspect' };
const context: ContextSnapshot = { id: 'context', version: '1', scope: 'Supplied notes only.', sources: [source] };
const plan: TaskPlan = { id: 'plan', version: '1', context: { id: 'context', version: '1' }, objective: 'Prepare an update', status: 'proposed', expectedOutputs: ['Draft update'],
  steps: [{ id: 'read', title: 'Read notes', detail: 'Read supplied notes.', status: 'pending' }, { id: 'publish', title: 'Publish after approval', detail: 'Separate authorization required.', status: 'waiting-approval', dependsOn: ['read'], approvalRequired: true }] };
const proposal: ActionProposal = { id: 'p', version: '1', action: 'Publish update', actor: { id: 'a', name: 'Writer', type: 'agent' }, target: 'Public workspace', effect: 'Publish once.', authority: 'Only this update.', consequence: 'C3',
  recovery: { kind: 'irreversible', description: 'Copies may remain.' }, contentPreview: 'Exact publication text', reviewBasis: { context: plan.context, plan: { id: plan.id, version: plan.version } } };
afterEach(() => { vi.restoreAllMocks(); });
describe('ContextPanel', () => {
  it('distinguishes availability from actual use', () => { render(<ContextPanel context={context} />); expect(screen.getByText('Not used')).toBeVisible(); expect(screen.getByText(/provided · Available/)).toBeVisible(); });
  it('shows used context explicitly', () => { render(<ContextPanel context={{ ...context, sources: [{ ...source, availability: 'available', usage: 'used' }] }} />); expect(screen.getByText('Used for this task')).toBeVisible(); });
  it('shows an empty state', () => { render(<ContextPanel context={{ ...context, sources: [] }} />); expect(screen.getByRole('status')).toHaveTextContent('No context'); });
  for (const availability of ['missing', 'restricted'] as const) {
    it(`never renders unexpected content or links for ${availability}`, () => {
      const hidden = { ...source, availability, usage: 'not-used', summary: 'PRIVATE_SENTINEL', detailsUrl: 'https://example.com/private' } as ContextSource;
      render(<ContextPanel context={{ ...context, sources: [hidden] }} />);
      expect(screen.queryByText('PRIVATE_SENTINEL')).not.toBeInTheDocument(); expect(screen.queryByRole('link')).not.toBeInTheDocument(); expect(screen.getByText(/Source content is unavailable/)).toBeVisible();
    });
  }
  it('warns about stale sources', () => { render(<ContextPanel context={{ ...context, sources: [{ ...source, availability: 'stale', usage: 'used' }] }} />); expect(screen.getByText(/may be out of date/)).toBeVisible(); });
  it('separates context persistence from data retention', () => { render(<ContextPanel context={{ ...context, sources: [{ ...source, persistence: 'persistent' }] }} />); expect(screen.getByText('Persistent context')).toBeVisible(); expect(screen.getByText(/not a promise about logs/)).toBeVisible(); });
  it('rejects unsafe source links', () => { render(<ContextPanel context={{ ...context, sources: [{ ...source, availability: 'available', usage: 'unknown', detailsUrl: 'javascript:alert(1)' }] }} />); expect(screen.queryByRole('link')).not.toBeInTheDocument(); expect(screen.getByText('Usage not confirmed')).toBeVisible(); });
  it('uses an expandable native disclosure', async () => {
    render(<ContextPanel context={context} />); const summary = screen.getByText('Inspect Project notes');
    expect(summary.tagName).toBe('SUMMARY');
    // Native Enter default behavior is covered by the real Chromium test.
    await userEvent.click(summary); expect(summary.closest('details')).toHaveAttribute('open'); expect(screen.getByText('Notes to inspect')).toBeVisible();
  });
  it('keeps accessible region ids unique', () => { const { container } = render(<><ContextPanel context={context} /><ContextPanel context={context} /></>); const ids = [...container.querySelectorAll('[id]')].map(el => el.id); expect(new Set(ids).size).toBe(ids.length); });
});
describe('PlanView', () => {
  it('shows steps, dependencies, expected outputs and approval points', () => { render(<PlanView plan={plan} />); expect(screen.getByText('Draft update')).toBeVisible(); expect(screen.getByText('Depends on: Read notes')).toBeVisible(); expect(screen.getByText(/Separate action approval required/)).toBeVisible(); expect(screen.queryByRole('button')).not.toBeInTheDocument(); });
  it('shows invalid dependencies rather than pretending the plan is ready', () => { render(<PlanView plan={{ ...plan, steps: [{ ...plan.steps[0], dependsOn: ['absent'] }] }} />); expect(screen.getByRole('status')).toHaveTextContent('Blocked'); expect(screen.getByText(/unknown step/)).toBeVisible(); });
  it('does not claim completion without evidence', () => { render(<PlanView plan={{ ...plan, status: 'completed' }} />); expect(screen.getByRole('status')).toHaveTextContent('Completion not verified'); });
  it('keeps approach review distinct from authorization', () => { render(<PlanView plan={{ ...plan, status: 'approved' }} />); expect(screen.getByRole('status')).toHaveTextContent('not action authorization'); });
  it('detects same-version changes to the plan objective', () => { const { rerender } = render(<PlanView plan={plan} />); rerender(<PlanView plan={{ ...plan, objective: 'Different objective' }} />); expect(screen.getByRole('status')).toHaveTextContent('review is stale'); });
  it('accepts ordinary progress updates without making the plan stale', () => { const { rerender } = render(<PlanView plan={plan} />); rerender(<PlanView plan={{ ...plan, status: 'in-progress' }} />); expect(screen.getByRole('status')).toHaveTextContent('In progress'); });
  it('announces a new revision and its change summary', () => { const { rerender } = render(<PlanView plan={plan} />); rerender(<PlanView plan={{ ...plan, version: '2', status: 'changed', changeSummary: 'New source check.' }} />); expect(screen.getByText('Revision: New source check.')).toBeVisible(); expect(screen.getByRole('status')).toHaveTextContent('review again'); });
});
describe('ProposalCard', () => {
  it('shows the exact preview and recovery limits', () => { render(<ProposalCard proposal={proposal} status="ready" />); expect(screen.getByText('Exact publication text')).toBeVisible(); expect(screen.getByText(/Cannot be undone/)).toBeVisible(); expect(screen.getByText(/context context v1; plan plan v1/)).toBeVisible(); });
  it('does not emit anything on view', () => { const review = vi.fn(); render(<ProposalCard proposal={proposal} status="ready" onReview={review} />); expect(review).not.toHaveBeenCalled(); });
  it('emits only a version-bound review-navigation request', async () => { const review = vi.fn(); render(<ProposalCard proposal={proposal} status="ready" onReview={review} />); await userEvent.click(screen.getByRole('button', { name: 'Review action' })); expect(review).toHaveBeenCalledWith({ proposalId: 'p', proposalVersion: '1' }); expect(screen.queryByRole('button', { name: /approve|publish/i })).not.toBeInTheDocument(); });
  for (const status of ['draft', 'approved', 'rejected', 'expired', 'superseded'] as const) {
    it(`${status} cannot open another actionable review`, () => { const review = vi.fn(); render(<ProposalCard proposal={proposal} status={status} onReview={review} />); fireEvent.click(screen.getByRole('button')); expect(review).not.toHaveBeenCalled(); expect(screen.getByRole('button')).toBeDisabled(); });
  }
  it('blocks a same-version content change', () => { const { rerender } = render(<ProposalCard proposal={proposal} status="ready" onReview={vi.fn()} />); rerender(<ProposalCard proposal={{ ...proposal, contentPreview: 'Changed content' }} status="ready" onReview={vi.fn()} />); expect(screen.getByRole('button')).toBeDisabled(); expect(screen.getByRole('status')).toHaveTextContent('without a new version'); });
  it('starts a fresh review on a new version', () => { const { rerender } = render(<ProposalCard proposal={proposal} status="ready" onReview={vi.fn()} />); rerender(<ProposalCard proposal={{ ...proposal, version: '2', contentPreview: 'Changed content' }} status="modified" onReview={vi.fn()} />); expect(screen.getByRole('button')).toBeEnabled(); });
  it('blocks expired proposals', () => { render(<ProposalCard proposal={{ ...proposal, expiresAt: '2000-01-01T00:00:00Z' }} status="ready" onReview={vi.fn()} />); expect(screen.getByRole('button')).toBeDisabled(); });
  it('rechecks the clock when opening review', async () => {
    const now = Date.now(); const review = vi.fn(); render(<ProposalCard proposal={{ ...proposal, expiresAt: new Date(now + 600000).toISOString() }} status="ready" onReview={review} />);
    await waitFor(() => expect(screen.getByRole('button')).toBeEnabled()); vi.spyOn(Date, 'now').mockReturnValue(now + 600000);
    fireEvent.click(screen.getByRole('button')); expect(review).not.toHaveBeenCalled(); expect(screen.getByRole('status')).toHaveTextContent('expired');
  });
  it('escapes publication content instead of treating it as HTML', () => { const { container } = render(<ProposalCard proposal={{ ...proposal, contentPreview: '<img src=x onerror=alert(1)>' }} status="ready" />); expect(container.querySelector('img')).toBeNull(); expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeVisible(); });
});
describe('ApprovalGate review basis', () => {
  it('shows the content and both version references at the final decision', () => { render(<ApprovalGate proposal={proposal} status="awaiting" approveLabel="Publish update" onDecision={vi.fn()} />); expect(screen.getByText('Exact publication text')).toBeVisible(); expect(screen.getByText('context · version 1')).toBeVisible(); expect(screen.getByText('plan · version 1')).toBeVisible(); });
  it('blocks changed context references under the same proposal version', () => { const props = { proposal, status: 'awaiting' as const, approveLabel: 'Publish update', onDecision: vi.fn() }; const { rerender } = render(<ApprovalGate {...props} />); rerender(<ApprovalGate {...props} proposal={{ ...proposal, reviewBasis: { ...proposal.reviewBasis!, context: { id: 'context', version: '2' } } }} />); expect(screen.getByRole('button', { name: 'Publish update' })).toBeDisabled(); });
  it('blocks changed content under the same proposal version', () => { const props = { proposal, status: 'awaiting' as const, approveLabel: 'Publish update', onDecision: vi.fn() }; const { rerender } = render(<ApprovalGate {...props} />); rerender(<ApprovalGate {...props} proposal={{ ...proposal, contentPreview: 'Changed' }} />); expect(screen.getByRole('button', { name: 'Publish update' })).toBeDisabled(); });
});
