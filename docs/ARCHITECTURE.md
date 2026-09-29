# TUN reference architecture

**Scope:** Fourteen canonical React reference components and the visual foundation. Host services described here are responsibilities, not supplied implementations.

[Documentation index](README.md) · [Core API](REACT-COMPONENTS-v0.1.md) · [Review](REVIEW-WORKFLOW-v0.1.md) · [Evidence](EVIDENCE-AND-MEMORY-v0.1.md) · [Supervision](SUPERVISION-AND-RECOVERY-v0.1.md) · [Integration checklist](INTEGRATION-CHECKLIST.md)

## Three separate contracts

**Design intent:** Specification and catalog describe how humans understand and control intelligence.

**Presentation:** Components display typed host records and emit explicit requests. Tokens determine appearance, never authority.

**Application authority:** The host owns identity, policy, permissions, validation, canonical revisions, execution, observations, verification, audit storage, memory retention, cancellation and recovery.

```text
Human intent → IntentComposer → host prepares context and plan
                               ↓
                     ContextPanel + PlanView
                               ↓
                   host prepares canonical proposal
                               ↓
              ProposalCard → navigation, not authorization
                               ↓
               ApprovalGate → explicit decision request
                               ↓
             host permission / revision / expiry / idempotency
                               ↓
            host tool execution → verification → action record
                               ↓
                          ActionReceipt

AgentCard: identity and declared authority.
MemoryIndicator / SourceView / UncertaintySignal: contextual explanation.
AgentActivity / ToolActivity: host observations and known effects.
HumanOverride / RecoveryControl: requests → host service → bound evidence.
```

The repository examples simulate these relationships. The supervision fixture and publication-review lab are explicitly separate; the fixture's stop button does not govern the other demo.

## Source and build ownership

| Source | Consumer | Responsibility |
|---|---|---|
| [tokens.json](../tokens/tokens.json) | [Token builder](../scripts/tokens.py) | Editable visual values |
| [tun.css](../styles/tun.css) | React copy/HTML specimen | Generated stylesheet |
| [Token report](TOKEN-VALIDATION-v0.1.md) | Review | Declared-check evidence |
| [React source](../packages/react/src) | TypeScript build | Presentation and contracts |
| [Review contracts](../packages/react/src/review-contracts.ts) | Review components/host | Context/plan metadata |
| [Evidence contracts](../packages/react/src/evidence-contracts.ts) | Evidence/memory views | Scoped display records |
| [Supervision contracts](../packages/react/src/supervision-contracts.ts) | Activity/control views | Observations, requests and evidence bindings |
| [ControlAction](../packages/react/src/ControlAction.tsx) | Override/recovery wrappers | Internal local request lifecycle, not a public component |
| [Asset copy](../packages/react/scripts/copy-assets.mjs) | Library build | Styles, tokens and license |
| [Public exports](../packages/react/src/index.ts) | Consumers | Fourteen components; evidence/supervision helpers root-only |
| [Review model](../examples/react/review-model.ts) | [App](../examples/react/App.tsx) | In-memory review simulation |
| [Evidence adapter](../examples/react/EvidenceReview.tsx) | Demo | Read-only context explanation |
| [Evidence fixtures](../examples/react/evidence-examples.ts) | Example explorer | Synthetic states, not task authority |
| [Supervision model](../examples/react/supervision-model.ts) | [Supervision lab](../examples/react/SupervisionLab.tsx) | Separately stepped local worker fixture |
| [Manifest](../package.json) / [lockfile](../package-lock.json) | npm | Commands and dependency graph |
| [Package checker](../scripts/check-package.mjs) | npm run check | Archive inventory/workspace exports |
| [Consumer checker](../scripts/check-consumer.mjs) | npm run check | Offline isolated installation and static consumption |

The build emits packages/react/dist ESM/declarations/CSS; Vite emits examples/react/dist. The root license is copied into the package. Generated outputs are not editable source. The library has no dependency on demo state machines. Core/review helpers use root and contracts entries; evidence/supervision helpers are root-only. No CommonJS entry or new contract subpath is declared.

## State is not one universal enum

| Concept | Examples | Meaning |
|---|---|---|
| Interaction stage | THINK, ACT | Conceptual stage |
| AgentCard state | planning, acting | Supplied operational label |
| Autonomy / consequence | 0–4 / C0–C4 | Delegation arrangement / contextual effect |
| Context availability / usage | available / used | Usability and influence are separate |
| Plan / proposal / approval | reviewed / ready / approved | Approach, action and decision lifecycles |
| Callback phase | pending, acknowledged, unknown | Request lifecycle, not execution |
| Receipt verification | verified, pending, unavailable | Supplied outcome evidence |
| Memory | M0–M3; active/inactive/unavailable | Scope-specific use, not retention guarantees |
| Evidence relationship | supports, contradicts, background | Relevance to a claim |
| Source access/check | available, restricted / verified, unverified | Readability and host-described checks |
| Uncertainty | U0–U3 with scope/basis | Qualitative assessment, not probability |
| Activity observation | running, partial, unknown | Observed work, distinct from AgentCard state |
| Control state | available, acknowledged, completed | Particular intervention/recovery request |
| Original recovery outcome | known, unknown | Whether another effectful attempt can be considered |

