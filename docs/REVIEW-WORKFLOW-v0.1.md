# Context, plan, and proposal review workflow v0.1

**Status:** Seven-component review-flow subset of the ten-component reference library; PR history records acceptance of each revision.  
**Revision:** September 28, 2026.  
**Package:** @tun-systemic/react 0.1.0, repository-local and unpublished. Identify builds by source commit and archive digest.

[Documentation index](README.md) · [Core React API](REACT-COMPONENTS-v0.1.md) · [Implementation matrix](STATUS-AND-ROADMAP.md) · [Evidence and memory](EVIDENCE-AND-MEMORY-v0.1.md) · [Historical workflow evidence](REVIEW-VALIDATION-v0.1.md)

## 1. Scope

This guide describes the review-flow subset originally delivered by adding ContextPanel, PlanView, and ProposalCard to the first four components. ActionProposal includes optional review-basis references and a plain-text content preview. Approval, authority, execution, and verification retain separate meanings.

The library now also includes MemoryIndicator, SourceView, and UncertaintySignal; their contracts and lab integration are in [Evidence and Memory](EVIDENCE-AND-MEMORY-v0.1.md). Four supervision/recovery patterns remain specified only. No model or production action runtime is supplied.

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

These are reusable presentation contracts. The lab orchestrates them locally, not through an exported workflow engine or production authorization service.

## 2. Context Panel

| Prop | Required | Contract |
|---|---|---|
| context | Yes | ContextSnapshot: id, version, scope, sources, optional changeSummary |
| title | No | Task context |
| className | No | Additional class |

A source has id, label, kind (file/note/memory/tool/other), scope, persistence, and provenance (provided/retrieved/inferred). Persistence is task, session, persistent, or operational: context use, not storage/deletion/training policy or replacement for M0–M3.

| Availability | Permitted typed fields | Display |
|---|---|---|
| available | usage; optional summary, detailsUrl, observedAt | Available plus Used / Not used / Usage not confirmed |
| stale | Same as available | Freshness warning and independently reported usage |
| missing | usage: not-used; no content/link fields | Missing; content unavailable |
| restricted | usage: not-used; no content/link fields | Restricted; content unavailable |

The component derives No / Active / Partial / Missing / Restricted context. Availability never implies usage. Optional summaries use native disclosures, links use the limited URL helper, and malformed timestamps display Time unavailable.

Missing/restricted content and links are not rendered, including unexpected extra fields. This is defense in depth, not access control. The host removes unauthorized content and sensitive metadata before sending props. Even disclosing a source label or existence requires permission. The component does no retrieval, freshness calculation, or permission changes.

## 3. Plan View

| Prop | Required | Contract |
|---|---|---|
| plan | Yes | TaskPlan: id/version, context reference, objective, status, steps, expectedOutputs |
| title | No | Proposed approach |
| className | No | Additional class |

Optional plan fields: changeSummary, blockers, completionEvidence. Steps require id, title, detail, status; optional fields are dependsOn, approvalRequired, owner, completionEvidence.

Plan states: proposed, approved, in-progress, changed, blocked, completed. Approved displays as **Approach reviewed — not action authorization**. Steps use pending, in-progress, waiting-approval, blocked, completed, skipped. Approval checkpoints explicitly require separate action approval.

planIssues detects incomplete metadata, missing outputs/steps, duplicate IDs, unknown dependencies, cycles, and changed plans without a change summary. Invalid plans display blocked. These bounded metadata checks do not validate arbitrary JSON, feasibility, or permission.

The mounted id/version fingerprints objective, context reference, outputs, and step definitions/dependencies/approval flags/owners. Same-version material changes warn of stale review. Progress and evidence updates alone are not material revisions. Changed material needs a new version and meaningful changeSummary; the host invalidates dependent proposals/approvals. The UI cannot detect edits made before mounting or changes to hidden data.

Completed steps need nonempty application evidence. Completed plans need overall evidence and no unfinished/unverified steps. These rules do not authenticate evidence. PlanView has no plan-approval/execution callback, fabricates no progress percentage, and is not an internal reasoning transcript.

## 4. Proposal Card

| Prop | Required | Contract |
|---|---|---|
| proposal | Yes | ActionProposal, optionally with reviewBasis/contentPreview |
| status | Yes | draft, ready, modified, approved, rejected, expired, superseded |
| rationale | No | Plain-text explanatory material |
| assumptions | No | Plain-text limitations array |
| onReview | No | Synchronous navigation request; never consent or execution |
| blockedReason | No | User-safe reason blocking actionable review |
| className | No | Additional class |

The card shows actor, exact target, consequence, effect, authority, recovery, expiry, and optional content/references. It distinguishes a proposal from an action receipt. Approved proposals say execution is tracked separately; approval does not imply success. Text is not treated as HTML.

