# TUN reference architecture

**Scope:** The seven-component React reference implementation and visual foundation in this review-workflow increment. The application-service boundary describes host responsibilities, not a supplied backend.

[Documentation index](README.md) · [Core React API](REACT-COMPONENTS-v0.1.md) · [Review workflow](REVIEW-WORKFLOW-v0.1.md) · [Integration checklist](INTEGRATION-CHECKLIST.md)

## Three separate contracts

**Design intent:** the Specification and catalog describe how people should understand and control intelligent products.

**Presentation implementation:** components receive typed props, display supplied content/state, and emit callback requests. Tokens determine appearance, never authority.

**Application authority:** the host owns authenticated identity, policy, permissions, data validation, immutable revisions, execution, verification, audit storage, and actual recovery.

```text
Human intent
    ↓
IntentComposer → host prepares context snapshot and plan
    ↓
ContextPanel + PlanView → human understands sources and approach
    ↓
Host prepares canonical action proposal
    ↓
ProposalCard → version-bound navigation request (not approval)
    ↓
ApprovalGate → version-bound explicit decision request
    ↓
Host authentication / authorization / revision / expiry / idempotency checks
    ↓
Host tool execution → host verification → host action record
    ↓
ActionReceipt renders supplied result

AgentCard identifies the actor, declared authority, and operational state.
The repository demo simulates the host path locally; no external action occurs.
```

## Source and build ownership

| Source | Produced or consumed by | Owner of truth |
|---|---|---|
| [tokens/tokens.json](../tokens/tokens.json) | [scripts/tokens.py](../scripts/tokens.py) | Editable visual values and aliases |
| [styles/tun.css](../styles/tun.css) | Token builder, React asset copy, HTML specimen | Generated output, not hand-edited |
| [Token report](TOKEN-VALIDATION-v0.1.md) | Token builder | Generated declared-check evidence |
| [React source](../packages/react/src) | TypeScript library build | Presentation contracts and behavior |
| [Review contracts](../packages/react/src/review-contracts.ts) | Components and demo host | Context/plan metadata, dependencies, references; not authorization |
| [React asset copy](../packages/react/scripts/copy-assets.mjs) | Library build | Copies CSS, generated tokens, and license |
| [Public exports](../packages/react/src/index.ts) | Package consumers | Seven available components |
| [Demo model](../examples/react/review-model.ts) | [Demo app](../examples/react/App.tsx) | In-memory simulation, not a service or exported engine |
| [Root manifest](../package.json) | npm workspaces | Commands and declared dependencies |
| [Lockfile](../package-lock.json) | npm ci | Resolved installation graph |
| [Package checker](../scripts/check-package.mjs) | npm run check | Archive inventory and workspace-export checks |

The build emits `packages/react/dist` with ESM JavaScript, declarations, styles, and tokens; Vite emits `examples/react/dist`. The root license is copied into the package. Generated output, dependencies, and local artifacts are not editable source. A package archive has no dependency on the demo's local state machine.

## State is not one universal enum

| Concept | Example | Meaning |
|---|---|---|
| Interaction stage | THINK or ACT | Conceptual phase, not a React prop enum |
| Agent state | planning, acting, failed | Host-supplied operational state |
| Autonomy | 0–4 | Delegation arrangement, not consequence severity |
| Consequence | C0–C4 | Contextual action effect, not error probability |
| Context availability | available, missing, restricted, stale | Whether the host reports a source is usable |
| Context usage | used, not-used, unknown | Whether it influenced this task, independently of availability |
| Plan state | proposed, approved, changed | Approach review/progress, not permission to execute actions |
| Proposal state | ready, modified, superseded | Proposed-action lifecycle |
| Approval state | awaiting, approved, expired | State of a particular explicit decision |
| Local callback phase | pending, submitted, unknown | Submission lifecycle, not completed execution |
| Receipt verification | verified, pending, unavailable | Host-supplied evidence state |
| Memory/uncertainty classifications | M0–M3 / U0–U3 | Design vocabulary, not implemented backend services |

The same product can use different autonomy and memory arrangements in different scopes. A context-persistence label is not a storage, deletion, backup, or training guarantee.

## Approval lifecycle

The host supplies a canonical `ActionProposal` with stable ID/version. Material fields, optional plain-text preview, and optional context/plan references are included in `proposalFingerprint`. A same-version material change blocks review; a new version starts a fresh review, not inherited consent. `reviewBasisMatches` only compares references; the host must bind them to immutable real content and policy.

The gate checks completeness, classification, status, and expiry, then rechecks time in the decision handler. A synchronous local latch prevents duplicate in-flight decisions within a mounted review. Successful callback resolution is acknowledgement, not proof of execution. Callback failure leaves the outcome unknown without automatic retry.

The latch is not durable idempotency, multi-tab coordination, revocation, cancellation, or Human Override. Client time is only a presentation safeguard. The backend rechecks authorization, expiry, current revisions, and revocation immediately before the effect.

## Receipt lifecycle

The host supplies `ReceiptData`; the gate does not manufacture it. Completed/reversed without verified, nonempty detail displays as pending verification. This cannot authenticate supplied evidence. Supported timestamps are shown in UTC; malformed values are unavailable. Limited URL checks do not replace host access/origin policy.

The demo keeps an in-memory ledger separate from displayed receipts. A simulated lost acknowledgement creates an unknown state; reconciliation reads the ledger rather than repeating the write. Previous receipts are retained during context changes. This is illustrative orchestration, not trusted or durable storage, and refreshing is not undo.

## Trust-boundary checklist

Authenticate principal and tenant; filter private context before sending it to clients; validate external data; bind exact canonical content and version; invalidate dependent reviews after material changes; check permission, expiry, and revocation just before execution; deduplicate durably; reconcile unknown outcomes; record partial effects; verify results; expose only privacy-appropriate evidence. The [integration checklist](INTEGRATION-CHECKLIST.md) expands these questions.

Never derive authorization from token colors, personas, remembered preferences, model instructions, a reviewed plan, a navigation callback, or successful promise resolution. TypeScript declarations and typed-metadata helpers are not complete validators for untrusted JSON.

## Styling and environments

Component CSS consumes semantic tokens and includes the generated stylesheet. Themes are document-level; no remote fonts or persisted preferences are supplied. The public index is a client entry. Framework-specific SSR/hydration, server-component boundaries, global CSS placement, and independent-consumer installation remain adoption tests. No blanket framework certification is claimed.
