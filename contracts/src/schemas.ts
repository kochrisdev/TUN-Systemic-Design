/** Strict wire schemas, followed by explicit cross-field checks. No coercion or authority grants. */
import { z } from 'zod';
import { parseTimestamp, safeDetailsUrl } from './contracts.js';
import { planIssues } from './review-contracts.js';
import { evidenceIssues, memoryIssues, uncertaintyIssues } from './evidence-contracts.js';

// Explicit ECMAScript whitespace avoids different \S meanings in Python and Go.
export const NonBlankTextSchema = z.string().regex(/[^\u0009-\u000d\u0020\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/, 'Non-blank text required');
const text = NonBlankTextSchema;
// The wire grammar is portable. Calendar validity and supported timezone offsets
// are checked by parseTimestamp after structural parsing, not erased during export.
const timestampWire = z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]{1,3})?(?:Z|[+-][0-9]{2}:[0-9]{2})$(?![\s\S])/);
const detailsUrlWire = z.string().regex(/^(?:\/(?:[^/\\\x00-\x20][^\\\x00-\x20]*)?|https?:\/\/[^\\\x00-\x20]+)$(?![\s\S])/);
export const ConsequenceSchema = z.enum(['C0', 'C1', 'C2', 'C3', 'C4']);
export const AutonomyLevelSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
export const AgentStateSchema = z.enum(['idle', 'listening', 'thinking', 'planning', 'waiting', 'acting', 'verifying', 'blocked', 'completed', 'failed', 'escalated']);
export const ApprovalStatusSchema = z.enum(['awaiting', 'approved', 'rejected', 'expired', 'superseded']);
export const ReceiptStatusSchema = z.enum(['completed', 'partially-completed', 'failed', 'reversed', 'pending-verification']);
export const ActorSchema = z.strictObject({ id: text, name: text, type: z.enum(['human', 'agent', 'system']) });
export const RecoverySchema = z.strictObject({ kind: z.enum(['reversible', 'compensatable', 'irreversible', 'unknown']), description: text });
export const RevisionRefSchema = z.strictObject({ id: text, version: text });
export const ReviewBasisSchema = z.strictObject({ context: RevisionRefSchema, plan: RevisionRefSchema });
const ActionProposalWire = z.strictObject({
  ...RevisionRefSchema.shape, action: text, target: text, actor: ActorSchema,
  consequence: ConsequenceSchema, effect: text, authority: text, recovery: RecoverySchema,
  expiresAt: timestampWire.optional(), reviewBasis: ReviewBasisSchema.optional(), contentPreview: text.optional(),
});
export const DecisionRequestSchema = z.strictObject({ proposalId: text, proposalVersion: text, decision: z.enum(['approve', 'reject']) });
export const AgentProfileSchema = z.strictObject({
  id: text, name: text, purpose: text, autonomy: AutonomyLevelSchema,
  authority: z.array(text), capabilities: z.array(text).optional(),
});
const ReceiptDataWire = z.strictObject({
  id: text, action: text, actor: ActorSchema, target: text, timestamp: timestampWire,
  status: ReceiptStatusSchema, summary: text,
  verification: z.strictObject({ state: z.enum(['verified', 'pending', 'unavailable']), detail: text }),
  recovery: RecoverySchema, detailsUrl: detailsUrlWire.optional(),
});
export const ContextAvailabilitySchema = z.enum(['available', 'stale', 'missing', 'restricted']);
export const ContextUsageSchema = z.enum(['used', 'not-used', 'unknown']);
export const ContextPersistenceSchema = z.enum(['task', 'session', 'persistent', 'operational']);
const contextBase = { id: text, label: text, kind: z.enum(['file', 'note', 'memory', 'tool', 'other']),
  scope: text, persistence: ContextPersistenceSchema, provenance: z.enum(['provided', 'retrieved', 'inferred']) };
const ContextSourceWire = z.union([
  z.strictObject({ ...contextBase, availability: z.enum(['available', 'stale']), usage: ContextUsageSchema,
    summary: text.optional(), detailsUrl: detailsUrlWire.optional(), observedAt: timestampWire.optional() }),
  z.strictObject({ ...contextBase, availability: z.enum(['missing', 'restricted']), usage: z.literal('not-used') }),
]);
const ContextSnapshotWire = z.strictObject({ ...RevisionRefSchema.shape, scope: text,
  sources: z.array(ContextSourceWire), changeSummary: text.optional() });
