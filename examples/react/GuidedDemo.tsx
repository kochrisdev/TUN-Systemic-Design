import { useEffect, useRef, useState } from 'react';
import { ActionReceipt, AgentCard, ApprovalGate, ContextPanel, IntentComposer, PlanView, ProposalCard,
  type AgentProfile, type AgentState, type ContextAvailability, type DecisionRequest } from '@tun-systemic/react';
import { EvidenceReview } from './EvidenceReview.js';
import { beginDemoDecision, changeDemoContext, changeDemoIntent, createDemoProposal, demoLocked, demoSourceReady,
  initialDemo, openDemoReview, prepareDemo, reconcileDemo, recordDemoAction, reviewDemoPlan, reviseDemoPlan, type DemoState } from './review-model.js';

const steps = ['Intent', 'Context', 'Plan', 'Proposal', 'Approval', 'Receipt'];
const explanations = [
  'Describe the outcome. This first step does not execute or authorize anything.',
  'See what information is available before preparing a plan.',
  'Review the approach. This is not permission to publish.',
  'Inspect the exact content, target, scope, and recovery limits.',
  'Make an explicit decision about this particular proposal.',
  'Inspect the known result. Approval alone is not evidence of execution.',
];
const agent: AgentProfile = { id: 'demo-agent', name: 'TUN Review Agent', purpose: 'Prepare a project update from a supplied local note.', autonomy: 2,
  authority: ['Read the supplied note', 'Prepare a local preview', 'Simulate publication after explicit approval'], capabilities: ['Explain a plan', 'Present a versioned proposal'] };
