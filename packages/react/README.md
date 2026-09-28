# @tun-systemic/react — v0.1.0

Ten reference React components for **TUN Systemic Design**: `IntentComposer`, `AgentCard`, `ContextPanel`, `PlanView`, `ProposalCard`, `ApprovalGate`, `ActionReceipt`, `MemoryIndicator`, `SourceView`, and `UncertaintySignal`.

The package is repository-local and **not published to npm**. Tool Activity, Agent Activity, Human Override, and Recovery Control remain specified only. The private flag prevents accidental publication; it does not restrict access to the public repository. Use source commit and archive digest to distinguish builds sharing version 0.1.0.

## Build in the repository

Use Node **22.23.2** and npm **12.1.0** from the repository root:

```sh
npm install --global npm@12.1.0
npm ci
npm run check
npm run dev
```

`npm run check` typechecks, builds, runs contract/React/model tests, builds the demo, checks archive inventory, and performs an isolated offline consumer install/reinstall plus declaration and static-render checks. Browser, token, documentation, and dependency-audit checks are separate. The lab on port 4173 is an in-memory simulation, not an AI, persistent-memory, evidence-verification, or execution service.

## Consume a local archive

Run `npm run pack:react` at the root to create `tun-systemic-react-0.1.0.tgz`. `npm run check` also creates a checked archive under artifacts/. Neither publishes anything.

In a compatible React application, replace this path:

```sh
npm install /absolute/path/to/tun-systemic-react-0.1.0.tgz
```

```tsx
import { MemoryIndicator, SourceView, UncertaintySignal } from '@tun-systemic/react';
import type { MemoryRecord, EvidenceCollection, UncertaintyAssessment } from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';
```

The peer range is React/React DOM `>=19.2.0 <20`. The package exposes ESM JavaScript, declarations, `contracts`, `styles.css`, and `tokens.css`. There is no CommonJS require entry. Core/review types and helpers remain available through root and contracts entries; **new evidence/memory types and helpers are root exports only**. No review-contracts or evidence-contracts package subpath is declared.

The isolated consumer test installs real local archives outside the workspace, compiles declarations including four negative type cases, renders all ten components, and resolves styles. It covers one locked peer graph, not independently selected dependency versions, registry distribution, browser hydration, CSS bundlers, or every framework. Use an actual successful CI run for evidence, not this description alone.

Import CSS once in the host's permitted global entry. It includes generated TUN tokens. Put `data-tun-theme="light"` or `"dark"` on html, or remove the attribute for system preference. Nested themes, remote fonts, and preference persistence are not implemented.

## Contracts and limits

Availability is not actual source usage. A reviewed plan does not authorize its actions. ProposalCard's onReview requests navigation; ApprovalGate's onDecision requests a particular decision. Optional reviewBasis and contentPreview are visible and fingerprinted. A receipt requires application-supplied verification.

MemoryIndicator explains M0–M3 use; inspection navigates and does not mutate memory. Memory use does not establish retention or training policy. SourceView distinguishes quotations, paraphrases, generated interpretations, inaccessible evidence, and conflicts. Reported checks are not independent proof. UncertaintySignal uses scoped qualitative labels and falls back to Unknown when supporting metadata is missing.

**An approval button is not an authorization service.** The host authenticates, validates input, binds immutable canonical authorization, rechecks expiry/revocation, deduplicates, executes, verifies, and protects audit records. A resolved callback is not completion. Never automatically retry an unconfirmed external effect. Remove unauthorized source content and metadata before sending props to the client.

The package implements no model calls, persistent-memory service, external tools, Human Override, or recovery services. UI checks cannot authenticate supplied evidence. TypeScript props and typed-metadata helpers are not complete runtime schemas for untrusted JSON.

## Documentation

These repository links work outside an extracted archive. Main can evolve; use the source SHA for historical reproduction. While a feature PR is unmerged, its branch rather than main contains the new guide.

- [Getting started](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/GETTING-STARTED.md)
- [Core React API](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/REACT-COMPONENTS-v0.1.md)
- [Review workflow](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/REVIEW-WORKFLOW-v0.1.md)
- [Evidence and memory API](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/EVIDENCE-AND-MEMORY-v0.1.md)
- [Implementation matrix](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/STATUS-AND-ROADMAP.md)
- [Evidence and memory PR](https://github.com/kochrisdev/TUN-Systemic-Design/pull/5)
- [Historical consumer installation evidence](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/CONSUMER-VALIDATION-v0.1.md)

No hosted deployment, npm release, complete accessibility audit, or independent certification is included. The existing CC0-1.0 license is copied into the package at build time. Third-party dependencies retain their own licenses.
