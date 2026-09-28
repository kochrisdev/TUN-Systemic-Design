# Supervision and recovery v0.1

**Revision:** September 28, 2026. **Scope:** Four reference React components, not a runtime or authorization service.

[Documentation index](README.md) · [Implementation matrix](STATUS-AND-ROADMAP.md) · [Core API](REACT-COMPONENTS-v0.1.md) · [Source contracts](../packages/react/src/supervision-contracts.ts)

## 1. Purpose and boundaries

`ToolActivity`, `AgentActivity`, `HumanOverride`, and `RecoveryControl` complete the fourteen canonical React exports. Every pattern now has a reference implementation; this is not a claim that every design requirement, platform, state composition, accessibility criterion, or production integration is complete.

The first two components display host observations. The latter two emit explicit, version-bound requests. Neither component executes tools, cancels a remote process, changes permissions, or restores data. The host implements those services and verifies their outcomes.

**Request is not acknowledgement. Acknowledgement is not completion. Stoppage is not reversal. Compensation is not undo.**

Import the new components, types, and helpers from `@tun-systemic/react`. They are not added to the existing `@tun-systemic/react/contracts` subpath. `ControlAction` is an internal shared implementation, not a fifteenth canonical component or a public export.

## 2. Agent Activity

| Prop | Required | Meaning |
|---|---|---|
| activity | Yes | ActivityRecord with identity/version, actor, task, scope, status, effects, and observedAt |
| title | No | Defaults to Agent activity |
| className | No | Additional presentation class |

Optional activity fields are `evidence`, `blocker`, and `progress`. Progress contains completed, total, and unit. It is displayed only for finite numbers with positive total, nonnegative completed no greater than total, and a nonempty unit. Invalid measurements say unavailable; no fabricated percent, duration, or time estimate is provided. A full counter does not establish task completion.

Activity status is idle, queued, running, waiting, verifying, completed, partial, failed, or unknown. This is a distinct observation contract, not the eleven-state AgentCard enum. Completed/partial/failed require nonempty host evidence to receive their terminal label. Otherwise the component shows Outcome not verified. Invalid observation timestamps are unavailable, not invented. The existing supported timestamp subset applies.

The view exposes actor, task, scope, known effects, supplied observation time, blockers, and evidence. It does not stream hidden internal reasoning, infer emotional state, monitor a runtime, poll services, or continuously announce a timer.

## 3. Tool Activity

`ToolActivity` has the same prop shape as AgentActivity, with `activity: ToolActivityRecord`. The record adds tool, category, target, and authority. Title defaults to Tool activity. The host must redact sensitive payloads, metadata, credentials, and unauthorized target information before supplying props.

Categories are searching, reading, writing, sending, publishing, transacting, executing-code, accessing-private-data, and changing-permissions. These labels describe a reported operation; they do not grant capability or permission. Empty authority is shown as No authority declared, never unrestricted access.

Terminal labels, timestamps, progress, and evidence follow the same rules as AgentActivity. Actual actor and tool attribution, source freshness, authorization, and audit integrity remain host responsibilities.

## 4. Shared control contract

HumanOverride and RecoveryControl accept:

| Prop | Required | Meaning |
|---|---|---|
| operation | Yes | InterventionOperation or RecoveryOperation |
| status | Yes | available, pending, acknowledged, completed, failed, unknown, unavailable |
| onRequest | Yes | Receives ControlRequest; returns void or Promise<void> |
| evidence | No | ControlEvidence required to display a verified terminal outcome |
| onInspect | No | Synchronous, inspection/navigation-only callback receiving ControlRequest |
| blockedReason | No | Privacy-safe host policy or availability explanation; blocks new requests |
| title | No | Human override or Recovery control |
| className | No | Additional presentation class |

The operation requires id, version, run (id/version), actor (id/name/type), kind, target, scope, effect, limits, and knownEffects. An explicit supported expiresAt is optional. Material fields are fingerprinted in a stable order. The host must issue immutable canonical revisions, not edit parameters invisibly under the same identity.

```ts
interface ControlRequest {
  readonly controlId: string;
  readonly controlVersion: string;
  readonly runId: string;
  readonly runVersion: string;
}
```

The request contains identities, not executable parameters. The service looks up the canonical record and checks principal, tenant, policy, authority, expiry, revocation, current run, and idempotency before executing. Use a separate action-specific ApprovalGate wherever the consequence or policy requires it, including applicable C4 actions. A request callback may stage that review; it must not bypass it.

A local synchronous latch blocks duplicate submissions within one mounted revision. Resolving the callback displays acknowledgement, never success. A thrown or rejected callback shows an unknown outcome without raw exception text and does not reopen the request. A host prop changing back to available does not clear that local latch.

