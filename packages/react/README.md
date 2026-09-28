# @tun-systemic/react — v0.1.0

Reference React components for **TUN Systemic Design**: `IntentComposer`, `AgentCard`, `ContextPanel`, `PlanView`, `ProposalCard`, `ApprovalGate`, and `ActionReceipt`.

The package is repository-local and **not published to npm**. The other seven canonical patterns are not exported. The private flag prevents accidental publication; it does not restrict access to the public repository. Use source commit and archive digest to distinguish private builds that share version 0.1.0.

## Build in the repository

Use Node **22.23.2** and npm **12.1.0** from the repository root:

```sh
npm install --global npm@12.1.0
npm ci
npm run check
npm run dev
```

`npm run check` typechecks, builds, runs contract/React/model tests, builds the demo, checks archive inventory, and performs an isolated offline consumer install/reinstall plus declaration and static-render checks. Browser, token, documentation, and dependency-audit checks are separate. The lab on port 4173 is an in-memory simulation, not an AI or execution service.

## Consume a local archive

Run `npm run pack:react` at the root to create `tun-systemic-react-0.1.0.tgz`. `npm run check` also creates a checked archive under artifacts/. Neither publishes anything.

In a compatible React application, replace this path:

```sh
npm install /absolute/path/to/tun-systemic-react-0.1.0.tgz
```

```tsx
import { ContextPanel, PlanView, ProposalCard, ApprovalGate } from '@tun-systemic/react';
import type { ContextSnapshot, TaskPlan, ActionProposal, ReviewRequest, DecisionRequest } from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';
```

The peer range is React/React DOM `>=19.2.0 <20`. The package exposes ESM JavaScript, declarations, `contracts`, `styles.css`, and `tokens.css`. There is no CommonJS require entry or separate review-contracts subpath; review types/helpers are available through root and contracts entries.

The isolated consumer test installs real local archives outside the workspace, compiles declarations, renders all seven components, and resolves styles. It covers one locked peer graph, not independently selected dependency versions, registry distribution, browser hydration, CSS bundlers, or every framework. Test those boundaries in the consuming application.

Import CSS once in the host's permitted global entry. It includes generated TUN tokens. Put `data-tun-theme="light"` or `"dark"` on html, or remove the attribute for system preference. Nested themes, remote fonts, and preference persistence are not implemented.

## Contracts and limits

Availability is not actual source usage. A reviewed plan does not authorize its actions. ProposalCard's onReview requests navigation; ApprovalGate's onDecision requests a particular decision. Optional reviewBasis and contentPreview are visible and fingerprinted. A receipt requires application-supplied verification.

**An approval button is not an authorization service.** The host authenticates, validates input, binds immutable canonical authorization, rechecks expiry/revocation, deduplicates, executes, verifies, and protects audit records. A resolved callback is not completion. Never automatically retry an unconfirmed external effect. Remove unauthorized source content and metadata before sending props to the client.

The package implements no model calls, persistent-memory service, external tools, Human Override, or recovery services. UI checks cannot authenticate supplied evidence. TypeScript props are not complete runtime schemas for untrusted JSON.

## Documentation

These repository links remain usable when this README is extracted from an archive. Main can evolve; reproduce historical results using the source SHA recorded with the evidence.

- [Getting started](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/GETTING-STARTED.md)
- [Core React API](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/REACT-COMPONENTS-v0.1.md)
- [Review workflow](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/REVIEW-WORKFLOW-v0.1.md)
- [Implementation matrix](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/STATUS-AND-ROADMAP.md)
- [Workflow evidence](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/REVIEW-VALIDATION-v0.1.md)
- [Consumer installation evidence](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/CONSUMER-VALIDATION-v0.1.md)

No hosted deployment, npm release, complete accessibility audit, or independent certification is included. The existing CC0-1.0 license is copied into the package at build time. Third-party dependencies retain their own licenses.
