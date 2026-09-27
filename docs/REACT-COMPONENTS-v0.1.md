# TUN React Components v0.1

**Status:** Reference implementation of four components.  
**Package:** `@tun-systemic/react` v0.1.0; repository-local, not published.  
**Documentation revision:** September 27, 2026.

[Documentation index](README.md) · [Getting started](GETTING-STARTED.md) · [Architecture](ARCHITECTURE.md) · [Dated validation](REACT-VALIDATION-v0.1.md)

## 1. Scope

This implementation translates parts of the [component catalog](COMPONENTS-v0.1.md) and [visual system](DESIGN-TOKENS-AND-VISUAL-SYSTEM-v0.1.md) into React/TypeScript. It does not implement the whole behavioral specification or claim full product conformance.

| Export | Purpose | Source |
|---|---|---|
| `IntentComposer` | Controlled intent entry and scoped submission | [IntentComposer.tsx](../packages/react/src/IntentComposer.tsx) |
| `AgentCard` | Identity, purpose, autonomy, state, authority | [AgentCard.tsx](../packages/react/src/AgentCard.tsx) |
| `ApprovalGate` | Version-bound explicit decision request | [ApprovalGate.tsx](../packages/react/src/ApprovalGate.tsx) |
| `ActionReceipt` | Supplied result with verification/recovery limits | [ActionReceipt.tsx](../packages/react/src/ActionReceipt.tsx) |

The remaining ten patterns are specified only. A model runtime, agent orchestrator, memory service, Figma/Tailwind adapter, production authorization backend, and hosted application are not included.

## 2. Repository layout

| Path | Responsibility |
|---|---|
| [packages/react/src](../packages/react/src) | Components, TypeScript contracts, component CSS |
| [packages/react/src/index.ts](../packages/react/src/index.ts) | Public client entry and exports |
| [packages/react/scripts/copy-assets.mjs](../packages/react/scripts/copy-assets.mjs) | Copy styles, generated token CSS, and license into build/package outputs |
| [examples/react](../examples/react) | Simulated Vite component lab |
| [tests](../tests) | Node contracts, timestamp regressions, React and browser tests |
| [scripts/check-package.mjs](../scripts/check-package.mjs) | Local archive inventory and workspace-export verification |
| [package-lock.json](../package-lock.json) | Resolved dependency graph |

The library build emits ESM JavaScript and declarations under `packages/react/dist`, plus styles and token CSS. React is a peer dependency. The package exports `.`, `./contracts`, `./styles.css`, and `./tokens.css`; it does not declare a CommonJS require entry.

## 3. Getting started

Use Node 22.23.2 from `.nvmrc` and npm 12.1.0 as the reference toolchain. Select Node before running these commands at the repository root:

```sh
npm install --global npm@12.1.0
npm ci
npm run check
npm run dev
```

