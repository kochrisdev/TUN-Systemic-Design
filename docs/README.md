# TUN documentation

[Repository home](../README.md) · [Introduction](INTRODUCTION.md) · [Public showcase](PUBLIC-SHOWCASE-v0.1.md) · [Getting started](GETTING-STARTED.md) · [Status and roadmap](STATUS-AND-ROADMAP.md) · [Scope and non-claims](SCOPE.md)

## Reading paths

**New visitors:** [An Introduction to TUN Systemic Design](INTRODUCTION.md) → Public Showcase → Guided Demo → Component Explorer → Concept Note.

**Product and design:** Introduction → Concept Note → Manifesto → Specification → Components → Visual System → Integration Checklist → [Conformance assessment](../conformance/README.md).

**Engineering:** Introduction → Getting Started → Architecture → React Components → Review Workflow → Evidence and Memory → Supervision and Recovery → [Requirement traceability](../conformance/TRACEABILITY.md) → Validation → Contributing.

**AI coding agents:** Check the implementation matrix, public exports, source contracts, and [application responsibilities](SCOPE.md#where-the-application-takes-over). Keep generated tokens reproducible and validation claims tied to executed checks. Preserve controller state across showcase navigation and enforce authority in the host application.

## Current guidance

| Document | Role |
|---|---|
| [An Introduction to TUN Systemic Design](INTRODUCTION.md) | Shared starting point for developers and non-developers: concepts, examples, components and adoption |
| [Scope and non-claims](SCOPE.md) | Central reference for application responsibilities, demo boundaries, validation coverage, release status and conformance |
| [Public Showcase](PUBLIC-SHOWCASE-v0.1.md) | Visitor journeys, state lifetime, specimens, metadata and Vercel configuration |
| [Concept Note](CONCEPT-NOTE.md) | Founding proposal and long-term vision |
| [Manifesto](MANIFESTO-v0.1.md) | Philosophy and TUN terminology |
| [Specification](SPECIFICATION-v0.1.md) | Draft behavioral requirements and conformance vocabulary |
| [Conformance assessment](../conformance/README.md) | Stable rule IDs, executable test mappings, fresh evidence reports and remaining assessment procedures |
| [Requirement traceability](../conformance/TRACEABILITY.md) | Generated requirement-to-test matrix and coverage inventory |
| [Components](COMPONENTS-v0.1.md) | Fourteen design patterns and implementation guidance |
| [Visual System](DESIGN-TOKENS-AND-VISUAL-SYSTEM-v0.1.md) | Tokens, styling and exporter behavior |
| [React Components](REACT-COMPONENTS-v0.1.md) | Package overview and core API |
| [Review Workflow](REVIEW-WORKFLOW-v0.1.md) | Context/plan/proposal APIs and approval binding |
| [Evidence and Memory](EVIDENCE-AND-MEMORY-v0.1.md) | Memory, sources and qualitative uncertainty |
| [Supervision and Recovery](SUPERVISION-AND-RECOVERY-v0.1.md) | Observations, intervention/recovery requests, evidence and simulation |
| [Getting Started](GETTING-STARTED.md) | Setup, commands, examples and package consumption |
| [Architecture](ARCHITECTURE.md) | Data flow, source ownership and host services |
| [Status and Roadmap](STATUS-AND-ROADMAP.md) | Available capabilities and next milestones |
| [Documentation checks](DOCUMENTATION-CHECKS.md) | Source-derived component counts, inventory synchronization and link validation |
| [Integration Checklist](INTEGRATION-CHECKLIST.md) | Product adoption worksheet |
| [Contributing](../CONTRIBUTING.md) | Change and review process |
| [Changelog](../CHANGELOG.md) | Repository milestones |

## Evidence and historical records

| Record | Scope |
|---|---|
| [Showcase Validation](SHOWCASE-VALIDATION-v0.1.md) | Public journeys, technical suites, focus/assets corrections, artifacts and deployment checks; final-head acceptance in PR 7 |
| [Supervision Validation](SUPERVISION-VALIDATION-v0.1.md) | Fourteen-component checks, review finding and artifacts; final-head acceptance in PR 6 |
| [Token Validation](TOKEN-VALIDATION-v0.1.md) | Generated declared token/contrast checks |
| [Evidence Validation](EVIDENCE-VALIDATION-v0.1.md) | Historical ten-component snapshot |
| [Consumer Validation](CONSUMER-VALIDATION-v0.1.md) | Historical seven-component isolated installation acceptance |
| [Review Validation](REVIEW-VALIDATION-v0.1.md) | Earlier workflow results and debugging history |
| [React Validation](REACT-VALIDATION-v0.1.md) | Historical four-component snapshot |
| [Documentation Audit](DOCUMENTATION-AUDIT-v0.1.md) | Earlier documentation review |

[PR 7](https://github.com/kochrisdev/TUN-Systemic-Design/pull/7) records public-showcase checks and merge state. [PR 6](https://github.com/kochrisdev/TUN-Systemic-Design/pull/6) records canonical-component acceptance. Use [What validation establishes](SCOPE.md#what-validation-establishes) to interpret the reports and their coverage.

## Sources of truth

Read the Introduction for orientation, and Specification and Components for intended behavior. For accepted props and exports inspect [core contracts](../packages/react/src/contracts.ts), [review contracts](../packages/react/src/review-contracts.ts), [evidence contracts](../packages/react/src/evidence-contracts.ts), [supervision contracts](../packages/react/src/supervision-contracts.ts) and [index.ts](../packages/react/src/index.ts).

Current implementation counts and the roadmap matrix are checked against the public exports by [the documentation checker](DOCUMENTATION-CHECKS.md). Use its explicit synchronization command after changing exports; retain historical snapshot counts.

The [conformance manifest](../conformance/spec-v0.1.json) maps mandatory specification statements to stable rule IDs, real test titles and explicit review procedures. Run `python scripts/check_conformance.py` to check traceability and add `--run` to collect fresh mapped-test results. Generated counts live in the traceability matrix rather than repeated prose.

[Showcase](../examples/react/Showcase.tsx) defines public navigation, [Guided Demo](../examples/react/GuidedDemo.tsx) presents the local model, and [the explorer catalog](../examples/react/showcase-catalog.ts) links actual components. The full technical lab is selected by `?lab=1` in the [application entry](../examples/react/main.tsx).

Edit [tokens.json](../tokens/tokens.json) for visual values, then regenerate CSS/reports. Inspect [package.json](../package.json) for commands, [package-lock.json](../package-lock.json) for the dependency graph, and [vercel.json](../vercel.json) for static deployment settings. Use named source/run evidence for tests and actual PR metadata for merge state.

Report conflicting guidance with its scope. Requirement changes need explicit review; preserve approval, privacy, evidence and recovery rules when resolving conflicts. Retain historical validation records when new acceptance succeeds.

## Status vocabulary

**Specified:** a design contract exists. **Implemented:** reference code is exported. **Validated:** a named check passed in a stated environment. **Published:** intentional distribution through a named channel.

See [Release status and conformance](SCOPE.md#release-status-and-conformance) for how document versions, package versions, commits, deployments and product-level assessments relate.
