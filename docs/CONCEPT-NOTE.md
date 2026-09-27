# TUN Systemic Design
## A Design System for AI-Native Products

**Concept Note | Version 0.1 | September 2026**

## 1. The Idea

TUN Systemic Design is a design system and design philosophy for building AI-native products.

Traditional design systems were created primarily for software interfaces: screens, pages, buttons, forms, navigation, and workflows.

AI changes what a product is.

An AI product does not simply display information and wait for instructions. It can understand intent, generate content, reason over information, use tools, remember context, collaborate with other agents, recommend actions, execute tasks, and adapt over time.

Designing such products therefore requires more than a UI design system.

It requires a **systemic design approach**.

TUN Systemic Design provides a common framework for designing the complete relationship between:

**Human + AI + Agents + Data + Tools + Decisions + Actions + Learning**

## 2. Vision

> **Create a universal design language for intelligent products.**

TUN Systemic Design aims to make AI products understandable, trustworthy, useful, controllable, and natural to interact with.

The ambition is not simply to create better-looking AI interfaces.

It is to establish principles, patterns, components, and technical standards for designing **intelligent systems around human intent**.

## 3. Why TUN Is Needed

Most existing design systems assume a deterministic world.

A user performs an action. The software follows predefined logic. The interface returns a predictable result.

AI systems behave differently.

They may interpret ambiguous instructions, generate different outputs from similar inputs, use external tools, operate autonomously, maintain memory, coordinate multiple agents, and make decisions under uncertainty.

This creates new design questions:

- How should an AI communicate uncertainty?
- When should an agent ask permission?
- What should an autonomous agent be allowed to do?
- How should users understand what an AI has done?
- How should AI memory be represented?
- How can users correct an AI?
- How should multiple agents collaborate?
- How should humans intervene?
- How should actions be reversed?
- How do we design trust without creating false confidence?

These are not simply interface problems.

They are **system design problems**.

## 4. The TUN Systemic Model

TUN views an AI product as a continuous intelligence system.

```text
HUMAN → INTENT → AI → REASON → ACT → OBSERVE → LEARN → HUMAN
```

The system begins with human intent and ultimately returns understanding, outcomes, and control to the human.

The human should not disappear as AI becomes more autonomous.

Instead, the interface evolves from:

**Human operates software**

to:

**Human directs intelligence.**

## 5. The TUN Interaction Model

At the center of TUN is a simple five-stage interaction model:

```text
ASK → THINK → PROPOSE → ACT → LEARN
```

### ASK

Understand the human's intent, context, constraints, and desired outcome.

### THINK

Interpret the request, gather relevant context, reason about alternatives, and determine possible actions.

### PROPOSE

Present recommendations, plans, choices, uncertainty, or consequences when human judgment is appropriate.

### ACT

Generate, execute, communicate, transact, automate, or coordinate actions through authorized tools and agents.

### LEARN

Use outcomes, corrections, preferences, and context to improve future interactions where appropriate and permitted.

Not every interaction requires every stage.

Simple tasks may move directly:

```text
ASK → ACT
```

Complex or consequential tasks may require:

```text
ASK → THINK → PROPOSE → HUMAN APPROVAL → ACT → VERIFY → LEARN
```

The interface should make the appropriate level of autonomy clear.

## 6. Core Principles

TUN Systemic Design is built around eight principles.

### 1. Transparent

Users should understand what the AI is doing, what information it is using, and what actions it has taken.

Transparency does not mean exposing every internal computation. It means exposing the information humans need to understand and control the system.

### 2. User Sovereign

The human remains the ultimate authority.

AI may assist, recommend, automate, or act within delegated authority, but meaningful human control must remain available.

### 3. Natural

People should communicate intent naturally.

The system should adapt to humans rather than forcing humans to learn machine-oriented interaction models.

### 4. Systemic

Design the entire intelligence system rather than individual screens.

Every product should be considered as a relationship among people, models, agents, data, tools, environments, and outcomes.

### 5. Adaptive

AI products should respond intelligently to context while remaining understandable and predictable enough for users to trust.

### 6. Reversible

Important AI actions should, wherever technically possible, be inspectable, interruptible, correctable, or reversible.

### 7. Composable

Models, agents, tools, workflows, data sources, interfaces, and human roles should function as interoperable building blocks.

