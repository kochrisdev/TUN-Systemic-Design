# TUN Systemic Design

**A design system for AI-native products.**

> Human Intent. Machine Intelligence. Systemic Design.

TUN designs the relationship between people, AI, agents, context, decisions, and actions—not only the screens around them. Its guiding philosophy is **Simplicity with Boldness. Consistency with Conciseness. Clarity with Confidence.**

## What exists today

This repository contains a **draft design specification**, a **14-component design catalog**, a **machine-readable visual system**, and a **seven-component React reference implementation**. A specified component is not necessarily implemented. Use the source commit and PR history to identify a particular increment.

| Layer | Available | Boundary |
|---|---|---|
| Philosophy | Concept note and manifesto | Founding propositions, not implementation or certification claims |
| Behavioral design | Specification and 14 component definitions | Draft project requirements; not an external standard |
| Visual system | Typed tokens, generated light/dark CSS, validator, HTML specimen | Limited token format and document-level themes |
| React | IntentComposer, AgentCard, ContextPanel, PlanView, ProposalCard, ApprovalGate, ActionReceipt | Repository-local package; not published to npm |
| Validation | Contract, React, workflow-model, browser, build, package, isolated-consumer, and token checks | Commit-specific evidence, not a production or accessibility guarantee |

There is no model runtime, production authorization service, persistent-memory service, Figma kit, Tailwind adapter, hosted application, or certification program in this increment. See the [implementation matrix and roadmap](docs/STATUS-AND-ROADMAP.md).

## Start here

| Your goal | Read |
|---|---|
| Understand TUN | [Concept Note](docs/CONCEPT-NOTE.md) and [Manifesto](docs/MANIFESTO-v0.1.md) |
| Run the examples | [Getting Started](docs/GETTING-STARTED.md) |
| Design a product | [Specification](docs/SPECIFICATION-v0.1.md), [Components](docs/COMPONENTS-v0.1.md), and [Visual System](docs/DESIGN-TOKENS-AND-VISUAL-SYSTEM-v0.1.md) |
| Implement React | [Core React API](docs/REACT-COMPONENTS-v0.1.md), [review workflow API](docs/REVIEW-WORKFLOW-v0.1.md), and [architecture](docs/ARCHITECTURE.md) |
| Adopt safely | [Integration checklist](docs/INTEGRATION-CHECKLIST.md), [review-workflow evidence](docs/REVIEW-VALIDATION-v0.1.md), and [consumer validation](docs/CONSUMER-VALIDATION-v0.1.md) |
| Contribute | [Contributing](CONTRIBUTING.md) |

The [documentation index](docs/README.md) explains which documents are normative, informative, generated, or historical.

## Run the React component lab

Use the reference toolchain: **Node 22.23.2** from `.nvmrc` and **npm 12.1.0**. Install/select that Node version before running these commands from the repository root:

```sh
npm install --global npm@12.1.0
npm ci
npm run check
npm run dev
```

Open `http://127.0.0.1:4173`. The lab is explicitly simulated: no model calls, messages, publications, or external state changes occur. The path is **Prepare plan → Review approach → Create proposal → Review action → Approve/reject → Verified receipt**. Context changes and plan revisions invalidate earlier reviews; unknown outcomes are reconciled rather than blindly retried.

`npm run dev` builds the library once; library source edits require rebuilding. Detailed setup, troubleshooting, browser tests, and local-package guidance are in [Getting Started](docs/GETTING-STARTED.md).

`npm run check` includes typechecking, contract/React/model tests, builds, package inventory/export checks, and a **fresh offline consumer install, lockfile reinstall, declaration check, and seven-component static-render smoke test**. It does not include browser tests, dependency audits, token checks, or documentation checks; the [verification guide](docs/GETTING-STARTED.md#verification) explains those separate checks. The consumer test checks one locked graph, not every framework or registry-install configuration.

## Use only the visual system

Python 3.10+ is sufficient; no npm install or external font service is needed:

```sh
python scripts/tokens.py check
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/examples/visual-system.html`. Edit [tokens/tokens.json](tokens/tokens.json), then run `python scripts/tokens.py build` to regenerate [styles/tun.css](styles/tun.css) and the [token report](docs/TOKEN-VALIDATION-v0.1.md). Do not hand-edit generated outputs.

## The interaction model

```text
ASK → THINK → PROPOSE → ACT → LEARN
```

For an action requiring human review:

```text
ASK → THINK → PROPOSE → APPROVE → ACT → VERIFY → LEARN
```

These are conceptual stages, not the library's runtime state machine. A task may omit unnecessary stages. THINK communicates a useful plan or rationale, not hidden chain-of-thought; LEARN does not imply automatic model training or permission to retain information.

TUN's eight principles are **Transparent, User Sovereign, Natural, Systemic, Adaptive, Reversible, Composable, and Calm**.

## Trust boundary

**An approval button is not an authorization service.** Components display application-supplied information and emit requests. The host authenticates, checks scope and expiry, binds immutable context/plan/content, deduplicates, executes, verifies, and records actions. Availability is not source usage; approach review is not action authorization; approval is not execution; execution is not verification; compensation is not undo. A network error does not prove that nothing happened.

## Evidence and project history

The [consumer validation record](docs/CONSUMER-VALIDATION-v0.1.md) closes the isolated-install gap left in the [review-workflow validation record](docs/REVIEW-VALIDATION-v0.1.md). The [earlier React record](docs/REACT-VALIDATION-v0.1.md) preserves the four-component snapshot. Reports prove only their named checks and source. The [documentation audit](docs/DOCUMENTATION-AUDIT-v0.1.md) records the prior documentation review; [CHANGELOG.md](CHANGELOG.md) separates repository milestones from npm publication.

## License

The repository retains its existing [CC0-1.0 license](LICENSE). Dependency licenses remain separate. The package's `private` flag prevents accidental npm publication; it is not an access restriction on this public repository.

**Design intelligence around humanity.**