Review action appears only with onReview. It is enabled only for valid ready/modified proposals. Draft, approved, rejected, expired, or superseded proposals cannot reopen actionable review. Expiry is checked by timer and on activation. Same-version material changes block review.

```ts
interface ReviewRequest {
  readonly proposalId: string;
  readonly proposalVersion: string;
}
```

onReview should navigate to the current Approval Gate. It must not approve, execute, silently renew a proposal, or persist blanket permission. The host handles navigation failures/focus. No decision is emitted by mounting, scrolling, or inspection.

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

Both fields are fingerprinted and displayed by ApprovalGate. Empty supplied previews or incomplete references block review. Legacy callers can omit them, without establishing evidence-bound review.

reviewBasisMatches compares supplied IDs/versions and the plan's context reference. It does not hash source bytes, verify freshness, compare plan fingerprints, authenticate origin, or enforce immutable revisions. Production services own canonical revisions, bind content/parameters to authenticated principals, and revalidate policy/revocation/expiry immediately before effects.

Supplementary rationale and assumptions are not separately fingerprinted. If they materially change a decision, the host issues a new proposal version. Reference matches do not turn approach review into authority. onDecision still carries only proposalId, proposalVersion, and approve/reject. Completion comes from a separate action record.

Memory/evidence metadata does not alter this contract. A material evidence change must invalidate the relevant canonical context and proposal; a confidence or source-check badge does not authorize an old or new action.

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

This displays records and forwards navigation only. Add host validation and ApprovalGate separately. Never wire openReview directly to publication.

## 7. Walk through the local lab

Follow [Getting Started](GETTING-STARTED.md), then open port 4173. The lab uses deterministic fixture notes, not model-generated research.

1. Inspect Task context: Available initially means Not used.
2. Prepare plan reads the local note and marks it Used for this task.
3. Review approach records plan review, not publication approval.
4. Create proposal exposes exact content, revisions, target, and recovery limits.
5. Review action moves focus to the approval area; nothing executes.
6. Reject action or explicitly Simulate publish. Only a verified local record creates a receipt.

Missing, Restricted, or Stale notes invalidate earlier reviews and block generation until current available notes are restored. Revise plan adds a scope reminder, clears approach approval, and produces a new proposal/content version. The host checks revisions/expiry at decision time and again immediately before its simulated write.

An unconfirmed-response scenario writes an in-memory record but loses acknowledgement. New proposals and mutations stay blocked. Check simulated action record reads the record instead of repeating publication. Missing evidence remains unknown, not proof of failure. Earlier verified receipts survive subsequent context changes; the UI displays the latest and a count, not a complete history browser.

The evidence/memory section explains the current context without changing approval state. Its separate synthetic fixture explorer demonstrates edge states but contributes no input or authority to this workflow. Production suitability remains Unknown; the local fixture does not substantiate a production claim.

Ledger and deduplication live only in page memory. Refresh clears the demonstration; it does not undo real-world actions. The lab makes no model calls, connections, persistent writes, publications, or external sends.

## 8. Accessibility and verification

Native structure, labels, disclosures, textual states, semantic tokens, wrapping content, and visible focus are used. The lab moves focus to approval and verified receipt regions. Material details remain visible on narrow layouts. State transitions do not depend on animation timing.

Tests cover availability/usage, restricted content, safe links, stale context, dependencies/revisions, evidence, status/expiry/content changes, review versus consent, duplicate decisions, reconciliation, and retained receipts. Chromium checks keyboard/disclosure behavior, 320px/long-text layouts, reduced motion, color-state transitions, and light/dark accessibility samples. [Workflow](REVIEW-VALIDATION-v0.1.md) and [consumer](CONSUMER-VALIDATION-v0.1.md) records preserve the earlier seven-component validation; [PR 5](https://github.com/kochrisdev/TUN-Systemic-Design/pull/5) records the expanded library's exact runs. Authored tests are not automatically passed tests.

## 9. Remaining acceptance and adoption work

The former isolated-install gap was closed by the offline consumer test. Its current fixture covers fresh installation outside the workspace, own-lockfile reinstall, declaration compilation, ten static renders, and package/CSS-path resolution. It uses already-locked local dependencies without lifecycle scripts, network fallback, or new workflow permissions. See the historical [Consumer validation](CONSUMER-VALIDATION-v0.1.md) and current PR evidence for their respective source snapshots.

Static rendering does not exercise hydration or CSS bundlers. Cross-browser, manual assistive-technology, localization, complete runtime schemas, framework/server-component boundaries, registry distribution, production authorization, durable idempotency, revocation, real recovery, and complete conformance remain adoption work. No certification, npm release, or deployment is claimed.

**Human Intent. Machine Intelligence. Systemic Design.**
