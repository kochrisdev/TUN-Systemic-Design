import { useState } from 'react';
import { ActionReceipt, AgentCard, ApprovalGate, IntentComposer,
  type ActionProposal, type AgentProfile, type AgentState, type ApprovalStatus,
  type DecisionRequest, type ReceiptData } from '@tun-systemic/react';

const agent: AgentProfile = {
  id: 'demo-agent', name: 'TUN Demo Agent', purpose: 'Prepare and demonstrate one approval flow.',
  autonomy: 2, authority: ['Prepare local proposals', 'Simulate a publish only after approval'],
  capabilities: ['Compose text', 'Show an example action record'],
};
const actor = { id: agent.id, name: agent.name, type: 'agent' as const };
const recovery = { kind: 'irreversible' as const, description: 'A real publication may be copied. This demo changes only local page state.' };
const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
export function App() {
  const [intent, setIntent] = useState('Prepare a release note introducing TUN Systemic Design.');
  const [theme, setTheme] = useState('system');
  const [version, setVersion] = useState(0);
  const [proposal, setProposal] = useState<ActionProposal | null>(null);
  const [approval, setApproval] = useState<ApprovalStatus>('awaiting');
  const [state, setState] = useState<AgentState>('idle');
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [unknown, setUnknown] = useState(false);
  const [busy, setBusy] = useState(false);
  function prepare(text: string) {
    const next = version + 1;
    setVersion(next); setReceipt(null); setApproval('awaiting'); setState('waiting');
    setProposal({ id: 'demo-publish', version: String(next), action: 'Publish example release note',
      target: 'Local example workspace — no external service', actor, consequence: 'C3',
      effect: `Simulate this goal: ${text}`, authority: 'One simulated publish. No continuing permission.', recovery,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() });
  }
  async function decide(request: DecisionRequest) {
    if (!proposal || request.proposalId !== proposal.id || request.proposalVersion !== proposal.version) {
      throw new Error('Stale demo proposal');
    }
    if (request.decision === 'reject') { setApproval('rejected'); setState('idle'); return; }
    setBusy(true); setState('acting');
    try {
      await wait(350);
      if (unknown) { setState('blocked'); throw new Error('Simulated lost acknowledgement'); }
      setApproval('approved'); setState('verifying');
      await wait(200);
      setReceipt({ id: `demo-receipt-${proposal.version}`, action: 'Simulated publication', actor,
        target: proposal.target, timestamp: new Date().toISOString(), status: 'completed',
        summary: 'Simulation completed. Nothing was published, sent, or saved outside this page.',
        verification: { state: 'verified', detail: 'Verified only against this demo’s in-memory state; not an external service.' },
        recovery });
      setState('completed');
    } finally { setBusy(false); }
  }
  function changeTheme(next: string) {
    setTheme(next);
    if (next === 'system') delete document.documentElement.dataset.tunTheme;
    else document.documentElement.dataset.tunTheme = next;
  }
  return <>
    <a className="skip-link" href="#main">Skip to component lab</a>
    <header className="lab-header"><a className="wordmark" href="#main">TUN<span>SYSTEMIC DESIGN</span></a>
      <label className="theme-picker">Theme <select value={theme} onChange={e => changeTheme(e.target.value)}>
        <option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option>
      </select></label>
    </header>
    <main id="main" className="lab-main">
      <div className="lab-intro"><p className="lab-kicker">REACT COMPONENT LAB / v0.1</p>
        <h1>Human intent.<br />Visible agency.</h1>
        <p className="lab-lede">Four components. One clear contract between people and intelligent systems.</p>
        <p className="simulation-notice"><strong>Local simulation only.</strong> No AI model, account connection, real publication, or persistent memory. Refreshing clears the demo.</p>
      </div>
      <div className="lab-grid">
        <div className="lab-column">
          <div className="lab-step">01 / EXPRESS INTENT</div>
          <IntentComposer value={intent} onValueChange={setIntent} onSubmit={prepare} disabled={busy}
            scope="Prepare a local proposal. This control cannot publish or authorize an external action." />
          <div className="lab-step">02 / KNOW THE AGENT</div>
          <AgentCard agent={agent} state={state} currentTask={proposal ? 'Demonstrate a review → decision → receipt flow' : 'Waiting for an intent'} />
        </div>
        <div className="lab-column">
          <div className="lab-step">03 / REVIEW AUTHORITY</div>
          {proposal ? <ApprovalGate proposal={proposal} status={approval} approveLabel="Simulate publish" onDecision={decide} />
            : <section className="lab-placeholder"><h2>Nothing is authorized yet.</h2><p>Prepare a proposal to inspect its target, consequences, recovery limits, and approval controls.</p></section>}
          <label className="demo-toggle"><input type="checkbox" checked={unknown} disabled={busy || approval !== 'awaiting'} onChange={e => setUnknown(e.target.checked)} />Simulate an unconfirmed response</label>
          <div className="lab-step">04 / VERIFY THE OUTCOME</div>
          {receipt ? <ActionReceipt receipt={receipt} />
            : <section className="lab-placeholder"><h2>No action receipt.</h2><p>Approval is not completion. A receipt appears only after the local simulation verifies its result.</p></section>}
        </div>
      </div>
      <footer className="lab-footer">Human Intent. Machine Intelligence. Systemic Design.<br />Draft reference implementation — not authorization infrastructure or accessibility certification.</footer>
    </main>
  </>;
}
