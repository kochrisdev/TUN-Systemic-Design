'use client';
import { useId } from 'react';
import { displayTimestamp, parseTimestamp, safeDetailsUrl } from './contracts.js';
import { evidenceIssues, evidenceRelationshipLabels, evidenceState, evidenceStateLabels, sourceHasReportedCheck,
  type EvidenceCollection, type EvidenceSource } from './evidence-contracts.js';

export interface SourceViewProps { evidence: EvidenceCollection; title?: string; announce?: boolean; className?: string }
export function SourceView({ evidence, title = 'Sources and evidence', announce = false, className = '' }: SourceViewProps) {
  const id = useId();
  const issues = evidenceIssues(evidence);
  return <section className={`tun-component tun-evidence ${className}`} aria-labelledby={`${id}-title`}>
    <p className="tun-eyebrow">Evidence · source access is not truth</p>
    <h2 id={`${id}-title`} className="tun-heading">{title}</h2>
    <p><strong>Claim under review: </strong>{evidence.claim || 'Claim unavailable'}</p>
    <p className="tun-badge" role={announce ? 'status' : undefined} aria-atomic={announce || undefined}>{evidenceStateLabels[evidenceState(evidence)]}</p>
    {issues.length > 0 && <p className="tun-notice">{issues.join(' ')}</p>}
    {evidence.sources.length ? <ul className="tun-source-list">{evidence.sources.map((source, index) =>
      <EvidenceItem key={`${source.id}-${index}`} source={source} />)}</ul>
      : <p className="tun-muted">No evidence supplied. This view cannot substantiate the claim.</p>}
    <p className="tun-caption">Evidence {evidence.id} · version {evidence.version}. Checks are reported by the application, not independently performed by this view.</p>
  </section>;
}
function EvidenceItem({ source }: { source: EvidenceSource }) {
  const readable = source.access === 'available';
  const url = readable ? safeDetailsUrl(source.url) : undefined;
  return <li className="tun-source-item">
    <h3 className="tun-subheading">{source.title}</h3>
    <p className="tun-caption">{source.kind} · {readable ? 'Available' : source.access === 'restricted' ? 'Restricted' : 'Unavailable'}</p>
    <p><strong>{evidenceRelationshipLabels[source.relationship] || 'Relationship unavailable'}. </strong>{source.relationshipExplanation}</p>
    {!readable ? <p className="tun-notice">{source.reason} Source content and links are not displayed.</p> : <>
      <p className="tun-caption">{sourceHasReportedCheck(source) ? 'Source material checked by the application: ' : 'Source support not verified: '}{source.verification?.detail || 'No check details supplied.'}</p>
      {source.observedAt && <p className="tun-caption">Observed: {parseTimestamp(source.observedAt) === null ? 'Time unavailable'
        : <time dateTime={source.observedAt}>{displayTimestamp(source.observedAt)}</time>}</p>}
      {source.excerpt ? <>
        <p><strong>{source.excerpt.kind === 'quote' ? 'Direct source quotation' : source.excerpt.kind === 'paraphrase' ? 'Paraphrase — not a direct quotation' : 'Generated interpretation — not source text'}</strong></p>
        {source.excerpt.kind === 'quote' ? <blockquote className="tun-notice tun-preserve-text" style={{ marginInline: 0 }}>{source.excerpt.text}</blockquote>
          : <p className="tun-preserve-text">{source.excerpt.text}</p>}
        {source.excerpt.location && <p className="tun-caption">Source location: {source.excerpt.location}</p>}
      </> : <p className="tun-muted">No inspectable excerpt supplied.</p>}
      {url ? <a className="tun-link" href={url}>Open source: {source.title}</a>
        : <p className="tun-caption">{source.url ? 'The source link is unavailable.' : 'No source link supplied.'}</p>}
    </>}
  </li>;
}
