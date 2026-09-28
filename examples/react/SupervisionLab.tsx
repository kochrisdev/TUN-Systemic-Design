import { useRef, useState } from 'react';
import { AgentActivity, ToolActivity, HumanOverride, RecoveryControl } from '@tun-systemic/react';
import { advanceSupervision, initialSupervision, nextSupervision, recoveryOperation, requestDemoRecovery,
  requestDemoStop, stopOperation, supervisionActivity, type SupervisionState } from './supervision-model.js';
export function SupervisionLab() {
  const [state, setState] = useState(initialSupervision);
  const current = useRef(state);
  function apply(change: (s: SupervisionState) => SupervisionState) { current.current = change(current.current); setState(current.current); }
  const activity = supervisionActivity(state);
  return <section id="supervision" aria-labelledby="supervision-title" className="evidence-section">
    <p className="lab-kicker">SUPERVISION AND RECOVERY / SEPARATE LOCAL SIMULATION</p>
    <h2 id="supervision-title">Request precisely. Verify the result.</h2>
    <p className="simulation-notice">This stepped fixture has no real agent, tool, backend, or external effects. The controls below do not govern the publication-review lab above. Original effects stay visible after stoppage and compensation.</p>
    <section className="tun-component" aria-label="Simulated worker controls">
      <h3 className="tun-subheading">Simulation controls, not production actions</h3>
      <label className="demo-toggle"><input type="checkbox" checked={state.loseAcknowledgement} disabled={state.phase !== 'running'}
        onChange={e => { const checked = e.target.checked; apply(s => ({ ...s, loseAcknowledgement: checked })); }} />Lose stop acknowledgement (simulation)</label>
      <div className="tun-actions">
        <button type="button" className="tun-button" disabled={!['stopping', 'recovering'].includes(state.phase)} onClick={() => apply(advanceSupervision)}>Advance simulated worker</button>
        <button type="button" className="tun-button" disabled={!['stopped', 'recovered'].includes(state.phase)} onClick={() => apply(nextSupervision)}>Start another local run</button>
      </div>
      <p className="tun-caption">Request stop, then advance the fixture to observe a result. An unknown result permits a status check, not a blind retry.</p>
    </section>
    <div className="lab-grid">
      <div className="lab-column">
        <AgentActivity activity={activity} />
        <ToolActivity activity={{ ...activity, id: 'local-tool', tool: 'In-memory fixture writer', category: 'writing',
          target: 'Local demonstration records', authority: 'Synthetic fixture operations only; no real permissions' }} />
      </div>
      <div className="lab-column">
        <HumanOverride operation={stopOperation(state)} status={state.overrideStatus} evidence={state.overrideEvidence}
          onRequest={request => apply(s => requestDemoStop(s, request))} />
        <RecoveryControl operation={recoveryOperation(state)} status={state.recoveryStatus} evidence={state.recoveryEvidence}
          onRequest={request => apply(s => requestDemoRecovery(s, request))} />
      </div>
    </div>
    <section className="tun-component" aria-label="Simulation action history"><h3 className="tun-subheading">Preserved local records</h3>
      <ol>{state.records.map((record, i) => <li key={i}>{record}</li>)}</ol>
      <p className="tun-caption">This is not durable audit storage. Refresh clears the fixture, not real-world effects.</p>
    </section>
  </section>;
}
