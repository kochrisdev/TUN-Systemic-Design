# TUN reference architecture

**Scope:** Seven-component React reference implementation and visual foundation. The application-service boundary describes host responsibilities, not a supplied backend.

[Documentation index](README.md) · [Core React API](REACT-COMPONENTS-v0.1.md) · [Review workflow](REVIEW-WORKFLOW-v0.1.md) · [Integration checklist](INTEGRATION-CHECKLIST.md) · [Consumer validation](CONSUMER-VALIDATION-v0.1.md)

## Three separate contracts

**Design intent:** Specification and catalog describe how people understand and control intelligent products.

**Presentation implementation:** Components receive typed props, display supplied content/state, and emit requests. Tokens determine appearance, never authority.

**Application authority:** The host owns authentication, policy, permissions, validation, immutable revisions, execution, verification, audit storage, and recovery.

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
Host authentication / authorization / revision / expiry / idempotency
    ↓
Host tool execution → host verification → host action record
    ↓
ActionReceipt renders supplied result

AgentCard identifies the actor, declared authority, and operational state.
The demo simulates the host path locally; no external action occurs.
```

## Source and build ownership

| Source | Produced or consumed by | Owner of truth |
|---|---|---|
| [tokens.json](../tokens/tokens.json) | [Token builder](../scripts/tokens.py) | Editable values and aliases |
| [tun.css](../styles/tun.css) | Builder, React copy, HTML specimen | Generated output |
| [Token report](TOKEN-VALIDATION-v0.1.md) | Builder | Declared-check evidence |
| [React source](../packages/react/src) | TypeScript build | Presentation behavior/contracts |
| [Review contracts](../packages/react/src/review-contracts.ts) | Components and demo | Metadata and references, not authority |
| [Asset copy](../packages/react/scripts/copy-assets.mjs) | Library build | Styles, generated tokens, license |
| [Public exports](../packages/react/src/index.ts) | Consumers | Seven components |
| [Demo model](../examples/react/review-model.ts) | [Demo app](../examples/react/App.tsx) | In-memory simulation, not a service |
| [Root manifest](../package.json) | npm workspaces | Commands/dependencies |
| [Lockfile](../package-lock.json) | npm ci | Resolved graph |
| [Package checker](../scripts/check-package.mjs) | npm run check | Inventory and workspace exports |
| [Consumer checker](../scripts/check-consumer.mjs) | npm run check | Separate offline installation, types, static renders, resolution |

The build emits packages/react/dist with ESM JavaScript, declarations, styles, and tokens. Vite emits examples/react/dist. The root license is copied into the package. Generated outputs, dependencies, and artifacts are not editable source. The package has no dependency on the demo state machine.

## State is not one universal enum

| Concept | Example | Meaning |
|---|---|---|
| Interaction stage | THINK, ACT | Conceptual phase, not a prop enum |
| Agent state | planning, acting, failed | Supplied operational state |
| Autonomy | 0–4 | Delegation arrangement, not severity |
| Consequence | C0–C4 | Contextual effect, not error probability |
| Context availability | available, missing, restricted, stale | Reported source usability |
| Context usage | used, not-used, unknown | Actual influence, separate from availability |
| Plan state | proposed, approved, changed | Approach review/progress, not action permission |
| Proposal state | ready, modified, superseded | Proposed-action lifecycle |
| Approval state | awaiting, approved, expired | Particular explicit decision |
| Callback phase | pending, submitted, unknown | Submission, not completion |
| Receipt verification | verified, pending, unavailable | Supplied evidence state |
| Memory/uncertainty | M0–M3 / U0–U3 | Design vocabulary, not supplied services |

Different scopes can have different autonomy/memory arrangements. Context lifetime is not a storage, deletion, backup, or training guarantee.

## Approval lifecycle

The host supplies a stable canonical ActionProposal ID/version. Material fields, preview, and context/plan references are fingerprinted. Same-version changes block review; a new version starts fresh rather than inheriting consent. reviewBasisMatches compares references only; the host binds immutable content and policy.

The gate checks completeness, classification, status, and expiry and rechecks time in the handler. A synchronous latch blocks duplicate in-flight decisions within a mounted review. Callback success is acknowledgement, not execution. Failure leaves the outcome unknown without automatic retry.

The latch is not durable idempotency, multi-tab coordination, revocation, cancellation, or Human Override. Client time is a presentation safeguard; backend checks authorization, expiry, revisions, and revocation immediately before effects.

## Receipt lifecycle

The host supplies ReceiptData. Completed/reversed without verified, meaningful detail displays pending verification. This cannot authenticate evidence. Supported timestamps display UTC; malformed values are unavailable. URL checks do not replace host access/origin policy.

The lab ledger is distinct from displayed receipts. Lost acknowledgement produces unknown state; reconciliation reads rather than repeating the write. Earlier receipts survive context changes. This is illustrative, non-durable orchestration; refresh is not undo.

## Package acceptance boundary

The inventory check and consumer test have different jobs. The consumer test packs built TUN and lockfile-matched installed peers into local archives, installs them in a new directory/cache outside the workspace, reinstalls from its own lockfile, compiles declarations, and renders seven static specimens. It verifies real package paths rather than workspace symlinks and compares the archive with the inventory integrity.

Every consumer npm operation is offline with lifecycle scripts disabled. No additional workflow permissions or dependencies are required. Reports are placed in the existing artifacts folder. This detects missing exports, declarations, assets, and workspace-only assumptions; it does not prove registry distribution, hydration, or framework/bundler integration. See [Consumer validation](CONSUMER-VALIDATION-v0.1.md).

## Trust-boundary checklist

Authenticate principal/tenant; filter private context before sending it; validate external data; bind canonical content/version; invalidate dependent reviews; recheck permission/expiry/revocation; deduplicate durably; reconcile unknown outcomes; retain partial effects; verify results; expose privacy-appropriate evidence. The [integration checklist](INTEGRATION-CHECKLIST.md) expands these requirements.

Never derive authority from colors, personas, preferences, model instructions, plan review, navigation, or promise resolution. Types and metadata helpers are not full untrusted-JSON validators.

## Styling and environments

CSS consumes semantic tokens and includes the generated stylesheet. Themes are document-level; no remote fonts or persistence are supplied. The public index is a client entry. The consumer smoke verifies one installed graph and non-interactive static rendering; SSR hydration, server-component boundaries, bundler CSS placement, and broader environments still need host testing. No blanket framework certification is claimed.