const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
export function GuidedDemo({ active }: { active: boolean }) {
  const [state, setState] = useState(initialDemo);
  const current = useRef(state);
  const mounted = useRef(true);
  const [step, setStep] = useState(0);
  const [loseAcknowledgement, setLoseAcknowledgement] = useState(false);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (active) stepHeading.current?.focus(); }, [active, step]);
  // Navigation hides rather than unmounts this controller. It cannot reset an approval latch.
  function apply(change: (s: DemoState) => DemoState): DemoState {
    if (!mounted.current) return current.current;
    const next = change(current.current); current.current = next; setState(next); return next;
  }
  function prepare() {
    const next = apply(prepareDemo);
    if (next.phase === 'planned') setStep(2);
  }
  function createProposal() {
    const next = apply(createDemoProposal);
    if (next.phase === 'proposed') setStep(3);
  }
  async function decide(request: DecisionRequest) {
    const lose = loseAcknowledgement;
    apply(s => beginDemoDecision(s, request));
    if (request.decision === 'reject') { setStep(5); return; }
    try {
      await wait(250);
      if (!mounted.current) return;
      apply(s => recordDemoAction(s, request));
      if (lose) throw new Error('Simulated lost acknowledgement');
      await wait(100);
      const next = apply(reconcileDemo);
      if (next.phase === 'completed') setStep(5);
    } catch {
      apply(s => ({ ...s, phase: 'unknown', notice: 'Outcome unconfirmed. Check the existing action record; do not repeat publication.' }));
      throw new Error('Unconfirmed local outcome');
    }
  }
  const locked = demoLocked(state);
  const ready = demoSourceReady(state);
  const receipt = state.receipts.at(-1);
  const agentState: AgentState = state.phase === 'pending' ? 'acting' : state.phase === 'unknown' ? 'blocked' : state.phase === 'completed' ? 'completed' : state.phase === 'reviewing' ? 'waiting' : state.plan ? 'planning' : 'idle';
  return <div className="sc-guided">
    <header className="sc-page-heading"><p className="sc-kicker">GUIDED DEMO / ONE TASK, SIX STAGES</p><h1>Understand first.<br />Authorize precisely.</h1><p>Prepare a project update from supplied notes. Nothing leaves this page.</p></header>
    <ol className="sc-steps" aria-label="Demo stages">{steps.map((name, i) => <li key={name} aria-current={step === i ? 'step' : undefined}><span>{String(i + 1).padStart(2, '0')}</span>{name}</li>)}</ol>
    <section className="sc-demo-stage" aria-labelledby="guided-step-title">
      <header className="sc-stage-heading"><p className="sc-kicker">STEP {step + 1} OF 6</p><h2 id="guided-step-title" ref={stepHeading} tabIndex={-1}>{steps[step]}</h2><p>{explanations[step]}</p></header>
      <p className="sc-task-status" role={active ? 'status' : undefined}>{state.notice || 'Use the example request below, or write your own.'}</p>
      {step === 0 && <IntentComposer value={state.intent} onValueChange={text => apply(s => changeDemoIntent(s, text))}
        onSubmit={() => setStep(1)} submitLabel="Inspect context" disabled={locked}
        scope="Review the supplied note before preparing a local plan. No action permission is granted." />}
      {step === 1 && <>
        <ContextPanel context={state.context} />
        <div className="sc-actions"><button className="sc-button sc-primary" disabled={locked || !ready || !state.intent.trim()} onClick={prepare}>Prepare plan</button></div>
        {!ready && <p className="sc-inline-warning">Restore available notes in the source scenario below before continuing.</p>}
        <details className="sc-disclosure"><summary>Change the source scenario</summary><label className="sc-field">Notes availability<select value={state.context.sources[0]?.availability ?? 'missing'} disabled={locked}
          onChange={e => apply(s => changeDemoContext(s, e.target.value as ContextAvailability))}>
          <option value="available">Available</option><option value="missing">Missing</option><option value="restricted">Restricted</option><option value="stale">Stale</option>
        </select></label><p>Changing this local fixture invalidates previous reviews. It does not change real access permissions.</p></details>
      </>}
      {step === 2 && state.plan && <>
        <PlanView plan={state.plan} />
        <div className="sc-actions"><button className="sc-button" disabled={locked || state.phase === 'idle'} onClick={() => apply(reviseDemoPlan)}>Revise plan</button>
          <button className="sc-button" disabled={locked || state.planReviewed || !ready || state.phase === 'idle'} onClick={() => apply(reviewDemoPlan)}>Review approach</button>
          <button className="sc-button sc-primary" disabled={locked || !state.planReviewed || !ready} onClick={createProposal}>Create proposal</button></div>
      </>}
      {step === 3 && state.proposal && <ProposalCard proposal={state.proposal} status={state.proposalStatus}
        rationale="This deterministic template uses only the supplied project note."
        assumptions={['No AI model is called.', 'Opening review is not consent.']}
        onReview={request => { const next = apply(s => openDemoReview(s, request.proposalId, request.proposalVersion)); if (next.phase === 'reviewing') setStep(4); }} />}
      {step === 4 && state.proposal && <>
        <ApprovalGate proposal={state.proposal} status={state.approval} approveLabel="Simulate publish" onDecision={decide} />
        <details className="sc-disclosure"><summary>Test an unconfirmed outcome</summary>
          <label className="demo-toggle"><input type="checkbox" checked={loseAcknowledgement} disabled={locked || state.approval !== 'awaiting'} onChange={e => setLoseAcknowledgement(e.target.checked)} />Simulate an unconfirmed response</label>
          <p>The fixture records the action but loses its acknowledgement. Recovery must read the record, not publish again.</p>
        </details>
        {state.phase === 'unknown' && <section className="sc-panel" aria-label="Guided outcome reconciliation"><h3>Check before retrying.</h3><p>The action may already exist. This control only reads the local record.</p>
          <button className="sc-button" onClick={() => { const next = apply(reconcileDemo); if (next.phase === 'completed') setStep(5); }}>Check simulated action record</button></section>}
      </>}
      {step === 5 && <>
        {state.phase === 'rejected' ? <section className="sc-panel"><h3>Action rejected.</h3><p>No action was executed for this proposal. Rejecting does not erase earlier records.</p></section>
          : state.phase === 'completed' && receipt ? <ActionReceipt receipt={receipt} />
          : <p>No verified outcome is available for this proposal.</p>}
        <div className="sc-actions"><button className="sc-button" disabled={locked} onClick={() => setStep(0)}>Return to intent</button><a className="sc-button sc-primary" href="#components">Explore the components</a></div>
      </>}
      {step > 0 && step < 5 && <div className="sc-stage-back"><button className="sc-button" disabled={locked} onClick={() => setStep(n => n - 1)}>Back to {steps[step - 1].toLowerCase()}</button>
        {step > 1 && <button className="sc-button" disabled={locked} onClick={() => setStep(1)}>Inspect context</button>}</div>}
      {locked && <p className="sc-small">Task edits stay locked while the outcome is pending or unknown. Changing showcase pages does not reset the task.</p>}
    </section>
    <div className="sc-guided-details">
      <details className="sc-disclosure"><summary>Who is acting?</summary><AgentCard agent={agent} state={agentState} currentTask="Local guided project update" /></details>
      <details className="sc-disclosure"><summary>Evidence and memory details</summary><EvidenceReview key={state.context.version} context={state.context} /></details>
      <details className="sc-disclosure"><summary>Retained local receipts ({state.receipts.length})</summary>
        <p>These page-session records survive navigation and new drafts. Refreshing clears the simulation; it does not undo real actions.</p>
        {state.receipts.length ? <ol>{state.receipts.map(record => <li key={record.id}>{record.id} — {record.summary}</li>)}</ol> : <p>No verified receipts yet.</p>}
      </details>
    </div>
  </div>;
}
