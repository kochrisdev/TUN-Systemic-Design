import { useState } from 'react';
import { MemoryIndicator, SourceView, UncertaintySignal,
  type ContextSnapshot, type EvidenceCollection, type EvidenceSource } from '@tun-systemic/react';

/** Read-only explanation of the existing local fixture, not another permission service. */
export function EvidenceReview({ context }: { context: ContextSnapshot }) {
  const [inspected, setInspected] = useState(false);
  const used = context.sources.some(source => source.usage === 'used');
  const evidence: EvidenceCollection = {
    id: 'task-evidence', version: context.version,
    claim: 'The supplied project notes describe a local simulation.',
    sources: context.sources.map((source): EvidenceSource => {
      const base = { id: source.id, title: `${source.label} (evidence)`, kind: 'Local fixture note',
        relationship: source.usage === 'used' ? 'supports' as const : 'background' as const,
        relationshipExplanation: source.usage === 'used'
          ? 'This note was used to prepare the local template. It establishes nothing about an external deployment.'
          : 'The note has not been used for the current task. Availability alone does not substantiate the output.' };
      if (source.availability === 'restricted' || source.availability === 'missing') return {
        ...base, access: source.availability === 'restricted' ? 'restricted' : 'unavailable',
        reason: 'The current context reports no readable source content.',
      };
      const checked = source.availability === 'available' && source.usage === 'used' &&
        Boolean(source.summary?.includes('All actions in this lab are simulated.'));
      return { ...base, access: 'available',
        excerpt: source.summary ? { kind: 'quote', text: source.summary, location: 'Supplied local fixture' } : undefined,
        verification: { state: checked ? 'verified' : 'unverified', detail: checked
          ? 'The local fixture contains the quoted simulation statement. No external research or independent audit was performed.'
          : source.availability === 'stale' ? 'The source is marked stale in the current context.' : 'The source has not substantiated a current task output.' } };
    }),
  };
  return <section aria-label="Evidence for the current task">
    <p className="lab-step">08 / UNDERSTAND MEMORY AND EVIDENCE</p>
    <div className="lab-grid">
      <div className="lab-column">
        <MemoryIndicator memory={{ id: 'session-notes', version: context.version, type: 'M1', state: used ? 'active' : 'inactive',
          scope: 'The supplied notes in this page session',
          influence: used ? 'The note text influenced the locally prepared template.' : undefined,
          retentionNotice: 'This demo stores state in page memory only. This is not a policy promise for other applications.' }}
          onInspect={() => setInspected(true)} announce />
        {inspected && <p className="simulation-notice" role="status">Inspection opened: only the supplied session note is involved. No memory was edited, deleted, or saved.</p>}
        <UncertaintySignal assessment={{ level: 'U3', scope: 'Suitability for production use',
          explanation: 'The local demonstration cannot establish production readiness.',
          basis: 'There is no production service, independent audit, or external action in this lab.',
          nextStep: 'Review the integration checklist and validate the intended host application.' }} />
      </div>
      <SourceView evidence={evidence} announce />
    </div>
  </section>;
}
