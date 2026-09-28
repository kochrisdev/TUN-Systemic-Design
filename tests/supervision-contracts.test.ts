import { describe, expect, it } from 'vitest';
import { activityLabels, activityStatusLabel, controlBlockReason, controlEvidenceMatches, controlFingerprint,
  controlRequest, interventionLabels, measuredProgress, recoveryActionLabels, type ActivityStatus, type RecoveryKind } from '../packages/react/src/supervision-contracts.js';
import { activity, now, recovery, stop, stopEvidence } from './supervision-fixtures.js';

describe('observation contracts', () => {
  for (const status of Object.keys(activityLabels) as ActivityStatus[]) it(`labels observed ${status}`, () => {
    expect(activityStatusLabel({ ...activity, status, evidence: 'Host record' })).toBe(activityLabels[status]);
  });
  for (const status of ['completed', 'partial', 'failed'] as const) it(`does not assert unverified ${status}`, () => expect(activityStatusLabel({ ...activity, status })).toBe('Outcome not verified'));
  it('rejects unknown observation time', () => expect(activityStatusLabel({ ...activity, observedAt: 'yesterday' })).toBe('Observation time unavailable'));
  it('rejects unknown activity state', () => expect(activityStatusLabel({ ...activity, status: 'invented' as ActivityStatus })).toBe('Outcome unknown'));
  it('does not infer completion from a full counter', () => expect(activityStatusLabel({ ...activity, progress: { completed: 5, total: 5, unit: 'steps' } })).toBe('Running'));
  for (const [completed, total] of [[-1, 5], [6, 5], [1, 0], [NaN, 5], [1, Infinity]]) it(`rejects invalid progress ${completed}/${total}`, () => expect(measuredProgress({ ...activity, progress: { completed, total, unit: 'steps' } })).toBeNull());
  it('shows zero measured progress', () => expect(measuredProgress({ ...activity, progress: { completed: 0, total: 5, unit: 'steps' } })).toBe('0 of 5 steps'));
  it('has no invented progress', () => expect(measuredProgress(activity)).toBeNull());
});
describe('control contracts', () => {
  for (const kind of Object.keys(interventionLabels) as (keyof typeof interventionLabels)[]) it(`accepts explicit ${kind}`, () => expect(controlBlockReason({ ...stop, kind }, 'intervention', now)).toBeNull());
  for (const kind of Object.keys(recoveryActionLabels) as RecoveryKind[]) it(`accepts documented known-outcome ${kind}`, () => expect(controlBlockReason({ ...recovery, kind, retrySafety: 'Host deduplicates by immutable operation key' }, 'recovery', now)).toBeNull());
  for (const kind of ['undo', 'retry', 'restore', 'rollback', 'compensate', 'revise'] as const) it(`blocks ${kind} after an unknown outcome`, () => expect(controlBlockReason({ ...recovery, kind, originalOutcome: 'unknown' }, 'recovery', now)).toMatch(/Check the original/));
  it('allows reconciliation of unknown outcomes', () => expect(controlBlockReason({ ...recovery, kind: 'reconcile', originalOutcome: 'unknown' }, 'recovery', now)).toBeNull());
  it('retry requires a safeguard', () => expect(controlBlockReason({ ...recovery, kind: 'retry' }, 'recovery', now)).toMatch(/duplicate-effect/));
  for (const field of ['id', 'version', 'target', 'scope', 'effect', 'limits', 'knownEffects'] as const) it(`requires ${field}`, () => expect(controlBlockReason({ ...stop, [field]: '' }, 'intervention', now)).toMatch(/incomplete/));
  it('rejects invalid clocks', () => expect(controlBlockReason(stop, 'intervention', NaN)).toMatch(/clock/));
  it('rejects invalid calendar expiry', () => expect(controlBlockReason({ ...stop, expiresAt: '2026-02-30T00:00:00Z' }, 'intervention', now)).toMatch(/invalid/));
  it('rejects exact expiry', () => expect(controlBlockReason({ ...stop, expiresAt: new Date(now).toISOString() }, 'intervention', now)).toMatch(/expired/));
  it('emits identities only', () => expect(controlRequest(stop)).toEqual({ controlId: 'stop', controlVersion: '1', runId: 'run', runVersion: '1' }));
  it('ignores property order', () => expect(controlFingerprint({ ...stop, actor: { type: 'agent', name: 'Fixture agent', id: 'agent' } })).toBe(controlFingerprint(stop)));
  it('fingerprints scope changes', () => expect(controlFingerprint({ ...stop, scope: 'Broader scope' })).not.toBe(controlFingerprint(stop)));
  it('fingerprints recovery outcome', () => expect(controlFingerprint({ ...recovery, originalOutcome: 'unknown' })).not.toBe(controlFingerprint(recovery)));
  it('matches bound completion evidence', () => expect(controlEvidenceMatches(stop, stopEvidence, 'completed')).toBe(true));
  for (const field of ['controlId', 'controlVersion', 'runId', 'runVersion', 'observedAt', 'detail'] as const) it(`rejects invalid evidence ${field}`, () => expect(controlEvidenceMatches(stop, { ...stopEvidence, [field]: '' }, 'completed')).toBe(false));
  it('rejects mismatched outcome', () => expect(controlEvidenceMatches(stop, stopEvidence, 'failed')).toBe(false));
  it('does not invent absent evidence', () => expect(controlEvidenceMatches(stop, undefined, 'completed')).toBe(false));
});
