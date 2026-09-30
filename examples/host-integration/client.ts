import { parseTimestamp, type ActionProposal, type ApprovalStatus, type ReceiptData } from '../../packages/react/src/contracts.js';

export type OperationState = 'authorized' | 'pending-verification' | 'outcome-unknown' | 'verified' | 'cancelled';
export interface ProposalRecord { proposal: ActionProposal; state: ApprovalStatus; kind: 'publish' | 'withdraw' }
export interface Operation { id: string; proposalId: string; proposalVersion: string; state: OperationState; receipt: ReceiptData | null }
export interface Snapshot {
  session: { id: string; tenant: string; canWrite: boolean; canAdmin: boolean };
  proposals: ProposalRecord[];
  operations: Operation[];
  events: { sequence: number; actor: string; resource: string; event: string; at: string }[];
}
const invalid = (): never => { throw new Error('The host returned an invalid pilot response. No new receipt can be displayed.'); };
const object = (v: unknown): Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : invalid();
const string = (v: unknown): string => typeof v === 'string' && v.trim().length > 0 && v.length <= 8000 ? v : invalid();
const boolean = (v: unknown): boolean => typeof v === 'boolean' ? v : invalid();
const array = (v: unknown): unknown[] => Array.isArray(v) && v.length <= 100 ? v : invalid();
function enumeration<T extends string>(v: unknown, allowed: readonly T[]): T { return typeof v === 'string' && allowed.includes(v as T) ? v as T : invalid(); }
function timestamp(v: unknown): string { const result = string(v); return parseTimestamp(result) === null ? invalid() : result; }
function actor(v: unknown): ActionProposal['actor'] { const a = object(v); return { id: string(a.id), name: string(a.name), type: enumeration(a.type, ['human'] as const) }; }
function recovery(v: unknown): ActionProposal['recovery'] { const r = object(v); return { kind: enumeration(r.kind, ['reversible', 'compensatable', 'irreversible', 'unknown'] as const), description: string(r.description) }; }
function proposal(v: unknown): ActionProposal {
  const p = object(v);
  return { id: string(p.id), version: string(p.version), action: string(p.action), target: string(p.target), actor: actor(p.actor), consequence: enumeration(p.consequence, ['C1'] as const), effect: string(p.effect), authority: string(p.authority), recovery: recovery(p.recovery), expiresAt: timestamp(p.expiresAt), contentPreview: string(p.contentPreview) };
}
function receipt(v: unknown): ReceiptData {
  const r = object(v), verification = object(r.verification);
  return { id: string(r.id), action: string(r.action), target: string(r.target), actor: actor(r.actor), timestamp: timestamp(r.timestamp), status: enumeration(r.status, ['completed'] as const), summary: string(r.summary), recovery: recovery(r.recovery), verification: { state: enumeration(verification.state, ['verified'] as const), detail: string(verification.detail) } };
}
/** Narrow pilot protocol decoder, not the pending general-purpose TUN schemas.
 * A successful fetch/callback is never converted into a receipt here. */
export function decodeSnapshot(input: unknown): Snapshot {
  const s = object(input), session = object(s.session);
  return {
    session: { id: string(session.id), tenant: string(session.tenant), canWrite: boolean(session.canWrite), canAdmin: boolean(session.canAdmin) },
    proposals: array(s.proposals).map(value => { const p = object(value); return { proposal: proposal(p.proposal), state: enumeration(p.state, ['awaiting', 'approved', 'rejected', 'expired', 'superseded'] as const), kind: enumeration(p.kind, ['publish', 'withdraw'] as const) }; }),
    operations: array(s.operations).map(value => {
      const o = object(value), state = enumeration(o.state, ['authorized', 'pending-verification', 'outcome-unknown', 'verified', 'cancelled'] as const);
      if ((state === 'verified') !== (o.receipt !== null)) invalid();
      const verifiedReceipt = state === 'verified' ? receipt(o.receipt) : null;
      const id = string(o.id);
      if (verifiedReceipt && verifiedReceipt.id !== id) invalid();
      return { id, proposalId: string(o.proposalId), proposalVersion: string(o.proposalVersion), state, receipt: verifiedReceipt };
    }),
    events: array(s.events).map(value => { const e = object(value); if (typeof e.sequence !== 'number' || !Number.isSafeInteger(e.sequence) || e.sequence < 1) invalid(); return { sequence: e.sequence as number, actor: string(e.actor), resource: string(e.resource), event: string(e.event), at: timestamp(e.at) }; }),
  };
}
export function receiptFor(operation: Operation | undefined): ReceiptData | null {
  return operation?.state === 'verified' && operation.receipt?.verification.state === 'verified' && operation.receipt.id === operation.id ? operation.receipt : null;
}
export async function api(token: string, path: string, body?: unknown): Promise<unknown> {
  const response = await fetch(path, { method: body === undefined ? 'GET' : 'POST', cache: 'no-store', credentials: 'omit', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  if (!response.ok) {
    // Do not reflect arbitrary server/proxy bodies or private exception text.
    throw new Error(response.status === 403 ? 'The server denied this request. Check current permission.' : response.status === 409 ? 'The server rejected a stale or ineligible action. Refresh its records.' : response.status === 401 ? 'The local access token is invalid.' : 'The server did not confirm the request. Refresh records; do not blindly repeat it.');
  }
  return response.json();
}
