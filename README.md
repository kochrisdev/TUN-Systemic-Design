# TUN Systemic Design

**A design system for AI-native products.**

> Human Intent. Machine Intelligence. Systemic Design.

TUN designs the relationship between people, AI, agents, context, decisions, and actions—not only the screens around them. **Simplicity with Boldness. Consistency with Conciseness. Clarity with Confidence.**

## What exists today

A draft behavioral specification, a fourteen-pattern component catalog, machine-readable visual tokens, and **reference React implementations of all fourteen canonical components**. Implemented is not the same as production-ready, published, or independently certified. Use source commits and PR history to identify accepted increments.

| Group | Reference components |
|---|---|
| Intent and identity | IntentComposer, AgentCard |
| Review and accountability | ContextPanel, PlanView, ProposalCard, ApprovalGate, ActionReceipt |
| Evidence and memory | MemoryIndicator, SourceView, UncertaintySignal |
| Supervision and recovery | ToolActivity, AgentActivity, HumanOverride, RecoveryControl |

The repository also includes generated light/dark CSS, a token validator, an HTML visual specimen, a React component lab, automated tests, and isolated offline package installation checks. It does not supply a model runtime, production authorization/cancellation/recovery services, persistent-memory backend, independent evidence verification, Figma kit, Tailwind adapter, hosted application, or certification program.

See the [implementation matrix and roadmap](docs/STATUS-AND-ROADMAP.md) for exact scope.

## Start here

| Goal | Documentation |
|---|---|
| Understand TUN | [Concept Note](docs/CONCEPT-NOTE.md), [Manifesto](docs/MANIFESTO-v0.1.md) |
| Run the examples | [Getting Started](docs/GETTING-STARTED.md) |
| Design a product | [Specification](docs/SPECIFICATION-v0.1.md), [Components](docs/COMPONENTS-v0.1.md), [Visual System](docs/DESIGN-TOKENS-AND-VISUAL-SYSTEM-v0.1.md) |
| Implement React | [Core API](docs/REACT-COMPONENTS-v0.1.md), [Review Workflow](docs/REVIEW-WORKFLOW-v0.1.md), [Evidence and Memory](docs/EVIDENCE-AND-MEMORY-v0.1.md), [Supervision and Recovery](docs/SUPERVISION-AND-RECOVERY-v0.1.md) |
| Adopt safely | [Architecture](docs/ARCHITECTURE.md), [Integration Checklist](docs/INTEGRATION-CHECKLIST.md) |
| Contribute | [Contributing](CONTRIBUTING.md), [Changelog](CHANGELOG.md) |

The [documentation index](docs/README.md) distinguishes current guidance, normative draft rules, generated outputs, and historical evidence.

## Run the React component lab

Select the reference **Node 22.23.2** from .nvmrc and **npm 12.1.0**, then run from the repository root:

```sh
npm install --global npm@12.1.0
npm ci
npm run check
npm run dev
```

Open `http://127.0.0.1:4173`. The review workflow is **Prepare plan → Review approach → Create proposal → Review action → Approve/reject → Verified receipt**. Read-only context/evidence and separate synthetic memory examples explain what influenced the task.

Use **Explore supervision and recovery** to inspect the final four components. Request stop, advance the simulated worker, and inspect the difference between acknowledgement and confirmed stoppage. The unknown-response scenario permits reconciliation, not blind retry. Compensation adds a separate record rather than erasing original effects.

**Every example is simulated.** No real worker is stopped, model called, account connected, message sent, or persistent data written. The supervision fixture is explicitly separate from the publication-review workflow. Refresh is not real-world undo.

`npm run dev` builds the library once; rebuild after library-source edits. `npm run check` covers typechecking, contract/React/model tests, builds, archive inventory/exports, and an offline isolated consumer install/reinstall with declaration/static-render checks. Browser, token, documentation, and dependency-audit checks remain separate. A passing static consumer does not establish hydration, every bundler/framework, or registry distribution.

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

[PR 6](https://github.com/kochrisdev/TUN-Systemic-Design/pull/6) tracks acceptance of the fourteen-component increment. Earlier [evidence/memory](docs/EVIDENCE-VALIDATION-v0.1.md), [consumer](docs/CONSUMER-VALIDATION-v0.1.md), [review-workflow](docs/REVIEW-VALIDATION-v0.1.md), [React](docs/REACT-VALIDATION-v0.1.md), and [documentation-audit](docs/DOCUMENTATION-AUDIT-v0.1.md) records retain their named source and results. Authored tests are not automatically passed tests.

The package remains private and unpublished at version 0.1.0. Use commit SHA and archive digest to distinguish repository-local builds sharing that version.

## License

The existing [CC0-1.0 license](LICENSE) is preserved. Dependency licenses remain separate. The private package flag prevents accidental registry publication, not access to the public repository.

**Design intelligence around humanity.**
