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
  it('explains blank input and removes the guidance when text is entered', async () => {
    const submit = vi.fn(); composer(submit, '   ');
    const input = screen.getByRole('textbox');
    expect(input).toHaveAccessibleDescription(/Whitespace alone is not enough/);
    expect(screen.getByRole('button')).toHaveAccessibleDescription(/Enter a request/);
    fireEvent.submit(input.closest('form')!);
    expect(submit).not.toHaveBeenCalled();
    await userEvent.type(input, 'Draft');
    expect(input).not.toHaveAccessibleDescription(/Enter a request/);
    expect(screen.getByRole('button')).toBeEnabled();
  });
  it('explains a reduced length limit and lets the user correct the existing value', async () => {
    const submit = vi.fn();
    function Harness({ limit }: { limit: number }) {
      const [value, setValue] = useState('Draft');
      return <IntentComposer value={value} onValueChange={setValue} onSubmit={submit} scope="Draft only" maxLength={limit} />;
    }
    const { rerender } = render(<Harness limit={10} />);
    rerender(<Harness limit={4} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/over the 4-character limit/);
    expect(screen.getByRole('button')).toBeDisabled();
    fireEvent.submit(input.closest('form')!);
    expect(submit).not.toHaveBeenCalled();
    await userEvent.clear(input);
    await userEvent.type(input, 'Plan');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAccessibleDescription(/over the/);
    await userEvent.click(screen.getByRole('button'));
    expect(submit).toHaveBeenCalledWith('Plan');
  });
  it('keeps unconfirmed outcome guidance visible alongside validation feedback', async () => {
    composer(async () => { throw new Error('private details'); }, 'Draft');
    await userEvent.click(screen.getByRole('button'));
    await userEvent.clear(screen.getByRole('textbox'));
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription(/Enter a request.*Submission was not confirmed/);
  });
  it('describes disabled preparation and gives a supplied blocker priority', () => {
    const props = { value: 'Draft', onValueChange: vi.fn(), onSubmit: vi.fn(), scope: 'Draft only', disabled: true };
    const { rerender } = render(<IntentComposer {...props} />);
    expect(screen.getByRole('button')).toHaveAccessibleDescription(/Request preparation is unavailable/);
    rerender(<IntentComposer {...props} blockedReason="Connect to the host first." />);
    expect(screen.getByRole('button')).toHaveAccessibleDescription('Connect to the host first.');
  });
  it('tracks composition even when a key event omits isComposing', async () => {
    const submit = vi.fn(); composer(submit, 'Draft');
    const input = screen.getByRole('textbox');
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: 'Enter', metaKey: true });
    expect(submit).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: 'Enter', metaKey: true });
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
  });
  it('ignores IME key code 229 when composition has already ended', () => {
    const submit = vi.fn(); composer(submit, 'Draft');
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', ctrlKey: true, keyCode: 229 });
    expect(submit).not.toHaveBeenCalled();
  });
  it('does not resubmit a completed request when the shortcut key repeats', async () => {
    const submit = vi.fn(); composer(submit, 'Draft');
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });
    await waitFor(() => expect(screen.getByRole('button')).toBeEnabled());
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true, repeat: true });
    expect(submit).toHaveBeenCalledTimes(1);
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
