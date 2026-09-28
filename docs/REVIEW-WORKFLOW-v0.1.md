# Context, plan, and proposal review workflow v0.1

**Status:** Reference implementation on the review-workflow branch; check PR status before assuming it is merged.  
**Revision:** September 28, 2026.  
**Package:** `@tun-systemic/react` 0.1.0, repository-local and unpublished. Use a commit SHA to distinguish this increment from the earlier four-component archive.

[Documentation index](README.md) · [Core React API](REACT-COMPONENTS-v0.1.md) · [Implementation matrix](STATUS-AND-ROADMAP.md) · [Validation](REVIEW-VALIDATION-v0.1.md)

## 1. Scope

This increment adds `ContextPanel`, `PlanView`, and `ProposalCard`, bringing the package to seven canonical exports. It extends `ActionProposal` with optional review-basis references and a plain-text content preview. It does not change the meanings of approval, authority, execution, or verification, introduce a model runtime, or implement the remaining seven components.

```text
IntentComposer → ContextPanel → PlanView → ProposalCard
                                            ↓
                                      ApprovalGate
                                            ↓
                           host execution and verification
                                            ↓
                                      ActionReceipt

AgentCard identifies the actor and its declared authority alongside the flow.
```

The components are reusable presentation contracts. The demonstration orchestrates them locally; it is not an exported workflow engine or production authorization service.

## 2. Context Panel

| Prop | Required | Contract |
|---|---|---|
| `context` | Yes | `ContextSnapshot`: id, version, scope, sources, optional changeSummary |
| `title` | No | Default: Task context |
| `className` | No | Additional class |

A source has `id`, `label`, `kind` (file/note/memory/tool/other), `scope`, `persistence`, and `provenance` (provided/retrieved/inferred). Persistence values are `task`, `session`, `persistent`, and `operational`; they describe context use, not storage/deletion/training policy or a replacement for the specification's M0–M3 vocabulary.

Availability and usage are independent facts:

| Availability | Permitted typed fields | Display |
|---|---|---|
| available | usage; optional summary, detailsUrl, observedAt | Available, plus Used / Not used / Usage not confirmed |
| stale | Same as available | Freshness warning, independently reported usage |
| missing | usage: not-used; no content/link fields | Missing; source content unavailable |
| restricted | usage: not-used; no content/link fields | Restricted; source content unavailable |

The component derives No / Active / Partial / Missing / Restricted context from the source list. It does not infer that available sources were used. Optional summaries use native disclosures; links pass through the existing limited URL helper; malformed timestamps display Time unavailable.

Missing/restricted source content and links are not rendered, including unexpected extra fields. This is defense in depth, **not access control**: the host must remove unauthorized content and sensitive metadata before sending props to a browser. A label itself can be sensitive. A restricted source can be represented only when disclosing its existence is permitted. The component performs no data retrieval, freshness calculation, or permission change.

## 3. Plan View

| Prop | Required | Contract |
|---|---|---|
| `plan` | Yes | `TaskPlan` with id/version, context reference, objective, status, steps, expectedOutputs |
| `title` | No | Default: Proposed approach |
| `className` | No | Additional class |

Optional plan fields are `changeSummary`, `blockers`, and `completionEvidence`. Each step has `id`, `title`, `detail`, and `status`; optional fields are `dependsOn`, `approvalRequired`, `owner`, and `completionEvidence`.

Plan states are proposed, approved, in-progress, changed, blocked, and completed. **Approved is displayed as Approach reviewed — not action authorization.** Steps use pending, in-progress, waiting-approval, blocked, completed, and skipped. An approval checkpoint is visibly labeled as requiring separate action approval.

`planIssues` identifies incomplete metadata, missing outputs/steps, duplicate IDs, unknown dependencies, cycles, and a changed plan without a change summary. Invalid plans are presented as blocked. It is a bounded check for typed metadata, not validation of arbitrary JSON, operational feasibility, or permission.

Material structure is fingerprinted for the mounted id/version: objective, context reference, outputs, and step definitions/dependencies/approval flags/owners. Same-version changes warn that review is stale. Ordinary progress and evidence updates are not material-plan revisions. New material content needs a new plan version and an appropriate `changeSummary`; the host must invalidate dependent proposals and approvals. The UI cannot detect changes made before mount or to hidden data.

A completed step without nonempty application evidence is shown as Completion not verified. A completed plan needs overall evidence and no unfinished/unverified steps. These rules do not authenticate the supplied evidence. The view has no plan-approval or execution callback, fabricates no progress percentage, and is not an internal reasoning transcript.

## 4. Proposal Card

| Prop | Required | Contract |
|---|---|---|
| `proposal` | Yes | Existing `ActionProposal`, optionally with reviewBasis and contentPreview |
| `status` | Yes | draft, ready, modified, approved, rejected, expired, superseded |
| `rationale` | No | Plain-text explanatory material |
| `assumptions` | No | Plain-text array of assumptions/limitations |
| `onReview` | No | Synchronous navigation request, never approval or execution |
| `blockedReason` | No | User-safe reason to block opening an actionable review |
| `className` | No | Additional class |

The card shows the actor, exact target, consequence, effect, authority requested, recovery limits, supplied expiry, optional content, and review references. It is labeled Proposal — not executed, not styled as a successful action receipt. Text is rendered as text, not HTML.

