# TUN Systemic Design

**A design system for AI-native products.**

> Human Intent. Machine Intelligence. Systemic Design.

TUN designs the relationship between people, AI, agents, context, decisions, and actions—not only the screens around them. **Simplicity with Boldness. Consistency with Conciseness. Clarity with Confidence.**

**New to TUN?** Read [An Introduction to TUN Systemic Design](docs/INTRODUCTION.md)—a shared starting point for developers and non-developers, with everyday examples, plain-language concepts, and a practical developer section.

## Explore the public showcase

[Open the demo site](https://tun-systemic-design-demo.vercel.app/) · [Guided demo](https://tun-systemic-design-demo.vercel.app/#demo) · [14 components](https://tun-systemic-design-demo.vercel.app/#components) · [Trust & Control Lab](https://tun-systemic-design-demo.vercel.app/#trust)

**Design intelligence around humanity.** The showcase separates a guided task, component inspection, and edge-case demonstrations. Every example is simulated: no model is called, account connected, real worker stopped, message sent, or persistent AI memory written. A site's deployment status is distinct from source implementation; check Vercel's source SHA for the revision being served.

The [Public Showcase guide](docs/PUBLIC-SHOWCASE-v0.1.md) explains navigation, state lifetime, representative examples, accessibility, sharing assets, and Vercel setup.

## What exists today

A draft behavioral specification, a fourteen-pattern component catalog, machine-readable visual tokens, and **reference React implementations of all fourteen canonical components**. Implemented is not the same as production-ready, published to a registry, or independently certified. Use source commits and PR history to identify accepted increments.

| Group | Reference components |
|---|---|
| Intent and identity | IntentComposer, AgentCard |
| Review and accountability | ContextPanel, PlanView, ProposalCard, ApprovalGate, ActionReceipt |
| Evidence and memory | MemoryIndicator, SourceView, UncertaintySignal |
| Supervision and recovery | ToolActivity, AgentActivity, HumanOverride, RecoveryControl |

The repository includes generated light/dark CSS, a token validator, an HTML visual specimen, the public React showcase, the original technical lab, automated tests, and isolated offline package installation checks. It supplies no model runtime, production authorization/cancellation/recovery services, persistent-memory backend, independent evidence verification, Figma kit, Tailwind adapter, or certification program. Hosting the static demonstration does not supply those services.

See the [implementation matrix and roadmap](docs/STATUS-AND-ROADMAP.md) for exact scope.

## Start here

| Goal | Documentation |
|---|---|
| Start without prior technical knowledge | [An Introduction to TUN Systemic Design](docs/INTRODUCTION.md) |
| Understand TUN | [Concept Note](docs/CONCEPT-NOTE.md), [Manifesto](docs/MANIFESTO-v0.1.md) |
| Explore or deploy the site | [Public Showcase](docs/PUBLIC-SHOWCASE-v0.1.md) |
| Run the examples locally | [Getting Started](docs/GETTING-STARTED.md) |
| Design a product | [Specification](docs/SPECIFICATION-v0.1.md), [Components](docs/COMPONENTS-v0.1.md), [Visual System](docs/DESIGN-TOKENS-AND-VISUAL-SYSTEM-v0.1.md) |
| Implement React | [Core API](docs/REACT-COMPONENTS-v0.1.md), [Review Workflow](docs/REVIEW-WORKFLOW-v0.1.md), [Evidence and Memory](docs/EVIDENCE-AND-MEMORY-v0.1.md), [Supervision and Recovery](docs/SUPERVISION-AND-RECOVERY-v0.1.md) |
| Adopt safely | [Architecture](docs/ARCHITECTURE.md), [Integration Checklist](docs/INTEGRATION-CHECKLIST.md) |
| Contribute | [Contributing](CONTRIBUTING.md), [Changelog](CHANGELOG.md) |

The [documentation index](docs/README.md) distinguishes current guidance, normative draft rules, generated outputs, and historical evidence.

## Run the showcase and technical lab

Select the reference **Node 22.23.2** from .nvmrc and **npm 12.1.0**, then run from the repository root:

```sh
npm install --global npm@12.1.0
npm ci
npm run check
npm run dev
```

Open `http://127.0.0.1:4173` for the public overview. Select **Try the guided demo** for **Intent → Context → Plan → Proposal → Approval → Receipt**. Component Explorer has two representative read-only specimens per component, with API/source links. Trust & Control contains separate evidence/memory and supervision/recovery simulations.

The guided and trust views retain their state while navigating within the showcase. Leaving a view does not approve, stop, retry, or reset its work. Unknown outcomes stay locked until reconciled. Original records remain after compensation and new drafts. Refreshing clears the page simulation, not real-world effects.

The original full technical lab remains at `http://127.0.0.1:4173/?lab=1`. Its review flow, synthetic evidence examples, and separate supervision fixture are preserved. Opening it creates a different page session; it does not control an existing guided task.

`npm run dev` builds the library once; rebuild after library-source edits. `npm run check` covers typechecking, contract/React/model/showcase tests, builds, archive inventory/exports, and an offline isolated consumer install/reinstall with declaration/static-render checks. Browser, token, documentation, and dependency-audit checks remain separate. A passing static consumer does not establish hydration, every bundler/framework, or registry distribution.

## Deploy the demonstration

The root [vercel.json](vercel.json) builds both workspaces and serves **examples/react/dist**. Keep the Vercel project's Root Directory at the repository root. No application API keys or backend are required. See the [deployment guide](docs/PUBLIC-SHOWCASE-v0.1.md#8-vercel-deployment) for configuration, domain metadata, validation boundaries, and troubleshooting.

## Use only the visual system

Python 3.10+ is sufficient for the token tools and optional local server:

```sh
python scripts/tokens.py check
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/examples/visual-system.html`. Edit [tokens.json](tokens/tokens.json), then run `python scripts/tokens.py build` to regenerate [CSS](styles/tun.css) and the [token report](docs/TOKEN-VALIDATION-v0.1.md). Do not hand-edit generated outputs.

## Interaction model

```text
ASK → THINK → PROPOSE → ACT → LEARN
```

For consequential work requiring review:

```text
ASK → THINK → PROPOSE → APPROVE → ACT → VERIFY → LEARN
```

These are conceptual phases, not one universal runtime enum. THINK communicates a useful plan, not hidden internal reasoning. LEARN does not imply automatic training or permission to retain information.

The eight principles are **Transparent, User Sovereign, Natural, Systemic, Adaptive, Reversible, Composable, and Calm**.

## Trust boundary

**An approval or override button is not an authorization service.** The host authenticates, validates inputs, checks scope and expiry, binds immutable revisions, deduplicates, executes, observes, verifies, and records effects. Availability is not source usage; plan review is not permission; acknowledgement is not completion; stoppage is not reversal; compensation is not undo. Network failure does not prove that nothing happened.

## Evidence and history

[PR 7](https://github.com/kochrisdev/TUN-Systemic-Design/pull/7) records public-showcase acceptance. [PR 6](https://github.com/kochrisdev/TUN-Systemic-Design/pull/6) records the fourteen-component implementation. Earlier [supervision](docs/SUPERVISION-VALIDATION-v0.1.md), [evidence/memory](docs/EVIDENCE-VALIDATION-v0.1.md), [consumer](docs/CONSUMER-VALIDATION-v0.1.md), [review-workflow](docs/REVIEW-VALIDATION-v0.1.md), [React](docs/REACT-VALIDATION-v0.1.md), and [documentation-audit](docs/DOCUMENTATION-AUDIT-v0.1.md) records retain their named source and results. Authored tests are not automatically passed tests.

The package remains private and unpublished to npm at version 0.1.0. Use commit SHA and archive digest to distinguish repository-local builds sharing that version. Hosting a demo does not publish the component package.

## License

The existing [CC0-1.0 license](LICENSE) is preserved. Dependency licenses remain separate. The private package flag prevents accidental registry publication, not access to the public repository.

**Design intelligence around humanity.**
