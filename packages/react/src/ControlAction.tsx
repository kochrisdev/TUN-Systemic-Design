'use client';
/** Internal shared presentation; not a public canonical component or trusted service. */
import { useEffect, useId, useRef, useState } from 'react';
import { displayTimestamp, parseTimestamp } from './contracts.js';
import { controlBlockReason, controlEvidenceMatches, controlFingerprint, controlRequest,
  type ControlEvidence, type ControlRequest, type ControlStatus, type InterventionOperation, type RecoveryOperation } from './supervision-contracts.js';
export interface ControlActionProps {
  operation: InterventionOperation | RecoveryOperation;
  family: 'intervention' | 'recovery';
  status: ControlStatus;
  evidence?: ControlEvidence;
  onRequest(request: ControlRequest): void | Promise<void>;
  /** Inspection/navigation only. It must not issue another effectful request. */
  onInspect?(request: ControlRequest): void;
  blockedReason?: string;
  className?: string;
  title: string;
  requestLabel: string;
  completedLabel: string;
}
export function ControlAction(props: ControlActionProps) {
  return <ControlRevision key={JSON.stringify([props.family, props.operation.id, props.operation.version, props.operation.run.id, props.operation.run.version])} {...props} />;
}
function ControlRevision({ operation, family, status, evidence, onRequest, onInspect, blockedReason, className = '', title, requestLabel, completedLabel }: ControlActionProps) {
  const id = useId(); const [fingerprint] = useState(() => controlFingerprint(operation));
  const [phase, setPhase] = useState<'idle' | 'pending' | 'acknowledged' | 'unknown'>('idle');
  const [clock, setClock] = useState<number | null>(null);
  const [localBlock, setLocalBlock] = useState(''); const [inspectionError, setInspectionError] = useState('');
  const latch = useRef(false); const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const expires = operation.expiresAt === undefined ? null : parseTimestamp(operation.expiresAt);
    const tick = () => { const now = Date.now(); setClock(now);
      if (expires !== null && expires > now) timer = setTimeout(tick, Math.min(expires - now + 1, 2147483647)); };
    tick(); return () => { if (timer !== undefined) clearTimeout(timer); };
  }, [operation.expiresAt]);
  const changed = fingerprint !== controlFingerprint(operation);
  const reason = blockedReason || localBlock || (changed ? 'Control details changed without a new version. Review is stale.' : controlBlockReason(operation, family, clock ?? 0));
  const disabled = Boolean(reason) || status !== 'available' || phase !== 'idle' || (operation.expiresAt !== undefined && clock === null);
  const confirmed = !changed && (status === 'completed' || status === 'failed') && controlEvidenceMatches(operation, evidence, status);
  const label = changed ? 'Review is stale' : confirmed ? (status === 'completed' ? completedLabel : 'Request failed — inspect partial effects')
    : ['completed', 'failed'].includes(status) ? 'Outcome not verified'
    : status === 'unknown' || phase === 'unknown' ? 'Outcome unknown — do not repeat the request'
    : status === 'pending' || phase === 'pending' ? 'Request pending — result not confirmed'
    : status === 'acknowledged' || phase === 'acknowledged' ? 'Request acknowledged — result not confirmed'
    : status === 'unavailable' ? 'Control unavailable' : 'Available for explicit request';
  async function request() {
    if (disabled || latch.current) return;
    const latestReason = controlBlockReason(operation, family, Date.now());
    if (latestReason) { setLocalBlock(latestReason); return; }
    latch.current = true; setPhase('pending');
    try { await onRequest(controlRequest(operation)); if (mounted.current) setPhase('acknowledged'); }
    catch { if (mounted.current) setPhase('unknown'); }
  }
  function inspect() {
    try { onInspect?.(controlRequest(operation)); }
    catch { setInspectionError('Status inspection is unavailable. No recovery or retry was requested.'); }
  }
  return <section className={`tun-component ${family === 'intervention' ? 'tun-override' : 'tun-recovery'} ${className}`} aria-labelledby={id}>
    <p className="tun-eyebrow">{family === 'intervention' ? 'Human intervention' : 'Recovery'} · request is not completion</p>
    <h2 id={id} className="tun-heading">{title}</h2>
    <p className="tun-badge" role="status">{label}</p>
    <dl className="tun-facts">
      <div><dt>Actor</dt><dd>{operation.actor.name} ({operation.actor.type})</dd></div>
      <div><dt>Target</dt><dd>{operation.target}</dd></div>
      <div><dt>Scope</dt><dd>{operation.scope}</dd></div>
      <div><dt>Requested effect</dt><dd>{operation.effect}</dd></div>
      <div><dt>Limits</dt><dd>{operation.limits}</dd></div>
      <div><dt>Known effects</dt><dd>{operation.knownEffects}</dd></div>
      {operation.expiresAt && <div><dt>Request expires</dt><dd>{displayTimestamp(operation.expiresAt)}</dd></div>}
    </dl>
    {'originalOutcome' in operation && <p>Original outcome: {operation.originalOutcome}. {operation.kind === 'compensate' ? 'Compensation is not undo; prior effects remain in the record.' : 'A status check must not repeat the original action.'}</p>}
    {'retrySafety' in operation && operation.retrySafety && <p>Host retry safeguard: {operation.retrySafety}</p>}
    {reason && <p className="tun-notice">{reason}</p>}
    {confirmed && evidence && <p className="tun-notice">Application evidence: {evidence.detail} Observed: {displayTimestamp(evidence.observedAt)}.</p>}
    <p id={`${id}-help`} className="tun-caption">Control {operation.id} v{operation.version} · run {operation.run.id} v{operation.run.version}. The host must authorize, execute, and verify this exact request. In-flight effects may already exist.</p>
    <div className="tun-actions"><button type="button" className="tun-button" disabled={disabled} aria-describedby={`${id}-help`} onClick={() => { void request(); }}>{requestLabel}</button>
      {onInspect && <button type="button" className="tun-button" onClick={inspect}>Inspect control status</button>}</div>
    {inspectionError && <p role="status">{inspectionError}</p>}
  </section>;
}
