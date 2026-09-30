import { useRef, useState } from 'react';
import { ActionReceipt, ApprovalGate, IntentComposer, ProposalCard } from '../../packages/react/src/index.js';
import { api, decodeSnapshot, receiptFor, type Snapshot } from './client.js';

export function App() {
  const [access, setAccess] = useState('');
  const [token, setToken] = useState('');
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [content, setContent] = useState('Our pilot now separates approval, execution, and server verification.');
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false), requestNumber = useRef(0);
  const [message, setMessage] = useState('Connect with a local token printed by the Python host.');
  const [fault, setFault] = useState('none');
  const current = snapshot?.proposals.find(p => `${p.proposal.id}:${p.proposal.version}` === selected) ?? snapshot?.proposals[0];
  const operation = snapshot?.operations.find(o => current && o.proposalId === current.proposal.id && o.proposalVersion === current.proposal.version);
  const receipt = receiptFor(operation);
  async function refresh(using = token) {
    const request = ++requestNumber.current;
    const data = decodeSnapshot(await api(using, '/api/snapshot'));
    if (request === requestNumber.current) setSnapshot(data);
  }
  async function command(path: string, body: unknown) {
    if (lock.current) throw new Error('A local request is already in flight.');
    lock.current = true; setBusy(true);
    try {
      const reply = await api(token, path, body);
      await refresh();
      setMessage('Server records refreshed. Acknowledgement alone is not verification.');
      return reply;
    } catch (error) {
      setMessage(error instanceof Error && error.message.startsWith('The server') ? error.message : 'Request outcome is unconfirmed. Refresh records and verify the existing operation; do not resubmit.');
      try { await refresh(); } catch { /* Preserve previously known state, not invented success. */ }
      throw error;
    } finally { lock.current = false; setBusy(false); }
  }
  const act = (path: string, body: unknown) => { void command(path, body).catch(() => {}); };
  return <main className="pilot">
    <header><p className="eyebrow">TUN SYSTEMIC DESIGN / HOST INTEGRATION</p><h1>Approval is not success.</h1>
      <p>Try a real HTTP host that authorizes a local board update, stores the effect, and withholds its receipt until a separate server readback verifies it.</p>
      <p className="notice">Local sandbox provider. Real SQLite records. No AI model, remote publication, payment, or external credentials.</p>
    </header>
    <section className="panel" aria-labelledby="connection-title"><h2 id="connection-title">Connect to the local host</h2>
      <form onSubmit={event => { event.preventDefault(); if (busy) return; setBusy(true); void refresh(access).then(() => { setToken(access); setAccess(''); setMessage('Connected. Select or prepare a proposal.'); }).catch(() => { setSnapshot(null); setToken(''); setMessage('Connection failed. Check the token printed by the host.'); }).finally(() => setBusy(false)); }}>
        <label htmlFor="access">Local access token</label><input id="access" type="password" value={access} onChange={event => setAccess(event.target.value)} autoComplete="off" required />
        <button disabled={busy}>Connect</button>
      </form>
      {snapshot && <><p>Principal: <strong>{snapshot.session.id}</strong> · Tenant: {snapshot.session.tenant} · Write permission: <strong>{snapshot.session.canWrite ? 'Granted' : 'Denied'}</strong></p>
        <button type="button" disabled={busy} onClick={() => { void refresh().then(() => setMessage('Read-only refresh finished. It did not verify or execute an action.')).catch(() => setMessage('Refresh failed. Previously known records have not been changed.')); }}>Refresh server records</button>
        {snapshot.session.canAdmin && <button type="button" disabled={busy} onClick={() => act('/api/session/permission', { canWrite: !snapshot.session.canWrite })}>{snapshot.session.canWrite ? 'Revoke write permission' : 'Restore write permission'}</button>}</>}
      <p role="status" className="notice">{message}</p>
    </section>
    {snapshot && <>
      <IntentComposer value={content} onValueChange={setContent} label="Project update text" submitLabel="Prepare server proposal" maxLength={4000} disabled={busy || !snapshot.session.canWrite}
        scope="The server stores a proposal for this exact text. Preparation does not publish it. No model is called."
        onSubmit={async value => { const reply = await command('/api/proposals', { kind: 'publish', content: value }) as { proposalId: string; proposalVersion: string }; setSelected(`${reply.proposalId}:${reply.proposalVersion}`); }} />
      {current && <>
        <section className="panel"><label htmlFor="proposals">Stored proposals and revisions</label><select id="proposals" value={`${current.proposal.id}:${current.proposal.version}`} onChange={event => setSelected(event.target.value)} disabled={busy}>
          {snapshot.proposals.map(p => <option key={`${p.proposal.id}:${p.proposal.version}`} value={`${p.proposal.id}:${p.proposal.version}`}>{p.proposal.action} · {p.proposal.id.slice(0,8)} v{p.proposal.version} · {p.state}</option>)}
        </select>
        {current.kind === 'publish' && ['awaiting','approved'].includes(current.state) && (!operation || operation.state === 'authorized') && <button type="button" disabled={busy || !snapshot.session.canWrite} onClick={() => { void command(`/api/proposals/${current.proposal.id}/revise`, { proposalVersion: current.proposal.version, content }).then(reply => { const p = reply as {proposalVersion:string}; setSelected(`${current.proposal.id}:${p.proposalVersion}`); }).catch(() => {}); }}>Revise with editor text</button>}
        </section>
        <ProposalCard proposal={current.proposal} status={current.state === 'awaiting' ? 'ready' : current.state} />
        <ApprovalGate proposal={current.proposal} status={current.state} approveLabel={current.kind === 'publish' ? 'Authorize local publication' : 'Authorize local withdrawal'} blockedReason={!snapshot.session.canWrite ? 'The server reports no current write permission.' : busy ? 'Another local request is in flight.' : undefined} onDecision={async decision => { await command('/api/decisions', decision); }} />
        <section className="panel" aria-labelledby="execution-title"><h2 id="execution-title">Execution and verification</h2>
          <p className="operation-state" role="status">{operation ? ({ authorized: 'Authorized — not executed', 'pending-verification': 'Provider returned — not verified', 'outcome-unknown': 'Outcome unknown — inspect this operation', verified: 'Server verification recorded', cancelled: 'Cancelled before dispatch' })[operation.state] : 'No authorized operation.'}</p>
          {operation && <>
            <p>Operation <code>{operation.id}</code></p>
            {snapshot.session.canAdmin && <><label htmlFor="fault">Local failure scenario</label><select id="fault" value={fault} disabled={busy || operation.state !== 'authorized'} onChange={event => setFault(event.target.value)}><option value="none">Normal provider response</option><option value="drop-ack">Drop HTTP response after provider commits</option><option value="before-write">Provider unavailable before writing</option></select></>}
            <div className="controls">
              <button type="button" disabled={busy || !snapshot.session.canWrite || operation.state !== 'authorized'} onClick={() => act(`/api/operations/${operation.id}/execute`, { fault })}>Execute authorized action</button>
              <button type="button" disabled={busy || !['outcome-unknown','pending-verification'].includes(operation.state)} onClick={() => act(`/api/operations/${operation.id}/verify`, {})}>Verify with server</button>
              <button type="button" disabled={busy || operation.state !== 'authorized'} onClick={() => act(`/api/operations/${operation.id}/cancel`, {})}>Cancel before dispatch</button>
            </div>
          </>}
          {!receipt && <p className="notice" data-testid="receipt-withheld">No verified receipt. A click, an HTTP acknowledgement, and a provider write cannot create one in this UI.</p>}
        </section>
        {receipt && <div data-testid="verified-receipt"><ActionReceipt receipt={receipt} />{current.kind === 'publish' && <button type="button" disabled={busy || !snapshot.session.canWrite} onClick={() => { void command('/api/proposals', { kind: 'withdraw', target: operation!.id }).then(reply => { const p = reply as {proposalId:string;proposalVersion:string}; setSelected(`${p.proposalId}:${p.proposalVersion}`); }).catch(() => {}); }}>Prepare separate withdrawal</button>}</div>}
      </>}
      <section className="panel"><h2>Durable host history</h2><p>{snapshot.operations.filter(o => o.receipt).length} verified receipt(s) retained in this tenant. Reconnect after a refresh or restart to inspect stored records.</p>
        <details><summary>Inspect authorization and verification events</summary><ol>{snapshot.events.map(event => <li key={event.sequence}><strong>{event.event}</strong> · {event.actor} · <time>{event.at}</time></li>)}</ol></details>
      </section>
    </>}
    <footer><p>Run locally. This server is a teaching reference, not a public hosting profile. Read <code>examples/host-integration/README.md</code> for the protocol, faults, tests, and production handoff.</p></footer>
  </main>;
}
