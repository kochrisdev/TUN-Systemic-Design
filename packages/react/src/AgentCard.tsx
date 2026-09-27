'use client';
import { useId } from 'react';
import { agentLabels, autonomyLabels, type AgentProfile, type AgentState } from './contracts.js';

export interface AgentCardProps {
  agent: AgentProfile;
  state: AgentState;
  currentTask?: string;
  className?: string;
}
export function AgentCard({ agent, state, currentTask, className = '' }: AgentCardProps) {
  const id = useId();
  return <section className={`tun-component ${className}`} aria-labelledby={`${id}-title`}>
    <div className="tun-row tun-row-top">
      <div><p className="tun-eyebrow">AI agent</p><h2 id={`${id}-title`} className="tun-heading">{agent.name}</h2></div>
      <p className="tun-badge" role="status" style={{ color: `var(--tun-state-agent-${state})` }}>{agentLabels[state]}</p>
    </div>
    <p>{agent.purpose}</p>
    <dl className="tun-facts">
      <div><dt>Autonomy</dt><dd>Level {agent.autonomy} — {autonomyLabels[agent.autonomy]}</dd></div>
      {currentTask && <div><dt>Current task</dt><dd>{currentTask}</dd></div>}
      <div><dt>Allowed to do</dt><dd>{agent.authority.length
        ? <ul>{agent.authority.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
        : 'No authority declared. Do not assume permission.'}</dd></div>
    </dl>
    {Boolean(agent.capabilities?.length) && <details className="tun-details">
      <summary>Capabilities — not permissions</summary>
      <ul>{agent.capabilities?.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
    </details>}
  </section>;
}
