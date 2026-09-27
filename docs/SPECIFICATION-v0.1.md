# TUN Systemic Design
## Specification v0.1

**Status:** Draft Standard  
**Version:** 0.1  
**Date:** September 2026

---

# 1. Purpose

TUN Systemic Design is a design framework for AI-native products.

This specification defines normative rules for designing systems in which humans interact with artificial intelligence, agents, tools, memory, data, and autonomous actions.

The purpose of this document is to make TUN implementable.

It establishes:

- core interaction requirements,
- autonomy levels,
- agent design rules,
- approval and permission patterns,
- memory patterns,
- uncertainty and evidence rules,
- action accountability,
- recovery and reversibility,
- safety and trust requirements,
- canonical AI interface components,
- and conformance expectations.

TUN applies to products in which AI materially participates in understanding intent, generating outputs, recommending actions, using tools, coordinating agents, or executing tasks.

---

# 2. Normative Language

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative.

## MUST

A requirement necessary for TUN conformance.

## MUST NOT

A behavior prohibited by TUN.

## SHOULD

A recommended practice that should normally be followed unless there is a documented reason not to.

## SHOULD NOT

A behavior that should normally be avoided unless justified.

## MAY

An optional behavior.

---

# 3. Core System Model

A TUN-compliant AI product SHOULD be designed as a continuous intelligence system:

```text
HUMAN → INTENT → AI → REASON → ACT → OBSERVE → LEARN → HUMAN
```

The human remains part of the control loop.

A system MUST NOT assume that increased AI capability removes the need for meaningful human understanding, authority, or intervention.

---

# 4. Core Interaction Model

TUN defines five primary interaction states:

```text
ASK → THINK → PROPOSE → ACT → LEARN
```

A product MAY omit states when they are not necessary.

For consequential actions, the preferred pattern is:

```text
ASK → THINK → PROPOSE → APPROVE → ACT → VERIFY → LEARN
```

## 4.1 ASK

The system MUST establish sufficient understanding of the user's intent before taking consequential action.

The system SHOULD capture:

- intended outcome,
- relevant constraints,
- scope,
- target,
- timing,
- authority,
- and material assumptions.

The system SHOULD avoid asking for information that is not required to make safe or useful progress.

## 4.2 THINK

The system MAY internally plan, reason, retrieve information, compare options, or coordinate tools.

The interface SHOULD expose the **result of reasoning relevant to human control**, not necessarily internal chain-of-thought.

The system SHOULD communicate:

- the proposed approach,
- assumptions,
- constraints,
- relevant uncertainty,
- dependencies,
- and material consequences.

## 4.3 PROPOSE

When human judgment is required, the system MUST clearly distinguish a proposal from an executed action.

A proposal SHOULD state:

- what will happen,
- why,
- what will be affected,
- whether the action is reversible,
- and what authority is being requested.

## 4.4 ACT

The system MUST act only within authorized scope.

The system MUST distinguish between:

- generating content,
- modifying local state,
- modifying shared state,
- communicating externally,
- making transactions,
- changing permissions,
- and initiating irreversible actions.

## 4.5 LEARN

The system MAY adapt based on outcomes, corrections, and permitted context.

Persistent learning MUST respect user control and product policy.

The system MUST NOT represent temporary session context as persistent memory.

---

# 5. TUN Principles

A conforming implementation SHOULD reflect the following principles.

## 5.1 Transparent

The system MUST make material AI behavior understandable.

It SHOULD make visible:

- what is happening,
- what has happened,
- which agent or system acted,
- which external tools were used when relevant,
- and what the user can do next.

## 5.2 User Sovereign

The system MUST preserve meaningful human authority over consequential actions.

Where practical, users SHOULD be able to:

- approve,
- reject,
- modify,
- interrupt,
- undo,
- or escalate actions.

## 5.3 Natural

The system SHOULD allow users to express intent naturally.

Users SHOULD NOT need to understand model architecture, prompt engineering, or internal orchestration in order to use the product effectively.

## 5.4 Systemic

Design MUST account for the complete interaction between humans, AI models, agents, tools, data, memory, actions, and outcomes.

## 5.5 Adaptive

The system MAY adapt to context, preferences, history, or task state.

