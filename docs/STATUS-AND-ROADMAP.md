# Implementation status and roadmap

**Revision:** September 30, 2026. **Current milestone:** Fourteen-component foundation and a runnable, server-backed local pilot. **Next:** Adopt one bounded workflow with a named internal product and provider.

[Documentation index](README.md) · [Public showcase](PUBLIC-SHOWCASE-v0.1.md) · [Public exports](../packages/react/src/index.ts) · [Scope and non-claims](SCOPE.md)

## Canonical component matrix

All fourteen patterns defined in [Components v0.1](COMPONENTS-v0.1.md) have reference React implementations. Together they cover intent, context, review, evidence, supervision, and recovery.

| Design component | React symbol | Source |
|---|---|---|
| Intent Composer | IntentComposer | [Implemented](../packages/react/src/IntentComposer.tsx) |
| Agent Card | AgentCard | [Implemented](../packages/react/src/AgentCard.tsx) |
| Context Panel | ContextPanel | [Implemented](../packages/react/src/ContextPanel.tsx) |
| Plan View | PlanView | [Implemented](../packages/react/src/PlanView.tsx) |
| Proposal Card | ProposalCard | [Implemented](../packages/react/src/ProposalCard.tsx) |
| Approval Gate | ApprovalGate | [Implemented](../packages/react/src/ApprovalGate.tsx) |
| Action Receipt | ActionReceipt | [Implemented](../packages/react/src/ActionReceipt.tsx) |
| Memory Indicator | MemoryIndicator | [Implemented](../packages/react/src/MemoryIndicator.tsx) |
| Source View | SourceView | [Implemented](../packages/react/src/SourceView.tsx) |
| Uncertainty Signal | UncertaintySignal | [Implemented](../packages/react/src/UncertaintySignal.tsx) |
| Tool Activity | ToolActivity | [Implemented](../packages/react/src/ToolActivity.tsx) |
| Agent Activity | AgentActivity | [Implemented](../packages/react/src/AgentActivity.tsx) |
| Human Override | HumanOverride | [Implemented](../packages/react/src/HumanOverride.tsx) |
| Recovery Control | RecoveryControl | [Implemented](../packages/react/src/RecoveryControl.tsx) |

## Adoption starting point

Start with [examples/host-integration](../examples/host-integration/README.md), not another showcase validation exercise. It connects the existing components to a genuine Python HTTP host, server-owned permissions and revisions, an on-disk operation ledger, and an independently committed local sandbox provider. The UI withholds its receipt until a separate server readback verifies the effect.

```sh
npm ci
npm run demo:host
```

The provider is deliberately local; authorization, HTTP requests, persistence and readback are real. The [pilot evidence map](../examples/host-integration/TRACEABILITY.md) links fault, concurrency, and browser checks to threats and specification obligations. Replace one boundary at a time in an adopting application.

## Other deliverables

| Area | Available now |
|---|---|
| Design guidance | Introduction, concept note, manifesto, behavioral specification, component catalog, integration checklist |
| Tokens and CSS | 212 typed tokens, generated light/dark themes, token exporter and contrast checks |
| Public showcase | Overview, six-stage guided demo, searchable component explorer, Trust & Control Lab |
| Representative states | Two read-only specimens for each of the fourteen components |
| Technical examples | Real local host pilot, original full lab at /?lab=1, and a separate HTML visual specimen |
| Deployment configuration | Vercel workspace install/build settings and examples/react/dist output |
| Sharing assets | Static title/description/social metadata, favicon, 1200-by-630 PNG with SVG source |
| TypeScript contracts | Core/review, evidence/memory, and supervision/recovery records and helpers |
| Validation tooling | Locked dependency graph, CI, contract/component/model/browser tests, documentation checker |
| Requirement traceability | [Stable rule IDs, test mappings, fresh evidence reports and manual/integration assessment procedures](../conformance/README.md) |
| Consumer acceptance | Isolated offline installation/reinstall, declarations, fourteen static renders, seven negative type cases, package/CSS checks |

## Acceptance boundary

[PR 7](https://github.com/kochrisdev/TUN-Systemic-Design/pull/7) records public-showcase acceptance. [PR 6](https://github.com/kochrisdev/TUN-Systemic-Design/pull/6) records the fourteen-component implementation. The [documentation index](README.md#evidence-and-historical-records) collects the named runs and historical validation records. Coverage, service responsibilities, release status, and conformance terminology are consolidated in [Scope and non-claims](SCOPE.md).

The [generated traceability matrix](../conformance/TRACEABILITY.md) records the current mandatory-statement coverage. The conformance runner connects selected checks to fresh execution results; its remaining review procedures define concrete next work for each rule.

## Next milestones

**Priority is a completed adoption, not more showcase coverage.** The public site remains a maintenance surface; new polish is justified by an adopter problem rather than a standalone validation milestone.

| Milestone | Deliverable | Acceptance target |
|---|---|---|
| **1. One named internal adoption** | Choose a reversible workflow, product owner, backend owner and reviewer; use the server-backed example as the starting point | A person reviews exact parameters, the service enforces current permission, and only authoritative readback produces a receipt. Record the product/environment and actual operator feedback. |
| **2. Real identity and one provider adapter** | Replace fixture tokens and the local provider with application identity, tenant policy and a narrowly scoped service | Repeat stale-version, revoked-grant, tenant isolation, duplicate request, lost-acknowledgement and restart scenarios against the selected provider. Document idempotency/readback limits. |
| **3. Operational recovery** | Extend the pilot to workers, partial effects, cancellation, reconciliation and recovery | Demonstrate intervention at real effect boundaries, bounded retries, preserved audit history and a verified recovery path. Retain unknown outcomes where the provider cannot resolve them. |
| **4. Adoption compatibility and packaging** | Finish runtime contracts, supported React/framework combinations, accessibility/localization and deliberate package release gates | Validate the environments used by the pilot; retain consumer-install and existing regression checks. Do not broaden compatibility or release claims without passing evidence. |
| **5. Scoped conformance review** | Attach pilot evidence and residual reviews to the existing threat and SPEC identifiers | Named reviewer, product revision, applicable-rule outcomes, exceptions and justified non-applicability. Expand collector support where separate evidence formats are actually needed. |

The local pilot is an implemented reference, not evidence that an external organization has adopted TUN. CI, documentation, dependency upkeep and public-site checks continue as release gates. Figma/native adapters and additional showcase polish follow demonstrated adoption needs.

## Maintaining status

Mark a component Implemented when source, export, example, tests, and API documentation exist. Mark checks Validated after a named run passes. Record the source revision and environment, and retain historical evidence. Follow [Contributing](../CONTRIBUTING.md).
