# TUN Systemic Design
## Components v0.1

**Status:** Draft project component catalog.  
**Version:** 0.1; documentation revision September 28, 2026.  
**Implementation:** All fourteen patterns have reference React exports. Check the PR's exact validation and merge state; this is not full product conformance.

[Documentation index](README.md) · [Specification](SPECIFICATION-v0.1.md) · [Implementation matrix](STATUS-AND-ROADMAP.md) · [React API](REACT-COMPONENTS-v0.1.md) · [Review workflow](REVIEW-WORKFLOW-v0.1.md) · [Evidence and memory](EVIDENCE-AND-MEMORY-v0.1.md) · [Supervision and recovery](SUPERVISION-AND-RECOVERY-v0.1.md)

# 1. Purpose

TUN components are reusable interaction contracts between people and intelligent systems. This catalog describes intended anatomy, states, behavior, accessibility, and anti-patterns. It is not an API listing. Normative keywords follow the Specification; state lists describe design coverage, not necessarily the current React prop enums.

# 2. Component Design Rules

Components SHOULD be outcome-first, visibly attributable, honest about uncertainty, recoverable where feasible, calm, composable, and accessible. Proposals and actions MUST be distinguishable. Critical state and consequence MUST NOT depend on color alone. Authority belongs to the application, not the visual component.

# 3. Canonical Component Set

| Pattern | Current React status |
|---|---|
| Intent Composer | Implemented as `IntentComposer` |
| Agent Card | Implemented as `AgentCard` |
| Context Panel | Implemented as `ContextPanel` |
| Plan View | Implemented as `PlanView` |
| Proposal Card | Implemented as `ProposalCard` |
| Approval Gate | Implemented as `ApprovalGate` |
| Action Receipt | Implemented as `ActionReceipt` |
| Memory Indicator | Implemented as `MemoryIndicator` |
| Source View | Implemented as `SourceView` |
| Uncertainty Signal | Implemented as `UncertaintySignal` |
| Tool Activity | Implemented as `ToolActivity` |
| Agent Activity | Implemented as `AgentActivity` |
| Human Override | Implemented as `HumanOverride` |
| Recovery Control | Implemented as `RecoveryControl` |

Only symbols exported by [index.ts](../packages/react/src/index.ts) are available to import. AI Result and Failure State in composition examples are host surfaces, not additional canonical exports. Internal ControlAction is not a fifteenth public component.

# 4. Intent Composer

**Purpose:** Capture a desired outcome, constraints, context, and scope without requiring prompt-engineering knowledge.

**Anatomy:** A visibly labeled intent input and start action; the scope SHOULD be visible whenever consequential operations are possible. Files, targets, deadlines, suggested goals, and format constraints MAY be added when supported. Do not require a complex form for a simple goal.

**States:** Empty, Drafting, Ready, Submitting, Clarification needed, Blocked. Error/unconfirmed feedback must not claim external success.

**Behavior:** Natural language SHOULD be supported. Input labels MUST be explicit; submission and suggested actions MUST be keyboard reachable. Scope text does not grant backend permissions.

**Reference implementation:** Controlled text, `scope`, `onValueChange`, and `onSubmit`; optional settings are documented in the React guide. Attachments, voice, target pickers, and clarification orchestration are not implemented. Avoid hidden execution scope, raw exception text, and sensitive-input logging.

# 5. Agent Card

**Purpose:** Show who is acting, for what purpose, and with what authority.

**Anatomy:** Name, role/purpose, state, and authority summary SHOULD be present. Capabilities, connected tools, current task, history, memory, and symbolic identity MAY be added. Capability and authority must remain distinct.

**States:** Idle, Listening, Thinking, Planning, Waiting, Acting, Verifying, Blocked, Completed, Failed, Escalated.

**Behavior:** The card MUST NOT imply permissions the agent lacks. Autonomous operation SHOULD be visible. State MUST have a textual label. A persona is not proof of competence, consciousness, or authority.

**Reference implementation:** `AgentProfile`, state, optional current task; capabilities are separately disclosed. No execution, tool management, memory management, or override controls are implemented by this card.

# 6. Context Panel

**Purpose:** Explain information materially influencing a task.

**Anatomy:** Source identity/type, scope, availability, and session-versus-persistent context SHOULD be clear. Relevant files, time ranges, workspaces, preferences, and permitted people/location context MAY be shown.

**States:** No context, Active context, Partial context, Missing context, Restricted context.