Adaptive behavior SHOULD remain understandable and SHOULD NOT create unexplained changes in system behavior.

## 5.6 Reversible

Actions SHOULD be reversible when technically feasible.

If an action is irreversible, the system MUST communicate that before execution when the consequence is material.

## 5.7 Composable

AI capabilities SHOULD be modular enough that models, tools, agents, and interfaces can be replaced or extended without requiring a complete redesign of the interaction model.

## 5.8 Calm

The system SHOULD reduce cognitive load.

It SHOULD surface complexity only when that complexity matters to understanding, control, risk, or decision quality.

---

# 6. Autonomy Model

TUN defines five autonomy levels.

## Level 0 — Human Only

The system provides deterministic tools without AI assistance.

Examples:

- manual form entry,
- manual configuration,
- static navigation.

## Level 1 — AI Assists

AI generates information, drafts, summaries, analysis, or suggestions.

The human performs the action.

Examples:

- drafting an email,
- generating code,
- summarizing a report.

## Level 2 — AI Proposes

AI prepares an action but waits for human approval.

Examples:

- proposed calendar event,
- proposed file update,
- proposed transaction,
- proposed message.

## Level 3 — AI Acts

AI executes within predefined and authorized boundaries.

Examples:

- sending approved recurring reports,
- modifying approved records,
- using a tool within a delegated scope.

## Level 4 — AI Operates

AI independently pursues delegated goals and may coordinate multiple tools or agents.

The system MUST provide:

- defined authority,
- operating boundaries,
- monitoring,
- exception handling,
- action history,
- and human intervention.

## 6.1 Autonomy Escalation Rule

As autonomy increases, observability, accountability, and recoverability MUST increase proportionally.

A Level 4 experience MUST NOT provide less visibility than a Level 2 experience for materially consequential actions.

---

# 7. Consequence Model

TUN classifies actions by consequence rather than by technical complexity.

## C0 — Informational

No external change occurs.

Examples:

- answer,
- summary,
- analysis,
- recommendation.

## C1 — Local Reversible

A change occurs but remains local and easily reversible.

Examples:

- draft edit,
- temporary preference,
- local note.

## C2 — Shared Reversible

The action changes shared or external state but can normally be reversed.

Examples:

- editing a shared document,
- changing a task status,
- creating a calendar event.

## C3 — External Consequential

The action affects external parties or meaningful resources.

Examples:

- sending a message,
- publishing content,
- submitting a form,
- changing permissions.

## C4 — High Consequence

The action may involve financial, legal, security, health, safety, identity, or other significant consequences.

Examples:

- transferring funds,
- deleting critical data,
- granting privileged access,
- executing legally binding actions.

## 7.1 Approval Requirement

C3 and C4 actions SHOULD require explicit approval unless the user has intentionally delegated that class of action in advance.

C4 actions MUST use explicit authorization and SHOULD provide a clear pre-action summary.

---

# 8. Approval Gates

An Approval Gate is a canonical TUN interaction pattern.

An Approval Gate MUST:

- identify the action,
- identify the target,
- state the material effect,
- identify the acting agent or system,
- state whether the action is reversible,
- and present a clear approve/reject path.

An Approval Gate SHOULD allow modification when practical.

Approval controls MUST NOT use deceptive defaults or visually obscure rejection.

A high-consequence approval MUST NOT be represented as a generic "Continue" action when the underlying effect is materially more specific.

Preferred examples:

- "Send message"
- "Transfer funds"
- "Delete account"
- "Grant access"
- "Publish publicly"

---

# 9. Agent Anatomy

Every agent that materially participates in a user-visible task SHOULD have a defined agent profile.

A TUN agent profile includes:

## 9.1 Identity

A recognizable name or role.

## 9.2 Purpose

The primary responsibility of the agent.

## 9.3 Capability

What the agent can do.

## 9.4 Authority

What the agent is allowed to do.

## 9.5 Context

What data, memory, tools, and systems the agent can access.

## 9.6 State

Current operational state.

Recommended states:

- Idle
- Listening
- Thinking
- Planning
- Waiting
- Acting
- Verifying
- Blocked
- Completed
- Failed
- Escalated

## 9.7 History

A meaningful record of actions performed.

## 9.8 Accountability

