import type { EvidenceCollection, EvidenceSource, MemoryRecord, MemoryType, UncertaintyAssessment } from '@tun-systemic/react';
export type EvidenceExample = 'supported' | 'conflicting' | 'unavailable' | 'generated';
export function evidenceExample(scenario: EvidenceExample): EvidenceCollection {
  const source: EvidenceSource = { id: 'example-note', title: 'Synthetic example note', kind: 'Synthetic fixture',
    relationship: 'supports', relationshipExplanation: 'The fixture explicitly describes a local demonstration.', access: 'available',
    excerpt: { kind: 'quote', text: 'This specimen is a local demonstration.', location: 'Synthetic fixture, sentence 1' },
    verification: { state: 'verified', detail: 'The example fixture contains this exact sentence; not an independent truth check.' } };
  const sources: EvidenceSource[] = scenario === 'unavailable' ? [{ id: 'unavailable-example', title: 'Unavailable synthetic note',
    kind: 'Synthetic fixture', relationship: 'background', relationshipExplanation: 'No supporting content is accessible.',
    access: 'restricted', reason: 'This example intentionally withholds its content.' }]
    : scenario === 'generated' ? [{ ...source, excerpt: { kind: 'generated', text: 'A generated interpretation of the example, without source evidence.' },
      verification: { state: 'unverified', detail: 'Generated text is not a quotation or verified support.' } }]
    : scenario === 'conflicting' ? [source, { ...source, id: 'contrary-example', title: 'Contrary synthetic note', relationship: 'contradicts',
      relationshipExplanation: 'This conflicting fixture describes a live action instead.', excerpt: { kind: 'quote', text: 'This specimen performs a live publication.' },
      verification: { state: 'unverified', detail: 'Conflicting fixture intentionally supplied for review.' } }] : [source];
  return { id: 'example-evidence', version: scenario, claim: 'This specimen is a local demonstration.', sources };
}
export function uncertaintyExample(scenario: EvidenceExample): UncertaintyAssessment {
  if (scenario === 'supported') return { level: 'U0', scope: 'Text in the synthetic example note',
    explanation: 'The note contains the quoted local-demonstration sentence.', basis: 'Exact text in the supplied synthetic fixture, not a production claim.' };
  if (scenario === 'generated') return { level: 'U2', scope: 'Interpretation of the synthetic note',
    explanation: 'The displayed interpretation is generated, not direct source evidence.', basis: 'Only the synthetic interpretation is supplied.', nextStep: 'Obtain original evidence before relying on this interpretation.' };
  return { level: 'U3', scope: 'Whether the example claim is substantiated', explanation: scenario === 'conflicting'
    ? 'The synthetic notes disagree.' : 'The source content is unavailable.', nextStep: 'Resolve the conflicting or missing evidence before making a decision.' };
}
export function memoryExample(mode: MemoryType | 'unavailable'): MemoryRecord {
  return { id: 'example-memory', version: mode, type: mode === 'unavailable' ? 'M2' : mode,
    state: mode === 'unavailable' ? 'unavailable' : mode === 'M0' ? 'inactive' : 'active',
    scope: 'Separate synthetic example; not the approval workflow',
    influence: 'A hypothetical formatting preference influences this example only.',
    retentionNotice: 'This selector changes display fixtures only. No persistent-memory service is connected.' };
}
