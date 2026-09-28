# Implementation status and roadmap

**Revision:** September 28, 2026, public showcase increment.  
**Scope:** The revision being viewed. Implemented does not mean published to npm, production-ready, independently certified, or accepted on every platform. Check the exact PR head and validation evidence; deployed content has its own source SHA.

[Documentation index](README.md) · [Public showcase](PUBLIC-SHOWCASE-v0.1.md) · [Public exports](../packages/react/src/index.ts) · [Supervision and recovery](SUPERVISION-AND-RECOVERY-v0.1.md)

## Canonical component matrix

All fourteen patterns defined in [Components v0.1](COMPONENTS-v0.1.md) have reference React exports. The showcase adds no new canonical component and changes no existing public component contract. Full behavior, conformance, and adoption are separate questions.

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

The internal shared ControlAction is not a fifteenth public component. Memory, evidence, activity, control, permission, and recovery are distinct contracts. No badge or callback grants authority. A stop request is not confirmation of stoppage, and compensation is not undo.

## Other deliverables

| Area | Status |
|---|---|
| Founding documents | Concept note and manifesto preserved |
| Behavioral specification | Draft project requirements, not independent certification |
| Tokens/CSS | 212 typed tokens, generated light/dark themes, limited DTCG-style exporter |
| HTML visual specimen | Local visual simulation, separate from React |
| Public showcase | Overview, six-stage guided demo, searchable 14-component explorer, separate Trust & Control Lab |
| Representative states | Two read-only specimens per component; not exhaustive state coverage |
| Original technical lab | Preserved at /?lab=1 with separate page-session state |
| Vercel configuration | Root build/install/output configuration; actual deployment must be verified separately |
| Sharing assets | Static title/description/social metadata, favicon and 1200-by-630 PNG with SVG source |
| TypeScript contracts | Core/review contracts plus root-only evidence and supervision contracts; not complete runtime schemas |
| CI/lockfile | Existing read-only workflows and locked graph preserved |
| Isolated consumer acceptance | Offline fresh install/reinstall, declarations, fourteen static specimens, seven negative type cases and package/CSS checks |
| Model, agent, memory, verification, authorization, cancellation, recovery services | Not supplied |
| Figma/Tailwind/native adapters | Not supplied |
| Runtime schemas/design linter | Not implemented; documentation checker is not a design linter |
| npm publication | Not included; a hosted demo is not a package release |
| Formal certification | Not implemented |

## Acceptance boundary

[PR 7](https://github.com/kochrisdev/TUN-Systemic-Design/pull/7) records the exact public-showcase runs, review and merge state. [PR 6](https://github.com/kochrisdev/TUN-Systemic-Design/pull/6) records fourteen-component acceptance. New tests being present is not a predeclared successful run. Browser navigation preserves visited controllers; navigation is not task cancellation or reset.

The [supervision](SUPERVISION-VALIDATION-v0.1.md), [evidence/memory](EVIDENCE-VALIDATION-v0.1.md), [consumer](CONSUMER-VALIDATION-v0.1.md), [review](REVIEW-VALIDATION-v0.1.md), and [original React](REACT-VALIDATION-v0.1.md) reports preserve historical results. Their earlier component counts remain dated evidence. Static rendering does not prove hydration, bundlers, or compatibility with every peer version.

The owner supplied a working Vercel demo address. That observation does not validate a later showcase deployment, production authorization services, social-network preview caches, loading performance, or deployment protection. Record those checks separately after deployment.

## Next milestones

**Adoption and integration hardening.** Add a bounded pilot using an actual application's authorization, observation, stop, reconciliation, and recovery services. Begin with reversible local effects, explicit authority, and a genuine service record. Test lost acknowledgements, revoked permissions, conflicting revisions, partial completion, remounts, and multi-tab duplicates.

**Portability and accessibility.** Expand Firefox/WebKit, assistive-technology, localization, CSS-bundler, framework-boundary, and hydration checks. Introduce validated runtime input schemas and exhaustive component-state matrices. Preserve the isolated package regression gate.

**Public-site validation.** Measure the deployed experience and complete user testing. Verify public/incognito access, production asset responses, social previews, and real loading performance. Hash-based presentation and a noscript fallback are not a complete prerendering or SEO strategy.

**Developer and designer experience.** The searchable component showcase now exists. Later work includes deliberate package versioning/release policy, Figma/token adapters, richer specimen controls, and examples tailored to real product workflows. Publish only after intentional authorization and release checks.

**Conformance and governance.** Map implemented behavior to applicable normative rules, document exceptions, and develop scoped evaluation tooling. Fourteen exports do not automatically make a product TUN-conformant.

## Maintaining status

Mark a component Implemented only when source, export, example, tests, and API documentation exist. Mark checks Validated only after a named run passes. Record exact source and limitations, preserving historical evidence. Follow [Contributing](../CONTRIBUTING.md).
