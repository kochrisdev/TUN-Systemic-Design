# TUN React Components v0.1

**Status:** Reference implementations of all fourteen canonical components.  
**Package:** @tun-systemic/react v0.1.0; repository-local, private, unpublished.  
**Revision:** September 28, 2026.

[Documentation index](README.md) · [Getting started](GETTING-STARTED.md) · [Architecture](ARCHITECTURE.md) · [Review API](REVIEW-WORKFLOW-v0.1.md) · [Evidence API](EVIDENCE-AND-MEMORY-v0.1.md) · [Supervision API](SUPERVISION-AND-RECOVERY-v0.1.md)

## 1. Scope

The library implements parts of the [component catalog](COMPONENTS-v0.1.md) and [visual system](DESIGN-TOKENS-AND-VISUAL-SYSTEM-v0.1.md). All canonical exports exist, but not every behavioral requirement, optional feature, platform, or product integration is implemented. This is not full TUN conformance or production certification.

| Export | Purpose | Source |
|---|---|---|
| IntentComposer | Controlled intent and scoped submission | [Source](../packages/react/src/IntentComposer.tsx) |
| AgentCard | Identity, purpose, autonomy, authority and state | [Source](../packages/react/src/AgentCard.tsx) |
| ContextPanel | Availability, usage, scope and persistence | [Source](../packages/react/src/ContextPanel.tsx) |
| PlanView | Versioned approach and approval checkpoints | [Source](../packages/react/src/PlanView.tsx) |
| ProposalCard | Exact action and navigation to review | [Source](../packages/react/src/ProposalCard.tsx) |
| ApprovalGate | Explicit version-bound decision request | [Source](../packages/react/src/ApprovalGate.tsx) |
| ActionReceipt | Supplied results with verification/recovery limits | [Source](../packages/react/src/ActionReceipt.tsx) |
| MemoryIndicator | Scoped memory influence and inspection | [Source](../packages/react/src/MemoryIndicator.tsx) |
| SourceView | Claim-specific sources and evidence distinctions | [Source](../packages/react/src/SourceView.tsx) |
| UncertaintySignal | Scoped qualitative uncertainty | [Source](../packages/react/src/UncertaintySignal.tsx) |
| ToolActivity | Observed tool, target, scope, progress and effects | [Source](../packages/react/src/ToolActivity.tsx) |
| AgentActivity | Observed agent work and blockers | [Source](../packages/react/src/AgentActivity.tsx) |
| HumanOverride | Version-bound intervention requests | [Source](../packages/react/src/HumanOverride.tsx) |
| RecoveryControl | Explicit recovery/reconciliation requests | [Source](../packages/react/src/RecoveryControl.tsx) |

Full props for the review, evidence/memory, and supervision families are in their linked API guides. A model runtime, orchestrator, memory store, independent evidence verifier, authorization/cancellation/recovery backend, design-tool adapter, and hosted application are not supplied.

## 2. Repository layout

| Path | Responsibility |
|---|---|
| [React source](../packages/react/src) | Components, contracts and component CSS |
| [index.ts](../packages/react/src/index.ts) | Public client entry and fourteen exports |
| [contracts.ts](../packages/react/src/contracts.ts) | Core approval, receipt, actor and timestamp contracts |
| [review-contracts.ts](../packages/react/src/review-contracts.ts) | Context, plans and revision references |
| [evidence-contracts.ts](../packages/react/src/evidence-contracts.ts) | Memory, evidence and uncertainty metadata |
| [supervision-contracts.ts](../packages/react/src/supervision-contracts.ts) | Observations, control requests and bound evidence |
| [copy-assets.mjs](../packages/react/scripts/copy-assets.mjs) | Copies styles, generated tokens and license |
| [examples/react](../examples/react) | Vite lab and local simulation models |
| [tests](../tests) | Metadata, React, model, browser and consumer tests |
| [check-package.mjs](../scripts/check-package.mjs) | Archive inventory and workspace exports |
| [check-consumer.mjs](../scripts/check-consumer.mjs) | Isolated offline package acceptance |
| [package-lock.json](../package-lock.json) | Resolved dependency graph |

The build emits ESM JavaScript and declarations under packages/react/dist plus styles and tokens. React is a peer dependency. Public entry points remain `.`, `./contracts`, `./styles.css`, and `./tokens.css`; no CommonJS require entry is supplied. Core/review helpers are available through root and contracts; evidence/memory and supervision helpers are **root-only**. No additional contract subpath is declared. Internal ControlAction is packaged as a dependency, not exported as a fifteenth component.

## 3. Getting started

Select Node 22.23.2 from .nvmrc and npm 12.1.0. At the repository root:

```sh
npm install --global npm@12.1.0
npm ci
npm run check
npm run dev
```

