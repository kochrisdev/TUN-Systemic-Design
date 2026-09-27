/** TUN presentation contracts. These are not an authorization boundary. */
export type Consequence = 'C0' | 'C1' | 'C2' | 'C3' | 'C4';
export type AutonomyLevel = 0 | 1 | 2 | 3 | 4;
export type AgentState = 'idle' | 'listening' | 'thinking' | 'planning' | 'waiting' | 'acting' | 'verifying' | 'blocked' | 'completed' | 'failed' | 'escalated';
export type ApprovalStatus = 'awaiting' | 'approved' | 'rejected' | 'expired' | 'superseded';
export type ReceiptStatus = 'completed' | 'partially-completed' | 'failed' | 'reversed' | 'pending-verification';
export interface Actor { readonly id: string; readonly name: string; readonly type: 'human' | 'agent' | 'system' }
export interface Recovery {
  readonly kind: 'reversible' | 'compensatable' | 'irreversible' | 'unknown';
  readonly description: string;
}
export interface ActionProposal {
  readonly id: string;
  readonly version: string;
  readonly action: string;
  readonly target: string;
  readonly actor: Actor;
  readonly consequence: Consequence;
  readonly effect: string;
  readonly authority: string;
  readonly recovery: Recovery;
  /** Absolute ISO-8601 timestamp with a timezone. Checked again by the service. */
  readonly expiresAt?: string;
}
export interface DecisionRequest {
  readonly proposalId: string;
  readonly proposalVersion: string;
  readonly decision: 'approve' | 'reject';
}
export interface AgentProfile {
  readonly id: string;
  readonly name: string;
  readonly purpose: string;
  readonly autonomy: AutonomyLevel;
  readonly authority: readonly string[];
  readonly capabilities?: readonly string[];
}
export interface ReceiptData {
  readonly id: string;
  readonly action: string;
  readonly actor: Actor;
  readonly target: string;
  readonly timestamp: string;
  readonly status: ReceiptStatus;
  readonly summary: string;
  readonly verification: { readonly state: 'verified' | 'pending' | 'unavailable'; readonly detail: string };
  readonly recovery: Recovery;
  readonly detailsUrl?: string;
}
export const agentLabels: Record<AgentState, string> = {
  idle: 'Idle', listening: 'Listening', thinking: 'Analyzing', planning: 'Planning',
  waiting: 'Waiting for approval', acting: 'Acting', verifying: 'Verifying',
  blocked: 'Blocked', completed: 'Completed', failed: 'Failed', escalated: 'Escalated',
};
export const autonomyLabels: Record<AutonomyLevel, string> = {
  0: 'Human only', 1: 'AI assists', 2: 'AI proposes', 3: 'AI acts', 4: 'AI operates',
};
export const consequenceLabels: Record<Consequence, string> = {
  C0: 'Informational', C1: 'Local reversible', C2: 'Shared reversible',
  C3: 'External consequential', C4: 'High consequence',
};
export const recoveryLabels: Record<Recovery['kind'], string> = {
  reversible: 'Reversible', compensatable: 'Compensation only',
  irreversible: 'Cannot be undone', unknown: 'Recovery not confirmed',
};
export const receiptLabels: Record<ReceiptStatus, string> = {
  completed: 'Completed', 'partially-completed': 'Partially completed', failed: 'Failed',
  reversed: 'Reversed', 'pending-verification': 'Pending verification',
};
/** A change to material presentation data invalidates the displayed decision. */
export function proposalFingerprint(p: ActionProposal): string {
  return JSON.stringify([p.id, p.version, p.action, p.target, p.actor.id, p.actor.name,
    p.actor.type, p.consequence, p.effect, p.authority, p.recovery.kind,
    p.recovery.description, p.expiresAt ?? null]);
}
export function parseTimestamp(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}
export function proposalBlockReason(p: ActionProposal, now: number): string | null {
  if (![p.id, p.version, p.action, p.target, p.actor.id, p.actor.name, p.effect,
    p.authority, p.recovery.description].every(s => typeof s === 'string' && s.trim())) {
    return 'Proposal details are incomplete. Request a fresh proposal.';
  }
  if (!Object.hasOwn(consequenceLabels, p.consequence) ||
      !Object.hasOwn(recoveryLabels, p.recovery.kind) ||
      !['human', 'agent', 'system'].includes(p.actor.type)) {
    return 'Proposal classification is invalid. Request a fresh proposal.';
  }
  if (p.expiresAt !== undefined) {
    const expires = parseTimestamp(p.expiresAt);
    if (expires === null) return 'The approval expiry is invalid. Request a fresh proposal.';
    if (now >= expires) return 'This proposal has expired. Request a fresh proposal.';
  }
  return null;
}
/** Successful-looking receipts require explicit verification from the host. */
export function effectiveReceiptStatus(receipt: ReceiptData): ReceiptStatus {
  if ((receipt.status === 'completed' || receipt.status === 'reversed') &&
      (receipt.verification.state !== 'verified' || !receipt.verification.detail.trim())) {
    return 'pending-verification';
  }
  return receipt.status;
}
/** No javascript:, data:, protocol-relative, or backslash-based links. */
export function safeDetailsUrl(value: string | undefined): string | undefined {
  if (!value || value !== value.trim() || /[\x00-\x20\\]/.test(value)) return undefined;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
      ? url.href : undefined;
  } catch { return undefined; }
}
export function displayTimestamp(value: string): string {
  const time = parseTimestamp(value);
  return time === null ? 'Time unavailable' : new Date(time).toISOString().replace('T', ' ').replace('.000Z', ' UTC').replace('Z', ' UTC');
}
