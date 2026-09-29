# TUN Systemic Design
## Specification v0.1

**Status:** Draft project specification.  
**Version:** 0.1; documentation revision September 29, 2026.  
**Implementation:** Fourteen reference React components; see the [implementation matrix](STATUS-AND-ROADMAP.md).

[Documentation index](README.md) · [Component catalog](COMPONENTS-v0.1.md) · [Implementation status](STATUS-AND-ROADMAP.md) · [Scope and non-claims](SCOPE.md) · [Revision findings](DOCUMENTATION-AUDIT-v0.1.md)

# 1. Purpose

TUN defines how people understand, authorize, and verify AI actions. These requirements connect intent, context, agents, tools, and memory with explicit decisions, observable outcomes, and usable recovery.

Requirements apply to the declared product scope and the actor responsible for enforcing them. Product-wide responsibilities and validation coverage are collected in [Scope and non-claims](SCOPE.md).

# 2. Normative Language

Uppercase **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** express requirement strength. Lowercase uses are ordinary prose. This convention follows [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

## MUST

Necessary for conformance to an applicable requirement.

## MUST NOT

Prohibited within the applicable scope.

## SHOULD

Recommended; a departure needs a documented reason and assessment of its consequences.

## SHOULD NOT

Normally avoided; an exception needs a documented justification.

## MAY

Optional. Implementing an optional capability does not exempt it from applicable safety, privacy, or accessibility requirements.

# 3. Core System Model

A product SHOULD be designed around the continuous relationship:

```text
HUMAN → INTENT → AI → REASON → ACT → OBSERVE → LEARN → HUMAN
```

The system MUST NOT assume that greater capability removes the need for meaningful human understanding, authority, or intervention. Human authority means authorized roles operating within legitimate permissions and applicable constraints—not permission to override another person's rights or account controls.

# 4. Core Interaction Model

```text
ASK → THINK → PROPOSE → ACT → LEARN
```

For a consequential action requiring review:

```text
ASK → THINK → PROPOSE → APPROVE → ACT → VERIFY → LEARN
```

These are conceptual stages, not a required linear runtime state machine. A product MAY omit unnecessary stages. Skipping a stage MUST NOT bypass required authorization, verification, or disclosure. Agent, approval, execution, and verification states are separate concepts.

## 4.1 ASK

The system MUST establish sufficient understanding before consequential action. It SHOULD capture the desired outcome, scope, target, timing, constraints, authority, and material assumptions. It SHOULD avoid unnecessary clarification when safe progress is possible.

## 4.2 THINK

The system MAY retrieve context, plan, and compare alternatives. It SHOULD communicate a useful approach, relevant assumptions, dependencies, limitations, and material consequences. This is a user-facing plan or rationale, not a requirement to expose hidden chain-of-thought or internal computation.

## 4.3 PROPOSE

When human judgment is required, the system MUST distinguish a proposal from an executed action. It SHOULD state the action, target, effect, reason, authority requested, and recovery limitations. Material changes require a new review rather than silently inheriting approval.

## 4.4 ACT

The system MUST act only within authorized scope. It MUST distinguish generation, local changes, shared changes, external communications, transactions, permission changes, and irreversible effects. A resolved UI callback does not establish that any effect occurred.

## 4.5 LEARN

The system MAY adapt using permitted feedback or context. Persistent learning MUST respect user control and product policy. Temporary context MUST NOT be described as persistent memory. LEARN does not imply automatic model training; reuse of context, preference storage, evaluation, and model updates need distinct descriptions and permissions.

# 5. TUN Principles

## 5.1 Transparent

The system MUST make material AI behavior understandable. It SHOULD identify what is happening, what happened, the responsible actor, relevant tools, and the next available control.

## 5.2 User Sovereign

The system MUST preserve meaningful human authority over consequential actions. Users SHOULD be able to approve, reject, modify, interrupt, undo where possible, or escalate within their authorized roles.

## 5.3 Natural

The system SHOULD support natural expression of intent without requiring knowledge of model architecture, orchestration, or prompt engineering.

## 5.4 Systemic

Design MUST account for people, models, agents, tools, context, memory, data, actions, and outcomes together. Local interface simplicity must not hide material effects elsewhere in the system.

## 5.5 Adaptive

The system MAY adapt to context. Adaptation SHOULD be understandable and SHOULD NOT produce unexplained material changes in authority or behavior.

## 5.6 Reversible

Actions SHOULD be reversible where feasible. Material irreversible effects MUST be disclosed before execution. Compensation or deletion after publication is not necessarily restoration of the original state.

## 5.7 Composable

Capabilities SHOULD be modular so models, tools, agents, and interfaces can change without silently altering the human control contract.

## 5.8 Calm

The system SHOULD reduce cognitive load and expose complexity only when it matters to understanding, control, risk, or decision quality.

# 6. Autonomy Model

Autonomy describes a delegated operation, not an intelligence score or permission grant. Different operations in one product MAY use different levels.

| Level | Name | Contract |
|---|---|---|
| 0 | Human Only | Manual tools without AI assistance |
| 1 | AI Assists | Information, drafts, analysis, or recommendations; the human performs consequential actions |
| 2 | AI Proposes | Prepared actions wait for human approval |
| 3 | AI Acts | Execution within intentionally delegated, bounded authority |
| 4 | AI Operates | Pursuit of delegated goals, potentially using multiple tools or agents |

Level 4 systems MUST provide defined authority, operating boundaries, monitoring, exception handling, action history, and meaningful human intervention. A profile label alone does not meet these requirements.

## 6.1 Autonomy Escalation Rule

As autonomy increases, observability, accountability, and recovery planning MUST increase proportionally to the consequences. A Level 4 experience MUST NOT provide less meaningful visibility than Level 2 for comparable consequential actions. Irreversible actions remain irreversible; increased autonomy cannot manufacture recoverability.

# 7. Consequence Model

Consequence describes the effect of an action, not technical complexity or confidence. Classify the whole effect, including notifications, disclosures, and downstream changes. The examples below are contextual, not universal domain-risk classifications.

| Class | Name | Typical effect |
|---|---|---|
| C0 | Informational | An answer or recommendation without an external state change |
| C1 | Local Reversible | A local draft or preference change that can be restored |
| C2 | Shared Reversible | A bounded shared-state change with a reliable restoration path |
| C3 | External Consequential | Communication, publication, submission, or other effect on external parties/resources |
| C4 | High Consequence | Significant financial, legal, security, health, safety, identity, or similarly material effects |

A calendar entry that sends invitations may have C3 effects even if its local record can be deleted. A permission change may be C4 rather than C3. Retrieval of sensitive data has privacy consequences even when the final answer is informational.

## 7.1 Approval Requirement

C3 actions SHOULD require explicit approval unless an authorized person has intentionally delegated that action class with defined targets, limits, duration, and exception handling.

C4 actions MUST have explicit, recorded approval of the particular proposal before execution. A general autonomy setting, remembered preference, or broad standing delegation is not sufficient. The pre-action summary SHOULD make material effects and recovery limits clear.

# 8. Approval Gates

A gate MUST identify the action, target, effect, actor, recovery limitations, and a clear approve/reject path. It SHOULD allow modification where practical. Controls MUST NOT use deceptive defaults or obscure rejection; a high-consequence action MUST NOT be disguised behind a generic Continue label.

Approval MUST be bound to the displayed proposal's identity, version, and material parameters. The host MUST validate current authority and scope before execution. UI checks are supplementary, not an authorization boundary. Expiry, revocation, identity, and idempotency require application-side enforcement.

An invalid or expired proposal cannot be approved. Disabling an invalid review MUST NOT prevent the host from offering a separate safe dismissal, escalation, or withdrawal path. Rejecting a proposal is not cancellation of an action already executing.

# 9. Agent Anatomy

Agents materially participating in a task SHOULD have a profile covering:

## 9.1 Identity

A recognizable name or role identifying the actor.

## 9.2 Purpose

The responsibility and intended outcome.

## 9.3 Capability

What the agent can technically do; not a permission list.

## 9.4 Authority

What the agent is allowed to do in the current scope.

## 9.5 Context

Which data, memory, and tools it can access.

## 9.6 State

Operational status: Idle, Listening, Thinking, Planning, Waiting, Acting, Verifying, Blocked, Completed, Failed, or Escalated. The reference implementation displays Thinking as Analyzing and Waiting as Waiting for approval; other waits need explanatory task text.

## 9.7 History

An inspectable record of relevant actions, including partial effects.

## 9.8 Accountability

The responsible human or organizational owner and available inspection, correction, stop, or escalation mechanisms.

# 10. Agent State Communication

Users SHOULD distinguish consideration, waiting for approval, execution, and completion. Labels SHOULD describe observable operations rather than assert human emotion or consciousness. Fictional characterization MAY be used only without misleading users about actual capabilities or state. Progress figures SHOULD reflect measured work, not decorative estimates.

# 11. Multi-Agent Systems

The product SHOULD make the primary actor, delegated roles, handoffs, and final accountability understandable. It MUST NOT leave consequential actions unattributed. Delegation MUST NOT silently increase authority; the host enforces scope across agent and tool boundaries.

# 12. Memory

Memory categories describe reuse of context, not a universal data-retention policy. Categories may coexist in different scopes; M0–M3 are not maturity or sensitivity rankings.

## M0 — No Memory

No task information is reused as AI memory after the active task. This label alone does not establish that logs, backups, or legally required records are absent.

## M1 — Session Context

Context is available for the current session or workflow, not reused as cross-session user memory.

## M2 — User-Controlled Memory

Information persists across sessions with meaningful user visibility and controls.

## M3 — Operational Memory

Task/process state is retained to continue an authorized workflow. State retention does not extend that workflow's authority or duration.

## 12.1 Memory Rules

The system MUST NOT imply persistence when only session context exists, or imply zero retention when operational records remain. It SHOULD explain material memory categories, influence, scope, and controls. Users SHOULD have meaningful management of their persistent context. Memory SHOULD NOT silently expand authority.

Applications SHOULD separately document retention, deletion propagation, backup exceptions, audit records, and any use for model training. A memory toggle is not proof of deletion from every system.

# 13. Uncertainty

The system MUST NOT present materially uncertain information as certain. Qualitative labels need an understandable basis; they are not numeric probabilities or proof of truth.

## U0 — Confirmed

Supported by direct or authoritative evidence within a stated scope and time. Source credibility does not guarantee that every interpretation is correct.

## U1 — High Confidence

Strong supporting evidence with residual uncertainty. An uncalibrated model statement about its confidence is not sufficient evidence.

## U2 — Inferred

Materially dependent on assumptions, incomplete information, or inference.

## U3 — Unknown

Insufficient information for a supported conclusion.

Products MAY use clearer terminology while preserving these distinctions. They SHOULD expose uncertainty when it affects safety, decisions, resources, identity, external communications, or irreversible action. Execution status and evidence confidence MUST NOT be conflated.

# 14. Evidence and Sources

Material external evidence SHOULD be inspectable. Source content, direct quotation, paraphrase, synthesis, and inference SHOULD be distinguished. Generated text MUST NOT be presented as a source quotation. Retrieval does not equal verification.

When sources are inaccessible, stale, incomplete, or conflicting, the product SHOULD say so instead of inventing citations or implying unrestricted access. Private evidence must remain subject to access controls; inspectability does not authorize disclosure to everyone who can see the interface.

# 15. Action Receipts

C2, C3, and C4 actions SHOULD produce a receipt or equivalent inspectable record. Records SHOULD include action, actor, target, supplied timestamp, status, material parameters, verification, recovery limits, and next available actions.

A receipt MUST reflect the actual known outcome, not a proposal or click. Completed or reversed results require appropriate verification before being presented as confirmed. Partial and unknown outcomes remain visible rather than becoming total success or assumed no-effect failure.

Illustrative record, not an actual event:

```text
Action: Sent email
Actor: Scheduling Agent
Target: alex@example.com
Time: 2026-09-27T08:00:00Z
Status: Completed
Verification: Provider accepted message; delivery is not confirmed
Recovery: Cannot recall recipient copies
```

Logs MAY be linked when access is appropriate. Verification of acceptance is not verification of receipt by another person.

# 16. Tool Activity

Tool activity SHOULD be visible when it affects understanding, control, cost, privacy, security, or outcome. Meaningful categories include searching, reading, writing, sending, publishing, transacting, code execution, private-data access, and permission changes. Products MAY summarize low-level calls but MUST NOT claim tool success solely from a plan to invoke a tool.

# 17. Human Override

Autonomous systems SHOULD expose pause, stop, cancel, scope change, permission revocation, takeover, or escalation. Level 4 systems MUST provide meaningful intervention as required by section 6. Controls SHOULD remain easy to find during long-running work.

Stop requested and stopped are distinct. The system SHOULD explain in-flight effects and what cannot be interrupted. A disabled or cosmetic control is not an override. Override does not erase audit history or undo prior actions.

# 18. Recovery and Reversibility

Recovery SHOULD be designed before failure: undo, restore, rollback, retry, version history, or draft state as appropriate. Where technically feasible, a product claiming conformance MUST provide a usable recovery path.

The system MUST NOT imply undo when it cannot restore the relevant state. Compensation, reconciliation, retry, and local reset need distinct descriptions. After an unknown external outcome, the host SHOULD reconcile authoritative records before retrying; it MUST NOT present a blind retry as a guaranteed safe recovery.

# 19. Failure States

Failure MUST be a first-class design state. The interface SHOULD explain what failed, what completed, what remains unknown, partial changes, and safe next steps. Prefer specific, privacy-safe explanations over a generic error when useful detail is known. Do not expose raw exceptions containing sensitive information.

# 20. Canonical TUN Components

The fourteen patterns below have reference React implementations. The [component catalog](COMPONENTS-v0.1.md) defines their anatomy and the [implementation matrix](STATUS-AND-ROADMAP.md) links their source.

## 20.1 Intent Composer

Captures desired outcome, scope, constraints, and optional context.

## 20.2 Agent Card

Displays actor identity, purpose, state, and authority.

## 20.3 Context Panel

Shows material available context and its limitations.

## 20.4 Plan View

Communicates a useful task approach, dependencies, and approval points.

## 20.5 Proposal Card

Presents an intended action, not an executed result.

## 20.6 Approval Gate

Requests explicit authorization for a particular proposal.

## 20.7 Action Receipt

Displays the known outcome and verification/recovery limits.

## 20.8 Memory Indicator

Communicates relevant context persistence and scope.

## 20.9 Source View

Exposes evidence and provenance subject to access controls.

## 20.10 Uncertainty Signal

Communicates material uncertainty and its basis.

## 20.11 Tool Activity

Shows meaningful external-system operations.

## 20.12 Agent Activity

Shows task progress and operational state.

## 20.13 Human Override

Provides actual intervention within system capabilities.

## 20.14 Recovery Control

Offers supported restoration, compensation, retry, or reconciliation.

# 21. Information Hierarchy

Interfaces SHOULD prioritize outcome, required decision, material risk/uncertainty, current state, evidence, then implementation details. An urgent intervention or pre-action consequence may need to precede an outcome. Calm design MUST NOT hide material information needed for a decision.

# 22. Visual Language

**Simplicity with Boldness. Consistency with Conciseness. Clarity with Confidence.**

Use strong hierarchy, space, restrained color, clear state contrast, minimal decoration, and purposeful motion. Color MUST NOT be the only critical-state signal. The [visual profile](DESIGN-TOKENS-AND-VISUAL-SYSTEM-v0.1.md) supplies concrete values; token colors do not encode authority.

# 23. Motion

Motion SHOULD explain transitions, progress, hierarchy, or causality, not simulate intelligence. Long-running activity SHOULD remain calm. Reduced-motion preferences SHOULD be respected. Execution logic MUST NOT depend on an animation completing.

# 24. Accessibility

Components MUST support accessible interaction. Interactive controls MUST be keyboard operable, have accessible names, expose meaningful state, and retain visible focus. Critical meaning MUST NOT rely only on color; approval and rejection MUST be distinguishable. Status changes SHOULD be announced without flooding assistive technologies.

Products SHOULD test reduced motion, reflow, zoom, forced colors, language, cognitive load, and relevant assistive technologies. The [integration checklist](INTEGRATION-CHECKLIST.md) separates automated samples from manual review.

# 25. Privacy

Unexpected sensitive-data access SHOULD be explained. Interfaces SHOULD minimize disclosure in previews, shared views, notifications, logs, and analytics. The host MUST enforce access control; collapsing content in the UI does not prevent disclosure if the data has already been sent to an unauthorized client.

# 26. Permissions

Capability is not authority. Permissions SHOULD be scoped, understandable, revocable, and proportional; broad permissions SHOULD NOT be requested where narrow permissions suffice. The host MUST enforce authorized scope and MUST NOT treat model output, retrieved instructions, memory, or visual state as permission grants.

# 27. Delegation

Delegation MUST define goal, scope, authority, duration or stopping condition, and exception behavior. It MUST NOT silently expand the assignment. Example: draft support replies until a stated date but do not send without approval. C4 still requires the explicit proposal approval in section 7.1.

# 28. Escalation

The system SHOULD request human input when authority is missing, uncertainty is material, consequences change, scope is exceeded, a policy boundary is reached, or reliable progress is blocked. Explain the needed decision and preserve relevant task state without leaking private context.

# 29. Calm AI

The interface SHOULD distinguish information, recommendations, warnings, required decisions, and urgent intervention. Only genuinely urgent conditions SHOULD receive urgent treatment. Reduce unnecessary interruptions, not meaningful control.

# 30. Machine-Readable TUN

Tokens and TypeScript contracts provide the current machine-readable foundation. Future versions SHOULD define structured patterns, permissions, state transitions, and conformance evidence.

Conceptual declaration only—not a parser input supported by this repository:

```yaml
tun:
  version: "0.1"
  autonomy: 2
  consequence: C3
  approval: required
  recovery: irreversible
```

# 31. TUN Conformance

## TUN-Inspired

Uses TUN principles without claiming complete implementation.

## TUN-Aligned

Implements identified relevant patterns and documents omissions. Avoid an unsupported percentage or universal badge.

## TUN-Conformant

A scoped, self-assessed claim that all applicable MUST and MUST NOT requirements of an identified revision are satisfied. The declaration MUST identify the assessed product scope, requirement evidence, reviewer, date, exceptions, and justified non-applicability. An applicable unmet MUST prevents this claim for that scope.

See [Scope and non-claims](SCOPE.md#release-status-and-conformance) for project release and certification status.

# 32. Product Declaration

Implementations SHOULD document revision/commit, scope, autonomy per operation, consequence classes, memory/retention model, agent roles, permissions, approval, verification, recovery, evidence, and known gaps. Use the [integration worksheet](INTEGRATION-CHECKLIST.md) to record responsibilities and evidence for each actor.

# 33. Anti-Patterns

## Invisible Action

External state changes without understandable agency or effect.

## Fake Certainty

Inference, confidence styling, or source retrieval presented as established truth.

## Permission Blur

Suggesting, approving, executing, and verifying look interchangeable.

## Agent Ambiguity

Consequential activity lacks a responsible actor.

## Memory Surprise

Unexpected persistent context or an unsupported no-retention claim.

## Automation Trap

Users cannot meaningfully intervene in delegated work.

## Irreversible Surprise

Material irreversible effects occur without prior disclosure.

## Complexity Dump

Internal details overwhelm understanding without improving control.

## Decorative Intelligence

Animation, personality, or confidence language substitutes for useful information.

# 34. Minimum TUN Requirement

Within a declared scope, a conformant product MUST distinguish proposals from actions; preserve human authority; communicate material uncertainty; expose meaningful state; provide accountability; respect permission scope; disclose irreversible effects; provide feasible recovery; distinguish session and persistent context; and avoid unnecessary cognitive complexity.

This summary does not replace the other applicable requirements. Document how qualitative requirements were evaluated rather than asserting that a checkbox proves them.

# 35. Reference Flow

```text
Intent → establish scope → prepare plan → propose action
       → disclose effects → approve → execute → verify
       → record outcome → return understanding and control
```

Use the least interaction needed while preserving adequate understanding and control. Keep unknown outcomes unknown until reconciled; not every task needs every stage.

# 36. Design Test

Before release, teams SHOULD answer: What is the goal? What does AI contribute? Who can act and under what authority? What can change? What must the human understand? When can they intervene? What evidence supports the result? What context persists? How do failures and unwanted effects recover?

If an answer is incomplete, record the gap and responsible owner rather than imply readiness.

# 37. Direction for v0.2

The fourteen-component foundation is in place. The [roadmap](STATUS-AND-ROADMAP.md#next-milestones) prioritizes a bounded application pilot, state matrices, runtime schemas, stronger integration tests, localization, broader accessibility/browser coverage, and design-tool adapters.

**Human Intent. Machine Intelligence. Systemic Design.**
