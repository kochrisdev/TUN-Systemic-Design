# TUN Systemic Design
## Components v0.1

**Status:** Draft Standard  
**Version:** 0.1  
**Date:** September 2026

---

# 1. Purpose

This document defines the first canonical component set for TUN Systemic Design.

These components are not merely visual UI elements. They represent recurring interaction contracts between humans and intelligent systems.

Each component specification includes:

- purpose,
- anatomy,
- required states,
- behavior,
- accessibility,
- implementation notes,
- and anti-patterns.

The goal is consistency across AI-native products regardless of model, platform, or implementation stack.

---

# 2. Component Design Rules

All TUN components SHOULD follow these principles:

1. **Outcome first** — show what matters before how it happened.
2. **Agency visible** — distinguish human, AI, agent, and tool actions.
3. **Authority explicit** — proposals and actions MUST not look the same.
4. **Uncertainty honest** — confidence and limitations SHOULD be visible when material.
5. **Recovery available** — provide undo, retry, revise, or escalation where relevant.
6. **Calm by default** — do not expose unnecessary system complexity.
7. **Composable** — components SHOULD work independently and in coordinated flows.
8. **Accessible** — state, action, and consequence MUST not depend on color alone.

---

# 3. Canonical Component Set

TUN v0.1 defines fourteen canonical components:

1. Intent Composer
2. Agent Card
3. Context Panel
4. Plan View
5. Proposal Card
6. Approval Gate
7. Action Receipt
8. Memory Indicator
9. Source View
10. Uncertainty Signal
11. Tool Activity
12. Agent Activity
13. Human Override
14. Recovery Control

---

# 4. Intent Composer

## Purpose

The Intent Composer captures a user's desired outcome, constraints, optional context, and scope.

It replaces the idea of a simple prompt box with a structured entry point for intelligent work.

## Required Anatomy

An Intent Composer SHOULD include:

- primary intent input,
- optional context input,
- optional constraints,
- submit / start action,
- visible scope when consequential actions are possible.

## Recommended Enhancements

It MAY include:

- suggested goals,
- attached files,
- target selection,
- deadline,
- preferred output,
- permission scope.

## States

- Empty
- Drafting
- Ready
- Submitting
- Clarification needed
- Blocked

## Behavior Rules

The component SHOULD allow natural language.

It SHOULD NOT require the user to understand prompts, agents, or model parameters.

If the request may trigger consequential actions, the system SHOULD surface likely scope before execution.

## Accessibility

- Input labels MUST be explicit.
- Keyboard submission MUST be supported.
- Suggested actions MUST be keyboard reachable.

## Anti-Patterns

- Prompt-engineering jargon in primary UI
- Hidden execution scope
- Overloaded forms for simple tasks
- Forcing technical configuration before intent is understood

---

# 5. Agent Card

## Purpose

The Agent Card communicates who or what is acting.

## Required Anatomy

An Agent Card SHOULD include:

- name,
- role,
- current state,
- authority summary.

## Optional Anatomy

It MAY include:

- capabilities,
- connected tools,
- current task,
- last activity,
- memory status,
- avatar or symbolic identity.

## States

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

## Behavior Rules

The Agent Card MUST NOT imply authority the agent does not possess.

When an agent is acting autonomously, the card SHOULD make that visible.

## Accessibility

State labels MUST be textual, not color-only.

## Anti-Patterns

- Decorative persona without functional clarity
- Ambiguous authority
- Human-emotion language presented as literal machine state
- Hidden tool access

---

# 6. Context Panel

## Purpose

The Context Panel shows the information materially influencing an AI task.

## Required Anatomy

A Context Panel SHOULD show:

- active context sources,
- scope,
- source type,
- whether context is temporary or persistent.

## Optional Anatomy

It MAY include:

- files,
- people,
- workspace,
- connected tools,
- location,
- time range,
- user preferences.

## States

- No context
- Active context
- Partial context
- Missing context
- Restricted context

## Behavior Rules

Context SHOULD be inspectable when it materially changes the output.

The panel SHOULD distinguish:

- session context,
- persistent memory,
- external source context.

## Anti-Patterns

