'use client';
import { useEffect, useId, useState } from 'react';
import { consequenceLabels, displayTimestamp, parseTimestamp, proposalBlockReason, proposalFingerprint,
  recoveryLabels, type ActionProposal } from './contracts.js';
import { proposalStatusLabels, type ProposalStatus, type ReviewRequest } from './review-contracts.js';

export interface ProposalCardProps {
  proposal: ActionProposal;
  status: ProposalStatus;
  rationale?: string;
  assumptions?: readonly string[];
  /** Navigation only. This callback must not execute or approve an action. */
  onReview?(request: ReviewRequest): void;
  blockedReason?: string;
  className?: string;
}
export function ProposalCard(props: ProposalCardProps) {
  return <ProposalRevision key={JSON.stringify([props.proposal.id, props.proposal.version])} {...props} />;
}
function ProposalRevision({ proposal, status, rationale, assumptions, onReview, blockedReason, className = '' }: ProposalCardProps) {
  const id = useId();
  const [snapshot] = useState(() => proposalFingerprint(proposal));
  const [clock, setClock] = useState<number | null>(null);
  const [localBlock, setLocalBlock] = useState('');
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const expires = proposal.expiresAt ? parseTimestamp(proposal.expiresAt) : null;
    const tick = () => {
      const now = Date.now(); setClock(now);
      if (expires !== null && expires > now) timer = setTimeout(tick, Math.min(expires - now + 1, 2147483647));
    };
    tick();
    return () => { if (timer !== undefined) clearTimeout(timer); };
  }, [proposal.expiresAt]);
  const reason = blockedReason || localBlock || (snapshot !== proposalFingerprint(proposal)
    ? 'Proposal changed without a new version. Request a fresh proposal.' : proposalBlockReason(proposal, clock ?? 0));
  const disabled = Boolean(reason) || !['ready', 'modified'].includes(status) || (proposal.expiresAt !== undefined && clock === null);
  function review() {
    if (disabled) return;
    const currentReason = proposalBlockReason(proposal, Date.now());
    if (currentReason) { setLocalBlock(currentReason); return; }
    onReview?.({ proposalId: proposal.id, proposalVersion: proposal.version });
  }
  return <section className={`tun-component tun-proposal ${className}`} aria-labelledby={`${id}-title`}>
    <p className="tun-eyebrow">Proposal · not executed</p>
    <h2 id={`${id}-title`} className="tun-heading">{proposal.action}</h2>
    <p className="tun-badge" role="status">{reason || proposalStatusLabels[status]}</p>
    <dl className="tun-facts">
      <div><dt>Actor</dt><dd>{proposal.actor.name} ({proposal.actor.type})</dd></div>
      <div><dt>Target</dt><dd>{proposal.target}</dd></div>
      <div><dt>Consequence</dt><dd>{proposal.consequence} · {consequenceLabels[proposal.consequence]}</dd></div>
      <div><dt>Expected effect</dt><dd>{proposal.effect}</dd></div>
      <div><dt>Authority requested</dt><dd>{proposal.authority}</dd></div>
      <div><dt>Recovery</dt><dd><strong>{recoveryLabels[proposal.recovery.kind]}.</strong> {proposal.recovery.description}</dd></div>
      {proposal.expiresAt && <div><dt>Expires</dt><dd>{displayTimestamp(proposal.expiresAt)}</dd></div>}
    </dl>
    {proposal.reviewBasis && <p className="tun-caption">Review basis: context {proposal.reviewBasis.context.id} v{proposal.reviewBasis.context.version}; plan {proposal.reviewBasis.plan.id} v{proposal.reviewBasis.plan.version}.</p>}
    {proposal.contentPreview !== undefined && <div className="tun-preview"><h3 className="tun-subheading">Content preview</h3><p className="tun-preserve-text">{proposal.contentPreview}</p></div>}
    {rationale && <p><strong>Rationale: </strong>{rationale}</p>}
    {Boolean(assumptions?.length) && <div><h3 className="tun-subheading">Assumptions and limitations</h3><ul>{assumptions?.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
    <p className="tun-caption" id={`${id}-help`}>Proposal {proposal.id} · version {proposal.version}. Opening review is not approval. Execution requires a separate authorized decision.</p>
    {onReview && <div className="tun-actions"><button type="button" className="tun-button" disabled={disabled} onClick={review} aria-describedby={`${id}-help`}>Review action</button></div>}
  </section>;
}