**Behavior:** Material context SHOULD be inspectable with explicit/inferred information distinguished. Availability is not proof a source was used. Do not imply source access when permission is missing, and do not send unauthorized private content to the browser merely to hide it in a collapsed panel.

**Accessibility and anti-patterns:** Use named disclosures and readable source/state labels. Avoid hidden persistence, irrelevant private context, and unexplained inference.

**Reference implementation:** `ContextSnapshot`, source availability separate from used/not-used/unknown, readable persistence/provenance, optional native disclosure and limited safe links, and warnings for stale context. Restricted/missing source summaries and links are not rendered; the host must still remove private data before sending props. No retrieval, permission, or memory service is supplied. See [Review Workflow](REVIEW-WORKFLOW-v0.1.md#2-context-panel).

# 7. Plan View

**Purpose:** Communicate a useful approach, not an internal chain-of-thought transcript.

**Anatomy:** Objective, major steps, dependencies, approval points, and expected outputs SHOULD be shown. Responsible agents, measured progress, and supported effort estimates MAY be included.

**States:** Proposed, Approved, In progress, Changed, Blocked, Completed.

**Behavior:** Material plan changes SHOULD be highlighted. Approval of an approach does not automatically authorize every effectful action. The view MUST NOT imply that all hidden reasoning is exposed. Mark steps complete only from observed state.

**Accessibility and anti-patterns:** Use ordered structure, textual status, and clear blockers. Avoid unbounded internal logs, fake progress, or hidden plan revisions.

**Reference implementation:** `TaskPlan`, context ID/version, step dependencies, expected outputs, change summaries, and application evidence. Structural errors are displayed as blocked; same-version material changes warn that review is stale. Unsupported completion claims are downgraded. There is no authorization callback. See [Review Workflow](REVIEW-WORKFLOW-v0.1.md#3-plan-view).

# 8. Proposal Card

**Purpose:** Show what may happen before execution.

**Anatomy:** Proposed action, actor, target, expected effect, and recovery limitations MUST be present. Rationale, alternatives, evidence, uncertainty, and revision controls MAY be included.

**States:** Draft, Ready, Modified, Approved, Rejected, Expired. A replaced version should be identified as superseded when relevant.

**Behavior:** The card MUST look and read differently from an Action Receipt. Approved means authorized, not executed. Scrolling, navigating, or viewing MUST NOT count as approval. Review-relevant changes need a new proposal version.

**Accessibility and anti-patterns:** Preserve material details in the reading order, not tooltip-only text. Avoid success styling, vague consequence labels, and implicit consent.

**Reference implementation:** `ActionProposal`, `ProposalStatus`, optional rationale/assumptions, optional navigation-only `onReview`, and host blocking explanation. Content preview and review references are inspectable. Same-version material changes and expiry block opening review. The card's landmark name includes its proposal-stage label to distinguish it from final approval of the same action. See [Review Workflow](REVIEW-WORKFLOW-v0.1.md#4-proposal-card).

# 9. Approval Gate

**Purpose:** Obtain an explicit decision on a particular consequential proposal.

**Anatomy:** Action, actor, target, consequence, recovery limits, approve, and reject controls MUST be present. Modification and detail inspection SHOULD be available when practical. Persistent delegation settings MAY be a separate, clearly scoped choice; they must not be bundled into one-time approval.

**States:** Awaiting approval, Approved, Rejected, Expired, Superseded. Local Pending, Submitted, and Unknown phases must remain separate from execution status.

**Behavior:** C4 approval MUST be explicit for the particular proposal, consistent with Specification section 7.1. A general preference does not authorize it. Controls MUST be keyboard accessible and distinguishable, without deceptive defaults. Prefer Send email or Publish post to generic Continue. Changed versions restart review; they do not inherit consent.

**Reference implementation:** `proposal`, `status`, `approveLabel`, `onDecision`, optional `blockedReason` and `className`. `onDecision` emits ID, version, and approve/reject—not executable parameters. Optional proposal context/plan references and content preview are included in its fingerprint and displayed before approval. Unknown callback outcomes remain latched against automatic retry. The component blocks both decisions on invalid/expired reviews; the host should supply independent safe dismissal/escalation. It is not a cancellation or authorization service.

# 10. Action Receipt

**Purpose:** Show what actually happened and what remains unverified.

**Anatomy:** Action, actor, target, supplied timestamp, status, and recovery SHOULD be shown. Verification evidence, material parameters, tool, audit link, and supported recovery controls MAY be added.

**States:** Completed, Partially completed, Failed, Reversed, Pending verification. An unknown outcome is not proof of failure or absence of effects.

**Behavior:** C2–C4 actions SHOULD have receipts or equivalent inspectable records. A receipt MUST represent actual known state, not intent. Do not infer execution from a click or promise resolution. Compensation is not necessarily reversal.

**Reference implementation:** Host-supplied `ReceiptData`; successful-looking but unverified completion/reversal is downgraded to pending verification. Invalid timestamps are unavailable, not fabricated. Audit links receive limited URL checks. The host still validates provenance and permitted origins. This component supplies no recovery button or external verification service; a separate RecoveryControl can be composed where the host supports it.

# 11. Memory Indicator

**Purpose:** Explain context persistence when it materially influences interaction.

**Anatomy:** Presence, memory type, and scope SHOULD be visible; view/edit/disable controls MAY appear when actually supported.

**States:** No memory, Session only, Persistent memory active, Operational memory active, Memory unavailable.

**Behavior:** Distinguish M0–M3 as memory-use categories, not retention guarantees or maturity levels. The indicator SHOULD remain quiet when irrelevant. Remembered preference is not new authority. Do not claim all data is deleted when logs or backups remain.

**Accessibility and anti-patterns:** A readable label and named management controls replace color-only badges. Avoid surprise personalization, fake persistence, and misleading privacy promises.

**Reference implementation:** `MemoryRecord` with id/version, type M0–M3, active/inactive/unavailable state, scope, influence, and optional retention notice. Inconsistent metadata displays unavailable. `onInspect` emits a version-bound navigation request only for valid active memory. No memory mutation, persistence, or permissions are implemented. Announcements are opt-in. See [Evidence and Memory](EVIDENCE-AND-MEMORY-v0.1.md#2-memory-indicator).

# 12. Source View

**Purpose:** Expose evidence supporting a result while preserving access controls.

**Anatomy:** Source identity/type, relevant reference or excerpt, and relationship to the claim SHOULD be clear. Date, provenance, limitations, and an open-source control MAY be included.

**States:** Verified, Partial, Conflicting, Unavailable. Explain what Verified means; source retrieval alone does not verify every claim.

**Behavior:** Source material and generated synthesis MUST be distinct. Quotes MUST be distinguishable from paraphrases. Where sources cannot be opened, identify that limitation rather than provide fake links. Preserve material contradictory evidence.

**Accessibility and anti-patterns:** Meaningful link names and structured excerpts; no fabricated citations, unauthorized excerpts, or source-like generated text.

**Reference implementation:** `EvidenceCollection` groups sources around a specific claim. Quotes, paraphrases, and generated interpretations are labeled separately. Restricted/unavailable records omit readable content and links. Declared contradictions remain visible. A checked summary requires supporting non-generated source material and described application checks, but does not authenticate truth. Hosts filter private data before transmission. See [Evidence and Memory](EVIDENCE-AND-MEMORY-v0.1.md#3-source-view).

# 13. Uncertainty Signal

**Purpose:** Communicate material ambiguity, inference, or missing evidence.

**Anatomy:** Qualitative level, explanation, and relevant next step SHOULD be present when shown.

**Levels:** U0 Confirmed, U1 High Confidence, U2 Inferred, U3 Unknown. These are not calibrated numeric probabilities. State the scope and basis of any confidence label.

**Behavior:** Show uncertainty when it affects safety, decisions, resources, identity, external communication, or irreversible effects. Do not infer truth from green styling or a model's unsupported confidence statement.

**Accessibility and anti-patterns:** Use text and context rather than color alone. Avoid fake numeric precision, decorative certainty badges, unnecessary warnings, and hidden known limitations.

**Reference implementation:** `UncertaintyAssessment` with scope, level, explanation, supporting basis, and optional next step. U0/U1 wording explicitly limits the claim to its scope. Invalid or unsupported metadata falls back to U3 Unknown with a correction notice. A label is neither independent verification nor authorization. See [Evidence and Memory](EVIDENCE-AND-MEMORY-v0.1.md#4-uncertainty-signal).

# 14. Tool Activity

**Purpose:** Show external-system operations when meaningful to control, privacy, cost, or outcome.

**Anatomy:** Tool/category, activity, and status SHOULD be clear. Name, permission scope, affected resource, and elapsed work MAY be included when safe.

**Categories:** Searching, Reading, Writing, Sending, Publishing, Transacting, Executing code, Accessing private data, Changing permissions.

**Behavior:** Summarize low-level calls rather than flood the user. Activity and completion must reflect observed operations; a proposed tool call is not a completed one. Token states include idle, active, waiting, completed, and failed; they do not implement a tool service.

**Accessibility and anti-patterns:** Throttled useful status announcements, no sensitive payload dumps or meaningless perpetual animation.

**Reference implementation:** ToolActivityRecord adds tool, category, target, and declared authority to a scoped ActivityRecord. It shows observation time, known effects, optional measured progress, blockers, and host evidence. Unsupported terminal claims display unverified. No polling or tool execution is implemented. See [Supervision and Recovery](SUPERVISION-AND-RECOVERY-v0.1.md#3-tool-activity).

# 15. Agent Activity

**Purpose:** Explain what an agent is doing now.

**Anatomy:** Agent identity, current state, and task SHOULD be visible. Measured progress, delegation, blockers, and an expected next state MAY be added.

**Behavior:** Use factual language such as Reviewing 12 documents only when that work is actually observed. Distinguish waiting, acting, verification, and completion. Do not imply subjective experience or guaranteed progress.

**Accessibility and anti-patterns:** Keep announcements calm and meaningful, not every streamed token. Avoid hidden blockers and fake progress percentages.

**Reference implementation:** ActivityRecord supplies identity/version, actor, task, scope, observed status, effects, and timestamp. Optional progress is bounded metadata, not a completion guarantee. AgentActivity has its own observation contract, distinct from AgentCard's state labels. See [Supervision and Recovery](SUPERVISION-AND-RECOVERY-v0.1.md#2-agent-activity).

# 16. Human Override

**Purpose:** Provide real intervention in autonomous behavior.

**Anatomy:** Pause, Stop, Cancel, Take control, Change scope, Revoke permission, or Escalate as actually supported. Level 4 systems MUST have meaningful intervention; controls SHOULD remain easy to access during long-running work.

**States:** Available, Engaged, Pending stop, Stopped, Unavailable.

**Behavior:** A stop request is not confirmation of stoppage. Explain in-flight or partial effects and what cannot be interrupted. Preserve audit history. A disabled review gate or page reset is not a Human Override.

**Accessibility and anti-patterns:** A persistent, plainly named keyboard-operable control where applicable; no hidden stop buttons, fake cancellation, or unsupported guarantees.

**Reference implementation:** HumanOverride presents a version-bound InterventionOperation and emits identity-only onRequest. Pause/stop/cancel/take-control/revoke/escalate are supported request kinds; changing scope is host orchestration, not an additional built-in kind. The local latch separates pending/acknowledged/unknown from host-confirmed completion. ControlEvidence must match control and run revisions. Actual intervention and global control placement belong to the host. See [Supervision and Recovery](SUPERVISION-AND-RECOVERY-v0.1.md#5-human-override).

# 17. Recovery Control

**Purpose:** Offer a supported response to failure, error, or unwanted effects.

**Anatomy:** Undo, Retry, Restore, Rollback, Reopen, Revise, or reconciliation as appropriate, with scope and limitations.

**States:** Available, Executing, Completed, Failed, Not possible.

**Behavior:** Controls MUST match actual capabilities and MUST NOT imply undo when impossible. Distinguish restoring prior state, compensating an effect, retrying work, and resetting a demo. Check authoritative state before retrying an unknown external action to avoid duplicate effects.

**Accessibility and anti-patterns:** Explain the resulting effect and announce known outcomes. Avoid fake undo, unexplained duplicate-prone retries, or support-only recovery when a practical interface path exists.

**Reference implementation:** RecoveryOperation adds originalOutcome and optional retrySafety. Unknown original outcomes permit only reconciliation; retry with a known outcome also requires a described host safeguard. Undo/retry/restore/rollback/compensate/revise/reconcile are request kinds, not recovery services. Reopen remains host orchestration. Bound host evidence is needed for terminal labels, and compensation is explicitly not undo. See [Supervision and Recovery](SUPERVISION-AND-RECOVERY-v0.1.md#6-recovery-control).

# 18. Composition Patterns

Patterns are design recipes, not exported workflow engines.

| Pattern | Composition |
|---|---|
| Simple Assist | Intent Composer → host result → Source View → Uncertainty Signal |
| Proposed Action | Intent Composer → Context Panel → Plan View → Proposal Card → Approval Gate → host execution/verification → Action Receipt |
| Autonomous Agent | Agent Card → Plan View → Agent/Tool Activity → Human Override → Action Receipt |
| Memory-Aware Assistant | Intent Composer → Memory Indicator → Context Panel → host result |
| Recovery | Action Receipt → host failure/unknown-state explanation → Recovery Control → updated receipt |

The React lab exercises all fourteen reference components through review, contextual evidence, memory/evidence fixtures, and a separate stepped supervision/recovery simulation. It is not an implementation of every recipe, a persistent-memory service, or a trusted backend.

# 19. Component Priority by Consequence

| Class | Recommended design emphasis |
|---|---|
| C0 | Intent, sources, and material uncertainty |
| C1 | Context and practical local recovery |
| C2 | Proposal, accountability, and shared-state recovery |
| C3 | Clear effects, explicit approval or bounded delegation, receipt, meaningful tool visibility |
| C4 | Explicit proposal approval, visible material consequences, verification/accountability, and intervention where autonomous work occurs |

This is composition guidance, not permission to omit an applicable MUST. A C4 implementation needs the approval contract, not necessarily two visually redundant cards. Evidence and uncertainty depend on the decision; override depends on autonomous execution; recovery depends on actual capability.

# 20. Component State Language

Prefer Ready, Waiting, Reviewing, Planning, Acting, Verifying, Blocked, Completed, Failed, and Reversed with explanatory scope. Keep operational state, autonomy, consequence, approval, uncertainty, and verification separate. Fictional personification must not mislead about capability or experience.

# 21. Design Token Categories

The token source now exists. Actual paths include:

```text
theme.light.state.agent.acting
theme.light.state.agent.waiting
theme.light.state.approval.awaiting
theme.light.state.approval.approved
theme.light.state.uncertainty.U2
theme.light.state.consequence.C4
```

Dark-theme paths use `theme.dark`. The exporter emits names such as `--tun-state-consequence-c4`. The earlier shorthand `state.approval.required`, `state.uncertainty.inferred`, and `state.consequence.high` was illustrative and is not the shipped API. Read [Visual System](DESIGN-TOKENS-AND-VISUAL-SYSTEM-v0.1.md) for supported types and mappings. Values control presentation, never authorization or truth.

# 22. Accessibility Requirements

Interactive controls MUST be keyboard operable, named, and visibly focusable; critical state MUST NOT rely only on color. Components SHOULD provide semantic structure, useful status announcements, reduced-motion behavior, and manageable cognitive load. Approval, rejection, override, and recovery MUST be especially clear. Automated samples do not replace manual and assistive-technology review.

# 23. Responsive Behavior

Components SHOULD remain understandable on desktop, mobile, embedded, conversational, and agent-workspace surfaces. Critical actions SHOULD remain visible on small screens. High-consequence approval MUST NOT be hidden behind horizontal scrolling or collapsed material details by default. A specified surface is not a claim of a tested adapter for that platform.

# 24. Implementation Guidance

Separate presentation, state, authority, action logic, and audit data. Avoid model-specific assumptions in reusable components. Authority and verification services are outside the UI trust boundary. The [architecture guide](ARCHITECTURE.md) shows which parts this repository actually supplies.

# 25. Example Component Contract

The source-of-truth React contract is exported, not the old illustrative onApprove/onReject shape:

```ts
import type { ApprovalGateProps, ActionProposal, DecisionRequest } from '@tun-systemic/react';

// ActionProposal includes actor, consequence, effect, authority, recovery,
// a stable ID/version, optional expiry, and optional reviewBasis/contentPreview.
type DecisionHandler = ApprovalGateProps['onDecision'];
// DecisionRequest contains proposalId, proposalVersion, and decision.
```

Use ApprovalGate with proposal, status, approveLabel, and onDecision. The callback requests a decision, not authorization infrastructure. Full props and timestamp restrictions are in [React Components](REACT-COMPONENTS-v0.1.md); context, plan, and content binding are in [Review Workflow](REVIEW-WORKFLOW-v0.1.md). TypeScript types are not runtime validation of untrusted JSON.

# 26. Component Review Checklist

What human problem is solved? Who acts? Under what authority? Is current state understandable? What changes? What is uncertain? How does the user intervene or recover? Can it be used without color-only, motion-only, or pointer-only cues? Is every exposed detail useful? Record evidence and known omissions rather than a blanket conformance claim.

# 27. Direction for v0.2

The visual tokens and all fourteen reference React components exist. Remaining work includes real host integration, detailed state matrices, visual anatomy examples, localization, broader browser/accessibility validation, runtime schemas, design-tool adapters, and scoped conformance evidence. The isolated offline consumer test covers the canonical exports; broader framework/hydration validation remains outstanding. See the [roadmap](STATUS-AND-ROADMAP.md) rather than treating this list as delivered functionality.

**Human Intent. Machine Intelligence. Systemic Design.**