A way for the user or system owner to inspect, stop, correct, or review agent behavior.

---

# 10. Agent State Communication

A user SHOULD be able to distinguish:

- an agent that is considering an action,
- an agent waiting for approval,
- an agent currently acting,
- and an agent that has completed an action.

State labels SHOULD describe behavior, not imply human emotion or consciousness.

Preferred:

- "Analyzing"
- "Preparing plan"
- "Waiting for approval"
- "Updating document"
- "Completed"

Avoid:

- "Worried"
- "Excited"
- "Confused"

unless the product intentionally uses fictional characterization and the distinction is clear.

---

# 11. Multi-Agent Systems

When multiple agents collaborate, the product SHOULD make orchestration understandable at the level relevant to the user.

The system SHOULD identify:

- primary agent,
- delegated agents,
- responsibility boundaries,
- handoffs,
- and final accountability.

A multi-agent system MUST NOT create ambiguity about which agent performed a consequential action.

---

# 12. Memory

TUN distinguishes four memory types.

## M0 — No Memory

The interaction is not retained beyond the active task.

## M1 — Session Context

Information is retained only for the current session or workflow.

## M2 — User-Controlled Memory

Information may persist across sessions and is visible or manageable by the user.

## M3 — Operational Memory

The system retains task or process state required for continuing an authorized workflow.

## 12.1 Memory Rules

Persistent memory MUST NOT be implied when only session context exists.

Where persistent memory materially affects user outcomes, the system SHOULD communicate:

- that memory exists,
- what category of information is retained,
- and how it affects behavior.

Users SHOULD have meaningful control over user-specific persistent memory where product architecture permits.

Memory SHOULD NOT silently expand an agent's authority.

Remembering a preference does not imply permission to act on that preference in a consequential context.

---

# 13. Uncertainty

AI systems MUST NOT present uncertain information as certain when uncertainty is material.

TUN defines four broad uncertainty states:

## U0 — Confirmed

Supported by authoritative or direct information.

## U1 — High Confidence

Strong evidence exists, but some uncertainty remains.

## U2 — Inferred

The result depends materially on inference, incomplete information, or assumptions.

## U3 — Unknown

The system lacks sufficient information.

The product MAY use different terminology, but the distinction SHOULD remain understandable.

The system SHOULD communicate uncertainty when it affects:

- safety,
- decision quality,
- financial impact,
- legal effect,
- identity,
- external communication,
- or irreversible action.

---

# 14. Evidence and Sources

When an AI result materially depends on external evidence, the system SHOULD make that evidence inspectable.

A source view SHOULD distinguish:

- source content,
- AI interpretation,
- generated synthesis,
- and unsupported inference.

The system MUST NOT visually present generated text as if it were a direct source quotation.

---

# 15. Action Receipts

Any C2, C3, or C4 action SHOULD generate an Action Receipt.

An Action Receipt SHOULD contain:

- action,
- timestamp,
- actor,
- target,
- status,
- relevant parameters,
- reversibility,
- and next available action.

Example:

```text
Action: Sent email
Actor: Scheduling Agent
Target: alex@example.com
Time: 10:42
Status: Completed
Reversible: No
```

For complex actions, receipts MAY contain links to supporting logs or artifacts.

---

# 16. Tool Activity

When AI uses external tools, the product SHOULD expose tool activity when it matters to user understanding, control, cost, privacy, security, or outcome.

Tool visibility MAY be summarized.

The system does not need to expose every low-level API call.

Useful categories include:

- Searching
- Reading
- Writing
- Sending
- Publishing
- Transacting
- Executing code
- Accessing private data
- Changing permissions

---

# 17. Human Override

Autonomous AI systems SHOULD provide a Human Override.

The override SHOULD support one or more of:

- Pause
- Stop
- Cancel
- Take control
- Change scope
- Revoke permission
- Escalate

For long-running or Level 4 agent workflows, interruption SHOULD be persistent and easy to find.

---

# 18. Recovery and Reversibility

A system SHOULD design recovery before failure occurs.

Where practical, the product SHOULD provide:

- Undo
- Restore
- Retry
- Rollback
- Version history
- Draft state
- Confirmation before irreversible action

When reversal is impossible, the system MUST NOT imply that undo is available.

---

