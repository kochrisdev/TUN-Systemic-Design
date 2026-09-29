# An Introduction to TUN Systemic Design

## Designing intelligence around humanity

*A practical guide for developers and non-developers who build, design, commission, manage, or use AI products.*

**Version:** 0.1 · **Date:** September 29, 2026  
**Document type:** Informative introduction. This guide explains TUN; it does not add requirements to the [Specification](SPECIFICATION-v0.1.md). Implementation statements describe the v0.1 reference system; consult the [status and roadmap](STATUS-AND-ROADMAP.md) for current scope.

[Documentation index](README.md) · [Interactive showcase](https://tun-systemic-design-demo.vercel.app/) · [Developer setup](GETTING-STARTED.md)

## TUN in one minute

**TUN Systemic Design is a design framework and reference component library for making AI products understandable, controllable, and accountable.**

It addresses not only what an interface looks like, but how a product communicates intent, context, permission, uncertainty, actions, and outcomes.

A person should be able to understand what the system is using, what it proposes, what it is allowed to do, what actually happened, and what can be changed or recovered.

For non-developers, TUN provides a vocabulary for specifying and evaluating an AI experience. For developers, it provides interaction contracts, visual tokens, React components, and working examples to help implement that experience.

> **Human Intent. Machine Intelligence. Systemic Design.**

## 1. Start with a familiar idea: the design system

A design system is a shared set of principles, reusable patterns, and building blocks for creating consistent products.

Think of a building. Its design is not just the paint on the walls. Doors need recognizable handles, signs need to be understandable, and emergency exits need to be usable. Different specialists must agree on how those parts work together.

Software needs similar agreements. A button should look clickable, communicate its purpose, work with a keyboard, and show a meaningful result when pressed.

TUN applies this thinking to products involving AI. It asks an additional question:

**What should happen before and after an intelligent system takes action?**

For example, the design of a **Send update** button includes more than its color. It includes showing the intended recipients, the content being sent, who is sending it, whether the user has authorized that action, and what the system can confirm afterward.

TUN does not replace good interface design. It connects that design to the behavior of the system behind it.

## 2. Why the word “systemic” matters

An AI experience can involve several connected parts: a person, a model, an agent, information sources, memory, external tools, and application rules.

A **model** is the computational system used for tasks such as interpreting language or generating a draft. An **agent** is software organized to pursue a task, potentially using a model and tools. A **tool** is a capability such as reading a document or submitting an update. Calling software an agent does not imply consciousness, competence, or permission.

A product might produce an excellent draft but send it to the wrong audience. It might have a reassuring progress indicator while a worker is actually blocked. It might offer an Undo button even though the original information has already been copied elsewhere.

Those are not just visual problems. They are failures in the relationships between parts of the system.

TUN therefore asks teams to design the whole relationship:

```text
Human goal
    ↓
Relevant context and permitted capabilities
    ↓
Proposed approach and actions
    ↓
Authorized execution
    ↓
Observed results and recovery
    ↓
Human understanding and control
```

This is a conceptual picture, not an architecture that every product must copy. A simple assistant may need no tools, persistent memory, or autonomous agents. It can still benefit from clear sources, honest limitations, and an understandable result.

The founding rationale is developed in the [Concept Note](CONCEPT-NOTE.md) and [Manifesto](MANIFESTO-v0.1.md).

## 3. An everyday example: preparing a project update

Imagine asking an assistant:

> “Prepare a project update from these notes. Let me review it before anything is published.”

A TUN-style experience makes several distinctions visible.

### Understand the intention

The desired outcome is a reviewable project update. The instruction includes a boundary: **prepare first; do not publish yet**.

The product should not interpret the ability to publish as permission to publish. It should clarify missing information only when that information matters to safe or useful progress.

### Explain the context

The assistant shows which notes are available and which actually informed the draft. A connected document is not necessarily a document that was read. Missing or restricted information is identified rather than silently treated as complete.

This is the role of a **Context Panel**.

### Present the approach

The product explains that it will read the supplied notes, prepare a draft, and wait for review before any publication.

A **Plan View** makes this approach understandable. It presents useful steps and dependencies, not a transcript of internal model reasoning.

Agreeing that the plan makes sense is not the same as authorizing publication.

### Show the exact proposal

A **Proposal Card** displays the draft, destination, acting agent, expected effect, requested authority, and recovery limitations.

The proposal answers: **“What would happen next?”** It does not claim anything has already happened.

### Request an explicit decision

An **Approval Gate** asks the person to approve or reject the particular action. Its label describes the action rather than disguising it behind a vague Continue button.

Changing the destination or material content requires a new review. Earlier approval should not silently transfer to a different action.

### Confirm the known result

After execution, an **Action Receipt** answers: **“What actually happened, and how do we know?”**

In a real product, a service accepting a publication request might not prove the post is publicly visible. The receipt should state the result that the application can substantiate, including anything still unverified.

If a connection fails, the outcome may be unknown rather than failed. Before trying again, the application should check whether the first attempt already took effect.

**The TUN showcase implements a local simulation of this journey. It does not use a live model or publish anything externally.** The [review workflow guide](REVIEW-WORKFLOW-v0.1.md) explains the actual implementation.

## 4. The TUN interaction model

TUN summarizes intelligent interaction as:

```text
ASK → THINK → PROPOSE → ACT → LEARN
```

**Ask** means establish the goal and relevant constraints. **Think** means develop an approach. **Propose** means present what needs human judgment. **Act** means perform authorized work. **Learn** means use permitted feedback or context to improve subsequent interactions.

For consequential work requiring review, the model becomes:

```text
ASK → THINK → PROPOSE → APPROVE → ACT → VERIFY → LEARN
```

These are conceptual stages, not seven mandatory screens. A low-risk summary may need a much shorter interaction. A consequential external action may need explicit approval, verification, and recovery planning.

LEARN does not mean the product automatically trains a model or stores everything a person says. Session context, saved preferences, operational records, and model training are different activities with different controls.

The design goal is **the least interaction necessary to preserve useful human understanding and control**, not the largest possible number of confirmation dialogs. See [Specification section 4](SPECIFICATION-v0.1.md#4-core-interaction-model).

## 5. Eight principles, in ordinary language

| Principle | What it means in practice |
|---|---|
| **Transparent** | Explain important behavior, sources, limitations, and outcomes without overwhelming the person. |
| **User Sovereign** | Preserve meaningful human authority, within legitimate roles, permissions, and other people's rights. |
| **Natural** | Let people express goals without needing to understand model architecture or prompt engineering. |
| **Systemic** | Consider effects across people, agents, tools, data, and organizations, not just one screen. |
| **Adaptive** | Respond to context without silently changing material behavior or authority. |
| **Reversible** | Offer correction and recovery where feasible, and explain what cannot be undone. |
| **Composable** | Make capabilities and interfaces reusable without losing their behavioral agreements. |
| **Calm** | Protect attention. Show complexity when it helps understanding, decisions, or control. |

These principles work together. For example, hiding a material warning might make a screen quieter, but it would not make the overall experience calm or transparent. Similarly, showing every low-level technical event can expose information without helping anyone understand it.

The [Specification](SPECIFICATION-v0.1.md#5-tun-principles) develops these principles into requirements. This introduction is a plain-language explanation, not a substitute for those requirements.

## 6. The distinctions that make TUN useful

### Capability is not authority

An agent may be able to send messages but be authorized only to draft them. A remembered preference for Friday updates does not authorize an external message every Friday.

TUN describes autonomy from **Level 0: Human Only**, through **AI Assists**, **AI Proposes**, and **AI Acts**, to **Level 4: AI Operates** within delegated goals and boundaries. These levels describe arrangements for work, not an intelligence score or automatic permission grant.

Consequences are classified separately: **C0** informational, **C1** local reversible, **C2** shared reversible, **C3** external consequential, and **C4** high consequence. Classification depends on the full effect: creating a calendar record that also sends invitations is not merely a local edit.

Under the draft v0.1 rules, C4 actions need explicit, recorded approval of the particular proposal. A broad autonomy setting is not enough. See [autonomy and consequences](SPECIFICATION-v0.1.md#6-autonomy-model).

### Available information is not verified information

A file can be available without being used. A source can be used without supporting a particular claim. A citation can identify a source without proving the AI's interpretation is correct.

TUN separates context, evidence, and uncertainty. Its uncertainty labels run from **U0: Confirmed within a stated scope** to **U3: Unknown**, with **High Confidence** and **Inferred** between them. These are qualitative descriptions, not calibrated percentages.

A useful product explains the basis and limits of an assessment. It does not manufacture trust with a green badge or an unsupported “99% confident.”

### Memory is not blanket permission or a retention guarantee

TUN distinguishes **M0: No AI memory after the active task**, **M1: Session context**, **M2: User-controlled persistent memory**, and **M3: Operational memory** used to continue authorized work.

These are categories of context reuse, not rankings from bad to good. More than one may apply in different parts of a product. M0 does not, by itself, mean that logs, backups, or other records do not exist. Disabling memory does not prove deletion from every system.

The [evidence and memory guide](EVIDENCE-AND-MEMORY-v0.1.md) explains the implementation and its limits.

### Requested, acknowledged, and completed are different states

A click means a request was made. An acknowledgement means a request was received or accepted. Neither establishes the final outcome.

The same distinction applies to stopping work. **Stop requested** does not mean **Stopped**, and **Stopped** does not mean earlier effects were reversed.

Recovery also has different meanings. **Undo** restores an earlier state where possible. **Compensation** applies another action to offset an effect without erasing its history. **Reconciliation** checks authoritative records to establish what happened. **Retry** attempts work again and can duplicate effects if used carelessly.

The [supervision and recovery guide](SUPERVISION-AND-RECOVERY-v0.1.md) keeps these concepts separate.

## 7. Meet the fourteen building blocks

A TUN component is a reusable interface element with an interaction contract: what it communicates, which states it supports, and what its controls mean.

| Component | The human question it helps answer |
|---|---|
| **Intent Composer** | What do I want to achieve, and within what scope? |
| **Agent Card** | Who or what is acting, and what may it do? |
| **Context Panel** | Which information is available, used, missing, or restricted? |
| **Plan View** | What approach is being proposed? |
| **Proposal Card** | What exactly could happen next? |
| **Approval Gate** | Do I authorize this particular action? |
| **Action Receipt** | What happened, and what is verified? |
| **Memory Indicator** | What context is remembered or reused here? |
| **Source View** | What evidence supports or contradicts this claim? |
| **Uncertainty Signal** | What is known, inferred, or still unknown? |
| **Tool Activity** | What operation is a tool reported to be performing? |
| **Agent Activity** | What is the agent doing, and what is blocking progress? |
| **Human Override** | How can I request intervention in this work? |
| **Recovery Control** | What supported recovery or status-check action is available? |

All fourteen have reference React implementations in v0.1. That does not mean every product needs all fourteen, that every possible state is covered, or that the underlying services are supplied.

Explore them in the [Component Explorer](https://tun-systemic-design-demo.vercel.app/#components), or read the [component catalog](COMPONENTS-v0.1.md). Explorer specimens are read-only examples; the guided and trust labs provide simulated interaction.

## 8. What TUN looks like

TUN's visual philosophy is:

> **Simplicity with Boldness.**  
> **Consistency with Conciseness.**  
> **Clarity with Confidence.**

The aim is strong hierarchy, readable typography, purposeful spacing, restrained color, and motion that explains a change rather than pretending to demonstrate intelligence.

A **design token** is a named design value, such as the color of primary text or the spacing between controls. Giving those values shared names helps different screens remain consistent and supports light and dark themes.

Visual meaning should not depend on color alone. A waiting state needs understandable text, not merely a yellow dot. A critical control needs a usable label and keyboard access, not merely a prominent shape.

The [visual system guide](DESIGN-TOKENS-AND-VISUAL-SYSTEM-v0.1.md) covers tokens and styling. Clear presentation supports good behavior; it does not prove that an action is authorized or a claim is true.

## 9. For non-developers: how to use TUN

You do not need to write code to apply TUN.

A founder or product manager can use it to describe the intended experience: what outcome matters, what authority may be delegated, and which decisions need review. A designer can map the moments when someone needs context, evidence, permission controls, or recovery. An operations leader can define ownership, exceptions, and escalation.

A useful product brief might say:

> “The assistant may read these approved notes and prepare a draft. It must show the proposed content and destination before publication. A person with the right role approves the exact action. If the result is unconfirmed, the product checks the existing record before offering another attempt.”

That is much more actionable than “make the AI trustworthy.”

During a demonstration, ask the team to show a missing source, a rejected proposal, a changed target, an unknown outcome, and a stop request. Ask what the interface knows in each case and which service enforces the boundary.

TUN gives non-developers a way to discuss behavior precisely without prescribing the internal technology. The [integration checklist](INTEGRATION-CHECKLIST.md) turns those questions into an adoption worksheet.

## 10. For developers: where TUN fits

TUN is not a model provider or an autonomous-agent runtime. Its reference React package supplies presentation components, TypeScript contracts, and supporting display checks. Your application supplies the facts, permissions, and execution services.

A useful division of responsibility is:

```text
TUN components
    Display context, proposals, status, evidence, and controls
    Emit narrowly defined user requests
                         ↓
Your application services
    Authenticate the user and validate the request
    Check canonical versions, scope, expiry, and permissions
    Prevent duplicate effects, execute, observe, and record
                         ↓
TUN components
    Present the application-confirmed result and available next steps
```

The **host application** means the product into which TUN is integrated. Its trusted services, not the browser's appearance, decide whether an operation is allowed.

For example, Approval Gate emits a decision associated with a proposal ID and version. The application must resolve those references to its own canonical record and recheck authority before executing. Do not interpret a rendered Approve button, model output, or successful callback as authorization infrastructure.

TypeScript describes expected data shapes during development. It is not sufficient validation of arbitrary JSON arriving from a model, browser, or external service. Likewise, a local duplicate-submission guard is not durable **idempotency**: preventing the same logical action from taking effect twice across retries, remounts, or tabs.

### A small display-only example

After installing the repository-local package using [Getting Started](GETTING-STARTED.md#build-and-consume-a-local-package), a compatible React application can render:

```tsx
import { MemoryIndicator } from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';

export function DraftContextNotice() {
  return (
    <MemoryIndicator
      memory={{
        id: 'example-draft-session',
        version: '1',
        type: 'M1',
        state: 'active',
        scope: 'This example project-update draft',
        influence: 'The supplied example notes informed this draft.',
      }}
    />
  );
}
```

This renders synthetic, application-supplied metadata. It does not create memory, inspect a model, establish a storage policy, or grant permission. In a real application, supply a record that accurately reflects that task. No callback or external action is included here.

The [Memory Indicator source](../packages/react/src/MemoryIndicator.tsx), [React API guide](REACT-COMPONENTS-v0.1.md), and [architecture guide](ARCHITECTURE.md) explain the contract in more detail. The framework is broader than React; React is the current reference implementation, not a requirement for understanding the principles.

## 11. Try the experience without writing code

Open the [public showcase](https://tun-systemic-design-demo.vercel.app/) and select **Try the guided demo**.

Use the supplied request and choose **Inspect context**, then **Prepare plan**. Review the approach, create the proposal, and open **Review action**. Notice that none of these steps publishes anything.

Choose **Simulate publish** to see a verified local receipt, or **Reject action** to see the rejection outcome. On another run, expand **Test an unconfirmed outcome** before approving and observe why the next step is a record check rather than another publication.

Then visit **Components** to inspect the building blocks, and **Trust & control** to explore memory, evidence, stopping, and compensation. Its supervision controls operate a separate fixture, not the guided publication task.

The [showcase guide](PUBLIC-SHOWCASE-v0.1.md) documents these paths. Navigation within the showcase preserves visited task state. Refreshing clears the page simulation; it is not real-world undo. No AI model, external publication, connected account, or persistent AI memory is provided by these examples.

## 12. Adopt TUN one workflow at a time

Begin with a bounded task, such as drafting a project update. Describe the desired outcome and permitted inputs. Identify possible effects, who may authorize them, and what evidence will establish completion.

Choose only the components needed to make that task understandable. A read-only summarizer may emphasize sources and uncertainty. A publishing assistant needs exact proposals, authorization, and receipts. Long-running delegated work additionally needs observation, intervention, and recovery.

Then design the difficult cases before expanding scope: unavailable information, changed permissions, expired proposals, partial completion, lost acknowledgements, and unsupported recovery. Implement the corresponding service-side checks and test them independently from the interface.

Evaluate success through task completion, correct understanding, appropriate intervention, and recovery—not just fewer clicks or more automation. An approval step that nobody understands is not meaningful control.

## 13. What exists today, and what remains your responsibility

The v0.1 repository contains founding documents, a draft behavioral specification, fourteen reference React components, visual tokens and themes, a public showcase, technical examples, and validation tooling.

It does not supply a production model runtime, authorization service, persistent-memory backend, independent evidence verifier, real worker-cancellation service, or recovery engine. Figma and other design-tool adapters, complete runtime schemas, and broader framework/accessibility validation remain separate work as recorded in the [roadmap](STATUS-AND-ROADMAP.md).

The React package is repository-local and unpublished to npm at this revision. A hosted demo is not a published package. A passing test is evidence for its stated source and environment, not a guarantee about every integration.

TUN is a project design framework, not an independently adopted industry standard or certification scheme. Using its components does not automatically make a product TUN-conformant. Any such claim needs a declared scope and evidence against applicable requirements.

## 14. Where to go next

**For product and design readers:** Continue with the [Concept Note](CONCEPT-NOTE.md), [Manifesto](MANIFESTO-v0.1.md), and [component catalog](COMPONENTS-v0.1.md).

**For developers:** Follow [Getting Started](GETTING-STARTED.md), then the [architecture](ARCHITECTURE.md) and [React API](REACT-COMPONENTS-v0.1.md) guides. Use the [documentation index](README.md) to find detailed review, evidence, memory, and recovery contracts.

**For anyone evaluating adoption:** Read the [Specification](SPECIFICATION-v0.1.md) alongside the [integration checklist](INTEGRATION-CHECKLIST.md) and [implementation status](STATUS-AND-ROADMAP.md). Requirements, implemented behavior, and validation evidence are different kinds of information.

## The idea to remember

**TUN is not about making AI look more intelligent. It is about helping people understand, direct, and verify intelligent work.**

The interface may become simpler as the system becomes more capable. The relationship should not become less understandable.

> **Design intelligence around humanity.**
