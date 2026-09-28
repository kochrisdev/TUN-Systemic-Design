# Implementation status and roadmap

**Revision:** September 28, 2026, context/plan/proposal increment.  
**Baseline:** `5cbf9a5816358b9c4db3f64af90fbebd04406a2b`.  
**Scope:** Contents of the branch being viewed, not an assertion that its pull request is merged, packages are published, or services deployed.

[Documentation index](README.md) · [Public exports](../packages/react/src/index.ts) · [Review workflow](REVIEW-WORKFLOW-v0.1.md)

## Canonical component matrix

All fourteen patterns are defined in [Components v0.1](COMPONENTS-v0.1.md). Seven have public React exports in this increment. Names without source links remain planned, not importable symbols.

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

Context metadata is not a Source View or memory service. Plan review is not action authorization. Recovery descriptions in receipts and the demo's reconciliation button are not a reusable Recovery Control. Agent state labels are not an autonomous runtime. AI-state tokens are presentation, not execution services.

## Other deliverables

| Area | Current status |
|---|---|
| Concept note and manifesto | Founding documents retained |
| Behavioral specification | Draft project requirements |
| Tokens and CSS | 212 typed tokens; generated light/dark themes; limited DTCG-style exporter |
| HTML visual specimen | Implemented local simulation; separate from the React lab |
| React component lab | Seven-component, deterministic context-to-receipt local simulation |
| TypeScript contracts | Core and review contracts exported; not complete runtime validation of untrusted JSON |
| CI and lockfile | Existing read-only workflows and locked dependency graph; results remain commit-specific |
| Figma, Tailwind, native adapters | Not implemented |
| Runtime JSON Schema and design linter | Not implemented; documentation checker is not a design linter |
| Model/agent/backend services | Not implemented |
| Registry release or hosted deployment | Not included |
| Formal certification | Not implemented |

## Current acceptance boundary

The three new components, public exports, connected example, tests, and API documentation are implemented. Read [Review validation](REVIEW-VALIDATION-v0.1.md) for the exact observed runs and remaining limitations. Implementation is not proof of every design requirement.

The proposed **fresh independent-consumer installation smoke test remains outstanding**. A tool write containing additional installer/CI changes was blocked; those changes were omitted. Existing inventory and workspace-export tests are not equivalent. No new workflow permissions or dependency upgrades were introduced.

## Proposed increments

These are sequencing recommendations, not dated commitments.

**Finish acceptance and adoption hardening.** Review the actual PR checks and representative renders, then address an isolated packaged install in a separately reviewed increment. Broaden browser and assistive-technology coverage, design localization, and test production authorization/execution separately before publication.

**Next components — evidence and memory.** Implement Memory Indicator, Source View, and Uncertainty Signal. Test session versus persistent context, inaccessible/conflicting sources, unsupported claims, and qualitative uncertainty. Never derive truth or permission from a visual badge.

**Then — supervision and recovery.** Implement Tool Activity, Agent Activity, Human Override, and Recovery Control. Distinguish stop requested from stopped, partial effects from total failure, compensation from undo, and reconciliation from blind retry. These need real host contracts, not decorative controls.

**Later — adapters and governance.** Consider Figma/Tailwind adapters, machine-readable behavior schemas, conformance tooling, and an intentional release process. Do not promise compatibility, publication, or certification until evaluated.

## Updating this page

A component moves to Implemented only when source, public export, example, tests, and documentation exist. A test is Validated only after a named run passes. Preserve historical evidence and add a new record for changed code or dependencies. [Contributing](../CONTRIBUTING.md) defines the review process.