Open `http://127.0.0.1:4173`. Initial setup needs registry access. The development command builds the library once; rebuild after source edits. npm run check includes typecheck, Node/React/metadata/model tests, builds, archive checks and isolated consumer acceptance. Browser, token, documentation and audits remain separate; see [Verification](GETTING-STARTED.md#verification).

Declared React/React DOM peer range remains >=19.2.0 <20. The isolated test targets fourteen static renders and seven negative declaration cases outside the workspace, using real local archives and its own lockfile reinstall. One locked peer graph does not establish every runtime, bundler, hydration or framework configuration. CI permissions remain read-only and artifacts temporary.

## 4. Intent Composer

| Prop | Required | Contract/default |
|---|---|---|
| value | Yes | Controlled string |
| onValueChange | Yes | Receives edited string |
| onSubmit | Yes | Receives trimmed intent; void or Promise<void> |
| scope | Yes | Explains allowed effects; does not authorize them |
| label | No | What would you like to achieve? |
| submitLabel | No | Prepare proposal |
| disabled | No | false |
| blockedReason | No | User-safe explanation blocking input/submission |
| maxLength | No | Positive integer; default/fallback 4000 |
| className | No | Additional CSS class |

Empty or over-limit input is blocked. Length uses JavaScript string code units, not grapheme clusters; UI wording currently calls these characters. Invalid maxLength uses 4000. Submission trims outside whitespace without clearing the host value. The lab overrides submitLabel to Prepare plan.

Enter inserts a line; Ctrl/Command + Enter submits except during IME composition. A synchronous latch blocks duplicate in-flight submissions in the mounted instance. Rejected callbacks show sanitized unconfirmed outcomes; the composer then unlocks, so the host must reconcile and deduplicate before retrying effectful work. This is not durable idempotency or the stricter approval latch.

Local-only example:

```tsx
import { useState } from 'react';
import { IntentComposer } from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';

export function DraftRequest() {
  const [intent, setIntent] = useState('');
  const [draft, setDraft] = useState('');
  return <>
    <IntentComposer value={intent} onValueChange={setIntent}
      scope="Copy this request into a local preview only. Nothing is sent."
      submitLabel="Prepare local preview" onSubmit={text => { setDraft(text); }} />
    <section aria-label="Local preview"><h2>Local preview</h2>
      <p>{draft || 'No preview prepared.'}</p></section>
  </>;
}
```

Attachments, voice, targets and clarification orchestration are not supplied.

## 5. Agent Card

Required props are agent: AgentProfile and state: AgentState. Optional props are currentTask and className. AgentProfile requires readonly id, name, purpose, autonomy (0–4), authority (string array), with optional capabilities (string array). Empty authority means none declared, not unrestricted access.

All eleven design states have labels. Thinking displays Analyzing; waiting displays Waiting for approval. Use task text for other waiting conditions; no configurable localization API is provided. The card does not observe or execute work. AgentActivity is now a separate component with a separate observation contract, not a replacement for AgentState.

## 6. Approval Gate

| Prop | Required | Contract |
|---|---|---|
| proposal | Yes | ActionProposal with canonical identity and material fields |
| status | Yes | awaiting, approved, rejected, expired, superseded |
| approveLabel | Yes | Specific action wording, not generic Continue |
| onDecision | Yes | Version-bound decision request; void or Promise<void> |
| blockedReason | No | Host-supplied blocking explanation |
| className | No | Additional CSS class |

ActionProposal requires readonly id, version, action, target, actor (id/name/type), consequence, effect, authority and recovery; expiresAt is optional. Recovery has a kind and explanation, not a boolean. Actor type is human/agent/system and consequence is C0–C4.

Optional plain-text contentPreview and context/plan reviewBasis are fingerprinted and displayed. Empty supplied preview or incomplete supplied references block review. Legacy callers can omit them without thereby establishing evidence-bound approval. See [Binding context, plan, and content](REVIEW-WORKFLOW-v0.1.md#5-binding-context-plan-and-content).

```ts
interface DecisionRequest {
  readonly proposalId: string;
  readonly proposalVersion: string;
  readonly decision: 'approve' | 'reject';
}
```

The callback is not an authorization or execution service. The host binds canonical exact parameters, content, relevant revisions, authenticated principal, and policy. Applicable C4 proposals require explicit action-specific approval; a RecoveryControl callback must not bypass that requirement.

### Review lifecycle

| Condition | Presentation and behavior |
|---|---|
| Valid, awaiting | Explicit approve/reject controls available |
| Pending callback | Controls disabled; no execution claim |
| Acknowledged callback | Latch remains closed; host supplies authoritative state |
| Rejected callback | Outcome unknown; no automatic retry |
| Approved prop | Authorization is distinct from execution |
| Rejected, expired, superseded | No further decisions from that review |
| Material data/content/references changed under same version | Local review blocked |
| New proposal ID/version | Fresh review, not inherited authorization |

Never change versions just to bypass a latch. Remounts and tabs require host-side coordination and durable idempotency. The gate cannot authenticate referenced records. Both controls are disabled for invalid/expired/blocked reviews; supply independent safe dismissal or escalation. Rejecting a proposal does not cancel an action already submitted. HumanOverride is a separate request surface, not a cancellation backend.

### Timestamp contract

Supported: `YYYY-MM-DDTHH:mm:ss[.fraction](Z|±HH:mm)`, with valid calendar date, mandatory seconds/timezone, and one to three fractional digits. Year zero, February 30, hour 24, leap seconds, precision beyond milliseconds, and unknown-local-offset `-00:00` are rejected. This is not full ISO-8601/RFC-3339 support.

A non-finite clock blocks approval. Expiry is rechecked at activation, not just by timer. Client time is not trusted server time; the host repeats expiry/policy checks before effects. Activity and control observations use the same supported timestamp subset.

## 7. Action Receipt

Required receipt: ReceiptData; optional className.

| Field | Meaning |
|---|---|
| id, action, actor, target | Identity and attribution |
| timestamp | Host-supplied supported absolute timestamp |
| status | completed, partially-completed, failed, reversed, pending-verification |
| summary | Privacy-safe known result |
| verification | verified/pending/unavailable plus meaningful detail |
| recovery | reversible/compensatable/irreversible/unknown plus limits |
| detailsUrl | Optional record link with limited URL checks |

Approval never creates a receipt. Completed/reversed without verified state and nonempty evidence displays pending verification. The UI cannot authenticate evidence. Partial remains partial. Invalid dates display unavailable; valid times display UTC.

The URL helper excludes javascript/data schemes, protocol-relative paths, credentials, and suspicious whitespace/control/backslash characters. HTTP/HTTPS and root-relative links are permitted. Hosts still enforce allowed origins, safe parameters and access controls. This is not complete URL security validation.

The receipt describes recovery but contains no recovery button. Compose the separate RecoveryControl only for genuine supported host capabilities. Compensation and local reset are not undo.

## 8. Application-side requirements

Validate external JSON before rendering. Authenticate identity/tenant; bind immutable operation and run revisions; check scope, expiry, revocation and current authorization; enforce durable idempotency; execute, observe, verify and keep protected records. Types and typed-metadata helpers are not complete runtime validators; malformed nested values may throw.

Model output and retrieved content are data, not authority. Memory cannot grant permission. Redact private prompts, credentials, payloads and sensitive links from client props, logs and shared surfaces. Source checks and confidence labels are host declarations, not independently proved truth. Evidence changes material to an action must invalidate canonical review.

Intervention acknowledgement is not stoppage. Recovery after an unknown original outcome requires reconciliation before effectful repetition. UI latches cannot coordinate other controls, remounts, tabs or distributed workers. Keep partial effects visible. See the [Supervision API](SUPERVISION-AND-RECOVERY-v0.1.md) and [integration checklist](INTEGRATION-CHECKLIST.md).

## 9. Visual and accessibility behavior

Import @tun-systemic/react/styles.css once. It includes generated tokens. Themes are document-level via html data-tun-theme light/dark; no attribute follows the system. No remote fonts or preference storage is supplied.

Native controls, readable labels, disclosures, generated IDs, visible focus, narrow-screen wrapping, reduced motion and forced colors are used. Evidence/memory announcements are opt-in through announce; activity/control views announce concise state labels. Hosts must throttle frequent updates. Automated samples do not replace a full manual assistive-technology review.

Approval, override and recovery are inline regions, not modals. Hosts adding dialogs need focus containment, dismissal and restoration. English copy is embedded and no locale contract is supplied. Test CSS placement, client/server boundaries, hydration and control visibility in the actual application. Static consumer renders do not prove these capabilities.

## 10. Validation and release status

[PR 6](https://github.com/kochrisdev/TUN-Systemic-Design/pull/6) records the fourteen-component increment. [Evidence](EVIDENCE-VALIDATION-v0.1.md), [consumer](CONSUMER-VALIDATION-v0.1.md), [workflow](REVIEW-VALIDATION-v0.1.md), and [original React](REACT-VALIDATION-v0.1.md) reports preserve earlier snapshots. Reports prove only their named source/checks, not every future commit.

The package remains private/unpublished at version 0.1.0. Identify builds by source SHA and digest. Current isolated fixtures target fourteen static renders and seven negative type cases using one locked peer graph. Registry distribution, broader peers, bundlers, hydration, browsers, assistive technology, localization and real backend services remain adoption work. No full conformance or accessibility certification is claimed.

## References

[Core contracts](../packages/react/src/contracts.ts), [review contracts](../packages/react/src/review-contracts.ts), [evidence contracts](../packages/react/src/evidence-contracts.ts), [supervision contracts](../packages/react/src/supervision-contracts.ts), [exports](../packages/react/src/index.ts), [root scripts](../package.json), and [CI](../.github/workflows/react.yml) define the implementation. External references: [React useId](https://react.dev/reference/react/useId), [Vite](https://vite.dev/guide/), [Vitest](https://vitest.dev/guide/), [npm ci](https://docs.npmjs.com/cli/commands/npm-ci/), [W3C form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/), and [Playwright CI](https://playwright.dev/docs/ci-intro).

**Human Intent. Machine Intelligence. Systemic Design.**
