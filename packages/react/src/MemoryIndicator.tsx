'use client';
import { useId } from 'react';
import { memoryIsInspectable, memoryIssues, memoryStatusLabel,
  type MemoryInspectionRequest, type MemoryRecord } from './evidence-contracts.js';

export interface MemoryIndicatorProps {
  memory: MemoryRecord;
  title?: string;
  /** Inspection navigation only. Do not mutate memory or grant permissions in this callback. */
  onInspect?(request: MemoryInspectionRequest): void;
  announce?: boolean;
  className?: string;
}
export function MemoryIndicator({ memory, title = 'Memory use', onInspect, announce = false, className = '' }: MemoryIndicatorProps) {
  const id = useId();
  const issues = memoryIssues(memory);
  const inspectable = memoryIsInspectable(memory);
  return <section className={`tun-component tun-memory ${className}`} aria-labelledby={`${id}-title`}>
    <p className="tun-eyebrow">Memory · never permission</p>
    <h2 id={`${id}-title`} className="tun-heading">{title}</h2>
    <p className="tun-badge" role={announce ? 'status' : undefined} aria-atomic={announce || undefined}>{memoryStatusLabel(memory)}</p>
    <p><strong>Scope: </strong>{memory.scope || 'Scope unavailable'}</p>
    {inspectable && <p><strong>Influence: </strong>{memory.influence}</p>}
    {issues.length > 0 && <p className="tun-notice">{issues.join(' ')}</p>}
    {memory.retentionNotice && <p className="tun-caption">Retention policy: {memory.retentionNotice}</p>}
    <p className="tun-caption" id={`${id}-help`}>Memory use does not establish logging, backup, deletion, or training policy. Remembered information grants no authority.</p>
    {onInspect && inspectable && <div className="tun-actions"><button type="button" className="tun-button" aria-describedby={`${id}-help`}
      onClick={() => onInspect({ memoryId: memory.id, memoryVersion: memory.version })}>Inspect memory</button></div>}
    <p className="tun-caption">Memory record {memory.id} · version {memory.version}. Application-supplied metadata.</p>
  </section>;
}
