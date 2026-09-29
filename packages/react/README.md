# @tun-systemic/react — v0.1.0

Reference React components for **TUN Systemic Design**. All fourteen canonical patterns have public implementations: IntentComposer, AgentCard, ContextPanel, PlanView, ProposalCard, ApprovalGate, ActionReceipt, MemoryIndicator, SourceView, UncertaintySignal, ToolActivity, AgentActivity, HumanOverride, and RecoveryControl.

The package remains repository-local and **not published to npm**. The private flag prevents accidental publication; it is not an access restriction on the public repository. Source SHA and archive digest distinguish builds sharing private version 0.1.0. A complete export set does not establish full conformance or production readiness.

## Build and run in the repository

Select Node **22.23.2** and npm **12.1.0**, then run from the repository root:

```sh
npm install --global npm@12.1.0
npm ci
npm run check
npm run dev
```

The component lab runs on port 4173. Every example is a local simulation, not an AI or action service. The new stepped supervision fixture is separate from the publication-review workflow.

`npm run check` typechecks, builds, runs contract/React/model tests, builds the demo, checks archive inventory, and performs an isolated offline consumer install/reinstall plus declaration and static-render checks. Browser, token, documentation, and dependency audits are separate. Tests must be observed passing for the relevant source; an authored fixture is not automatically evidence.

## Consume a local archive

From the repository root, `npm run pack:react` creates tun-systemic-react-0.1.0.tgz. `npm run check` also places a checked archive under artifacts/. Neither command publishes to npm.

In a compatible React app, replace the path with the actual archive:

```sh
npm install /absolute/path/to/tun-systemic-react-0.1.0.tgz
```

```tsx
import { ToolActivity, AgentActivity, HumanOverride, RecoveryControl } from '@tun-systemic/react';
import type { ActivityRecord, ToolActivityRecord, InterventionOperation, RecoveryOperation, ControlRequest } from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';
```

The declared peer range is React/React DOM >=18.3.0 <20. The package is ESM with declarations. Root, contracts, styles.css, and tokens.css are declared entry points; there is no CommonJS require entry. Evidence/memory and supervision types/helpers are **root-only**. Existing core/review helpers remain available through contracts. Internal ControlAction is not a public export.

The isolated consumer installs real local archives outside the repository and tests all fourteen static renders, declarations, seven negative type cases, and CSS/token resolution. It runs under the locked React 19 graph and exact React 18.3.0/18.3.1 profiles with React 18 types. A separate hydration sample checks all fourteen specimens and stable IDs. See [React compatibility](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/REACT-COMPATIBILITY.md) for the profile commands and evidence boundaries.

Import CSS once in the host's permitted global entry. Tokens are included. Set data-tun-theme light/dark on html, or remove it for system preference. Nested theme islands, remote fonts, and preference persistence are not implemented.

## Contracts and limits

An approval or override button is not an authorization service. The host validates external input, authenticates principal/tenant, binds immutable canonical operation and run revisions, checks scope/expiry/revocation, deduplicates, executes, observes, verifies, and protects audit records.

Availability is not source usage. Memory influence is not permission. A reviewed plan is not action authorization. Source checks are host declarations, not independent verification. Uncertainty is qualitative, not a calibrated probability.

HumanOverride/RecoveryControl emit version-bound request identities only. Promise resolution is acknowledgement, not completion. Rejected requests remain unknown and locally latched against repetition. Terminal control labels require matching host evidence. Unknown original outcomes allow reconciliation, not effectful recovery. Compensation is not undo; stopped work can still have prior effects.

Local UI latches do not coordinate remounts, multiple controls, tabs, or distributed systems. Do not generate a new version to bypass an unresolved outcome. Route applicable consequential recovery through explicit action approval and revalidate immediately before execution. Filter unauthorized data before sending any props to the browser.

No model runtime, source-verification service, memory storage, real tools, authorization, cancellation, or recovery backend is included. TypeScript interfaces are not complete hostile-JSON schemas. Broader framework, accessibility, localization, security, and production integration tests remain necessary.

## Documentation

These absolute links work when the README is extracted from an archive; use the source commit for historical reproduction:

- [Getting Started](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/GETTING-STARTED.md)
- [Core React API](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/REACT-COMPONENTS-v0.1.md)
- [Review Workflow](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/REVIEW-WORKFLOW-v0.1.md)
- [Evidence and Memory](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/EVIDENCE-AND-MEMORY-v0.1.md)
- [Supervision and Recovery](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/SUPERVISION-AND-RECOVERY-v0.1.md)
- [Implementation Matrix](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/STATUS-AND-ROADMAP.md)
- [Fourteen-component acceptance PR](https://github.com/kochrisdev/TUN-Systemic-Design/pull/6)

No hosted deployment, npm release, complete accessibility audit, or independent certification is included. The existing CC0-1.0 license is copied at build time. Third-party dependencies retain their own licenses.