export const PlanStatusSchema = z.enum(['proposed', 'approved', 'in-progress', 'changed', 'blocked', 'completed']);
export const PlanStepStatusSchema = z.enum(['pending', 'in-progress', 'waiting-approval', 'blocked', 'completed', 'skipped']);
export const PlanStepSchema = z.strictObject({ id: text, title: text, detail: text, status: PlanStepStatusSchema,
  dependsOn: z.array(text).optional(), approvalRequired: z.boolean().optional(), owner: text.optional(), completionEvidence: text.optional() });
const TaskPlanWire = z.strictObject({ ...RevisionRefSchema.shape, context: RevisionRefSchema, objective: text,
  status: PlanStatusSchema, steps: z.array(PlanStepSchema).min(1), expectedOutputs: z.array(text).min(1),
  changeSummary: text.optional(), blockers: z.array(text).optional(), completionEvidence: text.optional() });
export const ProposalStatusSchema = z.enum(['draft', 'ready', 'modified', 'approved', 'rejected', 'expired', 'superseded']);
export const ReviewRequestSchema = z.strictObject({ proposalId: text, proposalVersion: text });
export const MemoryTypeSchema = z.enum(['M0', 'M1', 'M2', 'M3']);
export const MemoryStateSchema = z.enum(['active', 'inactive', 'unavailable']);
const MemoryRecordWire = z.strictObject({ ...RevisionRefSchema.shape, type: MemoryTypeSchema, state: MemoryStateSchema,
  scope: text, influence: text.optional(), retentionNotice: text.optional() });
export const MemoryInspectionRequestSchema = z.strictObject({ memoryId: text, memoryVersion: text });
export const EvidenceAccessSchema = z.enum(['available', 'unavailable', 'restricted']);
export const EvidenceRelationshipSchema = z.enum(['supports', 'contradicts', 'background']);
export const EvidenceExcerptSchema = z.strictObject({ kind: z.enum(['quote', 'paraphrase', 'generated']), text, location: text.optional() });
const evidenceBase = { id: text, title: text, kind: text, relationship: EvidenceRelationshipSchema, relationshipExplanation: text };
const EvidenceSourceWire = z.union([
  z.strictObject({ ...evidenceBase, access: z.literal('available'), excerpt: EvidenceExcerptSchema.optional(),
    url: detailsUrlWire.optional(), observedAt: timestampWire.optional(),
    verification: z.strictObject({ state: z.enum(['verified', 'unverified']), detail: text }) }),
  z.strictObject({ ...evidenceBase, access: z.enum(['unavailable', 'restricted']), reason: text }),
]);
const EvidenceCollectionWire = z.strictObject({ ...RevisionRefSchema.shape, claim: text, sources: z.array(EvidenceSourceWire) });
export const EvidenceStateSchema = z.enum(['verified', 'partial', 'conflicting', 'unavailable']);
export const UncertaintyLevelSchema = z.enum(['U0', 'U1', 'U2', 'U3']);
const UncertaintyAssessmentWire = z.strictObject({ scope: text, level: UncertaintyLevelSchema, explanation: text,
  basis: text.optional(), nextStep: text.optional() });
export const ActivityStatusSchema = z.enum(['idle', 'queued', 'running', 'waiting', 'verifying', 'completed', 'partial', 'failed', 'unknown']);
const ActivityRecordWire = z.strictObject({ ...RevisionRefSchema.shape, actor: ActorSchema, task: text, scope: text,
  status: ActivityStatusSchema, effects: text, observedAt: timestampWire, evidence: text.optional(), blocker: text.optional(),
  progress: z.strictObject({ completed: z.number().min(0), total: z.number().positive(), unit: text }).optional() });
export const ToolCategorySchema = z.enum(['searching', 'reading', 'writing', 'sending', 'publishing', 'transacting', 'executing-code', 'accessing-private-data', 'changing-permissions']);
const ToolActivityRecordWire = z.strictObject({ ...ActivityRecordWire.shape, tool: text, category: ToolCategorySchema, target: text, authority: text });
export const ControlStatusSchema = z.enum(['available', 'pending', 'acknowledged', 'completed', 'failed', 'unknown', 'unavailable']);
export const ControlRequestSchema = z.strictObject({ controlId: text, controlVersion: text, runId: text, runVersion: text });
const controlBase = { ...RevisionRefSchema.shape, run: RevisionRefSchema, actor: ActorSchema, target: text, scope: text,
  effect: text, limits: text, knownEffects: text, expiresAt: timestampWire.optional() };
