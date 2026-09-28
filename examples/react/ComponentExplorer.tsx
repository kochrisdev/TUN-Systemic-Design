import { useState } from 'react';
import { IntentComposer, AgentCard, ContextPanel, PlanView, ProposalCard, ApprovalGate, ActionReceipt,
  MemoryIndicator, SourceView, UncertaintySignal, ToolActivity, AgentActivity, HumanOverride, RecoveryControl,
  type ActionProposal, type ActivityRecord, type ContextSnapshot, type EvidenceCollection, type InterventionOperation, type RecoveryOperation, type TaskPlan } from '@tun-systemic/react';
import { componentCatalog, filterCatalog, type ComponentName } from './showcase-catalog.js';
import { showcaseLinks } from './showcase-navigation.js';

const readOnly = 'Read-only explorer specimen. Use the guided demo or Trust & Control Lab to try interactions.';
// A disabled specimen must never request work, even if a consumer changes its markup.
const noRequest = () => { throw new Error('The explorer does not execute requests.'); };
const actor = { id: 'specimen-agent', name: 'Example agent', type: 'agent' as const };
const recovery = { kind: 'compensatable' as const, description: 'A real correction may offset an effect, not erase it. This is a static specimen.' };
const context: ContextSnapshot = { id: 'specimen-context', version: '1', scope: 'Synthetic public example only', sources: [{ id: 'note', label: 'Example project note', kind: 'note', scope: 'This specimen', persistence: 'session', provenance: 'provided', availability: 'available', usage: 'not-used', summary: 'This is a synthetic component example.' }] };
const plan: TaskPlan = { id: 'specimen-plan', version: '1', context: { id: context.id, version: context.version }, objective: 'Prepare an example project update', status: 'proposed', expectedOutputs: ['A draft for human review'], steps: [
  { id: 'read', title: 'Inspect the note', detail: 'Read only supplied context.', status: 'pending' },
  { id: 'draft', title: 'Prepare a draft', detail: 'Create reviewable content without publishing.', status: 'pending', dependsOn: ['read'] },
  { id: 'approve', title: 'Request separate action approval', detail: 'Show the exact content and intended effect.', status: 'waiting-approval', dependsOn: ['draft'], approvalRequired: true },
] };
const proposal: ActionProposal = { id: 'specimen-proposal', version: '1', actor, action: 'Publish example update', target: 'Synthetic workspace', consequence: 'C3', effect: 'One hypothetical publication. This specimen does not publish.', authority: 'No actual authority; illustration only.', recovery, contentPreview: 'Project update: this is a synthetic example, not a real publication.', reviewBasis: { context: { id: context.id, version: context.version }, plan: { id: plan.id, version: plan.version } } };
const activity: ActivityRecord = { id: 'specimen-activity', version: '1', actor, task: 'Review synthetic notes', scope: 'Static example only', status: 'running', effects: 'No real operations. Two hypothetical notes reviewed.', observedAt: '2026-09-28T10:00:00Z', progress: { completed: 2, total: 5, unit: 'notes' } };
const intervention: InterventionOperation = { id: 'specimen-stop', version: '1', run: { id: 'specimen-run', version: '1' }, actor, kind: 'stop', target: 'Example worker', scope: 'This hypothetical worker only', effect: 'Request the worker to stop accepting new work.', limits: 'An in-flight action may finish. Stopping does not undo earlier effects.', knownEffects: 'No real worker is connected.' };

