// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ActionProposalSchema, RuntimeSchemas, WireSchemas, validateContract, proposalBlockReason,
  effectiveReceiptStatus, type ContractName } from '../contracts/src/index.js';
import { buildBundle, rejectCustomChecks, renderBundle } from '../contracts/scripts/json-schema.mjs';
const corpus = JSON.parse(readFileSync('contracts/fixtures/cases.json', 'utf8')) as {
  cases: Array<{ id: string; contract: ContractName; input: unknown; wire: boolean; runtime: boolean }> };
const proposal = corpus.cases.find(c => c.id === 'valid-ActionProposal')!.input;
describe('runtime contracts shared corpus', () => {
  for (const test of corpus.cases) it(test.id, () => {
    expect(WireSchemas[test.contract].safeParse(test.input).success).toBe(test.wire);
    expect(validateContract(test.contract, test.input).success).toBe(test.runtime);
  });
});
it('every schema has valid, null and malformed input fixtures', () => {
  expect(new Set(corpus.cases.map(c => c.contract))).toEqual(new Set(Object.keys(WireSchemas)));
  for (const key of Object.keys(WireSchemas)) {
    expect(corpus.cases.some(c => c.contract === key && c.id === `valid-${key}`)).toBe(true);
    expect(corpus.cases.some(c => c.contract === key && !c.wire)).toBe(true);
  }
  expect(new Set(corpus.cases.map(c => c.id)).size).toBe(corpus.cases.length);
});
it('rejects malformed proposals before typed helpers or UI receive them', () => {
  for (const value of [null, false, [], 2, {}, { ...(proposal as object), actor: null }]) {
    expect(ActionProposalSchema.safeParse(value).success).toBe(false);
  }
});
it('strict parsing rejects hidden content on restricted source records', () => {
  for (const id of ['restricted-evidence-leak', 'restricted-context-leak']) {
    const row = corpus.cases.find(c => c.id === id)!;
    expect(validateContract(row.contract, row.input).success).toBe(false);
  }
});
it('semantic schemas reject contradictory memory and unsafe recovery metadata', () => {
  for (const id of ['active-M0', 'unknown-outcome-retry', 'confirmed-without-basis']) {
    const row = corpus.cases.find(c => c.id === id)!;
    expect(validateContract(row.contract, row.input).success).toBe(false);
  }
});
it('schema parsing preserves expiry as a separate current-time policy decision', () => {
  const input = { ...(proposal as object), expiresAt: '2000-01-01T00:00:00Z' };
  const parsed = ActionProposalSchema.parse(input);
  expect(proposalBlockReason(parsed, Date.parse('2026-09-29T08:00:00Z'))).toContain('expired');
});
it('schema validity does not upgrade unverified receipts to completed outcomes', () => {
  const row = corpus.cases.find(c => c.id === 'pending-verification-is-valid-data')!;
  const parsed = RuntimeSchemas.ReceiptData.parse(row.input);
  expect(effectiveReceiptStatus(parsed)).toBe('pending-verification');
});
it('does not coerce, strip unknown keys, or mutate valid caller data', () => {
  const input = structuredClone(proposal);
  const parsed = ActionProposalSchema.parse(input);
  expect(parsed).toEqual(input); expect(parsed).not.toBe(input);
  expect(ActionProposalSchema.safeParse({ ...(proposal as object), approval: true }).success).toBe(false);
  expect(ActionProposalSchema.safeParse({ ...(proposal as object), version: 1 }).success).toBe(false);
});
it('rejects NaN, Infinity and prototype-like unknown JSON properties', () => {
  expect(RuntimeSchemas.ActivityRecord.safeParse({ ...corpus.cases.find(c=>c.id==='valid-ActivityRecord')!.input as object, progress: { completed: NaN, total: Infinity, unit: 'steps' } }).success).toBe(false);
  const input = JSON.parse(JSON.stringify(proposal).replace(/}$/, ',"__proto__":{"polluted":true}}'));
  expect(ActionProposalSchema.safeParse(input).success).toBe(false);
  expect(({} as Record<string,unknown>).polluted).toBeUndefined();
});
it('generated JSON Schema exactly matches the committed wire contract bundle', () => {
  expect(renderBundle(buildBundle())).toBe(readFileSync('contracts/json-schema/contracts.schema.json', 'utf8'));
});
it('JSON Schema generation refuses to silently discard custom validation', () => {
  expect(()=>rejectCustomChecks(z.string().refine(s=>s==='x'))).toThrow(/custom refinements/);
});
