import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ActionReceipt, AgentCard, ApprovalGate, IntentComposer, type ActionProposal, type ReceiptData } from '../packages/react/src/index.js';
const proposal: ActionProposal = {
  id: 'publish-1', version: '1', action: 'Publish report', target: 'Public workspace',
  actor: { id: 'writer', name: 'Writer', type: 'agent' }, consequence: 'C3',
  effect: 'The report becomes public.', authority: 'Publish once.',
  recovery: { kind: 'irreversible', description: 'Copies may remain.' },
};
const record: ReceiptData = {
  id: 'receipt-1', action: 'Publish report', actor: proposal.actor, target: proposal.target,
  timestamp: '2026-09-27T08:00:00Z', status: 'completed', summary: 'Publication record.',
  verification: { state: 'verified', detail: 'Confirmed by application readback.' }, recovery: proposal.recovery,
};
function composer(onSubmit: (intent: string) => void | Promise<void>, initial = '') {
  function Harness() { const [value, setValue] = useState(initial); return <IntentComposer value={value} onValueChange={setValue} onSubmit={onSubmit} scope="Draft only; no external changes." />; }
  return render(<Harness />);
}
describe('IntentComposer', () => {
  it('uses a visible label and blocks blank input', () => {
    composer(vi.fn());
    expect(screen.getByRole('textbox', { name: 'What would you like to achieve?' })).toHaveAccessibleDescription(/Draft only/);
    expect(screen.getByRole('button', { name: 'Prepare proposal' })).toBeDisabled();
  });
  it('submits a trimmed intent without clearing it', async () => {
    const submit = vi.fn(); composer(submit, '  Prepare a draft  ');
    await userEvent.click(screen.getByRole('button', { name: 'Prepare proposal' }));
    expect(submit).toHaveBeenCalledWith('Prepare a draft');
    expect(screen.getByRole('textbox')).toHaveValue('  Prepare a draft  ');
  });
  it('locks duplicate in-flight requests', async () => {
    let resolve!: () => void;
    const submit = vi.fn(() => new Promise<void>(r => { resolve = r; })); composer(submit, 'Draft');
    const button = screen.getByRole('button', { name: 'Prepare proposal' });
    fireEvent.click(button); fireEvent.click(button);
    expect(submit).toHaveBeenCalledTimes(1);
    await act(async () => resolve());
  });
  it('does not treat ordinary Enter as submission', () => {
    const submit = vi.fn(); composer(submit, 'Draft');
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' }); expect(submit).not.toHaveBeenCalled();
  });
  it('supports the keyboard submit shortcut', async () => {
    const submit = vi.fn(); composer(submit, 'Draft');
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', ctrlKey: true });
    await waitFor(() => expect(submit).toHaveBeenCalledWith('Draft'));
  });
  it('does not submit during IME composition', () => {
    const submit = vi.fn(); composer(submit, 'Draft');
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', ctrlKey: true, isComposing: true });
    expect(submit).not.toHaveBeenCalled();
  });
  it('does not expose an exception payload', async () => {
    composer(async () => { throw new Error('secret-token'); }, 'Draft');
    await userEvent.click(screen.getByRole('button', { name: 'Prepare proposal' }));
    expect(await screen.findByText(/Submission was not confirmed/)).toBeVisible();
    expect(screen.queryByText(/secret-token/)).not.toBeInTheDocument();
  });
  it('keeps ids unique across instances', () => {
    const props = { value: '', onValueChange: vi.fn(), onSubmit: vi.fn(), scope: 'Draft only' };
    render(<><IntentComposer {...props} /><IntentComposer {...props} /></>);
    const inputs = screen.getAllByRole('textbox'); expect(inputs[0].id).not.toBe(inputs[1].id);
  });
});
describe('AgentCard', () => {
  it('separates capability from permission', () => {
    render(<AgentCard agent={{ id: 'writer', name: 'Writer', purpose: 'Draft reports', autonomy: 2, authority: ['Draft only'], capabilities: ['Publish'] }} state="waiting" />);
    expect(screen.getByText('Draft only')).toBeVisible();
    expect(screen.getByText('Capabilities — not permissions')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Waiting for approval');
  });
});
describe('ApprovalGate', () => {
  it('emits a version-bound decision, never a receipt', async () => {
    const decision = vi.fn(); render(<ApprovalGate proposal={proposal} status="awaiting" approveLabel="Publish report" onDecision={decision} />);
    await userEvent.click(screen.getByRole('button', { name: 'Publish report' }));
    expect(decision).toHaveBeenCalledWith({ proposalId: 'publish-1', proposalVersion: '1', decision: 'approve' });
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish report' })).toBeDisabled();
  });
  it('rejects without emitting approval', async () => {
    const decision = vi.fn(); render(<ApprovalGate proposal={proposal} status="awaiting" approveLabel="Publish report" onDecision={decision} />);
    await userEvent.click(screen.getByRole('button', { name: 'Reject action' }));
    expect(decision).toHaveBeenCalledWith({ proposalId: 'publish-1', proposalVersion: '1', decision: 'reject' });
  });
  it('latches both controls while a decision is pending', async () => {
    let resolve!: () => void;
    const decision = vi.fn(() => new Promise<void>(r => { resolve = r; }));
    render(<ApprovalGate proposal={proposal} status="awaiting" approveLabel="Publish report" onDecision={decision} />);
    fireEvent.click(screen.getByRole('button', { name: 'Publish report' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reject action' }));
    expect(decision).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Reject action' })).toBeDisabled();
    await act(async () => resolve());
  });
  it('fails closed on an unknown decision outcome', async () => {
    render(<ApprovalGate proposal={proposal} status="awaiting" approveLabel="Publish report" onDecision={async () => { throw new Error('secret'); }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Publish report' }));
    expect(await screen.findByText(/Decision outcome is unknown/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Publish report' })).toBeDisabled();
  });
  it('blocks same-version changes to the target', () => {
    const props = { proposal, status: 'awaiting' as const, approveLabel: 'Publish report', onDecision: vi.fn() };
    const { rerender } = render(<ApprovalGate {...props} />);
    rerender(<ApprovalGate {...props} proposal={{ ...proposal, target: 'Different target' }} />);
    expect(screen.getByText(/changed without a new version/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Publish report' })).toBeDisabled();
  });
  it('opens a fresh review for a new proposal version', async () => {
    const props = { proposal, status: 'awaiting' as const, approveLabel: 'Publish report', onDecision: vi.fn() };
    const { rerender } = render(<ApprovalGate {...props} />);
    await userEvent.click(screen.getByRole('button', { name: 'Reject action' }));
    rerender(<ApprovalGate {...props} proposal={{ ...proposal, version: '2' }} />);
    expect(screen.getByRole('button', { name: 'Publish report' })).toBeEnabled();
  });
  it('blocks expired proposals', () => {
    render(<ApprovalGate proposal={{ ...proposal, expiresAt: '2000-01-01T00:00:00Z' }} status="awaiting" approveLabel="Publish report" onDecision={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Publish report' })).toBeDisabled();
  });
  it('blocks terminal statuses', () => {
    render(<ApprovalGate proposal={proposal} status="superseded" approveLabel="Publish report" onDecision={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Publish report' })).toBeDisabled();
  });
});
describe('ActionReceipt', () => {
  it('renders verified state and a supplied timestamp', () => {
    render(<ActionReceipt receipt={record} />);
    expect(screen.getByRole('status')).toHaveTextContent('Completed');
    expect(screen.getByText('2026-09-27 08:00:00 UTC')).toHaveAttribute('datetime', record.timestamp);
  });
  it('downgrades unverified success', () => {
    render(<ActionReceipt receipt={{ ...record, verification: { state: 'pending', detail: 'Awaiting confirmation.' } }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Pending verification');
  });
  it('omits unsafe audit links', () => {
    render(<ActionReceipt receipt={{ ...record, detailsUrl: 'javascript:alert(1)' }} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
  it('escapes supplied text instead of rendering HTML', () => {
    const { container } = render(<ActionReceipt receipt={{ ...record, summary: '<img src=x onerror=alert(1)>' }} />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeVisible();
  });
});
