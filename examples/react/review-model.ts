/** Local deterministic simulation. No network, AI model, storage, or backend authority. */
import { planIssues, proposalBlockReason, reviewBasisMatches,
  type ActionProposal, type ApprovalStatus, type ContextAvailability, type ContextSnapshot,
  type DecisionRequest, type ProposalStatus, type ReceiptData, type TaskPlan } from '../../packages/react/src/contracts.js';

export interface DemoState {
  readonly intent: string;
  readonly target: string;
  readonly context: ContextSnapshot;
  readonly plan: TaskPlan | null;
  readonly proposal: ActionProposal | null;
  readonly proposalStatus: ProposalStatus;
  readonly approval: ApprovalStatus;
  readonly planReviewed: boolean;
  readonly reviewOpen: boolean;
  readonly phase: 'idle' | 'planned' | 'proposed' | 'reviewing' | 'pending' | 'unknown' | 'completed' | 'rejected';
  readonly revision: number;
  readonly receipts: readonly ReceiptData[];
  /** Simulated action store. Not displayed until verification/reconciliation. */
  readonly ledger: Readonly<Record<string, ReceiptData>>;
  readonly notice: string;
}
export const demoActor = { id: 'demo-agent', name: 'TUN Review Agent', type: 'agent' as const };
const notes = 'The review workflow adds Context Panel, Plan View, and Proposal Card. All actions in this lab are simulated.';
const recovery = { kind: 'irreversible' as const, description: 'Real publications may be copied. This simulation changes only in-memory page state.' };
export function demoContext(version: number, availability: ContextAvailability = 'available', used = false): ContextSnapshot {
  const base = { id: 'notes', label: 'Supplied project notes', kind: 'note' as const,
    scope: 'This local review task', persistence: 'session' as const, provenance: 'provided' as const };
  return { id: 'demo-context', version: String(version), scope: 'Only the supplied project notes; no connected files or accounts.',
    sources: [availability === 'missing' || availability === 'restricted'
      ? { ...base, availability, usage: 'not-used' }
      : { ...base, availability, usage: used ? 'used' : 'not-used', summary: notes }] };
}
export function initialDemo(): DemoState {
  return { intent: 'Prepare a project update from the supplied notes for my review.',
    target: 'Local example workspace — no external service', context: demoContext(1),
    plan: null, proposal: null, proposalStatus: 'draft', approval: 'awaiting', planReviewed: false,
    reviewOpen: false, phase: 'idle', revision: 1, receipts: [], ledger: {}, notice: '' };
}
export function demoLocked(s: DemoState): boolean { return s.phase === 'pending' || s.phase === 'unknown'; }
export function demoSourceReady(s: DemoState): boolean {
  return s.context.sources.length > 0 && s.context.sources.every(source => source.availability === 'available');
}
function invalidate(s: DemoState, notice: string): DemoState {
  return { ...s, proposalStatus: s.proposal ? 'superseded' : 'draft', approval: 'superseded',
    reviewOpen: false, planReviewed: false, phase: 'idle', notice };
}
export function changeDemoContext(s: DemoState, availability: ContextAvailability): DemoState {
  if (demoLocked(s)) return s;
  const revision = s.revision + 1;
  const context = { ...demoContext(revision, availability), changeSummary: 'Source availability changed. The previous review basis is no longer current.' };
  const plan = s.plan ? { ...s.plan, version: String(revision), context: { id: context.id, version: context.version },
    status: 'changed' as const, changeSummary: 'Context changed; prepare a fresh plan.' } : null;
  return { ...invalidate(s, 'Context changed. Prepare a fresh plan; previous approval is invalid.'), revision, context, plan };
}
export function changeDemoIntent(s: DemoState, intent: string): DemoState {
  if (demoLocked(s)) return s;
  return { ...invalidate(s, 'Intent changed. Prepare a fresh plan.'), intent, plan: null };
}
export function prepareDemo(s: DemoState, now = Date.now()): DemoState {
  if (demoLocked(s)) return s;
  if (!demoSourceReady(s) || !s.intent.trim() || !Number.isFinite(now)) return { ...s, notice: 'Current notes and a valid intent are required. No proposal was created.' };
  const revision = s.revision + 1;
  const context = demoContext(revision, 'available', true);
  const plan: TaskPlan = { id: 'demo-plan', version: String(revision), context: { id: context.id, version: context.version },
    objective: s.intent.trim(), status: 'proposed', expectedOutputs: ['A plain-text project update for review', 'A verified local action record only after separate approval'],
    steps: [
      { id: 'read', title: 'Read supplied notes', detail: 'Use only the note text shown in Task context.', status: 'completed', completionEvidence: 'The local template read the supplied note string.' },
      { id: 'draft', title: 'Prepare an update', detail: 'Assemble a deterministic template. No model is called.', status: 'pending', dependsOn: ['read'] },
      { id: 'publish', title: 'Simulate publication after approval', detail: 'Record a local simulation only after approval of the exact proposal version.', status: 'waiting-approval', dependsOn: ['draft'], approvalRequired: true },
    ] };
  return { ...s, revision, context, plan, planReviewed: false, reviewOpen: false, phase: 'planned',
    proposalStatus: s.proposal ? 'superseded' : 'draft', approval: 'awaiting', notice: 'Review the approach. No action has been authorized.' };
}
export function reviewDemoPlan(s: DemoState): DemoState {
  if (demoLocked(s) || !s.plan || !demoSourceReady(s) || planIssues(s.plan).length ||
      s.plan.context.version !== s.context.version || s.phase === 'idle') return s;
  return { ...s, planReviewed: true, plan: { ...s.plan, status: 'approved' }, notice: 'Approach reviewed. Publication still requires a separate action approval.' };
}
export function reviseDemoPlan(s: DemoState): DemoState {
  if (demoLocked(s) || !s.plan) return s;
  const revision = s.revision + 1;
  const plan = { ...s.plan, version: String(revision), status: 'changed' as const,
    completionEvidence: undefined, changeSummary: 'A scope reminder was added to the content before publication. Earlier proposal and approval are superseded.',
    steps: [ ...s.plan.steps.filter(step => !['reminder', 'publish'].includes(step.id)),
      { id: 'reminder', title: 'Include a scope reminder', detail: 'Add an explicit local-simulation reminder to the content preview.', status: 'pending' as const, dependsOn: ['draft'] },
      { ...s.plan.steps.find(step => step.id === 'publish')!, dependsOn: ['reminder'], status: 'waiting-approval' as const } ] };
  return { ...invalidate(s, 'Plan changed. Review the revised approach and generate a new proposal.'),
    revision, plan, phase: 'planned' };
}
export function createDemoProposal(s: DemoState, now = Date.now()): DemoState {
  if (demoLocked(s) || !s.plan || !s.planReviewed || !demoSourceReady(s) || planIssues(s.plan).length ||
      s.plan.context.version !== s.context.version || !Number.isFinite(now)) return s;
  const revision = s.revision + 1;
  const contentPreview = `Project update (local template)\n\n${notes}\n\nRequested outcome: ${s.intent.trim()}${s.plan.steps.some(step => step.id === 'reminder') ? '\n\nScope reminder: this preview does not authorize any external action.' : ''}`;
  const plan = { ...s.plan, steps: s.plan.steps.map(step => ['draft', 'reminder'].includes(step.id)
    ? { ...step, status: 'completed' as const, completionEvidence: step.id === 'draft' ? 'The local template preview was constructed.' : 'The scope reminder was added to the preview string.' } : step) };
  const proposal: ActionProposal = { id: 'demo-publish', version: String(revision), action: 'Publish project update (simulation)',
    target: s.target, actor: demoActor, consequence: 'C3', effect: 'Create one local simulated publication record. Nothing leaves this page.',
    authority: 'One simulated publication of this exact content and target; no continuing permission.', recovery,
    reviewBasis: { context: { id: s.context.id, version: s.context.version }, plan: { id: plan.id, version: plan.version } },
    contentPreview, expiresAt: new Date(now + 10 * 60 * 1000).toISOString() };
  return { ...s, revision, plan, proposal, proposalStatus: 'ready', approval: 'awaiting', reviewOpen: false,
    phase: 'proposed', notice: 'Proposal prepared. Opening review will not approve it.' };
}
export function openDemoReview(s: DemoState, id: string, version: string): DemoState {
  if (demoLocked(s) || !s.plan || !s.proposal || !s.planReviewed || s.proposalStatus !== 'ready' ||
      s.proposal.id !== id || s.proposal.version !== version || !reviewBasisMatches(s.proposal, s.context, s.plan) ||
      proposalBlockReason(s.proposal, Date.now())) return s;
  return { ...s, reviewOpen: true, phase: 'reviewing', notice: 'Review opened. Choose approve or reject explicitly.' };
}
export function beginDemoDecision(s: DemoState, request: DecisionRequest, now = Date.now()): DemoState {
  const p = s.proposal;
  if (!['approve', 'reject'].includes(request.decision) || demoLocked(s) || !s.plan || !p || !s.reviewOpen || !s.planReviewed || s.approval !== 'awaiting' ||
      request.proposalId !== p.id || request.proposalVersion !== p.version || !reviewBasisMatches(p, s.context, s.plan) ||
      proposalBlockReason(p, now)) throw new Error('Stale or unavailable demo review');
  if (request.decision === 'reject') return { ...s, approval: 'rejected', proposalStatus: 'rejected', phase: 'rejected', notice: 'Action rejected. No execution requested.' };
  return { ...s, approval: 'approved', proposalStatus: 'approved', phase: 'pending', notice: 'Decision accepted locally. Execution is not yet verified.' };
}
/** Simulated service write; revalidate just before an effect, not only on button click. */
export function recordDemoAction(s: DemoState, request: DecisionRequest, now = Date.now()): DemoState {
  const p = s.proposal;
  if (s.phase !== 'pending' || !s.plan || !p || request.decision !== 'approve' || s.approval !== 'approved' ||
      request.proposalId !== p.id || request.proposalVersion !== p.version || !reviewBasisMatches(p, s.context, s.plan) ||
      proposalBlockReason(p, now)) throw new Error('Demo execution cannot proceed');
  const key = `${p.id}:${p.version}`;
  if (s.ledger[key]) return s;
  const record: ReceiptData = { id: key, action: 'Simulated publication', actor: demoActor, target: p.target,
    timestamp: new Date(now).toISOString(), status: 'completed',
    summary: 'Simulation completed. Nothing was published, sent, or saved outside this page.',
    verification: { state: 'verified', detail: `Read back the local record for proposal ${p.version}, context ${p.reviewBasis!.context.version}, plan ${p.reviewBasis!.plan.version}.` }, recovery };
  return { ...s, ledger: { ...s.ledger, [key]: record } };
}
/** No retry: read the local canonical record and preserve all prior receipts. */
export function reconcileDemo(s: DemoState): DemoState {
  if (!s.proposal || !['pending', 'unknown'].includes(s.phase)) return s;
  const record = s.ledger[`${s.proposal.id}:${s.proposal.version}`];
  if (!record) return { ...s, phase: 'unknown', notice: 'No verified action record found. Do not retry automatically; refresh this local-only demo to start over.' };
  const plan = s.plan ? { ...s.plan, status: 'completed' as const, completionEvidence: record.verification.detail,
    steps: s.plan.steps.map(step => step.id === 'publish' ? { ...step, status: 'completed' as const, completionEvidence: record.verification.detail } : step) } : null;
  return { ...s, plan, phase: 'completed', reviewOpen: s.phase !== 'unknown',
    receipts: s.receipts.some(r => r.id === record.id) ? s.receipts : [...s.receipts, record],
    notice: 'Verified the simulated action record. No additional action was executed.' };
}
