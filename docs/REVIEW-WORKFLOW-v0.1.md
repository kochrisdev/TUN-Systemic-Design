# Context, plan, and proposal review workflow v0.1

**Status:** Seven-component review-flow subset of the fourteen-component reference library.  
**Revision:** September 28, 2026.  
**Package:** @tun-systemic/react 0.1.0, private and unpublished. Identify builds by source SHA and digest.

[Documentation index](README.md) · [Core API](REACT-COMPONENTS-v0.1.md) · [Status](STATUS-AND-ROADMAP.md) · [Evidence](EVIDENCE-AND-MEMORY-v0.1.md) · [Supervision](SUPERVISION-AND-RECOVERY-v0.1.md)

## 1. Scope

This guide describes the review-flow subset originally delivered by adding ContextPanel, PlanView and ProposalCard to the first four components. ActionProposal has optional review-basis references and plain-text content preview. Approval, authority, execution and verification retain separate meanings.

The library also supplies memory/evidence views and four supervision/recovery request/observation components. No model or production action runtime is supplied. The supervision fixture is separate and does not control the publication-review lab.

```text
IntentComposer → ContextPanel → PlanView → ProposalCard
                                            ↓
                                      ApprovalGate
                                            ↓
                           host execution and verification
                                            ↓
                                      ActionReceipt

AgentCard identifies the actor and declared authority alongside this flow.
```

The lab orchestrates reusable presentation contracts locally, not through an exported workflow engine or trusted service.

## 2. Context Panel

| Prop | Required | Contract |
|---|---|---|
| context | Yes | ContextSnapshot: id, version, scope, sources, optional changeSummary |
| title | No | Task context |
| className | No | Additional class |

A source has id, label, kind (file/note/memory/tool/other), scope, persistence and provenance (provided/retrieved/inferred). Persistence is task/session/persistent/operational: context use, not retention/training policy or a replacement for M0–M3.

| Availability | Typed fields | Display |
|---|---|---|
| available | usage; optional summary, detailsUrl, observedAt | Available plus Used/Not used/Usage not confirmed |
| stale | Same fields | Freshness warning and independent usage |
| missing | usage: not-used; no content/link | Missing; content unavailable |
| restricted | usage: not-used; no content/link | Restricted; content unavailable |

The component derives No/Active/Partial/Missing/Restricted context. Availability never implies usage. Summaries use native disclosures; links use the limited URL helper; invalid timestamps remain unavailable.

Restricted/missing content and links are not rendered, including unexpected extra fields. This is defense in depth, not access control. The host redacts before transmission, including sensitive labels or existence. No retrieval, freshness calculation or permission changes occur.

## 3. Plan View

| Prop | Required | Contract |
|---|---|---|
| plan | Yes | TaskPlan: id/version, context reference, objective, status, steps, expectedOutputs |
| title | No | Proposed approach |
| className | No | Additional class |

Optional plan fields are changeSummary, blockers and completionEvidence. Steps require id/title/detail/status; optional dependsOn, approvalRequired, owner and completionEvidence.

Plan states are proposed, approved, in-progress, changed, blocked and completed. Approved displays **Approach reviewed — not action authorization**. Step states are pending, in-progress, waiting-approval, blocked, completed and skipped. Approval checkpoints visibly require a separate action decision.

planIssues detects incomplete metadata, missing steps/outputs, duplicate IDs, unknown dependencies, cycles and changed plans without explanation. Invalid plans display blocked. These are bounded typed-metadata checks, not arbitrary-JSON validation, feasibility or permission.

The mounted id/version fingerprints objective, context, outputs and step definitions/dependencies/approval flags/owners. Same-version material changes warn of stale review. Progress/evidence updates alone are not material revisions. Material changes require a new version and appropriate explanation; the host invalidates dependent proposals. The UI cannot detect pre-mount edits or hidden-data changes.

Completed steps require meaningful application evidence. A completed plan needs overall evidence and no unfinished/unverified steps. The UI cannot authenticate evidence. There is no plan-authorization callback, fabricated percent or internal reasoning transcript.

## 4. Proposal Card

| Prop | Required | Contract |
|---|---|---|
| proposal | Yes | ActionProposal, optional reviewBasis/contentPreview |
| status | Yes | draft, ready, modified, approved, rejected, expired, superseded |
| rationale | No | Plain-text explanation |
| assumptions | No | Plain-text limitations array |
| onReview | No | Synchronous navigation request, not consent/execution |
| blockedReason | No | User-safe review-blocking explanation |
| className | No | Additional class |

The card shows actor, exact target, consequence, effect, requested authority, recovery, expiry and optional content/references. Approved proposals say execution is tracked separately, not successful. Text is not HTML.