## Approval lifecycle

The host supplies immutable canonical proposal identity/version and material parameters. Fingerprints include optional content and context/plan references. Same-version changes block review; a new version does not inherit consent. Reference matching does not authenticate underlying content.

The gate checks completeness/classification/expiry and rechecks time at activation. A synchronous local latch prevents duplicates in one mounted review. Callback success is acknowledgement, not execution; rejection leaves unknown without automatic retry. Durable idempotency, tabs, revocation and real cancellation require host services. Rejecting a proposal is not stopping an in-flight action.

## Evidence and memory boundaries

Memory inspection is navigation, not mutation. SourceView separates source and generated text and excludes restricted contents from rendering; the host must remove unauthorized content before transmission. Scoped confidence cannot authenticate truth or grant permission. Material evidence changes must invalidate canonical approval, not silently repaint a badge.

The task adapter explains its local context. Separate synthetic controls exercise edge states without modifying task authority or creating persistent memory. Storage, logs, backups, training, deletion and access policies remain independent host concerns.

## Supervision and recovery lifecycle

ActivityRecord contains task, actor, scope, observed status/time, effects and optional progress/evidence. A progress counter is not completion. Unsupported terminal claims display unverified. The UI does not continuously poll or determine observation freshness.

InterventionOperation/RecoveryOperation bind control identity/version and run identity/version to a described effect, limits and known prior effects. ControlAction fingerprints material fields, checks expiry/policy hints, and latches a request before invoking onRequest. Requests carry identity references only; the host looks up canonical parameters.

Acknowledgement and promise resolution do not confirm stoppage or recovery. Terminal status requires ControlEvidence for the same control and run revisions, with matching outcome, valid timestamp and nonempty explanation. These checks cannot authenticate host assertions. A new revision is not a way to escape unresolved results; the host coordinates remounts, tabs and other controls.

Unknown original outcomes permit reconciliation only. A known-outcome retry additionally needs a host-described duplicate-effect safeguard. Compensation is explicitly separate from undo. Applicable high-consequence recovery still requires action-specific approval. Real worker interruption, authorization, durable deduplication, compensation and audit services are not supplied.

The stepped fixture keeps prior writes after stoppage, records compensation separately, and reads rather than repeats a write after lost acknowledgement. Buttons advancing the worker simulate observed service events. Its in-memory history is not trusted or durable infrastructure.

## Receipt lifecycle

The host supplies ReceiptData; the gate creates none. Unverified completed/reversed claims display pending verification, invalid timestamps remain unavailable, and URL checks do not replace origin/access policy. Partial effects stay visible. The publication demo's ledger differs from displayed receipts; lost acknowledgement requires reconciliation. Refresh is not undo.

## Package acceptance boundary

The inventory check and consumer test are complementary. The consumer packs TUN and lockfile-matched installed peers, installs local archives in a new external directory/cache, reinstalls from its own lockfile, compiles declarations, and renders fourteen static specimens. It checks seven negative type cases, consumer-local paths, CSS/tokens, and archive integrity without workspace symlinks.

Consumer npm operations remain offline with lifecycle scripts disabled. No new permissions or dependencies are needed. This detects packaging assumptions, not registry distribution, independently selected peers, hydration, every bundler or framework. Historical [consumer evidence](CONSUMER-VALIDATION-v0.1.md) retains its earlier seven-component scope; current acceptance belongs to [PR 6](https://github.com/kochrisdev/TUN-Systemic-Design/pull/6).

## Trust-boundary checklist

The [threat model](THREAT-MODEL.md) expands these boundaries into an explicit STRIDE register: each scenario identifies the presentation safeguard, required host control, linked specification rule and adoption evidence. Use its [acceptance scenarios](THREAT-MODEL.md#7-adopter-acceptance-scenarios) when reviewing a real integration.

Authenticate principal/tenant; validate hostile input; redact before transmission; bind immutable material records; invalidate stale reviews; recheck authority/expiry/revocation; deduplicate durably; reconcile unknown outcomes; retain partial effects; verify results; restrict evidence visibility. Never derive permission from colors, model instructions, memory, source checks, plan review, navigation or callback success. Complete the [integration checklist](INTEGRATION-CHECKLIST.md).

## Styling and environments

Component CSS consumes semantic tokens and includes generated CSS. Themes are document-level without remote fonts or persistence. Public components are client entries. Static rendering and sampled Chromium tests do not establish SSR hydration, server-component boundaries, CSS placement, localization or full accessibility. Validate those in the actual host.
