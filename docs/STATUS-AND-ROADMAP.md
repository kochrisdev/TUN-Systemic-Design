# Implementation status and roadmap

**Revision:** September 29, 2026. **Current milestone:** Fourteen-component foundation, public showcase and requirement traceability available. **Next:** A bounded application pilot.

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

## Other deliverables

| Area | Available now |
|---|---|
| Design guidance | Introduction, concept note, manifesto, behavioral specification, component catalog, integration checklist |
| Tokens and CSS | 212 typed tokens, generated light/dark themes, token exporter and contrast checks |
| Public showcase | Overview, six-stage guided demo, searchable component explorer, Trust & Control Lab |
| Representative states | Two read-only specimens for each of the fourteen components |
| Technical examples | Original full lab at /?lab=1 and a separate HTML visual specimen |
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

These are planned increments, in recommended order.

| Milestone | Deliverable | Acceptance target |
|---|---|---|
| **1. Bounded application pilot** | Integrate one workflow with application-owned authorization, execution, observation, intervention, and recovery | Begin with reversible local effects. Verify lost acknowledgements, revoked permissions, changed revisions, partial completion, and duplicate requests across tabs/remounts. Attach evidence to the matching conformance rule IDs. |
| **2. Portability and accessibility** | Expand browser, framework, hydration, CSS-bundler, localization, and assistive-technology coverage; add runtime input schemas and state matrices | Validate named target environments and untrusted inputs while retaining isolated-consumer regression checks. |
| **3. Public-site validation** | Test the deployed showcase with first-time visitors | Check public access, production assets, social previews, loading performance, and successful completion of the guided journey. |
| **4. Developer and designer experience** | Richer specimens, product-specific examples, Figma/token adapters, and a package release policy | Demonstrate reuse in a consuming application and define intentional versioning and publication gates. |
| **5. Conformance and governance** | Extend the existing traceability layer to recommendation/component-catalog rules and additional test runners; close recorded integration gaps | Complete scoped product assessments with requirement-level evidence, reviewer, exceptions, and justified non-applicability. |

## Maintaining status

Mark a component Implemented when source, export, example, tests, and API documentation exist. Mark checks Validated after a named run passes. Record the source revision and environment, and retain historical evidence. Follow [Contributing](../CONTRIBUTING.md).
