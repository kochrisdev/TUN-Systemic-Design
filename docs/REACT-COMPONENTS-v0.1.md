# TUN React Components v0.1

**Status:** Reference implementation of seven components.  
**Package:** `@tun-systemic/react` v0.1.0; repository-local, not published.  
**Documentation revision:** September 28, 2026.

[Documentation index](README.md) · [Getting started](GETTING-STARTED.md) · [Architecture](ARCHITECTURE.md) · [Review workflow API](REVIEW-WORKFLOW-v0.1.md) · [Consumer validation](CONSUMER-VALIDATION-v0.1.md)

## 1. Scope

This implementation translates parts of the [component catalog](COMPONENTS-v0.1.md) and [visual system](DESIGN-TOKENS-AND-VISUAL-SYSTEM-v0.1.md) into React/TypeScript. It does not implement the entire behavioral specification or claim full product conformance. PR history identifies acceptance for a particular revision.

| Export | Purpose | Source |
|---|---|---|
| `IntentComposer` | Controlled intent entry and scoped submission | [IntentComposer.tsx](../packages/react/src/IntentComposer.tsx) |
| `AgentCard` | Identity, purpose, autonomy, state, authority | [AgentCard.tsx](../packages/react/src/AgentCard.tsx) |
| `ContextPanel` | Source availability, usage, scope, persistence | [ContextPanel.tsx](../packages/react/src/ContextPanel.tsx) |
| `PlanView` | Versioned approach, dependencies, approval checkpoints | [PlanView.tsx](../packages/react/src/PlanView.tsx) |
| `ProposalCard` | Exact proposed action and navigation to review | [ProposalCard.tsx](../packages/react/src/ProposalCard.tsx) |
| `ApprovalGate` | Version-bound explicit decision request | [ApprovalGate.tsx](../packages/react/src/ApprovalGate.tsx) |
| `ActionReceipt` | Supplied result with verification/recovery limits | [ActionReceipt.tsx](../packages/react/src/ActionReceipt.tsx) |

Seven patterns remain specified only. A model runtime, orchestrator, memory service, Figma/Tailwind adapter, production authorization backend, and hosted application are not included. Full props for the three review components are in [Review Workflow](REVIEW-WORKFLOW-v0.1.md).

## 2. Repository layout

| Path | Responsibility |
|---|---|
| [packages/react/src](../packages/react/src) | Components, contracts, component CSS |
| [index.ts](../packages/react/src/index.ts) | Public client entry and exports |
| [review-contracts.ts](../packages/react/src/review-contracts.ts) | Context/plan metadata, revision references, presentation helpers |
| [copy-assets.mjs](../packages/react/scripts/copy-assets.mjs) | Copy styles, generated token CSS, and license |
| [examples/react](../examples/react) | Simulated Vite component lab |
| [review-model.ts](../examples/react/review-model.ts) | Pure in-memory demonstration state; not an exported engine |
| [tests](../tests) | Contracts, timestamps, React, model, browser, and consumer fixtures |
| [check-package.mjs](../scripts/check-package.mjs) | Archive inventory and workspace exports |
| [check-consumer.mjs](../scripts/check-consumer.mjs) | Separate offline installed-consumer acceptance |
| [package-lock.json](../package-lock.json) | Resolved dependency graph |

The build emits ESM JavaScript and declarations under packages/react/dist, plus styles and tokens. React is a peer dependency. Exports are `.`, `./contracts`, `./styles.css`, and `./tokens.css`; there is no CommonJS require entry. Review types/helpers are re-exported through contracts; no separate review-contracts subpath is declared.

## 3. Getting started

Use Node 22.23.2 from .nvmrc and npm 12.1.0. From the repository root:

```sh
npm install --global npm@12.1.0
npm ci
npm run check
npm run dev
```

