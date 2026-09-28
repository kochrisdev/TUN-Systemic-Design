/** Host-supplied presentation contracts, not authorization or execution services. */
import { parseTimestamp, type Actor } from './contracts.js';
import type { RevisionRef } from './review-contracts.js';

export type ActivityStatus = 'idle' | 'queued' | 'running' | 'waiting' | 'verifying' | 'completed' | 'partial' | 'failed' | 'unknown';
export interface ActivityRecord extends RevisionRef {
  readonly actor: Actor;
  readonly task: string;
  readonly scope: string;
  readonly status: ActivityStatus;
  /** What is known about effects, including partial or unknown effects. */
  readonly effects: string;
  readonly observedAt: string;
  readonly evidence?: string;
  readonly blocker?: string;
  readonly progress?: { readonly completed: number; readonly total: number; readonly unit: string };
}
export type ToolCategory = 'searching' | 'reading' | 'writing' | 'sending' | 'publishing' | 'transacting' | 'executing-code' | 'accessing-private-data' | 'changing-permissions';
export interface ToolActivityRecord extends ActivityRecord {
  readonly tool: string;
  readonly category: ToolCategory;
  readonly target: string;
  readonly authority: string;
}
export const activityLabels: Record<ActivityStatus, string> = {
  idle: 'Idle', queued: 'Queued', running: 'Running', waiting: 'Waiting', verifying: 'Verifying',
  completed: 'Completed', partial: 'Partially completed', failed: 'Failed', unknown: 'Outcome unknown',
};
export const toolCategoryLabels: Record<ToolCategory, string> = {
  searching: 'Searching', reading: 'Reading', writing: 'Writing', sending: 'Sending', publishing: 'Publishing',
  transacting: 'Transacting', 'executing-code': 'Executing code', 'accessing-private-data': 'Accessing private data',
  'changing-permissions': 'Changing permissions',
};
const text = (value: unknown): value is string => typeof value === 'string' && Boolean(value.trim());
export function activityStatusLabel(record: ActivityRecord): string {
  if (!Object.hasOwn(activityLabels, record.status)) return 'Outcome unknown';
  if (parseTimestamp(record.observedAt) === null) return 'Observation time unavailable';
  if (['completed', 'partial', 'failed'].includes(record.status) && !text(record.evidence)) return 'Outcome not verified';
  return activityLabels[record.status];
}
export function measuredProgress(record: ActivityRecord): string | null {
  const p = record.progress;
  return p && Number.isFinite(p.completed) && Number.isFinite(p.total) && p.total > 0 &&
    p.completed >= 0 && p.completed <= p.total && text(p.unit)
    ? `${p.completed} of ${p.total} ${p.unit}` : null;
}