A new control/run revision creates a fresh UI instance, **not permission to repeat an unresolved effect**. The host must coordinate multiple controls, remounts, tabs, retries, and run generations durably. Reconcile the old result before offering an effectful replacement. The component does not provide cross-tab locking or a cancellation service.

Expiry is checked on initial display, by a bounded timer, and again at activation. Client time is only a presentation safeguard. Expiry prevents new requests; it does not erase a confirmed historical result. A blocked or unavailable control remains visible with its scope and limits; provide independent escalation or inspection when necessary.

`onInspect` must navigate to or inspect the current control record without resubmitting the original effect. Synchronous inspection errors are sanitized. The host handles asynchronous navigation/loading and any appropriate access checks.

## 5. Human Override

Supported intervention kinds and button labels:

| Kind | Explicit request |
|---|---|
| pause | Request pause |
| stop | Request stop |
| cancel | Request cancellation |
| take-control | Request human takeover |
| revoke | Request permission revocation |
| escalate | Request escalation |

Only the host can establish actual stoppage, pause, takeover, or revocation. In-flight effects may complete before a stop takes effect. Show prior effects and make limits clear. Do not silently equate cancelling future work with reversing completed work.

The component is an inline named region. A production agent workspace should keep an applicable override readily reachable while work is active; the library does not make it globally sticky or determine which user has authority to intervene.

## 6. Recovery Control

Recovery kinds are undo, retry, restore, rollback, compensate, revise, and reconcile. Each has specific request wording. Compensation explicitly remains distinct from undo.

RecoveryOperation additionally requires originalOutcome (known or unknown). If the original result is unknown, **only reconcile is allowed**; undo/retry/restore/rollback/compensate/revise are blocked until the host establishes the relevant prior outcome. Reconcile must read authoritative state without repeating the original action.

Retry on a known outcome also requires nonempty retrySafety explaining the host's duplicate-effect prevention. This explanatory string is not proof of durable idempotency. A retry needs its own appropriate authority and immutable operation record.

Confirmed compensation says Compensation confirmed — not undo. Confirmed reconciliation says Status check completed — no retry. A completed status check does not claim the original action succeeded: its evidence must explain what is known, including an unresolved original outcome. Keep partial effects and historical records visible.

## 7. Completion evidence

ControlEvidence contains the four request identity fields, outcome (completed or failed), observedAt, and nonempty detail. The observed timestamp must use the supported absolute format. The evidence must match the current control and run revisions and the supplied terminal status.

Without that binding, a completed or failed prop displays Outcome not verified. Changed same-version operation details display a stale-review warning instead of confirmed success. This is a presentation check, not cryptographic evidence verification or protection from an untrusted host. Validate external data and authenticate service records before rendering.

All operation descriptions, activity text, and evidence are rendered as text rather than HTML. Types and metadata helpers are not complete hostile-JSON schemas; malformed nested values can still throw. Runtime validation, input limits, and privacy filtering belong at the application boundary.

## 8. Working local example

Run the [component lab](GETTING-STARTED.md) and follow Explore supervision and recovery. The new simulation is explicitly separate from the publication-review workflow. It makes no model calls, writes no persistent data, and controls no real worker.

Request stop acknowledges the request while the simulated worker remains unresolved. Advance simulated worker then records stoppage; the two prior fixture writes remain in history. Request compensation, followed by another worker step, adds a separate compensating record without removing the originals.

Enable Lose stop acknowledgement before requesting stop to exercise the unknown path. The worker records a stop but its acknowledgement is hidden. The UI blocks another run and presents Check original action status. Advancing the requested reconciliation reads the existing record without repeating a write. Start another local run is available only after a resolved stop/recovery, and retains the existing history.

The stepping buttons simulate service events; they are not production control affordances. Refresh clears page memory, not real-world actions. The demo ledger is neither durable audit storage nor trusted authorization infrastructure.

## 9. Validation and adoption

New tests cover observations, invalid progress, effectful recovery restrictions, version fingerprints, completion evidence, duplicate requests, expiry, unknown outcomes, inspection boundaries, the stepped model, keyboard operation, light/dark themes, narrow-screen reflow, and automated accessibility samples. The installed-package acceptance fixture now targets all fourteen static renders and seven negative type cases.

Use CI results tied to the exact source commit, not this authored test list, as evidence of success. The initial implementation is reviewed through [PR 6](https://github.com/kochrisdev/TUN-Systemic-Design/pull/6). Broader browser/framework/hydration, localization, manual assistive-technology, hostile-input schemas, real authorization, distributed cancellation, and recovery testing remain adoption work.

**Human Intent. Machine Intelligence. Systemic Design.**