`Review action` appears only when an `onReview` handler is provided. It is enabled only for valid ready/modified proposals. Draft, approved, rejected, expired, or superseded proposals cannot reopen actionable review through this control. Expiry is checked by timer and again on activation. Same-version material changes block review.

```ts
interface ReviewRequest {
  readonly proposalId: string;
  readonly proposalVersion: string;
}
```

Opening review is not consent. `onReview` should navigate or reveal the current Approval Gate; it must not execute, approve, silently renew a proposal, or persist blanket permission. The host should handle navigation failures and focus. The card emits no decision on mount, scrolling, or ordinary inspection.

## 5. Binding context, plan, and content

The existing proposal contract has two additive optional fields:

```ts
interface RevisionRef { readonly id: string; readonly version: string }
interface ReviewBasis {
  readonly context: RevisionRef;
  readonly plan: RevisionRef;
}
// ActionProposal additions:
// readonly reviewBasis?: ReviewBasis;
// readonly contentPreview?: string;
```

Both fields are included in `proposalFingerprint` and displayed by the Approval Gate at the final decision. Empty supplied previews or incomplete supplied references block review. Legacy callers may omit both fields; that does not establish evidence-bound review for those callers.

`reviewBasisMatches(proposal, context, plan)` compares the supplied IDs and versions, including the plan's context reference. It does not hash source bytes, check source freshness, compare plan fingerprints, authenticate origin, or enforce version immutability. A production service must own immutable canonical revisions, bind full action parameters/content to the authenticated principal, and revalidate policy, revocation, and expiry immediately before execution. Supplementary rationale or assumptions are not separately fingerprinted; when they materially change a decision, the host must issue a new proposal version rather than silently edit them.

A reference match does not turn a reviewed plan into authority. The existing `onDecision` callback still carries only proposalId, proposalVersion, and approve/reject. Completion still comes from a separate supplied action record, never from the review callback.

## 6. Minimal presentation example

```tsx
import { ContextPanel, PlanView, ProposalCard } from '@tun-systemic/react';
import type { ContextSnapshot, TaskPlan, ActionProposal, ReviewRequest } from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';

export function ReviewSummary({ context, plan, proposal, openReview }: {
  context: ContextSnapshot;
  plan: TaskPlan;
  proposal: ActionProposal;
  openReview(request: ReviewRequest): void;
}) {
  return <>
    <ContextPanel context={context} />
    <PlanView plan={plan} />
    <ProposalCard proposal={proposal} status="ready" onReview={openReview} />
  </>;
}
```

This only presents host-supplied records and forwards navigation. Add appropriate host validation and an Approval Gate separately. Do not wire `openReview` directly to publication.

## 7. Walk through the local lab

Follow [Getting Started](GETTING-STARTED.md) and open the lab on port 4173. The lab is deterministic and uses a supplied fixture note rather than model-generated research.

1. Inspect Task context: the note is Available but initially Not used.
2. Select Prepare plan. The local template reads the note and its usage is marked Used for this task.
3. Select Review approach. This records local plan review, not publication approval.
4. Select Create proposal. Inspect the exact content, context/plan versions, target, and recovery limits.
5. Select Review action. Focus moves to the separate approval area; nothing has executed.
6. Select Reject action, or explicitly select Simulate publish. Only a verified local record creates the receipt.

Changing Notes availability to Missing, Restricted, or Stale invalidates the earlier review and blocks generation until current available notes are restored. Revise plan adds a scope-reminder step, requires approach review again, and produces a new proposal/content version. The host checks versions and expiry at both decision time and immediately before the simulated write.

With Simulate an unconfirmed response enabled, the demo writes its in-memory action record but loses the acknowledgement. It blocks further proposals and mutations. Check simulated action record reads that record; it does not repeat publication. A missing record remains unknown rather than being treated as proof of failure. Previously verified receipts are retained when later context changes; the lab displays the latest retained receipt and a count, not a full history browser.

The ledger and de-duplication are confined to the page's memory, not a durable or trusted backend. Refresh clears the demo and does not undo real-world actions. The lab does not call an AI model, connect accounts, write persistent memory, publish, or send anything externally.

## 8. Accessibility and verification

Components use native structure, labels, disclosures, textual states, semantic tokens, wrapping content, and visible focus. The demo moves focus to the approval region and verified receipt. It keeps material details visible on narrow layouts and does not depend on animation timing for state changes.

The added tests cover source availability/usage, missing and restricted content, safe links, stale context, plan dependency issues and revisions, completion evidence, proposal status/expiry/content changes, explicit review versus approval, duplicate decisions, reconciliation, and retained receipts. The Chromium suite checks keyboard navigation and native disclosure activation, 320px layouts, long unbroken content, reduced motion, and automated accessibility samples in both themes. Read the [dated validation record](REVIEW-VALIDATION-v0.1.md) for observed results; authored tests are not automatically passed tests.

## 9. Remaining acceptance and adoption work

The planned isolated fresh-consumer install check is **not included or completed**. A bulk tool write containing that installer and CI changes was blocked, so those changes were omitted. Existing read-only workflow permissions and dependency versions remain unchanged. Archive inventory and workspace-export checks do not replace independent installation testing.

Cross-browser, manual assistive-technology, localization, full runtime-schema, framework hydration, RSC, production authorization, durable idempotency, revocation, real recovery, and full conformance work remain outside this increment. No certification, npm release, or hosted deployment is claimed.

**Human Intent. Machine Intelligence. Systemic Design.**
