import { controlRequest, type ActivityRecord, type ControlEvidence, type InterventionOperation, type RecoveryOperation } from '../packages/react/src/supervision-contracts.js';
export const now = Date.parse('2026-09-28T10:00:00Z');
export const actor = { id: 'agent', name: 'Fixture agent', type: 'agent' as const };
export const activity: ActivityRecord = { id: 'run', version: '1', actor, task: 'Review local fixtures', scope: 'Synthetic only', status: 'running', effects: 'Two local changes remain.', observedAt: '2026-09-28T10:00:00Z' };
export const stop: InterventionOperation = { id: 'stop', version: '1', run: { id: 'run', version: '1' }, actor,
  kind: 'stop', target: 'Fixture worker', scope: 'This run', effect: 'Stop future work', limits: 'Earlier changes remain', knownEffects: 'Two local changes.' };
export const recovery: RecoveryOperation = { ...stop, id: 'recover', kind: 'compensate', originalOutcome: 'known' };
export const stopEvidence: ControlEvidence = { ...controlRequest(stop), outcome: 'completed', observedAt: '2026-09-28T10:00:00Z', detail: 'Stopped; two prior effects remain.' };
