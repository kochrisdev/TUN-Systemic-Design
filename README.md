# TUN Systemic Design

**Make AI actions understandable, controllable, and accountable.**

When an agent UI treats a click as “done,” people lose track of what they approved, what ran, and what was verified. TUN Systemic Design keeps those moments distinct. It gives product teams shared interaction rules, **14 React components**, and light/dark design tokens for building AI products around clear intent, visible context, explicit authority, and verifiable outcomes.

```text
Intent → Context → Plan → Proposal → ApprovalGate
                                         │ version-bound decision
                                         ▼
                     Application: Authorize → Execute → Verify
                                                           │
                                                           ▼
                                                     ActionReceipt
```

## Put an approval gate before an agent action

Pass your application's versioned publication proposal, current approval status, and decision handler:

```tsx
import { ApprovalGate, type ApprovalGateProps } from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';

export function PublishReview({
  proposal,
  status,
  onDecision,
}: Pick<ApprovalGateProps, 'proposal' | 'status' | 'onDecision'>) {
  return (
    <ApprovalGate
      proposal={proposal}
      status={status}
      approveLabel="Publish project update"
      onDecision={onDecision}
    />
  );
}
```

The gate shows the actor, target, effect, and recovery limits, then emits `{ proposalId, proposalVersion, decision }`. Your service validates authority, executes an approved action, and supplies the verified outcome to `ActionReceipt`.

## Explore and build

**Try it:** [Guided demo](https://tun-systemic-design-demo.vercel.app/#demo) · [14-component explorer](https://tun-systemic-design-demo.vercel.app/#components) · [Trust & Control Lab](https://tun-systemic-design-demo.vercel.app/#trust)

**Start here:** [Introduction for everyone](docs/INTRODUCTION.md) · [Install and run](docs/GETTING-STARTED.md) · [Approval Gate API](docs/REACT-COMPONENTS-v0.1.md#6-approval-gate)

**Design and integrate:** [Specification](docs/SPECIFICATION-v0.1.md) · [Visual system](docs/DESIGN-TOKENS-AND-VISUAL-SYSTEM-v0.1.md) · [Architecture](docs/ARCHITECTURE.md) · [Integration checklist](docs/INTEGRATION-CHECKLIST.md) · [Threat model](docs/THREAT-MODEL.md)

**Project:** [Documentation](docs/README.md) · [Roadmap](docs/STATUS-AND-ROADMAP.md) · [Scope and non-claims](docs/SCOPE.md) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [Changelog](CHANGELOG.md) · [CC0-1.0 license](LICENSE)

**Human Intent. Machine Intelligence. Systemic Design.**