The lab runs at `http://127.0.0.1:4173`. Initial dependency installation needs registry access. npm run dev builds the library once; rebuild after library-source edits. npm run check includes typecheck, contract/React/model tests, builds, archive checks, and the isolated offline consumer test. Browser, token, documentation, and audit checks remain separate; see [Verification](GETTING-STARTED.md#verification).

The peer range is React/React DOM >=19.2.0 <20. A named validation run covers one locked version, not every peer/runtime. The isolated test installs real local archives outside the workspace, compiles consumer declarations, and statically renders all seven components. This is distinct from inventory checking and does not establish hydration, bundler CSS integration, registry distribution, or every framework. Existing CI permissions remain read-only; artifacts are temporary.

## 4. Intent Composer

| Prop | Required | Contract/default |
|---|---|---|
| `value` | Yes | Controlled string |
| `onValueChange` | Yes | Receives edited string |
| `onSubmit` | Yes | Receives trimmed intent; void or Promise<void> |
| `scope` | Yes | Explains allowed effects; does not authorize them |
| `label` | No | What would you like to achieve? |
| `submitLabel` | No | Prepare proposal |
| `disabled` | No | false |
| `blockedReason` | No | User-safe explanation blocking input/submission |
| `maxLength` | No | Positive integer, default/fallback 4000 |
| `className` | No | Additional CSS class |

Empty or over-limit input is blocked. Length uses JavaScript string code units, not grapheme clusters; the UI calls this characters. Invalid maxLength falls back to 4000. Submission trims outside whitespace without clearing the controlled value. The lab overrides submitLabel to Prepare plan.

Enter adds a line; Ctrl/Command + Enter submits except during IME composition. A synchronous latch blocks duplicate in-flight submissions in that instance. A rejected callback reports an unconfirmed outcome without raw exceptions. The composer then unlocks, so the host must reconcile and deduplicate before retrying effectful operations. This is not the stricter approval latch or durable idempotency.

Local-only example with no external execution or prompt logging:

```tsx
import { useState } from 'react';
import { IntentComposer } from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';

export function DraftRequest() {
  const [intent, setIntent] = useState('');
  const [draft, setDraft] = useState('');
  return <>
    <IntentComposer
      value={intent}
      onValueChange={setIntent}
      scope="Copy this request into a local preview only. Nothing is sent."
      submitLabel="Prepare local preview"
      onSubmit={text => { setDraft(text); }}
    />
    <section aria-label="Local preview">
      <h2>Local preview</h2>
      <p>{draft || 'No preview prepared.'}</p>
    </section>
  </>;
}
```

Attachments, voice, targets, and clarification orchestration are not supplied.

## 5. Agent Card

Required: agent: AgentProfile and state: AgentState. Optional: currentTask and className.

AgentProfile has readonly id, name, purpose, autonomy (0–4), authority (string array), and optional capabilities (string array). Empty authority means none is declared, not unrestricted access. Capabilities are disclosed separately.

All eleven design states have labels. Thinking is displayed as Analyzing; waiting as Waiting for approval. Use explanatory task text for other waiting conditions. No configurable label/localization API is supplied. The host supplies state; the card does not observe execution or implement tool permissions, memory, or override controls.

## 6. Approval Gate

| Prop | Required | Contract |
|---|---|---|
| `proposal` | Yes | ActionProposal with canonical identity/material fields |
| `status` | Yes | awaiting, approved, rejected, expired, superseded |
| `approveLabel` | Yes | Specific action, not generic Continue |
| `onDecision` | Yes | Version-bound decision request; void or Promise<void> |
| `blockedReason` | No | Host-supplied blocking explanation |
| `className` | No | Additional CSS class |

ActionProposal contains readonly id, version, action, target, actor (id/name/type), consequence, effect, authority, recovery, and optional expiresAt. Recovery has a kind and explanation, not a boolean. Actor type is human, agent, or system; consequence is C0–C4.

Optional contentPreview (plain text) and reviewBasis (context/plan ID/version references) are fingerprinted and displayed before the controls. Empty supplied preview or incomplete supplied basis blocks review. Legacy callers may omit them; that does not establish context-bound approval. See [Binding context, plan, and content](REVIEW-WORKFLOW-v0.1.md#5-binding-context-plan-and-content).

```ts
interface DecisionRequest {
  readonly proposalId: string;
  readonly proposalVersion: string;
  readonly decision: 'approve' | 'reject';
}
```

The callback is not an authorization or execution service. The host binds its canonical proposal, exact parameters/content, relevant context/plan revisions, identity, and policy. The specification requires explicit approval of the particular C4 proposal; styling does not enforce domain-specific controls.

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

Do not change versions merely to bypass a latch. Remounts and additional tabs are outside its durable guarantees. The host prevents duplicate execution, reconciles unknown outcomes, and authenticates the records behind revision references.

Both controls are disabled for invalid/expired/blocked reviews. Supply an independent safe dismissal or escalation path where required. Rejecting a proposal does not cancel an already-submitted action; the component is not Human Override.

### Timestamp contract

Supported: YYYY-MM-DDTHH:mm:ss[.fraction](Z|±HH:mm), valid calendar dates, mandatory seconds/timezone, one to three fractional digits. Year zero, February 30, hour 24, leap seconds, precision beyond milliseconds, and unknown-local-offset -00:00 are rejected. This is not full ISO-8601/RFC-3339 support.

A non-finite clock blocks approval. Expiry is rechecked in the handler, not only by timer. Client time is not trusted server time; the host repeats expiry and policy checks before execution.

## 7. Action Receipt

Required: receipt: ReceiptData. Optional: className.

| Field | Meaning |
|---|---|
| id, action, actor, target | Identity and attribution |
| timestamp | Host-supplied supported absolute timestamp |
| status | completed, partially-completed, failed, reversed, pending-verification |
| summary | Privacy-safe description of the known result |
| verification | verified/pending/unavailable plus meaningful detail |
| recovery | reversible/compensatable/irreversible/unknown plus limits |
| detailsUrl | Optional record link subject to limited URL checks |

The Approval Gate never creates receipts. Completed/reversed without verified state and nonempty evidence displays pending verification. This cannot authenticate host evidence. Partial stays partial. Invalid timestamps are unavailable rather than fabricated; valid times display in UTC.

The URL helper excludes javascript/data schemes, protocol-relative paths, credentials, and suspicious whitespace/control/backslash characters. HTTP/HTTPS and root-relative links are permitted. The host still needs access controls, allowed origins, and safe query parameters. This is not complete URL security validation.

Compensation is not true reversal; local reset is not undo. The receipt describes recovery rather than implementing a Recovery Control.

## 8. Application-side requirements

Validate external JSON before rendering. Authenticate identity/tenant, bind exact parameters/version, recheck scope/expiry/revocation, enforce durable idempotency, execute, verify, and retain protected records. TypeScript interfaces and typed-metadata helpers are not full runtime validators; malformed nested inputs may throw.

Model output and retrieved content are data, not authority. Memory must not grant permission. Sanitize errors and keep private prompts, credentials, payloads, and sensitive query parameters out of logs/telemetry/shared surfaces. Filter unauthorized context before sending props to a client, not merely before rendering a disclosure.

Inspect authoritative state before retrying uncertain external actions. Preserve partial effects. Actual pause/stop/revocation and recovery require host services. Complete the [integration checklist](INTEGRATION-CHECKLIST.md).

## 9. Visual and accessibility behavior

Import @tun-systemic/react/styles.css once; it includes tokens. Themes are document-level via html data-tun-theme light/dark; no attribute follows the system. No remote fonts or persistence are supplied.

Native controls, labels, definition lists, disclosures, status text, generated IDs, visible focus, narrow-screen wrapping, reduced motion, and forced colors are used. These choices and automated samples are not a full accessibility audit.

Approval is inline, not modal. Hosts adding dialogs need focus containment/dismissal/restoration. Hosts replacing components need appropriate focus and announcements. English copy is embedded; no locale contract is implemented. Test framework CSS placement, client/server boundaries, and hydration; static-render smoke checks do not establish those capabilities.

## 10. Validation and release status

[Consumer validation](CONSUMER-VALIDATION-v0.1.md) closes the isolated-install gap left in the [workflow record](REVIEW-VALIDATION-v0.1.md). The [earlier React record](REACT-VALIDATION-v0.1.md) preserves the historical four-component snapshot. Reports prove only their named source and checks.

The package remains private and unpublished with version 0.1.0; use source SHA and digest to identify archives. The isolated offline test is distinct from workspace inventory and proves one installed peer graph, declaration compilation, static rendering, and package/CSS resolution. Registry distribution, broader peers, bundlers, hydration, browsers, assistive technologies, localization, deployments, and production services still require validation. No full TUN conformance or accessibility certification is claimed.

## References

[Source contracts](../packages/react/src/contracts.ts), [review contracts](../packages/react/src/review-contracts.ts), [exports](../packages/react/src/index.ts), [root scripts](../package.json), and [CI](../.github/workflows/react.yml) define this implementation. External references: [React useId](https://react.dev/reference/react/useId), [Vite](https://vite.dev/guide/), [Vitest](https://vitest.dev/guide/), [npm ci](https://docs.npmjs.com/cli/commands/npm-ci/), [W3C form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/), and [Playwright CI](https://playwright.dev/docs/ci-intro).

**Human Intent. Machine Intelligence. Systemic Design.**
