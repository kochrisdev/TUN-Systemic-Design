/** Explicitly stepped, in-memory simulation. No real worker, store, credentials, or external effects. */
import { controlRequest, type ActivityRecord, type ControlEvidence, type ControlRequest,
  type ControlStatus, type InterventionOperation, type RecoveryOperation } from '@tun-systemic/react';
export interface SupervisionState {
  version: number;
  phase: 'running' | 'stopping' | 'stopped' | 'unknown' | 'recovering' | 'recovered';
  loseAcknowledgement: boolean;
  stopWritten: boolean;
  overrideStatus: ControlStatus;
  overrideEvidence?: ControlEvidence;
  recoveryStatus: ControlStatus;
  recoveryOperation?: RecoveryOperation;
  recoveryEvidence?: ControlEvidence;
  records: readonly string[];
  observedAt: string;
}
const actor = { id: 'supervision-agent', name: 'Local supervision agent', type: 'agent' as const };
const effects = 'Two local fixture writes are already recorded. No external system is involved.';
export function initialSupervision(now = new Date().toISOString()): SupervisionState {
  return { version: 1, phase: 'running', loseAcknowledgement: false, stopWritten: false,
    overrideStatus: 'available', recoveryStatus: 'unavailable', records: ['Run 1: two local fixture writes.'], observedAt: now };
}
export function stopOperation(s: SupervisionState): InterventionOperation {
  return { id: 'local-stop', version: String(s.version), run: { id: 'local-run', version: String(s.version) },
    actor, kind: 'stop', target: 'This isolated simulation', scope: 'Stop future fixture work in this run only',
    effect: 'Ask the simulated worker to stop future work.', limits: 'Acknowledgement is not stoppage. Earlier writes remain recorded.', knownEffects: effects };
}
export function recoveryOperation(s: SupervisionState): RecoveryOperation {
  // Different effects have distinct identities. A submitted operation remains an immutable review snapshot.
  return s.recoveryOperation ?? { ...stopOperation(s), id: s.phase === 'unknown' ? 'local-reconcile' : 'local-compensate', kind: s.phase === 'unknown' ? 'reconcile' : 'compensate',
    originalOutcome: s.phase === 'unknown' ? 'unknown' : 'known',
    scope: s.phase === 'unknown' ? 'Inspect the existing stop record for this run only' : 'Compensate the prior local fixture effects only',
    effect: s.phase === 'unknown' ? 'Read the local stop record. Do not repeat any write.' : 'Record a separate compensating fixture action after confirmed stoppage.',
    limits: 'Compensation is not erasure or undo. This is not a real recovery service.' };
}
const matches = (operation: InterventionOperation | RecoveryOperation, request: ControlRequest) => {
  const expected = controlRequest(operation);
  return Object.keys(expected).every(key => expected[key as keyof ControlRequest] === request[key as keyof ControlRequest]);
};
export function requestDemoStop(s: SupervisionState, request: ControlRequest): SupervisionState {
  if (s.phase !== 'running' || !matches(stopOperation(s), request)) throw new Error('Unavailable simulation request');
  return { ...s, phase: 'stopping', overrideStatus: 'acknowledged' };
}
export function requestDemoRecovery(s: SupervisionState, request: ControlRequest): SupervisionState {
  const operation = recoveryOperation(s);
  if (!['stopped', 'unknown'].includes(s.phase) || s.recoveryStatus !== 'available' || !matches(operation, request)) throw new Error('Unavailable simulation recovery');
  return { ...s, phase: 'recovering', recoveryStatus: 'acknowledged', recoveryOperation: operation };
}
/** Manual worker step makes the request/result distinction inspectable without timing races. */
export function advanceSupervision(s: SupervisionState, now = new Date().toISOString()): SupervisionState {
  if (s.phase === 'stopping') {
    const evidence: ControlEvidence = { ...controlRequest(stopOperation(s)), outcome: 'completed', observedAt: now,
      detail: 'The local worker has stopped. The two prior fixture writes remain in history.' };
    return { ...s, phase: s.loseAcknowledgement ? 'unknown' : 'stopped', stopWritten: true,
      overrideStatus: s.loseAcknowledgement ? 'unknown' : 'completed',
      overrideEvidence: s.loseAcknowledgement ? undefined : evidence, recoveryStatus: 'available', observedAt: now,
      records: [...s.records, `Run ${s.version}: worker stop recorded locally.`] };
  }
  if (s.phase === 'recovering' && s.recoveryOperation) {
    if (!s.stopWritten) return { ...s, phase: 'unknown', recoveryStatus: 'unknown', observedAt: now };
    const reconciled = s.recoveryOperation.kind === 'reconcile';
    const detail = reconciled ? 'Read back the existing stop record. No write was repeated; earlier effects remain.'
      : 'One separate compensating fixture action recorded. Original writes remain in history; this was not undo.';
    return { ...s, phase: 'recovered', recoveryStatus: 'completed', overrideStatus: 'completed', observedAt: now,
      overrideEvidence: { ...controlRequest(stopOperation(s)), outcome: 'completed', observedAt: now, detail: 'Local stop record confirmed; prior effects remain.' },
      recoveryEvidence: { ...controlRequest(s.recoveryOperation), outcome: 'completed', observedAt: now, detail },
      records: reconciled ? s.records : [...s.records, `Run ${s.version}: a separate compensating action recorded.`] };
  }
  return s;
}
export function nextSupervision(s: SupervisionState, now = new Date().toISOString()): SupervisionState {
  if (!['stopped', 'recovered'].includes(s.phase)) return s;
  return { ...initialSupervision(now), version: s.version + 1,
    records: [...s.records, `Run ${s.version + 1}: two local fixture writes.`] };
}
export function supervisionActivity(s: SupervisionState): ActivityRecord {
  const stopped = ['stopped', 'recovered'].includes(s.phase);
  return { id: 'local-run', version: String(s.version), actor, task: 'Observe and supervise a stepped local fixture',
    scope: 'Only this simulation; separate from the publication-review lab',
    status: s.phase === 'unknown' ? 'unknown' : stopped ? 'partial' : s.phase === 'running' ? 'running' : 'waiting',
    effects, observedAt: s.observedAt, progress: { completed: 2, total: 5, unit: 'fixture steps' },
    evidence: stopped ? 'Local stop record confirmed. Two of five fixture steps had effects before stoppage.' : undefined,
    blocker: s.phase === 'stopping' ? 'Stop requested. Advance the simulated worker to observe its response.' : s.phase === 'unknown' ? 'The stop outcome is unconfirmed. Reconcile before another effectful request.' : undefined };
}
