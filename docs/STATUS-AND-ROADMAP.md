# Implementation status and roadmap

**Reviewed baseline:** `0226ec535e08eab09f840c4119ff9b71a57ad952` (September 27, 2026).  
**Scope:** Repository contents, not installed third-party services or deployments.

[Documentation index](README.md) · [Public exports](../packages/react/src/index.ts)

## Canonical component matrix

All fourteen patterns are defined in [Components v0.1](COMPONENTS-v0.1.md). Only the following four have public React exports. Component names without a source link below are planned API names, not importable symbols.

| Design component | React symbol | Implementation |
|---|---|---|
| Intent Composer | `IntentComposer` | [Implemented](../packages/react/src/IntentComposer.tsx) |
| Agent Card | `AgentCard` | [Implemented](../packages/react/src/AgentCard.tsx) |
| Context Panel | `ContextPanel` | Specified only |
| Plan View | `PlanView` | Specified only |
| Proposal Card | `ProposalCard` | Specified only |
| Approval Gate | `ApprovalGate` | [Implemented](../packages/react/src/ApprovalGate.tsx) |
| Action Receipt | `ActionReceipt` | [Implemented](../packages/react/src/ActionReceipt.tsx) |
| Memory Indicator | `MemoryIndicator` | Specified only |
| Source View | `SourceView` | Specified only |
| Uncertainty Signal | `UncertaintySignal` | Specified only |
| Tool Activity | `ToolActivity` | Specified only |
| Agent Activity | `AgentActivity` | Specified only |
| Human Override | `HumanOverride` | Specified only |
| Recovery Control | `RecoveryControl` | Specified only |

An Approval Gate's proposal display does not constitute a separate Proposal Card export. Recovery descriptions in receipts are not a Recovery Control. Agent state labels are not an autonomous agent runtime. AI-state tokens are not a memory, evidence, or tool-execution service.

## Other deliverables

| Area | Current status |
|---|---|
| Concept note and manifesto | Founding documents retained |
| Behavioral specification | Draft project requirements |
| Tokens and CSS | 212 typed tokens; generated light/dark themes; limited DTCG-style exporter |
| HTML visual specimen | Implemented local simulation |
| React component lab | Implemented local simulation |
| TypeScript contracts | Exported; not complete runtime validation of untrusted JSON |
| CI and lockfile | Implemented; results remain commit- and graph-specific |
| Figma, Tailwind, native adapters | Not implemented |
| Runtime JSON Schema and design linter | Not implemented; the documentation checker is not a design linter |
| Model/agent/backend services | Not implemented |
| Registry release or hosted deployment | Not established by this repository increment |
| Formal conformance assessment/certification | Not implemented |

## Proposed increments

These are sequencing recommendations, not dated commitments or completed work.

**Next — context and proposals.** Implement Context Panel, Plan View, and Proposal Card. Acceptance requires typed public contracts, visible source/scope boundaries, clear plan revisions, separation from execution, state coverage, package exports, and updated tests/docs. Preserve the existing approval safeguards.

**Then — evidence and memory.** Implement Memory Indicator, Source View, and Uncertainty Signal. Test session versus persistent context, inaccessible/conflicting sources, unsupported claims, and qualitative uncertainty. Do not derive truth or permission from a visual badge.

**Then — supervision and recovery.** Implement Tool Activity, Agent Activity, Human Override, and Recovery Control. Distinguish stop requested from stopped, partial effects from total failure, compensation from undo, and reconciliation from blind retry. These need real host contracts, not decorative controls.

**Adoption hardening.** Validate a packaged install in a fresh consumer app, broaden browser and assistive-technology coverage, design localization, and test production authorization/execution separately. Define the supported environments and evidence required before publication.

**Later — adapters and governance.** Consider Figma/Tailwind adapters, machine-readable behavior schemas, conformance tooling, and an intentional release process. Do not promise compatibility, publication, or certification until implemented and evaluated.

## Updating this page

A component moves to Implemented only when its source, public export, example, tests, and documentation exist. A test is Validated only after a named run passes. Preserve historical validation records; add new evidence for changed code or dependencies. [Contributing](../CONTRIBUTING.md) defines the review process.
