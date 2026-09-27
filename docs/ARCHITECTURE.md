# TUN reference architecture

**Scope:** The repository's four-component React implementation and visual foundation. The application-service boundary below describes required host responsibilities, not a backend supplied by TUN.

[Documentation index](README.md) · [React API](REACT-COMPONENTS-v0.1.md) · [Integration checklist](INTEGRATION-CHECKLIST.md)

## Three separate contracts

**Design intent:** the Specification and component catalog describe how people should understand and control intelligent products.

**Presentation implementation:** React components receive typed props, render content and state, and emit callback requests. Tokens determine appearance, never authority.

**Application authority:** the host owns authenticated identity, policy, permissions, data validation, execution, verification, audit storage, and actual recovery.

```text
Human intent
    ↓
IntentComposer → host prepares canonical proposal
    ↓
ApprovalGate → version-bound decision request
    ↓
Host authentication / authorization / expiry / idempotency checks
    ↓
Host tool execution → host verification → host action record
    ↓
ActionReceipt renders supplied result

AgentCard renders supplied identity, authority, and operational state.
The repository demo simulates the host path locally; no external action occurs.
```

## Source and build ownership

| Source | Produced or consumed by | Owner of truth |
|---|---|---|
| [tokens/tokens.json](../tokens/tokens.json) | [scripts/tokens.py](../scripts/tokens.py) | Editable visual values and aliases |
| [styles/tun.css](../styles/tun.css) | Token builder, React asset copy, HTML specimen | Generated output; do not edit directly |
| [Token validation report](TOKEN-VALIDATION-v0.1.md) | Token builder | Generated evidence for declared checks |
| [React source](../packages/react/src) | TypeScript library build | Component behavior and presentation contracts |
| [React asset copy](../packages/react/scripts/copy-assets.mjs) | Library build | Copies CSS, generated tokens, and existing license |
| [React entry point](../packages/react/src/index.ts) | Package consumers | Public component exports |
| [Demo](../examples/react) | Vite | Simulated local integration; not a service |
| [Root package manifest](../package.json) | npm workspaces | Commands and declared dependencies |
| [Lockfile](../package-lock.json) | `npm ci` | Resolved graph for repeatable installs |
| [Package checker](../scripts/check-package.mjs) | `npm run check` | Archive inventory and workspace-export checks |

The build produces `packages/react/dist` with ESM JavaScript, declarations, styles, and tokens. The demo build produces `examples/react/dist`. The root `LICENSE` is copied into the package. Build outputs, dependency folders, and local artifacts are not source files to edit or commit unless a release process explicitly requires them.

## State is not one universal enum

| Concept | Example | Meaning |
|---|---|---|
| Interaction stage | THINK or ACT | Conceptual task phase, not a React prop enum |
| Agent state | `planning`, `acting`, `failed` | Host-supplied operational state |
| Autonomy | 0–4 | Delegation arrangement, not consequence severity |
| Consequence | C0–C4 | Contextual effect of an action, not its probability of error |
| Approval state | `awaiting`, `approved`, `expired` | State of a particular review |
| Local submission phase | pending, submitted, unknown | Client callback lifecycle, not completed execution |
| Receipt verification | `verified`, `pending`, `unavailable` | Host-supplied evidence state |
| Memory / uncertainty labels | M0–M3 / U0–U3 | Design classifications; no corresponding service is implemented |

The same product can use multiple autonomy levels and memory types in different scopes. Labels should describe the particular operation rather than a blanket promise about the whole system.

## Approval lifecycle

The host supplies an `ActionProposal` with a stable ID and version. `proposalFingerprint` records the displayed material fields. A material change under the same version blocks that review; a new version starts a fresh review rather than inheriting consent.

The gate checks completeness, consequence/recovery classification, status, and expiry. It rechecks time at the decision handler as well as through a timer. Its synchronous local latch prevents duplicate in-flight decisions within the mounted review. Successful callback resolution means the request was acknowledged; it does not prove execution. Callback rejection leaves the outcome unknown and does not trigger an automatic retry.

The latch is not durable idempotency and does not coordinate tabs or survive arbitrary remounts. It is not a revocation, cancellation, or Human Override service. Expiry uses the client clock as a presentation safeguard; the backend must revalidate against trusted time.

## Receipt lifecycle

The host supplies `ReceiptData`; the gate does not manufacture it. `completed` or `reversed` without verified, nonempty verification detail is displayed as pending verification. That downgrade prevents one misleading presentation path; it cannot authenticate evidence supplied by the host.

A timestamp is displayed only if it passes the supported parser. Unsafe link schemes and certain malformed URLs are excluded by the UI helper, but the host still needs an allowed-origin policy and must avoid putting sensitive query parameters into links.

## Trust-boundary checklist

Authenticate the principal and tenant; bind approval to exact canonical parameters and version; check permission, expiry and revocation immediately before effectful execution; deduplicate durably; reconcile uncertain outcomes; record partial effects; verify the result; and expose only privacy-appropriate evidence. The [integration checklist](INTEGRATION-CHECKLIST.md) expands these into review questions.

Never make authorization decisions from CSS classes, token colors, agent personas, remembered preferences, model-generated instructions, or a callback returning successfully.

## Styling and environments

Component CSS consumes semantic token variables and includes the generated token stylesheet. Themes are document-level. No remote font loading or theme-persistence service is included. The public index is a client entry point; framework-specific SSR/hydration, server-component boundaries, style placement, and independent-consumer builds require testing in the host framework. No blanket framework certification is claimed.