# 19. Failure States

AI failure MUST be treated as a first-class design state.

Failure states SHOULD communicate:

- what failed,
- what was completed,
- what was not completed,
- whether partial changes occurred,
- what the user can do next.

The product SHOULD avoid vague failure messages such as:

> "Something went wrong."

when more useful information is available.

Preferred:

> "The report was generated, but it could not be uploaded because access expired. Reconnect the account or download the report."

---

# 20. Canonical TUN Components

TUN v0.1 defines the following canonical AI components.

## 20.1 Intent Composer

Captures a user's goal, constraints, and optional context.

## 20.2 Agent Card

Displays agent identity, role, state, and authority.

## 20.3 Context Panel

Shows material context available to the AI.

## 20.4 Plan View

Shows a task plan at the level useful for human understanding and control.

## 20.5 Proposal Card

Presents a recommended action before execution.

## 20.6 Approval Gate

Requests explicit human authorization.

## 20.7 Action Receipt

Records completed actions.

## 20.8 Memory Indicator

Communicates relevant persistent context.

## 20.9 Source View

Provides evidence and provenance.

## 20.10 Uncertainty Signal

Communicates material uncertainty.

## 20.11 Tool Activity

Shows meaningful external system use.

## 20.12 Agent Activity

Shows what an agent is currently doing.

## 20.13 Human Override

Allows interruption or control.

## 20.14 Recovery Control

Allows undo, retry, restore, or rollback.

---

# 21. Information Hierarchy

TUN interfaces SHOULD prioritize information in the following order:

1. Outcome
2. Required human decision
3. Material risk or uncertainty
4. Current system state
5. Supporting evidence
6. Implementation detail

Internal system complexity SHOULD NOT dominate the interface.

---

# 22. Visual Language

TUN's visual philosophy is:

> **Simplicity with Boldness.**  
> **Consistency with Conciseness.**  
> **Clarity with Confidence.**

A TUN interface SHOULD use:

- strong typographic hierarchy,
- generous spacing,
- restrained color,
- clear state contrast,
- minimal decoration,
- purposeful motion,
- high information density only where necessary.

Color MUST NOT be the only mechanism for communicating critical state.

---

# 23. Motion

Motion SHOULD communicate:

- transition,
- progress,
- state change,
- hierarchy,
- causality.

Motion SHOULD NOT simulate intelligence for decorative effect.

Long-running agent activity SHOULD use calm progress indicators rather than distracting animation.

---

# 24. Accessibility

TUN components MUST support accessible interaction.

At minimum:

- keyboard navigation SHOULD be supported,
- semantic labels SHOULD be available,
- status changes SHOULD be announced appropriately,
- critical state MUST NOT rely only on color,
- motion SHOULD respect reduced-motion preferences,
- approval controls MUST be clearly distinguishable.

AI-specific accessibility SHOULD also consider cognitive load and language complexity.

---

# 25. Privacy

The interface SHOULD communicate when AI accesses sensitive or private information if that access is not obvious from context.

The system SHOULD avoid exposing private context unnecessarily in:

- previews,
- shared surfaces,
- notifications,
- logs,
- and multi-user interfaces.

---

# 26. Permissions

TUN distinguishes capability from authority.

A model or agent MAY be technically capable of an action while not being authorized to perform it.

Permissions SHOULD be:

- scoped,
- understandable,
- revocable,
- and proportional to the task.

Broad permissions SHOULD NOT be requested when narrow permissions are sufficient.

---

# 27. Delegation

Delegation MUST define:

- goal,
- scope,
- authority,
- duration or stopping condition,
- and exception behavior.

Example:

> "Monitor support requests until Friday. Draft replies, but do not send anything without approval."

A delegated agent MUST NOT silently expand the scope of the assignment.

---

# 28. Escalation

An AI system SHOULD escalate to the user when:

- required authority is missing,
- uncertainty becomes material,
- an unexpected consequence appears,
- the task exceeds delegated scope,
- a policy or safety boundary is reached,
- or the agent cannot continue reliably.

Escalation SHOULD explain why human input is required.

---

# 29. Calm AI

A TUN system SHOULD minimize unnecessary interruption.

The system SHOULD distinguish between:

- information,
- recommendation,
- warning,
- required decision,
- and urgent intervention.

Only genuinely urgent conditions SHOULD use urgent visual treatment.

---

# 30. Machine-Readable TUN

TUN is intended to become machine-readable.

Future versions SHOULD define structured schemas for:

- components,
- patterns,
- autonomy levels,
- consequence levels,
- permissions,
- states,
- design tokens,
- and conformance tests.

Example conceptual declaration:

```yaml
tun:
  version: 0.1
  autonomy: 2
  consequence: C3
  approval: required
  reversible: false
  agent:
    identity: communications-agent
    authority:
      - draft
      - propose_send
```

This is illustrative only and is not yet a normative schema.

---

# 31. TUN Conformance

A product MAY describe itself as:

## TUN-Inspired

It uses TUN principles but does not claim formal implementation.

## TUN-Aligned

It implements the majority of relevant TUN interaction patterns.

## TUN-Conformant

It satisfies all applicable MUST requirements for its declared scope.

Formal certification criteria are reserved for a future specification.

---

# 32. Product Declaration

A TUN implementation SHOULD document:

- autonomy level,
- highest consequence class,
- memory model,
- major agent roles,
- permission model,
- approval model,
- recovery model,
- and known non-conformities.

Example:

```text
TUN Version: 0.1
Autonomy: Level 2
Maximum Consequence: C3
Memory: M1 + M2
Approval: Explicit for all C3 actions
Recovery: Version history + undo for document edits
```

---

# 33. Anti-Patterns

The following are TUN anti-patterns.

## Invisible Action

AI changes external state without making the action understandable.

## Fake Certainty

The system presents inference as fact.

## Permission Blur

The user cannot tell whether AI is suggesting or executing.

## Agent Ambiguity

The user cannot tell which agent is responsible for an action.

## Memory Surprise

The AI uses persistent context the user did not reasonably expect.

## Automation Trap

Users cannot easily stop or modify autonomous behavior.

## Irreversible Surprise

A destructive action occurs without meaningful warning.

## Complexity Dump

The system exposes internal complexity without improving user understanding.

## Decorative Intelligence

Animations, personas, or language imply intelligence or awareness without improving function.

---

# 34. Minimum TUN Requirement

At minimum, an AI-native product claiming TUN conformance MUST:

1. distinguish proposal from action,
2. preserve human authority for consequential actions,
3. communicate material uncertainty,
4. expose meaningful agent or system state,
5. provide action accountability,
6. respect permission scope,
7. communicate irreversible consequences,
8. provide recovery where technically feasible,
9. distinguish session context from persistent memory,
10. avoid unnecessary cognitive complexity.

---

# 35. Reference Flow

A typical consequential TUN interaction:

```text
1. User expresses intent
        ↓
2. System understands scope
        ↓
3. AI prepares plan
        ↓
4. AI proposes action
        ↓
5. System communicates consequence
        ↓
6. Human approves
        ↓
7. Agent executes
        ↓
8. System verifies result
        ↓
9. Action receipt is created
        ↓
10. Outcome returns to human
```

This pattern is not required for every task.

The design principle is:

> **Use the least interaction necessary while preserving sufficient human understanding and control.**

---

# 36. Design Test

Before releasing a TUN-based AI feature, teams SHOULD be able to answer:

### Intent
What is the human trying to achieve?

### Intelligence
What role does AI play?

### Agency
Who can act?

### Authority
What is each actor allowed to do?

### Consequence
What could materially change?

### Understanding
What must the human know?

### Intervention
When can the human stop or modify the system?

### Evidence
What information supports the output?

### Memory
What context persists?

### Recovery
What happens when the AI is wrong?

If these questions cannot be answered clearly, the design is incomplete.

---

# 37. Direction for v0.2

Future versions should define:

- detailed component anatomy,
- component state tables,
- design tokens,
- agent identity patterns,
- agent-to-agent interaction patterns,
- AI notification patterns,
- multimodal interaction patterns,
- TUN accessibility guidance,
- structured TUN schemas,
- React reference components,
- Tailwind tokens,
- Figma library architecture,
- and automated conformance tests.

---

# TUN Systemic Design

## Human Intent. Machine Intelligence. Systemic Design.

> **Design intelligence around humanity.**
