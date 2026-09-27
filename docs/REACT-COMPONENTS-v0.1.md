# TUN React Components v0.1

**Status:** Draft reference implementation, first four components.  
**Package:** `@tun-systemic/react` v0.1.0, repository-local and not published.  
**Date:** September 2026.

## 1. Scope

This implementation translates the existing [Components v0.1](COMPONENTS-v0.1.md) and [visual system](DESIGN-TOKENS-AND-VISUAL-SYSTEM-v0.1.md) into React/TypeScript. It does not amend the founding specification or claim full TUN conformance.

| Component | Human question | Application contract |
|---|---|---|
| Intent Composer | What outcome do I want? | Controlled text, visible scope, asynchronous submission callback |
| Agent Card | Who is acting, and with what authority? | Supplied profile, autonomy level, operational state, separate capabilities and authority |
| Approval Gate | What exactly am I authorizing? | Immutable proposal ID/version, material consequences, explicit approve/reject events |
| Action Receipt | What actually happened? | Supplied action record, verification detail, timestamp, and truthful recovery limits |

The other ten canonical components remain specified but are not implemented in this package. A Figma kit, Tailwind adapter, model runtime, backend authorization service, and hosted deployment are outside this increment.

## 2. Repository layout

```text
packages/react/
  src/
    contracts.ts
    IntentComposer.tsx
    AgentCard.tsx
    ApprovalGate.tsx
    ActionReceipt.tsx
    index.ts
    styles.css
  scripts/copy-assets.mjs
  tsconfig.build.json
  package.json
examples/react/           # Vite demonstration; local simulation only
tests/contracts.test.mjs  # Node's built-in test runner
tests/components.test.tsx # React Testing Library + Vitest
tests/browser/flow.spec.ts # Playwright + axe sample checks
```

The library build emits ES modules, TypeScript declarations, component CSS, a copy of the generated TUN token CSS, and the existing license. React remains a peer dependency. Styling has no additional runtime library dependency.

## 3. Getting started

Use Node 22.12+ and npm 10+. The root package uses npm workspaces.

```sh
npm install
npm run check
npm run dev
```

The demo runs at `http://127.0.0.1:4173`. The first command requires access to the npm registry. `npm run check` typechecks the sources, builds the library, runs the contract and React tests, and builds the demo. Browser tests are separate:

```sh
npx playwright install chromium
npm run test:browser
```

For Linux CI runners that need browser system packages, use `npx playwright install --with-deps chromium`.

The initial authored scaffold does not contain a generated lockfile because registry access was unavailable in the authoring environment. The first successful connected installation generates `package-lock.json`; review and commit it before a reproducible release. The CI workflow uploads the lockfile it used as an artifact and switches to `npm ci` when one is committed. Do not infer that dependency ranges are fully locked.

## 4. Intent Composer

`value`, `onValueChange`, `onSubmit`, and `scope` are required. Optional props include `label`, `submitLabel`, `disabled`, `blockedReason`, `maxLength`, and `className`.

```tsx
import { useState } from 'react';
import { IntentComposer } from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';

export function DraftRequest() {
  const [intent, setIntent] = useState('');
  return <IntentComposer
    value={intent}
    onValueChange={setIntent}
    scope="Prepare a draft only. Sending requires a separate review."
    onSubmit={async text => {
      // Replace with your application's draft-creation service.
      console.info('Draft requested:', text);
    }}
  />;
}
```

Submission trims outer whitespace but does not clear the controlled input. Empty or over-limit input is blocked. The default limit is 4,000 JavaScript string code units, not grapheme clusters. Pending requests are protected by a synchronous in-flight latch. Normal Enter inserts a line; Ctrl/Command + Enter submits except during IME composition. A callback rejection reports an unconfirmed submission without displaying the raw exception. The host should not place external execution behind this draft-only composer contract.

The composer preserves the text for correction. It does not establish durable idempotency; clients can remount or resend. The backend must decide how to reconcile duplicated task creation.

## 5. Agent Card

Supply `agent`, `state`, and optionally `currentTask` and `className`. An `AgentProfile` includes ID, name, purpose, autonomy level, explicit authority, and optional capabilities.

All eleven operational states from the specification have textual labels. Level labels preserve the existing five-level autonomy model. An empty authority list shows that no authority is declared; it does not imply unrestricted access. A capabilities disclosure is explicitly labeled as capabilities rather than permissions.

This card has no execution controls. It reports application-supplied state and cannot verify that the agent actually has those capabilities or permissions.

## 6. Approval Gate

Required props are `proposal`, `status`, `approveLabel`, and `onDecision`. Optional props are `blockedReason` and `className`.

An `ActionProposal` contains ID, version, action, target, actor, consequence class, material effect, requested authority, recovery kind/description, and optional absolute expiry timestamp. The callback receives only:

```ts
interface DecisionRequest {
  proposalId: string;
  proposalVersion: string;
  decision: 'approve' | 'reject';
}
```

