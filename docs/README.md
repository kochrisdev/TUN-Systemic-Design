# TUN documentation

[Repository home](../README.md) · [Getting started](GETTING-STARTED.md) · [Status and roadmap](STATUS-AND-ROADMAP.md)

## Reading paths

**Product and design:** Concept Note → Manifesto → Specification → Components → Visual System → Integration Checklist.

**Engineering:** Getting Started → Architecture → React Components → Review Workflow → Evidence and Memory → Validation → Contributing.

**AI coding agents:** Read the implementation matrix, actual source contracts, and integration checklist before generating code. Do not assume catalog entries are exported, fabricate passed tests, edit generated tokens, or turn a UI callback, remembered preference, source check, or confidence label into permission to execute.

## Document map

| Document | Authority and purpose |
|---|---|
| [Concept Note](CONCEPT-NOTE.md) | Informative founding proposal. Long-term outputs are aspirations. |
| [Manifesto v0.1](MANIFESTO-v0.1.md) | Informative philosophy. IX is TUN terminology; the interface progression is conceptual. |
| [Specification v0.1](SPECIFICATION-v0.1.md) | Draft behavioral requirements and conformance vocabulary. |
| [Components v0.1](COMPONENTS-v0.1.md) | Fourteen design patterns and implementation status. |
| [Design Tokens and Visual System v0.1](DESIGN-TOKENS-AND-VISUAL-SYSTEM-v0.1.md) | Visual profile and supported exporter behavior. |
| [React Components v0.1](REACT-COMPONENTS-v0.1.md) | Public implementation overview, core APIs, and host responsibilities. |
| [Review Workflow v0.1](REVIEW-WORKFLOW-v0.1.md) | Context Panel, Plan View, Proposal Card, approval bindings, walkthrough. |
| [Evidence and Memory v0.1](EVIDENCE-AND-MEMORY-v0.1.md) | Memory Indicator, Source View, Uncertainty Signal; root exports, display safeguards, examples, and limits. |
| [Consumer Validation v0.1](CONSUMER-VALIDATION-v0.1.md) | Historical seven-component offline installation and static-render evidence. |
| [Review Validation v0.1](REVIEW-VALIDATION-v0.1.md) | Historical workflow evidence and debugging. Its earlier open consumer item was subsequently resolved. |
| [Getting Started](GETTING-STARTED.md) | Installation, commands, preview, packaging, troubleshooting. |
| [Architecture](ARCHITECTURE.md) | Build/data flow, source ownership, and trust boundaries. |
| [Status and Roadmap](STATUS-AND-ROADMAP.md) | Ten implemented versus four specified-only patterns and next increments. |
| [Integration Checklist](INTEGRATION-CHECKLIST.md) | Adoption worksheet, not certification. |
| [Token Validation v0.1](TOKEN-VALIDATION-v0.1.md) | Generated token evidence. |
| [React Validation v0.1](REACT-VALIDATION-v0.1.md) | Historical four-component evidence. |
| [Documentation Audit v0.1](DOCUMENTATION-AUDIT-v0.1.md) | Historical documentation review and limitations. |
| [Contributing](../CONTRIBUTING.md) | Change, review, validation, and maintenance. |
| [Changelog](../CHANGELOG.md) | Repository milestones, not npm releases. |

## Sources of truth

For intended behavior, read Specification and Components together. For accepted props, inspect [contracts.ts](../packages/react/src/contracts.ts), [review-contracts.ts](../packages/react/src/review-contracts.ts), [evidence-contracts.ts](../packages/react/src/evidence-contracts.ts), [public exports](../packages/react/src/index.ts), and component source. Implementation can fall short of a requirement; code does not silently redefine the specification.

New evidence/memory contracts are exported from the package root, not the existing contracts subpath. Do not invent a package subpath from an internal filename.

For visual values, edit [tokens.json](../tokens/tokens.json), not generated CSS/reports. For commands, inspect [package.json](../package.json); for installed dependencies, inspect [package-lock.json](../package-lock.json). A successful check needs a named source/run. A branch's contents do not establish merge or publication.

Historical records remain unchanged when new acceptance work passes. Use [PR 5](https://github.com/kochrisdev/TUN-Systemic-Design/pull/5) for this increment's final-head checks rather than reusing the seven-component counts. Do not reinterpret failed runs as successes.

Report conflicting sections and their scope. Do not weaken approval, privacy, or recovery requirements to resolve conflicts. Normative changes need a reviewed pull request explaining their effect.

## Status vocabulary

**Specified:** a design contract exists. **Implemented:** code is exported. **Validated:** a named check passed in a stated environment. **Published:** a package or release was intentionally distributed through a named channel. None means certified; there is no certification program here.

Document version 0.1, private package version 0.1.0, commits, and deployment versions are different identifiers. Use commit and archive digest to reproduce an exact build.
