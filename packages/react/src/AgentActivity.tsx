'use client';
import { useId } from 'react';
import { displayTimestamp } from './contracts.js';
import { activityStatusLabel, measuredProgress, type ActivityRecord } from './supervision-contracts.js';
export interface AgentActivityProps { activity: ActivityRecord; title?: string; className?: string }
export function AgentActivity({ activity, title = 'Agent activity', className = '' }: AgentActivityProps) {
  const id = useId(); const progress = measuredProgress(activity);
  return <section className={`tun-component tun-agent-activity ${className}`} aria-labelledby={id}>
    <p className="tun-eyebrow">Observed activity · not an internal reasoning transcript</p>
    <h2 id={id} className="tun-heading">{title}</h2>
    <p className="tun-badge" role="status">{activityStatusLabel(activity)}</p>
    <p>{activity.task}</p>
    <dl className="tun-facts">
      <div><dt>Actor</dt><dd>{activity.actor.name} ({activity.actor.type})</dd></div>
      <div><dt>Scope</dt><dd>{activity.scope}</dd></div>
      <div><dt>Observed</dt><dd>{displayTimestamp(activity.observedAt)}</dd></div>
      <div><dt>Known effects</dt><dd>{activity.effects}</dd></div>
    </dl>
    {progress && <p>Measured progress: {progress}. Progress alone does not verify completion.</p>}
    {activity.progress && !progress && <p className="tun-notice">Progress measurement unavailable.</p>}
    {activity.blocker && <p className="tun-notice">Blocking issue: {activity.blocker}</p>}
    {activity.evidence && <p className="tun-caption">Application evidence: {activity.evidence}</p>}
    <p className="tun-caption">Run {activity.id} · version {activity.version}. This view does not monitor or control a runtime.</p>
  </section>;
}
