'use client';
import { useId } from 'react';
import { displayTimestamp } from './contracts.js';
import { activityStatusLabel, toolCategoryLabels, measuredProgress, type ToolActivityRecord } from './supervision-contracts.js';
export interface ToolActivityProps { activity: ToolActivityRecord; title?: string; className?: string }
export function ToolActivity({ activity, title = 'Tool activity', className = '' }: ToolActivityProps) {
  const id = useId(); const progress = measuredProgress(activity);
  return <section className={`tun-component tun-tool-activity ${className}`} aria-labelledby={id}>
    <p className="tun-eyebrow">External-operation metadata · host supplied</p>
    <h2 id={id} className="tun-heading">{title}</h2>
    <p className="tun-badge" role="status">{activityStatusLabel(activity)}</p>
    <p>{activity.task}</p>
    <dl className="tun-facts">
      <div><dt>Tool</dt><dd>{activity.tool}</dd></div>
      <div><dt>Operation</dt><dd>{toolCategoryLabels[activity.category] ?? 'Unknown operation'}</dd></div>
      <div><dt>Actor</dt><dd>{activity.actor.name} ({activity.actor.type})</dd></div>
      <div><dt>Target</dt><dd>{activity.target}</dd></div>
      <div><dt>Scope</dt><dd>{activity.scope}</dd></div>
      <div><dt>Declared authority</dt><dd>{activity.authority || 'No authority declared'}</dd></div>
      <div><dt>Known effects</dt><dd>{activity.effects}</dd></div>
      <div><dt>Observed</dt><dd>{displayTimestamp(activity.observedAt)}</dd></div>
    </dl>
    {progress && <p>Measured progress: {progress}. This is not proof of completion.</p>}
    {activity.progress && !progress && <p className="tun-notice">Progress measurement unavailable.</p>}
    {activity.blocker && <p className="tun-notice">Blocking issue: {activity.blocker}</p>}
    {activity.evidence && <p className="tun-caption">Application evidence: {activity.evidence}</p>}
    <p className="tun-caption">Operation {activity.id} · version {activity.version}. No tool call is made by this view.</p>
  </section>;
}
