import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ApprovalGate, ProposalCard, type ActionProposal } from '../packages/react/src/index.js';
const proposal: ActionProposal = { id: 'p', version: '1', action: 'Publish update', target: 'Workspace',
  actor: { id: 'a', name: 'Writer', type: 'agent' }, consequence: 'C3', effect: 'Publish once', authority: 'One publication',
  recovery: { kind: 'irreversible', description: 'Copies may remain' } };
it('proposal inspection and final approval have distinct landmark names for the same action', () => {
  render(<><ProposalCard proposal={proposal} status="ready" />
    <ApprovalGate proposal={proposal} status="awaiting" approveLabel="Publish update" onDecision={vi.fn()} /></>);
  expect(screen.getByRole('region', { name: 'Proposal · not executed Publish update' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: /^Publish update$/ })).toBeInTheDocument();
});
it('an approved proposal does not claim that execution never happened', () => {
  render(<ProposalCard proposal={proposal} status="approved" />);
  expect(screen.getByText('Proposal · execution tracked separately')).toBeVisible();
  expect(screen.queryByText('Proposal · not executed')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('execution not confirmed here');
});
