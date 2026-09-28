/** Compiled outside the workspace against the installed archive's declarations. */
import { IntentComposer, AgentCard, ContextPanel, PlanView, ProposalCard, ApprovalGate, ActionReceipt,
  MemoryIndicator, SourceView, UncertaintySignal, ToolActivity, AgentActivity, HumanOverride, RecoveryControl,
  type ActionProposal, type AgentProfile, type ContextSnapshot, type ContextSource,
  type DecisionRequest, type ReceiptData, type TaskPlan, type EvidenceSource, type MemoryType,
  type ActivityRecord, type InterventionOperation, type InterventionKind, type ControlRequest, type ControlEvidence } from '@tun-systemic/react';

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
const activity: ActivityRecord = { id: 'run', version: '1', actor, task: 'Observe fixture', scope: 'Local', effects: 'Partial effects remain', status: 'completed', observedAt: '2026-09-28T00:00:00Z' };
const operation: InterventionOperation = { id: 'control', version: '1', run: { id: 'run', version: '1' }, actor,
  kind: 'stop', target: 'Local worker', scope: 'This run', effect: 'Stop future work', limits: 'Earlier effects remain', knownEffects: 'Two fixture writes' };
export const specimens = {
  IntentComposer: <IntentComposer value="Synthetic request" onValueChange={noEffect} onSubmit={noEffect} scope="No external effects" />,
  AgentCard: <AgentCard agent={agent} state="planning" />,
  ContextPanel: <ContextPanel context={context} />,
  PlanView: <PlanView plan={plan} />,
  ProposalCard: <ProposalCard proposal={proposal} status="ready" onReview={noEffect} />,
  ApprovalGate: <ApprovalGate proposal={proposal} status="awaiting" approveLabel="Approve synthetic action" onDecision={noEffect} />,
  ActionReceipt: <ActionReceipt receipt={receipt} />,
  MemoryIndicator: <MemoryIndicator memory={{ id: 'm', version: '1', type: 'M2', state: 'active', scope: 'Fixture', influence: 'Hypothetical preference' }} onInspect={noEffect} />,
  SourceView: <SourceView evidence={{ id: 'e', version: '1', claim: 'A synthetic claim', sources: [{ id: 's', title: 'Fixture source', kind: 'Synthetic note', relationship: 'supports', relationshipExplanation: 'Synthetic relation', access: 'available', excerpt: { kind: 'generated', text: 'Literal <script>not evidence</script>' }, verification: { state: 'verified', detail: 'Generated material must still not be treated as source text.' } }] }} />,
  UncertaintySignal: <UncertaintySignal assessment={{ level: 'U0', scope: 'Fixture', explanation: 'Missing basis deliberately downgrades this assessment.' }} />,
  AgentActivity: <AgentActivity activity={activity} />,
  ToolActivity: <ToolActivity activity={{ ...activity, tool: 'Local tool', category: 'writing', target: 'Fixture', authority: 'No external authority' }} />,
  HumanOverride: <HumanOverride operation={operation} status="completed" onRequest={noEffect} />,
  RecoveryControl: <RecoveryControl operation={{ ...operation, kind: 'retry', originalOutcome: 'unknown' }} status="available" onRequest={noEffect} />,
};
// These errors must remain rejected by the installed declarations.
// @ts-expect-error execution is not a decision-request value
const invalidDecision: DecisionRequest = { proposalId: 'p', proposalVersion: '1', decision: 'execute' };
// @ts-expect-error restricted source metadata cannot contain source content
const invalidSource: ContextSource = { id: 'r', label: 'Restricted', kind: 'note', scope: 'Fixture', persistence: 'session', provenance: 'provided', availability: 'restricted', usage: 'not-used', summary: 'Forbidden extra field' };
// @ts-expect-error memory classifications do not include delegation permissions
const invalidMemory: MemoryType = 'authorized';
// @ts-expect-error restricted evidence cannot include an excerpt
const invalidEvidence: EvidenceSource = { id: 'r', title: 'Restricted', kind: 'Note', relationship: 'background', relationshipExplanation: 'Unavailable', access: 'restricted', reason: 'No access', excerpt: { kind: 'quote', text: 'Must not be sent' } };
// @ts-expect-error control requests must identify the run version
const invalidRequest: ControlRequest = { controlId: 'c', controlVersion: '1', runId: 'r' };
// @ts-expect-error arbitrary destructive commands are not intervention kinds
const invalidKind: InterventionKind = 'destroy';
// @ts-expect-error acknowledgement is not a verified terminal outcome
const invalidOutcome: ControlEvidence['outcome'] = 'acknowledged';
void invalidDecision; void invalidSource; void invalidMemory; void invalidEvidence; void invalidRequest; void invalidKind; void invalidOutcome;
