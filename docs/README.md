# TUN documentation

[Repository home](../README.md) · [Public showcase](PUBLIC-SHOWCASE-v0.1.md) · [Getting started](GETTING-STARTED.md) · [Status and roadmap](STATUS-AND-ROADMAP.md)

## Reading paths

**New visitors:** Public Showcase → Guided Demo → Component Explorer → Concept Note.

**Product and design:** Concept Note → Manifesto → Specification → Components → Visual System → Integration Checklist.

**Engineering:** Getting Started → Architecture → React Components → Review Workflow → Evidence and Memory → Supervision and Recovery → Validation → Contributing.

**AI coding agents:** Check the implementation matrix, public exports and source contracts. All fourteen canonical components have reference exports; that supplies no model, authorization service, memory backend or real cancellation/recovery. Never fabricate validation, hand-edit generated tokens, or turn presentation callbacks into authority. The public shell preserves its controllers across navigation; do not replace view changes with destructive task resets.

## Current guidance

| Document | Role |
|---|---|
| [Public Showcase](PUBLIC-SHOWCASE-v0.1.md) | Visitor journeys, state lifetime, specimen boundaries, metadata and Vercel configuration |
| [Concept Note](CONCEPT-NOTE.md) | Founding proposal; long-term outputs are aspirations |
| [Manifesto](MANIFESTO-v0.1.md) | Philosophy and TUN terminology, not an exclusive history |
| [Specification](SPECIFICATION-v0.1.md) | Draft behavioral requirements and conformance vocabulary |
| [Components](COMPONENTS-v0.1.md) | Fourteen design patterns and implementation boundaries |
| [Visual System](DESIGN-TOKENS-AND-VISUAL-SYSTEM-v0.1.md) | Tokens, styling and exporter behavior |
| [React Components](REACT-COMPONENTS-v0.1.md) | Package overview and core API |
| [Review Workflow](REVIEW-WORKFLOW-v0.1.md) | Context/plan/proposal APIs and approval binding |
| [Evidence and Memory](EVIDENCE-AND-MEMORY-v0.1.md) | Memory, sources and qualitative uncertainty |
| [Supervision and Recovery](SUPERVISION-AND-RECOVERY-v0.1.md) | Observations, intervention/recovery requests, evidence and simulation |
| [Getting Started](GETTING-STARTED.md) | Setup, commands, examples and package consumption |
| [Architecture](ARCHITECTURE.md) | Data flow, source ownership and host services |
| [Status and Roadmap](STATUS-AND-ROADMAP.md) | Implemented versus planned capabilities |
| [Integration Checklist](INTEGRATION-CHECKLIST.md) | Adoption worksheet, not certification |
| [Contributing](../CONTRIBUTING.md) | Change and review process |
| [Changelog](../CHANGELOG.md) | Repository milestones, not npm releases |

## Evidence and historical records

| Record | Scope |
|---|---|
| [Showcase Validation](SHOWCASE-VALIDATION-v0.1.md) | Public journeys, preserved technical suites, focus/assets corrections, artifact identity and deployment limits; final-head acceptance in PR 7 |
| [Supervision Validation](SUPERVISION-VALIDATION-v0.1.md) | Fourteen-component implementation checks, review finding, artifacts and limits; final-head acceptance in PR 6 |
| [Token Validation](TOKEN-VALIDATION-v0.1.md) | Generated declared token/contrast checks |
| [Evidence Validation](EVIDENCE-VALIDATION-v0.1.md) | Historical ten-component snapshot |
| [Consumer Validation](CONSUMER-VALIDATION-v0.1.md) | Historical seven-component isolated installation acceptance |
| [Review Validation](REVIEW-VALIDATION-v0.1.md) | Earlier workflow results and debugging history |
| [React Validation](REACT-VALIDATION-v0.1.md) | Historical four-component snapshot |
| [Documentation Audit](DOCUMENTATION-AUDIT-v0.1.md) | Earlier documentation review |

[PR 7](https://github.com/kochrisdev/TUN-Systemic-Design/pull/7) records public-showcase checks and merge state. [PR 6](https://github.com/kochrisdev/TUN-Systemic-Design/pull/6) records canonical-component acceptance. Older counts remain dated evidence, not current implementation limits. Authored tests are not successful tests until a named run passes. Source merge, Vercel deployment readiness, and a successful live smoke test are separate observations.

## Sources of truth

Read Specification and Components for intended behavior. For accepted props and exports inspect [core contracts](../packages/react/src/contracts.ts), [review contracts](../packages/react/src/review-contracts.ts), [evidence contracts](../packages/react/src/evidence-contracts.ts), [supervision contracts](../packages/react/src/supervision-contracts.ts) and [index.ts](../packages/react/src/index.ts). An implementation may fall short; code does not silently redefine a requirement.

[Showcase](../examples/react/Showcase.tsx) defines public navigation, [Guided Demo](../examples/react/GuidedDemo.tsx) presents the unchanged local model, and [the explorer catalog](../examples/react/showcase-catalog.ts) links actual components. The preserved full technical lab is selected by `?lab=1` in the [application entry](../examples/react/main.tsx). Native hash links do not execute task operations.

Edit [tokens.json](../tokens/tokens.json) for visual values, not generated CSS/reports. Inspect [package.json](../package.json) for commands, [package-lock.json](../package-lock.json) for the dependency graph, and [vercel.json](../vercel.json) for static deployment settings. Use named source/run evidence for tests and actual PR metadata for merge state.

Report conflicting guidance with its scope. Do not weaken approval, privacy, evidence or recovery rules to resolve conflicts. Normative changes require explicit review. Historical validation records remain unchanged when new acceptance succeeds.

## Status vocabulary

**Specified:** a design contract exists. **Implemented:** reference code is exported. **Validated:** a named check passed in a stated environment. **Published:** intentional distribution through a named channel. None means certified; no certification program is supplied.

Document version 0.1, private package version 0.1.0, Git commits and deployment versions are distinct. Identify exact builds by source SHA and archive digest.
