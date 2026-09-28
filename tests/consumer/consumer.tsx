/** Compiled outside the workspace against the installed archive's declarations. */
import { IntentComposer, AgentCard, ContextPanel, PlanView, ProposalCard, ApprovalGate, ActionReceipt,
  type ActionProposal, type AgentProfile, type ContextSnapshot, type ContextSource,
  type DecisionRequest, type ReceiptData, type TaskPlan } from '@tun-systemic/react';

const noEffect = () => { throw new Error('Rendering must not request an action.'); };
const actor = { id: 'fixture-agent', name: 'Fixture agent', type: 'agent' as const };
const recovery = { kind: 'irreversible' as const, description: 'No external action is performed by this fixture.' };
export const context: ContextSnapshot = { id: 'fixture-context', version: '1', scope: 'Public synthetic notes only',
  sources: [{ id: 'notes', label: 'Synthetic notes', kind: 'note', scope: 'This fixture', persistence: 'session',
    provenance: 'provided', availability: 'available', usage: 'not-used', summary: 'Fixture notes' }] };
export const plan: TaskPlan = { id: 'fixture-plan', version: '1', context: { id: context.id, version: context.version },
  objective: 'Prepare a synthetic update', status: 'proposed', expectedOutputs: ['A reviewable draft'],
  steps: [{ id: 'draft', title: 'Prepare a draft', detail: 'No external effects', status: 'pending', approvalRequired: true }] };
export const proposal: ActionProposal = { id: 'fixture-proposal', version: '1', action: 'Publish synthetic update', actor,
  target: 'Synthetic workspace', consequence: 'C3', effect: 'One hypothetical publication', authority: 'No actual permission',
  recovery, contentPreview: 'Literal <script>not executable</script> text',
  reviewBasis: { context: { id: context.id, version: context.version }, plan: { id: plan.id, version: plan.version } } };
const agent: AgentProfile = { id: actor.id, name: actor.name, purpose: 'Static fixture rendering', autonomy: 2,
  authority: ['Render synthetic information only'], capabilities: ['Prepare a draft'] };
const receipt: ReceiptData = { id: 'fixture-receipt', action: 'Synthetic action record', actor, target: proposal.target,
  timestamp: '2026-09-28T00:00:00Z', status: 'completed', summary: 'This record intentionally lacks verification',
  verification: { state: 'pending', detail: 'No execution was requested.' }, recovery };
export const specimens = {
  IntentComposer: <IntentComposer value="Synthetic request" onValueChange={noEffect} onSubmit={noEffect} scope="No external effects" />,
  AgentCard: <AgentCard agent={agent} state="planning" />,
  ContextPanel: <ContextPanel context={context} />,
  PlanView: <PlanView plan={plan} />,
  ProposalCard: <ProposalCard proposal={proposal} status="ready" onReview={noEffect} />,
  ApprovalGate: <ApprovalGate proposal={proposal} status="awaiting" approveLabel="Approve synthetic action" onDecision={noEffect} />,
  ActionReceipt: <ActionReceipt receipt={receipt} />,
};
// These errors must remain rejected by the installed declarations.
// @ts-expect-error execution is not a decision-request value
const invalidDecision: DecisionRequest = { proposalId: 'p', proposalVersion: '1', decision: 'execute' };
// @ts-expect-error restricted source metadata cannot contain source content
const invalidSource: ContextSource = { id: 'r', label: 'Restricted', kind: 'note', scope: 'Fixture', persistence: 'session', provenance: 'provided', availability: 'restricted', usage: 'not-used', summary: 'Forbidden extra field' };
void invalidDecision; void invalidSource;