Review action appears only with onReview and is enabled only for valid ready/modified proposals. Expiry is checked by timer and at activation; same-version material changes block review. Other statuses cannot reopen actionable review.

```ts
interface ReviewRequest {
  readonly proposalId: string;
  readonly proposalVersion: string;
}
```

onReview navigates to the current ApprovalGate. It must not approve, execute, renew a proposal or persist blanket authority. Hosts handle navigation failures/focus. Mounting, scrolling or inspection emits no decision.

## 5. Binding context, plan, and content

```ts
interface RevisionRef { readonly id: string; readonly version: string }
interface ReviewBasis {
  readonly context: RevisionRef;
  readonly plan: RevisionRef;
}
// Additive ActionProposal fields:
// readonly reviewBasis?: ReviewBasis;
// readonly contentPreview?: string;
```

Both fields are fingerprinted and displayed at the gate. Empty supplied previews or incomplete references block review. Legacy callers may omit them without establishing evidence-bound review.

reviewBasisMatches compares IDs/versions and the plan's context reference. It does not hash bytes, verify freshness, compare plan fingerprints, authenticate origin or enforce immutability. Production services own canonical revisions, bind content/parameters to the principal and revalidate policy/revocation/expiry immediately before effects.

Supplementary rationale/assumptions are not separately fingerprinted; material changes require a new proposal version. Reference matching does not turn approach review into authority. onDecision carries only proposalId, proposalVersion and approve/reject; completion comes from a separate action record.

Memory/evidence metadata does not change these rules. A material evidence change invalidates canonical review; a confidence badge cannot authorize an old or new action. Recovery or intervention requests likewise need their own appropriate scope and host checks.

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

This only displays records and forwards navigation. Add host validation and ApprovalGate separately. Never wire openReview directly to publication.

## 7. Walk through the local lab

Follow [Getting Started](GETTING-STARTED.md). The lab uses deterministic fixture notes, not model-generated research.

1. Inspect Task context: Available initially means Not used.
2. Prepare plan reads the local note and marks it Used for this task.
3. Review approach records plan review, not publication approval.
4. Create proposal shows exact content, revisions, target and recovery limits.
5. Review action moves focus to the approval area; nothing executes.
6. Reject action or explicitly Simulate publish. Only a verified local record creates a receipt.

Missing/restricted/stale notes invalidate reviews and block generation. Revise plan adds a scope reminder, clears approach review and creates new plan/proposal versions. The host checks revision/expiry at decision time and before its simulated write.

A lost acknowledgement produces unknown state and blocks new proposals/mutations. Check simulated action record reads rather than repeats publication. Missing evidence stays unknown, not failed. Earlier verified receipts survive later context changes; the UI shows the latest and a count rather than a full history browser.

Evidence/memory views explain context without changing authority. Their synthetic explorer supplies no inputs to this workflow. The separate supervision fixture demonstrates stop/compensation/reconciliation and does not govern this publication flow. Production suitability remains Unknown.

Ledger and deduplication exist only in page memory. Refresh clears the demonstration, not real effects. There are no model calls, account connections, persistent writes or external sends.

## 8. Accessibility and verification

Native structure, labels, disclosures, semantic tokens, wrapping and visible focus are used. Focus moves to approval and receipt regions. Material details remain visible on narrow screens; state changes do not depend on animation timing.

Tests cover source access/use, safe links, stale context, dependencies/revisions, evidence, status/expiry/material changes, review versus consent, duplicate decisions, reconciliation and retained records. Chromium samples include keyboards, 320px/long-text layouts, reduced motion, color transitions and both themes. The [workflow](REVIEW-VALIDATION-v0.1.md) and [consumer](CONSUMER-VALIDATION-v0.1.md) reports preserve earlier snapshots. [PR 6](https://github.com/kochrisdev/TUN-Systemic-Design/pull/6) tracks the fourteen-component increment. Authored tests are not automatically passed.

## 9. Remaining acceptance and adoption work

The isolated-install gap is closed by the offline consumer test. Its current fixture targets fourteen static renders, seven negative declaration cases, fresh external-directory installation, its own lockfile reinstall and package/CSS resolution. It uses locked local dependencies without lifecycle scripts, network fallback or new workflow permissions.

Static rendering does not prove hydration or CSS bundlers. Broader browsers, assistive technologies, localization, complete runtime schemas, frameworks, registry distribution, production authorization, durable idempotency, cancellation, recovery services and full conformance remain adoption work. No certification, npm release or hosted deployment is claimed.

**Human Intent. Machine Intelligence. Systemic Design.**