- Hidden persistent context
- Mixing inferred and explicit user data without distinction
- Exposing irrelevant private context

---

# 7. Plan View

## Purpose

The Plan View communicates how a complex task will be approached.

It is not a chain-of-thought viewer.

## Required Anatomy

A Plan View SHOULD include:

- objective,
- major steps,
- dependencies,
- approval points,
- expected outputs.

## Optional Anatomy

It MAY include:

- estimated effort,
- responsible agent,
- tool dependencies,
- completion status.

## States

- Proposed
- Approved
- In progress
- Changed
- Blocked
- Completed

## Behavior Rules

The Plan View SHOULD expose only the level of reasoning useful for human understanding and control.

It MUST NOT imply that hidden internal reasoning is fully exposed.

## Anti-Patterns

- Dumping raw chain-of-thought
- Extremely granular internal steps
- Hiding material changes to the plan

---

# 8. Proposal Card

## Purpose

The Proposal Card presents a recommended action before execution.

## Required Anatomy

It MUST include:

- proposed action,
- target,
- expected effect,
- reversibility,
- actor.

## Optional Anatomy

It MAY include:

- rationale,
- alternatives,
- uncertainty,
- evidence,
- edit action.

## States

- Draft
- Ready
- Modified
- Approved
- Rejected
- Expired

## Behavior Rules

A Proposal Card MUST look different from a completed Action Receipt.

Users MUST be able to distinguish:

> "This may happen"

from:

> "This already happened"

## Anti-Patterns

- Proposal styled as completed action
- Consequence hidden behind vague text
- Approval implied by passive scrolling or navigation

---

# 9. Approval Gate

## Purpose

The Approval Gate requests explicit authorization for a consequential action.

## Required Anatomy

It MUST include:

- action,
- target,
- consequence,
- reversibility,
- acting system or agent,
- approve control,
- reject / cancel control.

## Optional Anatomy

It MAY include:

- modify,
- inspect details,
- remember permission,
- approval duration.

## States

- Awaiting approval
- Approved
- Rejected
- Expired
- Superseded

## Behavior Rules

Approval MUST be explicit for C4 actions.

Approval language SHOULD describe the real action.

Preferred:

- Send email
- Publish post
- Delete workspace
- Transfer funds

Avoid:

- Continue
- Confirm
- Proceed

when the true consequence is materially more specific.

## Accessibility

Approve and reject controls MUST be clearly distinguishable and keyboard accessible.

## Anti-Patterns

- Dark patterns
- Preselected approval
- Hidden consequence
- Approval bundled with unrelated consent

---

# 10. Action Receipt

## Purpose

The Action Receipt records what actually happened.

## Required Anatomy

It SHOULD include:

- action,
- actor,
- target,
- timestamp,
- status,
- reversibility.

## Optional Anatomy

It MAY include:

- parameters,
- tool used,
- result,
- audit link,
- rollback action.

## States

- Completed
- Partially completed
- Failed
- Reversed
- Pending verification

## Behavior Rules

Receipts SHOULD exist for C2, C3, and C4 actions.

A receipt MUST represent actual system state, not intent.

## Anti-Patterns

- No post-action confirmation
- Ambiguous success
- Missing target
- Missing indication of partial completion

---

# 11. Memory Indicator

## Purpose

The Memory Indicator communicates when persistent context affects the interaction.

## Required Anatomy

It SHOULD include:

- memory presence,
- memory type,
- scope.

## Optional Anatomy

It MAY include:

- view memory,
- edit memory,
- disable for task,
- explain influence.

## States

- No memory
- Session only
- Persistent memory active
- Operational memory active
- Memory unavailable

## Behavior Rules

The indicator SHOULD appear when persistent memory materially affects the experience.

It SHOULD NOT create unnecessary noise when memory is irrelevant.

## Anti-Patterns

- Surprise personalization
- Implying persistence when none exists
- Using remembered preference as new permission

---

# 12. Source View

## Purpose

The Source View exposes evidence supporting an AI-generated output.

## Required Anatomy

It SHOULD include:

- source identity,
- source type,
- relevant excerpt or reference,
- relationship to output.

## Optional Anatomy

It MAY include:

- date,
- confidence,
- provenance,
- open source action.

## States

- Verified
- Partial
- Conflicting
- Unavailable

## Behavior Rules

The system MUST distinguish source material from generated synthesis.

Direct quotation MUST be visually distinguishable from paraphrase.

## Anti-Patterns

- Generated text presented as source text
- Citation without accessible source
- Hiding contradictory evidence

---

# 13. Uncertainty Signal

## Purpose

The Uncertainty Signal communicates material ambiguity, inference, or missing information.

## Recommended Levels

- Confirmed
- High Confidence
- Inferred
- Unknown

## Required Anatomy

When shown, it SHOULD include:

- uncertainty level,
- short explanation,
- next best action if relevant.

## Behavior Rules

Uncertainty signals SHOULD be used when uncertainty affects:

- safety,
- financial impact,
- legal effect,
- external communication,
- identity,
- irreversible action,
- decision quality.

## Anti-Patterns

- Fake numeric precision
- Confidence badges used decoratively
- Over-warning low-risk content
- Hiding known limitations

---

# 14. Tool Activity

## Purpose

Tool Activity shows meaningful external system usage.

## Required Anatomy

It SHOULD identify:

- tool category,
- current activity,
- status.

## Optional Anatomy

It MAY include:

- tool name,
- permission scope,
- affected resource,
- elapsed state.

## Recommended Categories

- Searching
- Reading
- Writing
- Sending
- Publishing
- Transacting
- Executing code
- Accessing private data
- Changing permissions

## Behavior Rules

Do not expose every low-level API call.

Expose tool activity when it matters to trust, control, privacy, security, cost, or outcome.

## Anti-Patterns

- Decorative "working" animation with no informational value
- Hiding sensitive tool use
- Flooding users with technical logs

---

# 15. Agent Activity

## Purpose

Agent Activity communicates what an agent is doing now.

## Required Anatomy

It SHOULD include:

- agent identity,
- current state,
- current task.

## Optional Anatomy

It MAY include:

- progress,
- delegated subtask,
- blocking issue,
- next expected state.

## Behavior Rules

Agent Activity SHOULD use calm, factual language.

Preferred:

> "Reviewing 12 documents"

Avoid:

> "Deeply thinking about your problem"

## Anti-Patterns

- Anthropomorphic overclaiming
- Indeterminate motion with no state
- No distinction between waiting and acting

---

# 16. Human Override

## Purpose

Human Override gives the user direct control over autonomous behavior.

## Required Anatomy

For Level 4 workflows, at least one of the following SHOULD remain easy to access:

- Pause
- Stop
- Cancel
- Take control
- Change scope
- Revoke permission
- Escalate

## States

- Available
- Engaged
- Pending stop
- Stopped
- Unavailable

## Behavior Rules

The override SHOULD remain persistent during long-running autonomous execution.

A stopped workflow SHOULD clearly state whether partial changes already occurred.

## Anti-Patterns

- Stop control hidden in secondary navigation
- Fake cancel that does not halt execution
- Losing audit history after intervention

---

# 17. Recovery Control

## Purpose

Recovery Control helps users recover from mistakes, failures, or unwanted outcomes.

## Required Actions

Depending on context, it SHOULD support:

- Undo
- Retry
- Restore
- Rollback
- Reopen
- Revise

## States

- Available
- Executing
- Completed
- Failed
- Not possible

## Behavior Rules

Recovery actions MUST reflect actual system capability.

If undo is impossible, the interface MUST NOT imply otherwise.

## Anti-Patterns

- Fake undo
- Recovery available only through support
- Retry without explaining potential duplicate effects

---

# 18. Composition Patterns

TUN components SHOULD be combined into repeatable interaction patterns.

## Pattern A — Simple Assist

```text
Intent Composer
→ AI Result
→ Source View
→ Uncertainty Signal
```

## Pattern B — Proposed Action

```text
Intent Composer
→ Plan View
→ Proposal Card
→ Approval Gate
→ Action Receipt
```

## Pattern C — Autonomous Agent

```text
Agent Card
→ Plan View
→ Agent Activity
→ Tool Activity
→ Human Override
→ Action Receipt
```

