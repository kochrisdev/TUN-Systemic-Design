'use client';
import { useId } from 'react';
import { displayTimestamp, parseTimestamp, safeDetailsUrl } from './contracts.js';
import { contextAvailabilityLabels, contextPersistenceLabels, contextState, contextUsageLabels,
  type ContextSnapshot, type ContextSource } from './review-contracts.js';

export interface ContextPanelProps { context: ContextSnapshot; title?: string; className?: string }
export function ContextPanel({ context, title = 'Task context', className = '' }: ContextPanelProps) {
  const id = useId();
  return <section className={`tun-component tun-context ${className}`} aria-labelledby={`${id}-title`}>
    <p className="tun-eyebrow">Context snapshot · availability is not usage</p>
    <h2 id={`${id}-title`} className="tun-heading">{title}</h2>
    <p>{context.scope}</p>
    <p className="tun-badge" role="status">{contextState(context)}</p>
    {context.changeSummary && <p className="tun-notice">Context changed: {context.changeSummary}</p>}
    {context.sources.length ? <ul className="tun-source-list">
      {context.sources.map((source, index) => <SourceItem key={`${source.id}-${index}`} source={source} />)}
    </ul> : <p className="tun-muted">No sources supplied. Do not assume access to other data.</p>}
    <p className="tun-caption">Context {context.id} · version {context.version}. Context persistence is not a promise about logs, backups, or training.</p>
  </section>;
}
function SourceItem({ source }: { source: ContextSource }) {
  // Defense in depth: even unexpected extra fields on restricted/missing records are not displayed.
  // The host must still remove unauthorized data BEFORE sending any props to a client.
  const readable = source.availability === 'available' || source.availability === 'stale';
  const url = readable ? safeDetailsUrl(source.detailsUrl) : undefined;
  return <li className="tun-source-item">
    <h3 className="tun-subheading">{source.label}</h3>
    <p className="tun-caption">{source.kind} · {source.provenance} · {contextAvailabilityLabels[source.availability]}</p>
    <dl className="tun-facts">
      <div><dt>Scope</dt><dd>{source.scope}</dd></div>
      <div><dt>Context lifetime</dt><dd>{contextPersistenceLabels[source.persistence]}</dd></div>
      <div><dt>Task usage</dt><dd>{readable ? contextUsageLabels[source.usage] : 'Not used'}</dd></div>
    </dl>
    {source.availability === 'stale' && <p className="tun-notice">This source may be out of date. Review freshness before relying on it.</p>}
    {!readable && <p className="tun-muted">Source content is unavailable. No content or source link is displayed.</p>}
    {readable && source.observedAt && <p className="tun-caption">Observed: {parseTimestamp(source.observedAt) === null
      ? 'Time unavailable' : <time dateTime={source.observedAt}>{displayTimestamp(source.observedAt)}</time>}</p>}
    {readable && source.summary && <details className="tun-details"><summary>Inspect {source.label}</summary><p className="tun-preserve-text">{source.summary}</p></details>}
    {url && <a className="tun-link" href={url}>Open {source.label}</a>}
    {readable && source.detailsUrl && !url && <p className="tun-caption">The source link is unavailable.</p>}
  </li>;
}
