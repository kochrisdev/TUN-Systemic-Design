import './review.css';
import { useEffect, useRef, useState } from 'react';
import { ActionReceipt, AgentCard, ApprovalGate, ContextPanel, IntentComposer, PlanView, ProposalCard,
  type AgentProfile, type AgentState, type ContextAvailability, type DecisionRequest } from '@tun-systemic/react';
import { EvidenceReview } from './EvidenceReview.js';
import { EvidenceExamples } from './EvidenceExamples.js';
import { beginDemoDecision, changeDemoContext, changeDemoIntent, createDemoProposal, demoLocked, demoSourceReady,
  initialDemo, openDemoReview, prepareDemo, reconcileDemo, recordDemoAction, reviewDemoPlan, reviseDemoPlan,
  type DemoState } from './review-model.js';

const agent: AgentProfile = {
  id: 'demo-agent', name: 'TUN Review Agent', purpose: 'Demonstrate a context-to-receipt review workflow.',
  autonomy: 2, authority: ['Read supplied local notes', 'Prepare template previews', 'Simulate publication only after separate approval'],
  capabilities: ['Show versioned context and plans', 'Record a simulated outcome'],
};
const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
export function App() {
  const [state, setState] = useState(initialDemo);
  // In-memory canonical demo state; this is not a trusted production backend.
  const current = useRef(state);
  const mounted = useRef(true);
  const [theme, setTheme] = useState('system');
  const [unknown, setUnknown] = useState(false);
  const gateRegion = useRef<HTMLDivElement>(null);
  const receiptRegion = useRef<HTMLDivElement>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (state.reviewOpen && state.phase === 'reviewing') gateRegion.current?.focus(); }, [state.reviewOpen, state.phase]);
  useEffect(() => { if (state.phase === 'completed') receiptRegion.current?.focus(); }, [state.phase]);
  function apply(change: (s: DemoState) => DemoState) {
    if (!mounted.current) return;
    current.current = change(current.current);
    setState(current.current);
  }
  async function decide(request: DecisionRequest) {
    const loseAcknowledgement = unknown;
    apply(s => beginDemoDecision(s, request));
    if (request.decision === 'reject') return;
    try {
      await wait(250);
      if (!mounted.current) return;
      apply(s => recordDemoAction(s, request));
      if (loseAcknowledgement) throw new Error('Simulated lost acknowledgement');
      await wait(100);
      apply(reconcileDemo);
    } catch {
      apply(s => ({ ...s, phase: 'unknown', notice: 'Outcome unconfirmed. Reconcile the simulated record before starting another review.' }));
      throw new Error('Unconfirmed demo outcome');
    }
  }
  function changeTheme(next: string) {
    setTheme(next);
    if (next === 'system') delete document.documentElement.dataset.tunTheme;
    else document.documentElement.dataset.tunTheme = next;
  }
  const locked = demoLocked(state);
  const ready = demoSourceReady(state);
  const agentState: AgentState = state.phase === 'pending' ? 'acting' : state.phase === 'unknown' ? 'blocked'
    : state.phase === 'completed' ? 'completed' : state.phase === 'reviewing' ? 'waiting'
    : state.plan ? 'planning' : 'idle';
  const receipt = state.receipts.at(-1);
  return <>
    <a className="skip-link" href="#main">Skip to component lab</a>
    <header className="lab-header"><a className="wordmark" href="#main">TUN<span>SYSTEMIC DESIGN</span></a>
      <label className="theme-picker">Theme <select value={theme} onChange={e => changeTheme(e.target.value)}>
        <option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option>
      </select></label>
    </header>
    <main id="main" className="lab-main">
      <div className="lab-intro"><p className="lab-kicker">REACT COMPONENT LAB / EVIDENCE AND MEMORY</p>
        <h1>Understand first.<br />Authorize precisely.</h1>
        <p className="lab-lede">Ten components. Visible context, evidence, memory, and accountable actions.</p>
        <p className="simulation-notice"><strong>Local simulation only.</strong> No AI model, account connection, real publication, or persistent memory. Refreshing clears this demonstration, not real-world actions.</p>
      </div>
      <p className="simulation-notice" role="status">{state.notice || 'Start with the supplied notes and a clear outcome.'}</p>
      <div className="lab-grid">
        <div className="lab-column">
          <div className="lab-step">01 / EXPRESS INTENT</div>
          <IntentComposer value={state.intent} onValueChange={text => apply(s => changeDemoIntent(s, text))}
            onSubmit={() => apply(prepareDemo)} submitLabel="Prepare plan" disabled={locked}
            blockedReason={!ready ? 'Notes are missing, restricted, or stale. Restore available notes before preparing a plan.' : undefined}
            scope="Read only the supplied notes and prepare a local plan. Submission cannot approve or publish anything." />
          <div className="lab-step">02 / KNOW THE AGENT</div>
          <AgentCard agent={agent} state={agentState} currentTask="Demonstrate the review workflow within this page only" />
          <div className="lab-step">03 / INSPECT CONTEXT</div>
          <ContextPanel context={state.context} />
          <section className="tun-component" aria-label="Source scenario controls">
            <label className="theme-picker">Notes availability <select value={state.context.sources[0]?.availability ?? 'missing'} disabled={locked}
              onChange={e => apply(s => changeDemoContext(s, e.target.value as ContextAvailability))}>
              <option value="available">Available</option><option value="missing">Missing</option><option value="restricted">Restricted</option><option value="stale">Stale</option>
            </select></label>
            <p className="tun-caption">This selector changes a local fixture, not access permissions. Changing context invalidates the earlier review.</p>
          </section>
          <div className="lab-step">04 / REVIEW THE APPROACH</div>
          {state.plan ? <>
            <PlanView plan={state.plan} />
            <section className="tun-component" aria-label="Plan review controls">
              <p>Approach review and action approval are separate decisions.</p>
              <div className="tun-actions">
                <button type="button" className="tun-button" disabled={locked || state.phase === 'idle'} onClick={() => apply(reviseDemoPlan)}>Revise plan</button>
                <button type="button" className="tun-button" disabled={locked || !ready || state.planReviewed || state.phase === 'idle'} onClick={() => apply(reviewDemoPlan)}>Review approach</button>
                <button type="button" className="tun-button tun-button-primary" disabled={locked || !ready || !state.planReviewed} onClick={() => apply(createDemoProposal)}>Create proposal</button>
              </div>
            </section>
          </> : <section className="lab-placeholder"><h2>No plan yet.</h2><p>Prepare a plan from the supplied notes. Nothing is authorized.</p></section>}
        </div>
        <div className="lab-column">
          <div className="lab-step">05 / INSPECT THE PROPOSAL</div>
          {state.proposal ? <ProposalCard proposal={state.proposal} status={state.proposalStatus}
            rationale="The local template uses only the supplied project note."
            assumptions={['This is deterministic demo content, not AI-generated research.', 'A real application must bind review to authenticated authority and canonical content.']}
            blockedReason={state.phase === 'unknown' ? 'Reconcile the previous outcome before starting another review.' : undefined}
            onReview={request => apply(s => openDemoReview(s, request.proposalId, request.proposalVersion))} />
            : <section className="lab-placeholder"><h2>No proposal yet.</h2><p>Review the approach, then create a concrete proposal.</p></section>}
          <div className="lab-step">06 / AUTHORIZE THE EXACT ACTION</div>
          <div ref={gateRegion} tabIndex={-1} className="lab-focus-region" aria-label="Action approval review">
            {state.reviewOpen && state.proposal ? <ApprovalGate proposal={state.proposal} status={state.approval} approveLabel="Simulate publish" onDecision={decide} />
              : <section className="lab-placeholder"><h2>No active action approval.</h2><p>Use Review action on a current proposal. Opening this area does not authorize execution.</p></section>}
          </div>
          <label className="demo-toggle"><input type="checkbox" checked={unknown} disabled={locked || state.approval !== 'awaiting'} onChange={e => setUnknown(e.target.checked)} />Simulate an unconfirmed response</label>
          {state.phase === 'unknown' && <section className="tun-component" aria-label="Outcome reconciliation">
            <p>The demo may have recorded an action before its acknowledgement was lost. Do not retry publication.</p>
            <button type="button" className="tun-button" onClick={() => apply(reconcileDemo)}>Check simulated action record</button>
          </section>}
          <div className="lab-step">07 / VERIFY THE OUTCOME</div>
          <div ref={receiptRegion} tabIndex={-1} className="lab-focus-region" aria-label="Latest action record">
            {receipt ? <><ActionReceipt receipt={receipt} /><p className="simulation-notice">Latest verified record. {state.receipts.length} record(s) retained in this page session; new plans do not erase earlier outcomes.</p></>
              : <section className="lab-placeholder"><h2>No action receipt.</h2><p>Only verification of a local action record creates a receipt. Review and approval alone do not.</p></section>}
          </div>
        </div>
      </div>
      <EvidenceReview key={state.context.version} context={state.context} />
      <EvidenceExamples />
      <footer className="lab-footer">Human Intent. Machine Intelligence. Systemic Design.<br />Reference implementation — not authorization infrastructure or accessibility certification.</footer>
    </main>
  </>;
}
