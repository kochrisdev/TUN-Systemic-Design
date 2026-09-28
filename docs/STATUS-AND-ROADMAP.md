# Implementation status and roadmap

**Revision:** September 28, 2026, evidence and memory increment.  
**Scope:** Contents of the revision being viewed. A package build is not a registry publication, hosted service, or certification. Check the PR's exact head and validation evidence before assuming acceptance.

[Documentation index](README.md) · [Public exports](../packages/react/src/index.ts) · [Review workflow](REVIEW-WORKFLOW-v0.1.md) · [Evidence and memory](EVIDENCE-AND-MEMORY-v0.1.md)

## Canonical component matrix

All fourteen patterns are defined in [Components v0.1](COMPONENTS-v0.1.md). Ten have public React exports. Names without source links remain planned, not importable symbols.

| Design component | React symbol | Implementation |
|---|---|---|
| Intent Composer | `IntentComposer` | [Implemented](../packages/react/src/IntentComposer.tsx) |
| Agent Card | `AgentCard` | [Implemented](../packages/react/src/AgentCard.tsx) |
| Context Panel | `ContextPanel` | [Implemented](../packages/react/src/ContextPanel.tsx) |
| Plan View | `PlanView` | [Implemented](../packages/react/src/PlanView.tsx) |
| Proposal Card | `ProposalCard` | [Implemented](../packages/react/src/ProposalCard.tsx) |
| Approval Gate | `ApprovalGate` | [Implemented](../packages/react/src/ApprovalGate.tsx) |
| Action Receipt | `ActionReceipt` | [Implemented](../packages/react/src/ActionReceipt.tsx) |
| Memory Indicator | `MemoryIndicator` | [Implemented](../packages/react/src/MemoryIndicator.tsx) |
| Source View | `SourceView` | [Implemented](../packages/react/src/SourceView.tsx) |
| Uncertainty Signal | `UncertaintySignal` | [Implemented](../packages/react/src/UncertaintySignal.tsx) |
| Tool Activity | `ToolActivity` | Specified only |
| Agent Activity | `AgentActivity` | Specified only |
| Human Override | `HumanOverride` | Specified only |
| Recovery Control | `RecoveryControl` | Specified only |

Context availability, actual use, memory influence, claim-to-source relationship, source checks, and scoped uncertainty are separate facts. None grants authority. The Memory Indicator is not a memory service, and Source View does not independently verify evidence. Recovery descriptions and the demo's reconciliation button are not a reusable Recovery Control. Agent state labels are not an autonomous runtime.

## Other deliverables

| Area | Current status |
|---|---|
| Concept note and manifesto | Founding documents retained |
| Behavioral specification | Draft project requirements |
| Tokens and CSS | 212 typed tokens; generated light/dark themes; limited DTCG-style exporter |
| HTML visual specimen | Local simulation, separate from the React lab |
| React component lab | Ten components: review workflow, read-only contextual evidence, and separately labeled synthetic evidence/memory examples |
| TypeScript contracts | Core/review contracts plus root-exported evidence/memory contracts; not complete untrusted-JSON validation |
| CI and lockfile | Existing read-only workflows and locked graph; results remain commit-specific |
| Isolated consumer acceptance | Offline install/reinstall, types, ten static renders, and package/CSS resolution are test targets for this increment |
| Figma, Tailwind, native adapters | Not implemented |
| Runtime JSON Schema and design linter | Not implemented; documentation checker is not a design linter |
| Model, agent, memory, evidence-verification, or backend services | Not implemented |
| Registry release or hosted deployment | Not included |
| Formal certification | Not implemented |

## Acceptance boundary

The three evidence/memory components, exports, examples, tests, and API documentation exist. See [PR 5](https://github.com/kochrisdev/TUN-Systemic-Design/pull/5) for final-head checks, review, and merge state. Authored tests do not imply successful execution.

The existing isolated-consumer installer is unchanged. Its fixtures and package checker now cover ten components, four negative declaration cases, generated-text presentation, and unsupported-confidence fallback. Consumer installation is offline using the same locked graph, with lifecycle scripts disabled and no additional workflow permissions.

Earlier [consumer](CONSUMER-VALIDATION-v0.1.md) and [review](REVIEW-VALIDATION-v0.1.md) reports retain their historical source and test counts. Passing one isolated installation does not certify registry distribution, independently selected peers, CSS bundlers, hydration, or every framework.

## Proposed increments

These are sequencing recommendations, not dated commitments.

**Next — supervision and recovery.** Implement Tool Activity, Agent Activity, Human Override, and Recovery Control. Distinguish stop requested from stopped, partial effects from total failure, compensation from undo, and reconciliation from blind retry. Define real host contracts before exposing controls. This would complete the fourteen-component implementation set, not a production agent runtime or automatic conformance.

**Adoption hardening.** Broaden browser and assistive-technology coverage, add localization, runtime schemas, framework/bundler/hydration checks, and separately validate production authorization/execution. Keep offline consumer installation as a regression gate. Evidence and memory adapters require access control, provenance, retention policy, and permission checks in the host.

**Later — adapters and governance.** Consider Figma/Tailwind adapters, machine-readable behavior schemas, conformance tooling, and an intentional release process. Promise compatibility, publication, or certification only after evaluation.

## Updating this page

A component becomes Implemented only when source, public export, example, tests, and documentation exist. Validated means a named run passed. Preserve historical evidence and record new source/dependency graphs. [Contributing](../CONTRIBUTING.md) defines the review process.
