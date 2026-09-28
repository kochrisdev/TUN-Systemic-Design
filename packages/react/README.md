# @tun-systemic/react — v0.1.0

Reference React components for **TUN Systemic Design**: `IntentComposer`, `AgentCard`, `ContextPanel`, `PlanView`, `ProposalCard`, `ApprovalGate`, and `ActionReceipt`.

The package is repository-local and **not published to npm**. The other seven canonical design patterns are not exported. The `private` flag prevents accidental publication; it does not restrict access to the public repository. This private increment retains version 0.1.0; use its source commit and archive digest to distinguish it from the earlier four-component package.

## Build in the repository

Use the reference development toolchain, Node **22.23.2** and npm **12.1.0**, from the repository root:

```sh
npm install --global npm@12.1.0
npm ci
npm run check
npm run dev
```

`npm run check` typechecks, builds, runs contract/React/workflow-model tests, builds the demo, and checks a local package archive. Browser, token, documentation, and dependency-audit checks are separate. The local lab on port 4173 is an in-memory simulation, not an AI or execution service.

## Consume a local archive

Run `npm run pack:react` at the repository root. It creates `tun-systemic-react-0.1.0.tgz`; `npm run check` also creates a checked archive under `artifacts/`. Neither publishes anything.

In a compatible React application, replace this path with the actual archive location:

```sh
npm install /absolute/path/to/tun-systemic-react-0.1.0.tgz
```

```tsx
import { ContextPanel, PlanView, ProposalCard, ApprovalGate } from '@tun-systemic/react';
import type { ContextSnapshot, TaskPlan, ActionProposal, ReviewRequest, DecisionRequest } from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';
```

The peer range is React/React DOM `>=19.2.0 <20`. The package exposes ESM JavaScript, declarations, `contracts`, `styles.css`, and `tokens.css`; there is no CommonJS require entry or separate `review-contracts` subpath. Review types/helpers are available through the root and `contracts` entries. A tested locked graph does not establish every peer version or host-framework configuration.

The proposed fresh independent-consumer installation smoke test remains outstanding. Inventory and workspace exports are not that test. Validate archive installation, styles, SSR/hydration, and framework boundaries in the actual consumer before adoption.

Import component CSS once in the host's permitted global-style entry. It includes generated TUN tokens. Put `data-tun-theme="light"` or `"dark"` on `<html>`, or remove the attribute for the system preference. Nested theme islands, remote fonts, and preference persistence are not implemented.

## Contracts and limits

Availability is not actual source usage. A reviewed plan does not authorize its actions. ProposalCard's `onReview` requests navigation only; ApprovalGate's `onDecision` requests a particular decision. Optional `reviewBasis` and `contentPreview` are visible and included in proposal fingerprints. A receipt still requires application-supplied verification.

**An approval button is not an authorization service.** The host authenticates, validates input, binds immutable canonical authorization, rechecks expiry/revocation, deduplicates, executes, verifies, and protects audit records. A callback resolving is not a completed action. Never automatically retry an unconfirmed external effect. Remove unauthorized source content and metadata before sending props to the client.

The package implements no model calls, persistent-memory service, external tool execution, Human Override, or recovery services. UI checks cannot authenticate supplied evidence. TypeScript props are not complete runtime schemas for untrusted JSON.

## Documentation

Absolute repository links work when this README is extracted from an archive. While this increment is unmerged, use its branch or source commit in GitHub rather than assuming main contains the new guide.

- [Getting started](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/GETTING-STARTED.md)
- [Core React API](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/REACT-COMPONENTS-v0.1.md)
- [Review workflow PR](https://github.com/kochrisdev/TUN-Systemic-Design/pull/4)
- [Review workflow guide on the implementation branch](https://github.com/kochrisdev/TUN-Systemic-Design/blob/feat/context-plan-proposal-v0.1/docs/REVIEW-WORKFLOW-v0.1.md)
- [Implementation matrix](https://github.com/kochrisdev/TUN-Systemic-Design/blob/feat/context-plan-proposal-v0.1/docs/STATUS-AND-ROADMAP.md)
- [Review validation](https://github.com/kochrisdev/TUN-Systemic-Design/blob/feat/context-plan-proposal-v0.1/docs/REVIEW-VALIDATION-v0.1.md)

No hosted deployment, npm release, full accessibility audit, or independent conformance certification is included. The existing CC0-1.0 license is copied into the package at build time; third-party dependencies retain their own licenses.
