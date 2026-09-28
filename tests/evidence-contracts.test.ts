import { describe, expect, it } from 'vitest';
import { effectiveUncertaintyLevel, evidenceIssues, evidenceState, memoryIsInspectable, memoryIssues,
  memoryStatusLabel, sourceHasReportedCheck, uncertaintyIssues,
  type EvidenceSource, type MemoryType, type UncertaintyLevel } from '../packages/react/src/evidence-contracts.js';
import { evidenceExample, memoryExample, uncertaintyExample } from '../examples/react/evidence-examples.js';

describe('memory metadata', () => {
  for (const mode of ['M0', 'M1', 'M2', 'M3', 'unavailable'] as const) {
    it(`supports ${mode} without assigning authority`, () => {
      expect(memoryIssues(memoryExample(mode))).toEqual([]);
      expect(memoryIsInspectable(memoryExample(mode))).toBe(!['M0', 'unavailable'].includes(mode));
    });
  }
  it('rejects active no-memory mode', () => { expect(memoryIssues({ ...memoryExample('M0'), state: 'active' })).not.toEqual([]); });
  it('requires influence for active memory', () => { expect(memoryIsInspectable({ ...memoryExample('M2'), influence: ' ' })).toBe(false); });
  it('requires record identity and scope', () => { expect(memoryIssues({ ...memoryExample('M1'), id: '', scope: '' })).not.toEqual([]); });
  it('does not make an unknown classification inspectable', () => { expect(memoryStatusLabel({ ...memoryExample('M1'), type: 'M9' as MemoryType })).toBe('Memory unavailable'); });
  it('makes inactive persistent memory distinct from deleted memory', () => { expect(memoryStatusLabel({ ...memoryExample('M2'), state: 'inactive' })).toContain('not used for this task'); });
});
describe('source evidence metadata', () => {
  for (const [scenario, state] of [['supported', 'verified'], ['conflicting', 'conflicting'], ['unavailable', 'unavailable'], ['generated', 'partial']] as const) {
    it(`summarizes ${scenario} as ${state}`, () => { expect(evidenceState(evidenceExample(scenario))).toBe(state); });
  }
  it('empty source collection is unavailable', () => { expect(evidenceState({ ...evidenceExample('supported'), sources: [] })).toBe('unavailable'); });
  const source = evidenceExample('supported').sources[0] as Extract<EvidenceSource, { access: 'available' }>;
  it('missing check explanation is not verified support', () => { expect(sourceHasReportedCheck({ ...source, verification: { state: 'verified', detail: '' } })).toBe(false); });
  it('generated interpretation cannot be verified source support', () => { expect(sourceHasReportedCheck({ ...source, excerpt: { kind: 'generated', text: 'Generated claim' } })).toBe(false); });
  it('retrieval without an excerpt is not enough', () => { expect(sourceHasReportedCheck({ ...source, excerpt: undefined })).toBe(false); });
  it('background only is partial', () => { expect(evidenceState({ ...evidenceExample('supported'), sources: [{ ...source, relationship: 'background' }] })).toBe('partial'); });
  it('duplicate identities are reported and prevent checked summary', () => { const evidence = { ...evidenceExample('supported'), sources: [source, source] }; expect(evidenceIssues(evidence)).not.toEqual([]); expect(evidenceState(evidence)).toBe('partial'); });
  it('inaccessible corroboration is still partial', () => { expect(evidenceState({ ...evidenceExample('supported'), sources: [source, ...evidenceExample('unavailable').sources] })).toBe('partial'); });
  it('declared contradictory metadata remains visible even when its content is inaccessible', () => {
    const contrary = { ...evidenceExample('unavailable').sources[0]!, relationship: 'contradicts' as const };
    expect(evidenceState({ ...evidenceExample('supported'), sources: [source, contrary] })).toBe('conflicting');
  });
  it('blank claim is not verified', () => { expect(evidenceState({ ...evidenceExample('supported'), claim: '' })).toBe('partial'); });
  it('a paraphrase stays distinct but may have a reported check', () => { expect(sourceHasReportedCheck({ ...source, excerpt: { kind: 'paraphrase', text: 'Local specimen.' } })).toBe(true); });
});
describe('qualitative uncertainty', () => {
  for (const level of ['U0', 'U1', 'U2'] as const) {
    it(`${level} requires a basis`, () => { expect(effectiveUncertaintyLevel({ scope: 'Example', level, explanation: 'Claim', basis: ' ' })).toBe('U3'); });
    it(`${level} preserves its explicitly supported label`, () => { expect(effectiveUncertaintyLevel({ scope: 'Example', level, explanation: 'Claim', basis: 'Supplied evidence' })).toBe(level); });
  }
  it('unknown can honestly lack a basis', () => { expect(uncertaintyIssues(uncertaintyExample('unavailable'))).toEqual([]); });
  it('missing scope falls back to unknown', () => { expect(effectiveUncertaintyLevel({ ...uncertaintyExample('supported'), scope: '' })).toBe('U3'); });
  it('invalid classification falls back to unknown', () => { expect(effectiveUncertaintyLevel({ ...uncertaintyExample('supported'), level: '99%' as UncertaintyLevel })).toBe('U3'); });
  it('missing explanation falls back to unknown', () => { expect(effectiveUncertaintyLevel({ ...uncertaintyExample('supported'), explanation: '' })).toBe('U3'); });
});
