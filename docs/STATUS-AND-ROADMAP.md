# Implementation status and roadmap

**Revision:** September 28, 2026, review-workflow acceptance.  
**Scope:** Contents of the revision being viewed. A package build is not a registry publication, hosted service, or certification.

[Documentation index](README.md) · [Public exports](../packages/react/src/index.ts) · [Review workflow](REVIEW-WORKFLOW-v0.1.md) · [Consumer validation](CONSUMER-VALIDATION-v0.1.md)

## Canonical component matrix

All fourteen patterns are defined in [Components v0.1](COMPONENTS-v0.1.md). Seven have public React exports. Names without source links remain planned, not importable symbols.

| Design component | React symbol | Implementation |
|---|---|---|
| Intent Composer | `IntentComposer` | [Implemented](../packages/react/src/IntentComposer.tsx) |
| Agent Card | `AgentCard` | [Implemented](../packages/react/src/AgentCard.tsx) |
| Context Panel | `ContextPanel` | [Implemented](../packages/react/src/ContextPanel.tsx) |
| Plan View | `PlanView` | [Implemented](../packages/react/src/PlanView.tsx) |
| Proposal Card | `ProposalCard` | [Implemented](../packages/react/src/ProposalCard.tsx) |
| Approval Gate | `ApprovalGate` | [Implemented](../packages/react/src/ApprovalGate.tsx) |
| Action Receipt | `ActionReceipt` | [Implemented](../packages/react/src/ActionReceipt.tsx) |
| Memory Indicator | `MemoryIndicator` | Specified only |
| Source View | `SourceView` | Specified only |
| Uncertainty Signal | `UncertaintySignal` | Specified only |
| Tool Activity | `ToolActivity` | Specified only |
| Agent Activity | `AgentActivity` | Specified only |
| Human Override | `HumanOverride` | Specified only |
| Recovery Control | `RecoveryControl` | Specified only |

Context metadata is not a Source View or memory service. Plan review is not action authorization. Recovery descriptions and the demo's reconciliation button are not a reusable Recovery Control. Agent state labels are not an autonomous runtime. AI-state tokens are presentation, not execution services.

## Other deliverables

| Area | Current status |
|---|---|
| Concept note and manifesto | Founding documents retained |
| Behavioral specification | Draft project requirements |
| Tokens and CSS | 212 typed tokens; generated light/dark themes; limited DTCG-style exporter |
| HTML visual specimen | Local simulation, separate from the React lab |
| React component lab | Seven-component deterministic context-to-receipt simulation |
| TypeScript contracts | Core and review contracts exported; not complete untrusted-JSON validation |
| CI and lockfile | Read-only workflows and locked graph; evidence remains commit-specific |
| Isolated consumer acceptance | Offline fresh install and lockfile reinstall, types, exports, static rendering, and CSS-path checks implemented and validated for the named graph |
| Figma, Tailwind, native adapters | Not implemented |
| Runtime JSON Schema and design linter | Not implemented; documentation checker is not a design linter |
| Model/agent/backend services | Not implemented |
| Registry release or hosted deployment | Not included |
| Formal certification | Not implemented |

## Acceptance boundary

The three new components, exports, connected example, tests, and API documentation exist. The [consumer validation record](CONSUMER-VALIDATION-v0.1.md) closes the isolated-install gap previously recorded in [Review validation](REVIEW-VALIDATION-v0.1.md). It uses only local archives and the locked installed graph, with no lifecycle scripts, network fallback, or new CI permissions. The older report is preserved as historical evidence, not a current assertion that the test is absent.

Passing a fresh offline installation is not validation of registry distribution, independently selected peer versions, bundler CSS integration, hydration, or every consumer framework. See PR history for the final reviewed head and merge result; a branch name alone does not prove acceptance.

## Proposed increments

These are sequencing recommendations, not dated commitments.

**Next components — evidence and memory.** Implement Memory Indicator, Source View, and Uncertainty Signal. Cover session versus persistent context, inaccessible/conflicting sources, unsupported claims, and qualitative uncertainty. Never derive truth or permission from a badge. This brings the planned implementation count to ten, not fourteen.

**Then — supervision and recovery.** Implement Tool Activity, Agent Activity, Human Override, and Recovery Control. Distinguish stop requested from stopped, partial effects from total failure, compensation from undo, and reconciliation from blind retry. These require real host contracts, not decorative controls.

**Adoption hardening.** Broaden browser and assistive-technology coverage, add localization and consumer-framework/bundler checks, and separately test production authorization/execution before publication. Preserve the offline install check as a regression gate rather than replacing it with a workspace import.

**Later — adapters and governance.** Consider Figma/Tailwind adapters, machine-readable behavior schemas, conformance tooling, and an intentional release process. Promise compatibility, publication, or certification only after evaluation.

## Updating this page

A component becomes Implemented only when source, public export, example, tests, and documentation exist. Validated means a named run passed. Preserve historical evidence and record new source/dependency graphs. [Contributing](../CONTRIBUTING.md) defines the review process.
