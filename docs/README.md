# TUN documentation

[Repository home](../README.md) · [Getting started](GETTING-STARTED.md) · [Status and roadmap](STATUS-AND-ROADMAP.md)

## Reading paths

**Product and design:** Concept Note → Manifesto → Specification → Components → Visual System → Integration Checklist.

**Engineering:** Getting Started → Architecture → React Components → Review Workflow → Validation → Contributing.

**AI coding agents:** Read the implementation matrix, actual source contracts, and integration checklist before generating code. Do not assume a catalog entry is an exported component, fabricate a passed test, edit generated token outputs, or turn a UI callback into implicit permission to execute.

## Document map

| Document | Authority and purpose |
|---|---|
| [Concept Note](CONCEPT-NOTE.md) | Informative founding proposal. Long-term outputs are aspirations. |
| [Manifesto v0.1](MANIFESTO-v0.1.md) | Informative philosophy. IX is TUN terminology; the interface progression is conceptual, not an exclusive history. |
| [Specification v0.1](SPECIFICATION-v0.1.md) | Draft project behavioral requirements and conformance vocabulary. |
| [Components v0.1](COMPONENTS-v0.1.md) | Draft contracts for fourteen design patterns and current implementation status. |
| [Design Tokens and Visual System v0.1](DESIGN-TOKENS-AND-VISUAL-SYSTEM-v0.1.md) | Concrete visual profile and supported exporter behavior. |
| [React Components v0.1](REACT-COMPONENTS-v0.1.md) | Seven exports, core APIs, and host responsibilities. |
| [Review Workflow v0.1](REVIEW-WORKFLOW-v0.1.md) | Context Panel, Plan View, Proposal Card, optional approval bindings, and local walkthrough. |
| [Review Validation v0.1](REVIEW-VALIDATION-v0.1.md) | This increment's observed evidence and remaining acceptance work. |
| [Getting Started](GETTING-STARTED.md) | Installation, commands, preview, packaging, and troubleshooting. |
| [Architecture](ARCHITECTURE.md) | Source ownership, build/data flow, and application trust boundaries. |
| [Status and Roadmap](STATUS-AND-ROADMAP.md) | Implemented versus specified capabilities and next increments. |
| [Integration Checklist](INTEGRATION-CHECKLIST.md) | Adoption and review worksheet; not certification. |
| [Token Validation v0.1](TOKEN-VALIDATION-v0.1.md) | Generated evidence; regenerate with the token builder. |
| [React Validation v0.1](REACT-VALIDATION-v0.1.md) | Historical four-component evidence tied to source, toolchain, run, and artifact identifiers. |
| [Documentation Audit v0.1](DOCUMENTATION-AUDIT-v0.1.md) | Historical review scope, findings, and limitations. |
| [Contributing](../CONTRIBUTING.md) | Change, review, validation, and documentation maintenance. |
| [Changelog](../CHANGELOG.md) | Repository milestones, not a list of npm releases. |

## Sources of truth

For **intended behavior**, read the draft Specification and Components together. For **what code actually accepts**, inspect [contracts.ts](../packages/react/src/contracts.ts), [review-contracts.ts](../packages/react/src/review-contracts.ts), [public exports](../packages/react/src/index.ts), and component source. An implementation can fall short of a requirement; code does not silently redefine the specification.

For **visual values**, edit [tokens.json](../tokens/tokens.json), not generated CSS/reports. For **commands**, inspect [package.json](../package.json); for the installed graph, inspect [package-lock.json](../package-lock.json). For **test success**, use a run tied to the relevant commit, not an undated claim. A branch's contents do not prove it was merged.

When documents conflict, report the exact sections and intended scope. Do not resolve behavioral conflicts by weakening approval, privacy, or recovery requirements. Normative changes belong in a reviewed pull request with an explanation of their effect.

## Status vocabulary

**Specified** means a design contract exists. **Implemented** means code is exported. **Validated** means a named check passed for a stated snapshot and environment. **Published** means a package or release was intentionally distributed through a named channel. None means **certified**, and there is no certification program here.

Document version 0.1, private package version 0.1.0, Git commits, and deployment versions are different identifiers. Use a commit SHA and archive digest to reproduce an exact state; the private version has not been bumped for every increment.