export const InterventionKindSchema = z.enum(['pause', 'stop', 'cancel', 'take-control', 'revoke', 'escalate']);
const InterventionOperationWire = z.strictObject({ ...controlBase, kind: InterventionKindSchema });
export const RecoveryKindSchema = z.enum(['undo', 'retry', 'restore', 'rollback', 'compensate', 'revise', 'reconcile']);
const RecoveryOperationWire = z.strictObject({ ...controlBase, kind: RecoveryKindSchema, originalOutcome: z.enum(['known', 'unknown']), retrySafety: text.optional() });
const ControlEvidenceWire = z.strictObject({ ...ControlRequestSchema.shape, outcome: z.enum(['completed', 'failed']), observedAt: timestampWire, detail: text });

/** Losslessly exportable JSON wire schemas. These intentionally contain no JavaScript refinements. */
export const WireSchemas = {
  NonBlankText: NonBlankTextSchema,
  Timestamp: timestampWire, DetailsUrl: detailsUrlWire,
  Consequence: ConsequenceSchema, AutonomyLevel: AutonomyLevelSchema, AgentState: AgentStateSchema,
  ApprovalStatus: ApprovalStatusSchema, ReceiptStatus: ReceiptStatusSchema,
  Actor: ActorSchema, Recovery: RecoverySchema, RevisionRef: RevisionRefSchema, ReviewBasis: ReviewBasisSchema,
  ActionProposal: ActionProposalWire, DecisionRequest: DecisionRequestSchema, AgentProfile: AgentProfileSchema,
  ReceiptData: ReceiptDataWire, ContextAvailability: ContextAvailabilitySchema, ContextUsage: ContextUsageSchema,
  ContextPersistence: ContextPersistenceSchema, ContextSource: ContextSourceWire, ContextSnapshot: ContextSnapshotWire,
  PlanStatus: PlanStatusSchema, PlanStepStatus: PlanStepStatusSchema, PlanStep: PlanStepSchema, TaskPlan: TaskPlanWire,
  ProposalStatus: ProposalStatusSchema, ReviewRequest: ReviewRequestSchema,
  MemoryType: MemoryTypeSchema, MemoryState: MemoryStateSchema, MemoryRecord: MemoryRecordWire,
  MemoryInspectionRequest: MemoryInspectionRequestSchema, EvidenceAccess: EvidenceAccessSchema,
  EvidenceRelationship: EvidenceRelationshipSchema, EvidenceExcerpt: EvidenceExcerptSchema, EvidenceSource: EvidenceSourceWire,
  EvidenceCollection: EvidenceCollectionWire, EvidenceState: EvidenceStateSchema, UncertaintyLevel: UncertaintyLevelSchema,
  UncertaintyAssessment: UncertaintyAssessmentWire, ActivityStatus: ActivityStatusSchema, ActivityRecord: ActivityRecordWire,
  ToolCategory: ToolCategorySchema, ToolActivityRecord: ToolActivityRecordWire, ControlStatus: ControlStatusSchema,
  ControlRequest: ControlRequestSchema, InterventionKind: InterventionKindSchema, InterventionOperation: InterventionOperationWire,
  RecoveryKind: RecoveryKindSchema, RecoveryOperation: RecoveryOperationWire, ControlEvidence: ControlEvidenceWire,
} as const;
export type ContractName = keyof typeof WireSchemas;
export type ContractValue<N extends ContractName> = z.output<(typeof WireSchemas)[N]>;

/** Named residual algorithms are recorded beside every exported JSON Schema. */
export const SemanticChecks: Partial<Record<ContractName, readonly string[]>> = {
  Timestamp: ['timestamp'], DetailsUrl: ['url'], ActionProposal: ['timestamp'], ReceiptData: ['timestamp', 'url'],
  ContextSource: ['timestamp', 'url'], ContextSnapshot: ['timestamp', 'url', 'unique-source-ids'],
  TaskPlan: ['plan-graph'], MemoryRecord: ['memory-state'], EvidenceSource: ['timestamp', 'url'],
  EvidenceCollection: ['timestamp', 'url', 'unique-source-ids', 'evidence-metadata'],
  UncertaintyAssessment: ['uncertainty-basis'], ActivityRecord: ['timestamp', 'progress-range'],
  ToolActivityRecord: ['timestamp', 'progress-range'], InterventionOperation: ['timestamp'],
  RecoveryOperation: ['timestamp', 'recovery-policy'], ControlEvidence: ['timestamp'],
};

