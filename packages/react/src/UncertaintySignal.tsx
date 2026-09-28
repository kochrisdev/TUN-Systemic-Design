'use client';
import { useId } from 'react';
import { effectiveUncertaintyLevel, uncertaintyIssues, uncertaintyLabels, type UncertaintyAssessment } from './evidence-contracts.js';

export interface UncertaintySignalProps { assessment: UncertaintyAssessment; title?: string; announce?: boolean; className?: string }
export function UncertaintySignal({ assessment, title = 'Uncertainty', announce = false, className = '' }: UncertaintySignalProps) {
  const id = useId();
  const level = effectiveUncertaintyLevel(assessment);
  const issues = uncertaintyIssues(assessment);
  return <section className={`tun-component tun-uncertainty ${className}`} aria-labelledby={`${id}-title`}>
    <p className="tun-eyebrow">Uncertainty · qualitative, not a probability</p>
    <h2 id={`${id}-title`} className="tun-heading">{title}</h2>
    <p className="tun-badge" role={announce ? 'status' : undefined} aria-atomic={announce || undefined}>{level} · {uncertaintyLabels[level]}</p>
    <p><strong>Scope: </strong>{assessment.scope || 'Scope unavailable'}</p>
    <p>{assessment.explanation || 'No explanation supplied.'}</p>
    {assessment.basis && <p><strong>Basis: </strong>{assessment.basis}</p>}
    {issues.length > 0 && <p className="tun-notice">{issues.join(' ')} Displayed as Unknown until corrected.</p>}
    {assessment.nextStep && <p><strong>Next step: </strong>{assessment.nextStep}</p>}
    <p className="tun-caption">Application-supplied assessment. A confidence label is not independent verification or permission to act.</p>
  </section>;
}
