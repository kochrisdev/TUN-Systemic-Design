'use client';
import { useId, useState } from 'react';
import { effectivePlanStatus, effectivePlanStepStatus, planFingerprint, planIssues, planStatusLabels,
  planStepLabels, type TaskPlan } from './review-contracts.js';

export interface PlanViewProps { plan: TaskPlan; title?: string; className?: string }
export function PlanView(props: PlanViewProps) {
  return <PlanRevision key={JSON.stringify([props.plan.id, props.plan.version])} {...props} />;
}
function PlanRevision({ plan, title = 'Proposed approach', className = '' }: PlanViewProps) {
  const id = useId();
  const [snapshot] = useState(() => planFingerprint(plan));
  const changed = snapshot !== planFingerprint(plan);
  const issues = planIssues(plan);
  const status = effectivePlanStatus(plan);
  const label = changed ? 'Plan changed without a new version — review is stale'
    : status === 'unverified' ? 'Completion not verified' : planStatusLabels[status];
  return <section className={`tun-component tun-plan ${className}`} aria-labelledby={`${id}-title`}>
    <p className="tun-eyebrow">Plan · not an action authorization</p>
    <h2 id={`${id}-title`} className="tun-heading">{title}</h2>
    <p>{plan.objective}</p>
    <p className="tun-badge" role="status">{label}</p>
    {plan.changeSummary && <p className="tun-notice">Revision: {plan.changeSummary}</p>}
    {issues.length > 0 && <div className="tun-notice"><p>Plan metadata needs correction.</p><ul>{issues.map(issue => <li key={issue}>{issue}</li>)}</ul></div>}
    {Boolean(plan.blockers?.length) && <div className="tun-notice"><p>Blocking issues</p><ul>{plan.blockers?.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
    <ol className="tun-plan-steps">{plan.steps.map((step, index) => {
      const stepStatus = effectivePlanStepStatus(step);
      return <li key={`${step.id}-${index}`}>
        <h3 className="tun-subheading">{step.title}</h3>
        <p className="tun-caption">{stepStatus === 'unverified' ? 'Completion not verified' : planStepLabels[stepStatus]}{step.owner ? ` · ${step.owner}` : ''}</p>
        <p>{step.detail}</p>
        {step.approvalRequired && <p className="tun-notice">Separate action approval required before this step can execute.</p>}
        {Boolean(step.dependsOn?.length) && <p className="tun-caption">Depends on: {step.dependsOn?.map(dep => plan.steps.find(s => s.id === dep)?.title ?? `Unknown step (${dep})`).join(', ')}</p>}
        {step.completionEvidence && <p className="tun-caption">Application evidence: {step.completionEvidence}</p>}
      </li>;
    })}</ol>
    <h3 className="tun-subheading">Expected outputs</h3>
    <ul>{plan.expectedOutputs.map((item, i) => <li key={i}>{item}</li>)}</ul>
    {plan.completionEvidence && <p className="tun-caption">Plan evidence: {plan.completionEvidence}</p>}
    <p className="tun-caption">Plan {plan.id} · version {plan.version}. Based on context {plan.context.id} · version {plan.context.version}.</p>
    <p className="tun-muted">Reviewing this approach does not approve publication or any other external action. This view is a task plan, not an internal reasoning transcript.</p>
  </section>;
}
