# TUN and existing approaches

**TUN connects human-AI interaction guidance to a concrete action lifecycle: review the proposal, authorize the exact action, observe execution, and verify the effect before presenting success.** Use it alongside human-centered design research and your chosen agent runtime, not as a substitute for either.

[Introduction](INTRODUCTION.md) · [Architecture](ARCHITECTURE.md) · [Real host example](../examples/host-integration/README.md) · [Governance and citation](../GOVERNANCE.md)

**Comparison reviewed:** September 30, 2026. **TUN implementation baseline:** [5f9e83e](https://github.com/kochrisdev/TUN-Systemic-Design/tree/5f9e83e0c1f897e1ef5c31b366559277cf324c27). This is a comparison of the cited materials' scope, not a product ranking or usability benchmark.

## Where the approaches meet

| Approach and primary source | What the cited material contributes | How to use it with TUN |
|---|---|---|
| **Jakob Nielsen's agentic UX guidance** — [UX Guidelines for Designing AI Workflows][nielsen], a section of his July 13, 2026 UX Tigers article | Design for delegation and oversight, make outputs and changes reviewable, support asynchronous work, and help non-experts judge proposed work. | Use the guidance to shape the user journey. TUN supplies named context, plan, approval, activity, and receipt components plus explicit state and host-boundary contracts for implementing that journey. |
| **Anthropic's agent-building guidance** — [Building effective agents][anthropic], December 19, 2024 | Distinguishes predefined workflows from model-directed agents; emphasizes simple composition, environmental feedback, human checkpoints, stopping conditions, and clear agent-computer interfaces. The article itself points to newer tooling documentation. | Use the architectural guidance to decide how the agent works. TUN addresses what the person reviews and what the application must report at each boundary. A human checkpoint and a verified outcome are separate events in the TUN workflow. |
| **OpenAI's agent and UI guidance** — [Guardrails and human review][openai-review] and [UI guidelines for ChatGPT plugins][openai-ui] | Documents automatic guardrails separately from approval interruptions and resumable state. The UI guidance covers native conversation surfaces and an optional component library with styling and tokens. | Keep the runtime's guardrails and permissions, and follow the platform's UI requirements where applicable. TUN offers an application-owned presentation contract for version-bound review, unknown outcomes, and receipts. Connecting an SDK interruption to that contract needs an explicit host adapter; it is not a built-in integration. |
| **Microsoft HAX Toolkit** — [Toolkit][hax] and [Guidelines for Human-AI Interaction][hax-guidelines] | Research-grounded guidance, design patterns and examples, a prioritization workbook, and a playbook for anticipating failures. Its guidelines address initial interaction, ongoing use, errors, and changes over time. | Use HAX to plan and evaluate the broader human-AI experience. Use TUN's specification, components, threat model, and requirement-to-test evidence to implement and inspect an action-oriented workflow. TUN's repository tests are not a replacement for HAX's research or user evaluation. |

These approaches overlap on user control, appropriate feedback, and recoverability. TUN does not claim to originate those ideas or to demonstrate better usability than the cited work. Its emphasis is making the boundary between **presentation and application authority** explicit and testable.

## The concrete TUN contribution

The [reference architecture](ARCHITECTURE.md) separates approval, authorization, execution and verification; the [component catalog](COMPONENTS-v0.1.md) provides corresponding interface patterns.

The [conformance layer](../conformance/README.md) ties specification rules to tests and assessment procedures. The [threat model](THREAT-MODEL.md) allocates presentation safeguards and host enforcement. Together they make the integration inspectable.

The most direct demonstration is the [local Python/SQLite host example](../examples/host-integration/README.md). Its provider can commit a real local post while the client still has no action receipt. A separate server readback must match the operation, tenant, and canonical content before the UI shows completion. The example uses local identities and a sandbox provider; its [evidence map](../examples/host-integration/TRACEABILITY.md) records what was tested.

## Choosing a starting point

For planning, begin with UX/HAX guidance and the [TUN introduction](INTRODUCTION.md). For an existing application, keep the runtime and select one consequential workflow. Connect the host example to your identity and provider adapter, then evaluate it with users and a security reviewer. A deterministic automated workflow can also benefit; an LLM is not required.

Adopt the patterns relevant to that workflow rather than adding every component or replacing an established design system. The [roadmap](STATUS-AND-ROADMAP.md) distinguishes accepted capabilities from planned work.

## Sources and maintenance

This is the TUN maintainer's positioning analysis, not endorsement by the cited authors or organizations. The linked primary materials were consulted September 30, 2026. The Nielsen row cites his UX Tigers writing specifically; the Anthropic row compares the dated architectural article rather than asserting a current SDK feature inventory. OpenAI's two references distinguish runtime controls from platform-specific UI guidance.

Recheck these sources when updating the note, and keep TUN capability claims tied to merged source and named evidence. Possible composition is not tested interoperability.

[nielsen]: https://www.uxtigers.com/post/ux-roundup-20260713
[anthropic]: https://www.anthropic.com/engineering/building-effective-agents
[openai-review]: https://developers.openai.com/api/docs/guides/agents/guardrails-approvals
[openai-ui]: https://developers.openai.com/plugins/concepts/ui-guidelines
[hax]: https://www.microsoft.com/en-us/haxtoolkit/
[hax-guidelines]: https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/