export type ControlStatus = 'available' | 'pending' | 'acknowledged' | 'completed' | 'failed' | 'unknown' | 'unavailable';
export interface ControlRequest {
  readonly controlId: string;
  readonly controlVersion: string;
  readonly runId: string;
  readonly runVersion: string;
}
interface ControlBase extends RevisionRef {
  readonly run: RevisionRef;
  readonly actor: Actor;
  readonly target: string;
  readonly scope: string;
  readonly effect: string;
  readonly limits: string;
  readonly knownEffects: string;
  readonly expiresAt?: string;
}
export type InterventionKind = 'pause' | 'stop' | 'cancel' | 'take-control' | 'revoke' | 'escalate';
export interface InterventionOperation extends ControlBase { readonly kind: InterventionKind }
export type RecoveryKind = 'undo' | 'retry' | 'restore' | 'rollback' | 'compensate' | 'revise' | 'reconcile';
export interface RecoveryOperation extends ControlBase {
  readonly kind: RecoveryKind;
  readonly originalOutcome: 'known' | 'unknown';
  /** Required for retry: host explains its duplicate-effect prevention, not proof supplied by the UI. */
  readonly retrySafety?: string;
}
export interface ControlEvidence extends ControlRequest {
  readonly outcome: 'completed' | 'failed';
  readonly observedAt: string;
  readonly detail: string;
}
export const interventionLabels: Record<InterventionKind, string> = {
  pause: 'Request pause', stop: 'Request stop', cancel: 'Request cancellation',
  'take-control': 'Request human takeover', revoke: 'Request permission revocation', escalate: 'Request escalation',
};
export const recoveryActionLabels: Record<RecoveryKind, string> = {
  undo: 'Request undo', retry: 'Request retry', restore: 'Request restoration', rollback: 'Request rollback',
  compensate: 'Request compensation', revise: 'Request revision', reconcile: 'Check original action status',
};
export const interventionCompletionLabels: Record<InterventionKind, string> = {
  pause: 'Pause confirmed', stop: 'Stop confirmed', cancel: 'Cancellation confirmed',
  'take-control': 'Human takeover confirmed', revoke: 'Permission revocation confirmed', escalate: 'Escalation confirmed',
};
export const recoveryCompletionLabels: Record<RecoveryKind, string> = {
  undo: 'Undo confirmed', retry: 'Retry result confirmed', restore: 'Restoration confirmed', rollback: 'Rollback confirmed',
  compensate: 'Compensation confirmed — not undo', revise: 'Revision confirmed', reconcile: 'Status check completed — no retry',
};
export function controlRequest(operation: ControlBase): ControlRequest {
  return { controlId: operation.id, controlVersion: operation.version, runId: operation.run.id, runVersion: operation.run.version };
}
/** Explicit ordered fields: ordinary object key order is not a material revision. */
export function controlFingerprint(operation: InterventionOperation | RecoveryOperation): string {
  return JSON.stringify([operation.id, operation.version, operation.run.id, operation.run.version,
    operation.actor.id, operation.actor.name, operation.actor.type, operation.kind, operation.target,
    operation.scope, operation.effect, operation.limits, operation.knownEffects, operation.expiresAt ?? null,
    'originalOutcome' in operation ? operation.originalOutcome : null,
    'retrySafety' in operation ? operation.retrySafety ?? null : null]);
}
export function controlBlockReason(operation: InterventionOperation | RecoveryOperation, family: 'intervention' | 'recovery', now: number): string | null {
  if (!Number.isFinite(now)) return 'The control clock is unavailable.';
  if (![operation.id, operation.version, operation.run.id, operation.run.version, operation.actor.id,
    operation.actor.name, operation.target, operation.scope, operation.effect, operation.limits, operation.knownEffects].every(text)) return 'Control details are incomplete.';
  if (!['human', 'agent', 'system'].includes(operation.actor.type)) return 'The acting identity is invalid.';
  const kinds = family === 'intervention' ? interventionLabels : recoveryActionLabels;
  if (!Object.hasOwn(kinds, operation.kind)) return 'This control action is not supported.';
  if (family === 'recovery') {
    if (!('originalOutcome' in operation) || !['known', 'unknown'].includes(operation.originalOutcome)) return 'The original outcome must be identified.';
    if (operation.originalOutcome === 'unknown' && operation.kind !== 'reconcile') return 'Check the original action status before another effectful recovery attempt.';
    if (operation.kind === 'retry' && !text(operation.retrySafety)) return 'Retry requires a host-supplied duplicate-effect prevention explanation.';
  }
  if (operation.expiresAt !== undefined) {
    const expiry = parseTimestamp(operation.expiresAt);
    if (expiry === null) return 'The control expiry is invalid.';
    if (now >= expiry) return 'This control request has expired.';
  }
  return null;
}
/** This checks binding and presentation completeness, never evidence authenticity. */
export function controlEvidenceMatches(operation: ControlBase, evidence: ControlEvidence | undefined, outcome: 'completed' | 'failed'): boolean {
  const r = controlRequest(operation);
  return Boolean(evidence && evidence.controlId === r.controlId && evidence.controlVersion === r.controlVersion &&
    evidence.runId === r.runId && evidence.runVersion === r.runVersion && evidence.outcome === outcome &&
    parseTimestamp(evidence.observedAt) !== null && text(evidence.detail));
}
