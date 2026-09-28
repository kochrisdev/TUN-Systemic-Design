import { expect, it } from 'vitest';
import { initialSupervision, recoveryOperation, requestDemoRecovery, stopOperation } from '../examples/react/supervision-model.js';
import { controlRequest } from '../packages/react/src/supervision-contracts.js';
it('compensation describes its own scope rather than the stop scope', () => {
  const state = { ...initialSupervision(), phase: 'stopped' as const, recoveryStatus: 'available' as const };
  const operation = recoveryOperation(state);
  expect(operation.scope).toBe('Compensate the prior local fixture effects only');
  expect(operation.scope).not.toBe(stopOperation(state).scope);
});
it('reconciliation scope remains bound after the request is acknowledged', () => {
  const state = { ...initialSupervision(), phase: 'unknown' as const, recoveryStatus: 'available' as const };
  const operation = recoveryOperation(state);
  expect(operation.scope).toBe('Inspect the existing stop record for this run only');
  const submitted = requestDemoRecovery(state, controlRequest(operation));
  expect(recoveryOperation(submitted)).toEqual(operation);
});