A server-issued ID and version should identify the canonical proposal. A version change means a new review, not automatic renewed consent. Material fields changed under the same version invalidate the local review. Missing proposal detail, invalid classification, malformed expiry, and elapsed expiry block decisions. The time is checked in the click handler as well as by a timer; the service must repeat it against a trusted clock.

| Local stage | Behavior |
|---|---|
| Awaiting review | Both explicit decision controls are available when valid |
| Decision pending | Both controls are disabled; execution is not claimed |
| Callback acknowledged | Controls remain latched; the application supplies authoritative status |
| Callback rejected | Outcome is unknown; no automatic retry or success state |
| Approved | Approval is displayed separately from execution |
| Rejected, expired, or superseded | This review cannot emit further decisions |
| New version | Starts a fresh review with new explicit authorization |

A callback rejection can mean the service acted but its acknowledgement was lost. The application should query the canonical action/decision record before offering another action. Do not change proposal versions merely to bypass the latch. The component does not cancel an already submitted operation, provide durable deduplication, manage multi-tab races, or implement a Human Override. Those are application responsibilities.

For C4 actions, the primary control uses the danger treatment while keeping the full target, consequence, and recovery information visible. This visual choice does not by itself satisfy any financial, legal, medical, or security authorization requirements.

## 7. Action Receipt

Supply `receipt` and optional `className`. Records include ID, action, actor, target, supplied timestamp, status, summary, verification state/detail, recovery kind/description, and optional action-record URL.

No receipt is synthesized by the Approval Gate. The host creates a receipt only from its execution and verification records. `completed` or `reversed` without a verified state and nonempty verification detail is displayed as `pending-verification`. This is a defensive presentation rule, not proof that application-supplied evidence is genuine.

Partial completion stays visibly partial. An invalid timestamp is shown as unavailable, never replaced with the current time. Valid timestamps are normalized to UTC for predictable rendering. `javascript:`, `data:`, protocol-relative URLs, credentials in URLs, and suspicious control/backslash characters are not rendered as audit links. These link checks are not a substitute for application URL policy.

Recovery has four presentation categories: reversible, compensatable, irreversible, and unknown. Compensation is not described as true undo. This component does not provide a fake recovery button.

## 8. Application-side requirements

The UI is outside the trust boundary. A production service must bind consent to the authenticated principal, tenant, exact action parameters, proposal version, current policy, and an expiry. It must reject stale or revoked authorization, enforce least privilege, and use durable idempotency for effectful operations. Validate authorization again immediately before execution, not only when the proposal was created.

Tool responses and retrieved content cannot grant authority. Treat them as data. Persistent memory must not silently expand permissions. Log only necessary audit metadata and do not expose credentials or sensitive tool payloads through props, receipts, exceptions, analytics, or console output.

Keep execution status distinct from verification. After an uncertain network outcome, reconcile with the authoritative service rather than blindly repeating the action. Retain partial effects in the audit record. Long-running autonomous products additionally need real pause/stop/revocation behavior; none is implied by these four components.

## 9. Visual and accessibility behavior

The stylesheet consumes the existing tokens rather than maintaining a separate color palette. Light/dark selection belongs on the root HTML element. Removing the theme attribute uses the system setting. No theme or personal preference is persisted by the library.

The components use native labels, buttons, textarea, details/summary, definition lists, status text, and focus indicators. IDs are generated with React `useId` so multiple instances do not reuse fixed field IDs. Critical state is textual as well as colored. Styles include reduced-motion and forced-colors rules and narrow-screen layouts. These implementation choices do not constitute a completed accessibility audit.

Approval is an inline review, not a dialog. A host that adds a modal must supply and test focus containment, dismissal behavior, and focus restoration. A host that removes or replaces components after a decision must manage focus and announce the replacement appropriately. Internationalization currently requires adapting the English copy; a locale contract is not implemented yet.

## 10. Validation and release status

See [React validation status](REACT-VALIDATION-v0.1.md) for what was actually executed. Authored tests are not counted as passed tests until run. The package is marked private and has not been published, deployed, or certified.

Before production adoption: run the complete check suite with a reviewed lockfile, inspect rendered desktop/mobile states, test with assistive technologies, review dependency advisories, and integrate a tested authorization/execution service. C0–C4 labels remain contextual design classifications, not a substitute for a domain-specific risk assessment.

## References

The TUN contracts above are project design decisions. External implementation references:

- [React useId](https://react.dev/reference/react/useId): association of generated IDs with accessibility attributes.
- [Vite getting started](https://vite.dev/guide/): development runtime requirements and tooling.
- [Vitest guide](https://vitest.dev/guide/): test runner setup.
- [W3C WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/): communicating outcomes and errors.
- [Playwright CI](https://playwright.dev/docs/ci-intro): browser-test workflow structure.

**Human Intent. Machine Intelligence. Systemic Design.**