### 8. Calm

AI should reduce cognitive burden.

The interface should surface what matters, when it matters, rather than continuously exposing the complexity underneath.

## 7. Human–AI Agency

TUN treats autonomy as a spectrum rather than an on/off setting.

**Level 0 — Human Only**  
The system provides tools but no intelligent assistance.

**Level 1 — AI Assists**  
AI provides information, generation, or recommendations.

**Level 2 — AI Proposes**  
AI develops actions but waits for human approval.

**Level 3 — AI Acts**  
AI performs authorized actions within defined boundaries.

**Level 4 — AI Operates**  
Agents independently pursue delegated goals while humans supervise through policies, limits, monitoring, and exception handling.

Increasing autonomy should be accompanied by increasing accountability, observability, and control.

## 8. Designing for Agents

AI agents introduce a new design object.

Traditional systems are built around:

**Pages + Components + Users**

AI-native systems increasingly involve:

**Humans + Agents + Tools + Context + Goals**

TUN therefore introduces an **Agent Design Language**.

Every agent should communicate several essential characteristics:

- Identity
- Purpose
- Capability
- Authority
- Context
- State
- History
- Accountability

## 9. TUN AI Components

TUN will introduce reusable components specifically for intelligent products.

Examples include:

- Agent Card
- Intent Composer
- Context Panel
- Plan View
- Proposal Card
- Approval Gate
- Action Receipt
- Memory Indicator
- Source View
- Uncertainty Signal
- Tool Activity
- Agent Activity
- Human Override
- Undo / Recovery

These become the building blocks of AI-native interfaces.

## 10. Visual Philosophy

TUN follows a simple visual philosophy:

> **Simplicity with Boldness.**  
> **Consistency with Conciseness.**  
> **Clarity with Confidence.**

The interface should be quiet while the intelligence behind it may be complex.

The visual language should favor strong typography, structured grids, generous space, clear hierarchy, minimal decoration, purposeful motion, high information clarity, and restrained use of color.

Complex intelligence should produce **simple experiences**.

## 11. Architecture of TUN

TUN can develop into nine interconnected layers:

1. **TUN Foundations**
2. **TUN Intelligence**
3. **TUN Interaction**
4. **TUN Agents**
5. **TUN Components**
6. **TUN Patterns**
7. **TUN Safety & Trust**
8. **TUN Tokens**
9. **TUN SDK**

## 12. Beyond UI

A defining characteristic of TUN is that the design system does not stop at the screen.

TUN considers:

- Experience Design
- Interaction Design
- Agent Design
- System Design
- Governance Design
- Interface Design

Therefore:

> **TUN is not simply a UI system for AI. It is a systemic design framework for Human–AI systems.**

## 13. Designed for Humans and Machines

Traditional design systems are primarily documentation for human designers and developers.

TUN should be **machine-readable by design**.

Its principles, components, tokens, patterns, permissions, and interaction rules can eventually be expressed as structured specifications.

This would allow an AI coding agent to receive an instruction such as:

> "Build this product according to TUN Systemic Design."

The agent could understand not only visual styling but also how AI interactions, approvals, memory, autonomy, uncertainty, and actions should behave.

TUN therefore becomes both:

**a design language for humans**

and

**a design protocol for AI builders.**

## 14. Open System

TUN Systemic Design should ultimately become an open and extensible system.

Potential outputs include:

- TUN Design Specification
- TUN Pattern Library
- TUN Figma Library
- TUN React Components
- TUN Tailwind Tokens
- TUN Agent UX Specification
- TUN Accessibility Standard
- TUN AI Safety Patterns
- TUN Design Linter
- TUN SDK
- TUN Certification

## 15. Long-Term Ambition

The web created new interaction languages.

Mobile created new interaction languages.

AI will create another.

The transition is larger than replacing search boxes with chat boxes.

Software is moving from interfaces people operate toward intelligent systems people **instruct, delegate to, collaborate with, and supervise**.

TUN Systemic Design is intended to help define that new relationship.

Its central question is:

> **How should humans design, understand, direct, and live with increasingly intelligent digital systems?**

The objective is a design system where intelligence can become increasingly capable without making the human experience increasingly complicated.

---

## TUN Systemic Design

### Human Intent. Machine Intelligence. Systemic Design.

**Design intelligence around humanity.**