function commonIssues(value: unknown): string[] {
  const issues: string[] = [];
  // Called ONLY on successfully parsed finite-depth wire records, not arbitrary objects.
  function inspect(node: unknown): void {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(inspect); return; }
    for (const [key, field] of Object.entries(node)) {
      if (['timestamp', 'expiresAt', 'observedAt'].includes(key) && typeof field === 'string' && parseTimestamp(field) === null) issues.push('Invalid calendar timestamp or unsupported offset.');
      if (['url', 'detailsUrl'].includes(key) && typeof field === 'string' && safeDetailsUrl(field) === undefined) issues.push('Unsupported or unsafe navigation URL.');
      inspect(field);
    }
  }
  inspect(value);
  return issues;
}
function semanticIssues<N extends ContractName>(name: N, value: ContractValue<N>): string[] {
  const issues = commonIssues(value);
  if (name === 'Timestamp' && parseTimestamp(value as string) === null) issues.push('Invalid calendar timestamp or unsupported offset.');
  if (name === 'DetailsUrl' && safeDetailsUrl(value as string) === undefined) issues.push('Unsupported or unsafe navigation URL.');
  if (name === 'TaskPlan') issues.push(...planIssues(value as ContractValue<'TaskPlan'>));
  if (name === 'MemoryRecord') issues.push(...memoryIssues(value as ContractValue<'MemoryRecord'>));
  if (name === 'EvidenceCollection') issues.push(...evidenceIssues(value as ContractValue<'EvidenceCollection'>));
  if (name === 'UncertaintyAssessment') issues.push(...uncertaintyIssues(value as ContractValue<'UncertaintyAssessment'>));
  if (name === 'ContextSnapshot') {
    const sources = (value as ContractValue<'ContextSnapshot'>).sources;
    if (new Set(sources.map(s => s.id)).size !== sources.length) issues.push('Source identifiers must be unique.');
  }
  if (name === 'ActivityRecord' || name === 'ToolActivityRecord') {
    const p = (value as ContractValue<'ActivityRecord'>).progress;
    if (p && p.completed > p.total) issues.push('Completed work exceeds total work.');
  }
  if (name === 'RecoveryOperation') {
    const op = value as ContractValue<'RecoveryOperation'>;
    if (op.originalOutcome === 'unknown' && op.kind !== 'reconcile') issues.push('Reconcile the original outcome before effectful recovery.');
    if (op.kind === 'retry' && !op.retrySafety) issues.push('Retry needs a duplicate-effect prevention explanation.');
  }
  return [...new Set(issues)];
}
function runtime<N extends ContractName>(name: N): z.ZodType<ContractValue<N>, unknown> {
  const schema = WireSchemas[name] as unknown as z.ZodType<ContractValue<N>, unknown>;
  return schema.superRefine((value, ctx) => {
    for (const message of semanticIssues(name, value)) ctx.addIssue({ code: 'custom', message });
  });
}

export const TimestampSchema = runtime('Timestamp');
export const DetailsUrlSchema = runtime('DetailsUrl');
export const ActionProposalSchema = runtime('ActionProposal');
export const ReceiptDataSchema = runtime('ReceiptData');
export const ContextSourceSchema = runtime('ContextSource');
export const ContextSnapshotSchema = runtime('ContextSnapshot');
export const TaskPlanSchema = runtime('TaskPlan');
export const MemoryRecordSchema = runtime('MemoryRecord');
export const EvidenceSourceSchema = runtime('EvidenceSource');
export const EvidenceCollectionSchema = runtime('EvidenceCollection');
export const UncertaintyAssessmentSchema = runtime('UncertaintyAssessment');
export const ActivityRecordSchema = runtime('ActivityRecord');
export const ToolActivityRecordSchema = runtime('ToolActivityRecord');
export const InterventionOperationSchema = runtime('InterventionOperation');
export const RecoveryOperationSchema = runtime('RecoveryOperation');
export const ControlEvidenceSchema = runtime('ControlEvidence');
export const RuntimeSchemas = {
  ...WireSchemas, Timestamp: TimestampSchema, DetailsUrl: DetailsUrlSchema,
  ActionProposal: ActionProposalSchema, ReceiptData: ReceiptDataSchema, ContextSource: ContextSourceSchema,
  ContextSnapshot: ContextSnapshotSchema, TaskPlan: TaskPlanSchema, MemoryRecord: MemoryRecordSchema,
  EvidenceSource: EvidenceSourceSchema, EvidenceCollection: EvidenceCollectionSchema,
  UncertaintyAssessment: UncertaintyAssessmentSchema, ActivityRecord: ActivityRecordSchema,
  ToolActivityRecord: ToolActivityRecordSchema, InterventionOperation: InterventionOperationSchema,
  RecoveryOperation: RecoveryOperationSchema, ControlEvidence: ControlEvidenceSchema,
} as const;

/** Parse an unknown JSON value. Parsing never checks live permissions or executes a tool. */
export function validateContract<N extends ContractName>(name: N, input: unknown) {
  return (RuntimeSchemas[name] as z.ZodType<ContractValue<N>, unknown>).safeParse(input);
}