## Pattern D — Memory-Aware Assistant

```text
Intent Composer
→ Memory Indicator
→ Context Panel
→ AI Result
```

## Pattern E — Recovery

```text
Action Receipt
→ Failure State
→ Recovery Control
→ Updated Action Receipt
```

---

# 19. Component Priority by Consequence

## C0

Recommended:

- Intent Composer
- Source View
- Uncertainty Signal

## C1

Recommended:

- Intent Composer
- Context Panel
- Recovery Control

## C2

Recommended:

- Proposal Card
- Action Receipt
- Recovery Control

## C3

Strongly recommended:

- Proposal Card
- Approval Gate
- Action Receipt
- Tool Activity

## C4

Required or strongly expected:

- Proposal Card
- Approval Gate
- Action Receipt
- Human Override where autonomous execution is possible
- Source View where evidence affects the decision
- Uncertainty Signal where uncertainty is material

---

# 20. Component State Language

TUN recommends factual, operational state language.

Preferred terms:

- Ready
- Waiting
- Reviewing
- Planning
- Acting
- Verifying
- Blocked
- Completed
- Failed
- Reversed

Avoid implying machine consciousness unless intentionally fictionalized.

---

# 21. Design Token Categories

Future TUN token definitions SHOULD include semantic tokens for:

- agent states,
- approval states,
- consequence levels,
- uncertainty levels,
- success,
- warning,
- failure,
- memory presence,
- tool activity,
- focus,
- disabled state.

Example conceptual tokens:

```text
state.agent.acting
state.agent.waiting
state.approval.required
state.approval.approved
state.uncertainty.inferred
state.consequence.high
```

These names are illustrative and not yet normative.

---

# 22. Accessibility Requirements

All canonical components SHOULD:

- support keyboard navigation,
- expose semantic labels,
- provide textual state labels,
- avoid color-only communication,
- support reduced motion,
- maintain clear focus states,
- avoid unnecessary cognitive complexity.

Approval, override, and recovery controls MUST be especially clear.

---

# 23. Responsive Behavior

Components SHOULD remain understandable across:

- desktop,
- mobile,
- embedded interfaces,
- conversational surfaces,
- agent workspaces.

Critical actions SHOULD remain visible on smaller screens.

High-consequence approval MUST NOT be hidden behind horizontal scrolling or collapsed content by default.

---

# 24. Implementation Guidance

TUN components SHOULD separate:

- presentation,
- state,
- authority,
- action logic,
- audit data.

A component library SHOULD NOT hardcode model-specific assumptions.

Recommended architecture:

```text
TUN Component
├── Visual Layer
├── State Model
├── Authority Model
├── Event Model
└── Audit Metadata
```

This allows the same interaction pattern to work across different AI systems.

---

# 25. Example Component Contract

Illustrative only:

```ts
type ApprovalGate = {
  action: string
  target: string
  consequence: "C0" | "C1" | "C2" | "C3" | "C4"
  reversible: boolean
  actor: {
    id: string
    type: "human" | "agent" | "system"
  }
  status:
    | "awaiting"
    | "approved"
    | "rejected"
    | "expired"
  onApprove(): void
  onReject(): void
}
```

Future releases SHOULD define formal schemas.

---

# 26. Component Review Checklist

Before a TUN component is released, teams SHOULD ask:

### Purpose
What human problem does this component solve?

### Agency
Who is acting?

### Authority
What can that actor do?

### State
Can the user tell what is happening now?

### Consequence
What may materially change?

### Uncertainty
What might be wrong or incomplete?

### Recovery
What happens if the action is unwanted or fails?

### Accessibility
Can the component be understood without relying on color, motion, or pointer input?

### Calmness
Is the component exposing only necessary complexity?

---

# 27. Direction for v0.2

The next version SHOULD add:

- visual anatomy diagrams,
- component sizing guidance,
- interaction state matrices,
- design tokens,
- copywriting patterns,
- mobile adaptations,
- Figma component structure,
- React reference components,
- accessibility tests,
- conformance test cases.

---

# TUN Systemic Design

## Human Intent. Machine Intelligence. Systemic Design.

> **Design intelligence around humanity.**