export function ComponentExplorer() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('All groups');
  const [chosen, setChosen] = useState<ComponentName>('IntentComposer');
  const [variant, setVariant] = useState('standard');
  const matches = filterCatalog(query, group);
  const selected = matches.find(item => item.symbol === chosen) ?? matches[0];
  const groups = [...new Set(componentCatalog.map(item => item.group))];
  return <>
    <header className="sc-page-heading"><p className="sc-kicker">COMPONENT EXPLORER / 14 REFERENCE IMPLEMENTATIONS</p><h1 data-view-title tabIndex={-1}>One language.<br />Fourteen building blocks.</h1><p className="sc-lede">Inspect real components, representative states, and the boundary each one protects.</p></header>
    <div className="sc-explorer-filters"><label className="sc-field">Find a component<input type="search" value={query} placeholder="Try approval, memory, or recovery" onChange={event => setQuery(event.target.value)} /></label>
      <label className="sc-field">Component group<select value={group} onChange={event => setGroup(event.target.value)}><option>All groups</option>{groups.map(value => <option key={value}>{value}</option>)}</select></label></div>
    <p className="sc-small" role="status">{matches.length} of 14 components</p>
    <div className="sc-explorer-grid">
      <nav aria-label="Component selection" className="sc-component-menu"><ul>{matches.map(item => <li key={item.symbol}><button type="button" aria-pressed={selected?.symbol === item.symbol} onClick={() => { setChosen(item.symbol); setVariant('standard'); }}><span>{item.name}</span><small>{item.group}</small></button></li>)}</ul></nav>
      {selected ? <section className="sc-component-detail" aria-labelledby="component-title">
        <p className="sc-kicker">{selected.group}</p><h2 id="component-title">{selected.name}</h2><p className="sc-question">{selected.question}</p><p>{selected.purpose}</p>
        <label className="sc-field sc-variant">Example state<select value={variant} onChange={event => setVariant(event.target.value)}><option value="standard">{selected.states[0]}</option><option value="edge">{selected.states[1]}</option></select></label>
        <p className="sc-small">Synthetic, read-only specimen. These two examples are not an exhaustive state matrix.</p>
        <div className="sc-specimen" aria-label="Read-only component specimen"><ComponentSpecimen key={`${selected.symbol}:${variant}`} name={selected.symbol} edge={variant === 'edge'} /></div>
        <div className="sc-boundary"><strong>Design boundary</strong><p>{selected.boundary}</p></div>
        <details className="sc-disclosure"><summary>Import and implementation</summary><p>This is the import, not a complete host integration. The API guide documents required records and callback responsibilities.</p>
          <pre><code>{`import { ${selected.symbol} } from '@tun-systemic/react';\nimport '@tun-systemic/react/styles.css';`}</code></pre>
          <p>The reference package is available from the repository; it is not published to npm.</p></details>
        <div className="sc-actions"><a href={`${showcaseLinks.source}docs/${selected.guide}`} target="_blank" rel="noopener noreferrer">Read {selected.name} API<span className="sc-sr-only"> (opens in a new tab)</span></a>
          <a href={`${showcaseLinks.source}packages/react/src/${selected.symbol}.tsx`} target="_blank" rel="noopener noreferrer">View source<span className="sc-sr-only"> (opens in a new tab)</span></a></div>
      </section> : <section className="sc-panel"><h2>No matching components.</h2><p>Try another name or clear the filters.</p><button className="sc-button" onClick={() => { setQuery(''); setGroup('All groups'); }}>Clear filters</button></section>}
    </div>
  </>;
}
export function ComponentSpecimen({ name, edge }: { name: ComponentName; edge: boolean }) {
  const proposed = edge ? { ...proposal, expiresAt: '2020-01-01T00:00:00Z' } : proposal;
  const observed: ActivityRecord = edge ? { ...activity, status: 'completed', progress: { completed: 5, total: 5, unit: 'notes' }, evidence: undefined } : activity;
  switch (name) {
    case 'IntentComposer': return <IntentComposer value="Prepare a project update for my review." onValueChange={noRequest} onSubmit={noRequest} scope="Read the supplied note. Do not publish." disabled blockedReason={edge ? 'Required project notes are unavailable.' : readOnly} />;
    case 'AgentCard': return <AgentCard agent={{ id: actor.id, name: actor.name, purpose: 'Prepare a scoped project update', autonomy: 2, authority: ['Read supplied notes', 'Propose a draft, not publish it'], capabilities: ['Summarize notes', 'Prepare a proposal'] }} state={edge ? 'blocked' : 'planning'} currentTask={edge ? 'Waiting for the missing project note' : 'Preparing an example approach'} />;
    case 'ContextPanel': return <ContextPanel context={edge ? { ...context, sources: [{ id: 'note', label: 'Example project note', kind: 'note', scope: 'This specimen', persistence: 'session', provenance: 'provided', availability: 'restricted', usage: 'not-used' }] } : context} />;
    case 'PlanView': return <PlanView plan={edge ? { ...plan, status: 'blocked', blockers: ['Project note access is missing. No execution is authorized.'] } : plan} />;
    case 'ProposalCard': return <ProposalCard proposal={proposed} status={edge ? 'expired' : 'ready'} />;
    case 'ApprovalGate': return <ApprovalGate proposal={proposed} status={edge ? 'expired' : 'awaiting'} approveLabel="Publish example update" onDecision={noRequest} blockedReason={readOnly} />;
    case 'ActionReceipt': return <ActionReceipt receipt={{ id: 'specimen-receipt', actor, action: 'Synthetic publication record', target: proposal.target, timestamp: '2026-09-28T10:00:00Z', status: 'completed', summary: 'Illustrative record, not a result of an action on this page.', verification: { state: edge ? 'pending' : 'verified', detail: edge ? 'No confirming record supplied.' : 'Hypothetical record read-back, supplied by this static fixture.' }, recovery }} />;
    case 'MemoryIndicator': return <MemoryIndicator memory={{ id: 'specimen-memory', version: '1', type: edge ? 'M2' : 'M1', state: edge ? 'unavailable' : 'active', scope: 'Static example task', influence: edge ? undefined : 'A supplied session note shapes the example draft.', retentionNotice: 'This specimen implements no memory storage, retention, or deletion service.' }} />;
    case 'SourceView': {
      const evidence: EvidenceCollection = { id: 'specimen-evidence', version: '1', claim: 'This component displays a synthetic fixture.', sources: edge ? [{ id: 'note', title: 'Synthetic source', kind: 'Example note', relationship: 'supports', relationshipExplanation: 'The host reports a relevant but inaccessible source.', access: 'restricted', reason: 'The excerpt is unavailable to this viewer.' }] : [{ id: 'note', title: 'Synthetic source', kind: 'Example note', relationship: 'supports', relationshipExplanation: 'The quoted example explicitly describes its scope.', access: 'available', excerpt: { kind: 'quote', text: 'This is a synthetic component example.' }, verification: { state: 'verified', detail: 'Static fixture comparison only; not independent verification.' } }] };
      return <SourceView evidence={evidence} />;
    }
    case 'UncertaintySignal': return <UncertaintySignal assessment={{ level: edge ? 'U0' : 'U2', scope: 'Production suitability', explanation: edge ? 'A certainty claim with no supplied basis.' : 'The reference may fit this workflow, but host validation is incomplete.', basis: edge ? undefined : 'Component behavior is illustrated; production services are not tested here.', nextStep: 'Validate the real host integration.' }} />;
    case 'ToolActivity': return <ToolActivity activity={{ ...observed, tool: 'Example note reader', category: 'reading', target: 'Synthetic notes', authority: 'No real access is granted by this specimen.' }} />;
    case 'AgentActivity': return <AgentActivity activity={observed} />;
    case 'HumanOverride': return <HumanOverride operation={intervention} status={edge ? 'acknowledged' : 'available'} blockedReason={readOnly} onRequest={noRequest} />;
    case 'RecoveryControl': {
      const operation: RecoveryOperation = { ...intervention, id: 'specimen-recovery', kind: edge ? 'retry' : 'compensate', scope: 'This hypothetical action record only', effect: edge ? 'Repeat an earlier operation.' : 'Record a compensating action without erasing the original.', limits: 'Unknown effects must be reconciled before an effectful retry.', originalOutcome: edge ? 'unknown' : 'known' };
      return <RecoveryControl operation={operation} status="available" blockedReason={readOnly} onRequest={noRequest} />;
    }
  }
}