The lab runs at `http://127.0.0.1:4173`. Installation needs registry access. `npm run dev` builds the library once; rebuild after library-source edits. `npm run check` includes typecheck, library/React/contract checks, demo build, and package checks, but not browser, token, docs, or audit checks. The [full verification guide](GETTING-STARTED.md#verification) covers those separately.

The declared peer range is React/React DOM `>=19.2.0 <20`. The validation report records a specific locked version, not evidence for every allowed peer/runtime. Dependencies and manifests should change intentionally together. CI uses read-only repository permissions and temporary artifacts. A workspace package inventory check is not independent-consumer installation testing.

## 4. Intent Composer

| Prop | Required | Contract/default |
|---|---|---|
| `value` | Yes | Controlled string |
| `onValueChange` | Yes | Receives edited string |
| `onSubmit` | Yes | Receives trimmed intent; returns void or Promise<void> |
| `scope` | Yes | Explain allowed effects; does not itself authorize them |
| `label` | No | What would you like to achieve? |
| `submitLabel` | No | Prepare proposal |
| `disabled` | No | false |
| `blockedReason` | No | Safe, user-facing explanation that blocks input/submission |
| `maxLength` | No | Positive integer, default/fallback 4000 |
| `className` | No | Additional CSS class |

Empty or over-limit input is blocked. Length uses JavaScript string code units, not grapheme clusters; the UI currently calls this characters. Invalid maxLength values fall back to 4000. Submission trims outside whitespace without clearing the host's value.

Normal Enter adds a line; Ctrl/Command + Enter submits except during IME composition. A synchronous latch blocks duplicate in-flight submissions in that mounted instance. Callback rejection displays an unconfirmed outcome without raw exception text; the composer unlocks afterward, so the host must reconcile and deduplicate before retrying effectful operations. It is not the stricter approval latch or a durable idempotency mechanism.

Self-contained local-only example; no external execution or prompt logging:

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

Attachments, voice, target selection, and clarification orchestration are not supplied by this component.

## 5. Agent Card

Required props: `agent: AgentProfile` and `state: AgentState`. Optional: `currentTask` and `className`.

`AgentProfile` includes readonly `id`, `name`, `purpose`, `autonomy` (0–4), `authority` (string array), and optional `capabilities` (string array). An empty authority list means no authority is declared, not unrestricted access. Capabilities are disclosed separately.

All eleven design states have labels. `thinking` is displayed as Analyzing, and `waiting` as Waiting for approval. Use explanatory task text for other waiting conditions; there is no independent configurable state-label or localization API. State is supplied by the host, not observed by the card.

No execution, tool-permission management, memory management, or override control is included.

## 6. Approval Gate

| Prop | Required | Contract |
|---|---|---|
| `proposal` | Yes | `ActionProposal` with canonical identity and material fields |
| `status` | Yes | awaiting, approved, rejected, expired, superseded |
| `approveLabel` | Yes | Specific action text, not a generic Continue label |
| `onDecision` | Yes | Version-bound decision request; void or Promise<void> |
| `blockedReason` | No | Host-supplied blocking explanation |
| `className` | No | Additional CSS class |

`ActionProposal` contains readonly `id`, `version`, `action`, `target`, `actor` (id/name/type), `consequence`, `effect`, `authority`, `recovery`, and optional `expiresAt`. Recovery has a kind and explanation; it is not a boolean. Actor types are human, agent, or system. Consequence is C0–C4.

```ts
interface DecisionRequest {
  readonly proposalId: string;
  readonly proposalVersion: string;
  readonly decision: 'approve' | 'reject';
}
```

The callback is not an authorization or execution service. Use the server's canonical proposal to bind identity, version, exact parameters, and policy. C4 requires explicit approval of the particular proposal under the design specification; component styling cannot enforce domain-specific controls.

### Review lifecycle

| Condition | Presentation and behavior |
|---|---|
| Valid, awaiting | Explicit approve/reject controls available |
| Pending callback | Controls disabled; no execution claim |
| Acknowledged callback | Local latch remains closed; host supplies authoritative state |
| Rejected callback | Outcome unknown; no automatic retry |
| Approved prop | Authorization displayed separately from execution |
| Rejected, expired, superseded | No further decisions from that review |
| Material data changed under the same version | Local review blocked |
| New proposal ID/version | Fresh review, not inherited authorization |

Do not change versions merely to bypass a latch. React remounts and additional tabs are outside its durable guarantees. The host must prevent duplicate execution and reconcile unknown outcomes.

The component disables both controls when the review is invalid, expired, or blocked. Provide a separate safe dismissal/escalation path where required. Rejecting a proposal is not cancelling an operation already in flight. The component does not implement Human Override.

### Timestamp contract

Supported form: `YYYY-MM-DDTHH:mm:ss[.fraction](Z|±HH:mm)`, with valid calendar dates, mandatory seconds, explicit timezone, and one to three fractional digits when present. Year zero, February 30, hour 24, leap seconds, greater-than-millisecond precision, and unknown-local-offset `-00:00` are not accepted. This is not a claim of full ISO-8601/RFC-3339 support.

A non-finite clock blocks approval. Expiry is checked again in the handler rather than only by a timer. Client time is not trusted server time; the host repeats expiry and policy checks immediately before execution.

## 7. Action Receipt

Required: `receipt: ReceiptData`. Optional: `className`.

| Field | Meaning |
|---|---|
| `id`, `action`, `actor`, `target` | Action-record identity and attribution |
| `timestamp` | Host-supplied supported absolute timestamp |
| `status` | completed, partially-completed, failed, reversed, pending-verification |
| `summary` | Privacy-safe description of the known result |
| `verification` | verified/pending/unavailable plus nonempty relevant detail |
| `recovery` | reversible/compensatable/irreversible/unknown plus limits |
| `detailsUrl` | Optional action-record link subject to limited UI URL checks |

No receipt is created by the Approval Gate. Completed or reversed without verified status and nonempty verification detail is displayed as pending verification. This safeguards presentation; it cannot authenticate supplied evidence. Partial completion stays partial. An invalid timestamp is unavailable, not invented or rolled into another date; valid times display in UTC.

The URL helper excludes javascript/data schemes, protocol-relative paths, URL credentials, and suspicious whitespace/control/backslash characters. It permits HTTP/HTTPS and root-relative links. The host still needs an origin policy, safe query parameters, and access controls. Do not treat this helper as complete URL security validation.

Compensation is not true reversal, and local reset is not undo. The receipt provides descriptions, not a Recovery Control or execution service.

## 8. Application-side requirements

The host must validate external JSON before rendering, authenticate identity/tenant, bind exact proposal parameters/version, recheck scope/expiry/revocation, enforce durable idempotency, execute, verify, and keep protected records. TypeScript interfaces are not complete runtime validators; malformed nested values may throw if passed directly.

Treat model output and retrieved content as data, not authority. Persistent preferences must not silently grant permission. Sanitize errors and avoid private prompts, credentials, payloads, or sensitive link parameters in logs, telemetry, and shared surfaces.

After an uncertain response, inspect authoritative state before repeating an external action. Keep partial effects visible. Actual pause/stop/revocation and recovery are separate host services. Use the [integration checklist](INTEGRATION-CHECKLIST.md) before production adoption.

## 9. Visual and accessibility behavior

Import `@tun-systemic/react/styles.css` once; it includes generated token CSS. Themes are document-level via `<html data-tun-theme="light|dark">`; removing the attribute uses system preference. Remote fonts and persistence are not included.

Components use native form controls, readable labels, definition lists, disclosures, status text, and generated IDs. Styles include visible focus, narrow-screen adaptation, reduced motion, and forced colors. These choices and automated samples are not a complete accessibility audit.

Approval is inline, not a modal. Hosts adding a dialog need focus containment, dismissal, and focus restoration. Hosts replacing components after decisions need focus and announcement management. English copy is currently embedded; a locale contract is not implemented. Test consuming-framework CSS placement, client/server boundaries, hydration, and SSR rather than assuming compatibility.

## 10. Validation and release status

The [historical validation record](REACT-VALIDATION-v0.1.md) identifies tested source, toolchain, 59 contract tests, 21 React tests, 8 Chromium tests, and additional checks. Those counts are evidence for that snapshot, not automatic proof for later changes. The documentation audit has separate checks and does not rewrite historical evidence.

The package stays private and unpublished. Workspace export/inventory checks do not equal installation into a fresh external project. Cross-browser, assistive-technology, localization, deployment, and production backend validation remain adoption work. No full TUN conformance or accessibility certification is claimed.

## References

[Source contracts](../packages/react/src/contracts.ts), [public exports](../packages/react/src/index.ts), [root scripts](../package.json), and [React workflow](../.github/workflows/react.yml) define this implementation. External references include [React useId](https://react.dev/reference/react/useId), [Vite](https://vite.dev/guide/), [Vitest](https://vitest.dev/guide/), [npm ci](https://docs.npmjs.com/cli/commands/npm-ci/), [W3C form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/), and [Playwright CI](https://playwright.dev/docs/ci-intro).

**Human Intent. Machine Intelligence. Systemic Design.**
