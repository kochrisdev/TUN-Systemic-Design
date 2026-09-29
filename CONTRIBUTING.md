# Contributing to TUN Systemic Design

[Documentation index](docs/README.md) · [Getting started](docs/GETTING-STARTED.md) · [Status and roadmap](docs/STATUS-AND-ROADMAP.md)

TUN is a draft design framework and reference implementation. Contributions should preserve human intent, visible agency, explicit authority, honest uncertainty, recoverability, and calm interaction.

## Before editing

Read the relevant design contract and implementation source. Identify whether your change concerns philosophy, a normative rule, a token, a component API, a host-integration pattern, or evidence. Avoid combining a documentation correction with unrelated dependency or runtime changes.

Work on a branch from current `main`. Preserve existing work and the repository's license. Do not force-push shared branches, publish packages, deploy examples, change repository permissions, or merge another contributor's work as an incidental part of a documentation edit.

## Reviewable changes

A pull request should explain the problem, changed files, intended behavior, compatibility impact, executed checks, and remaining limits. Mark unexecuted checks as unexecuted. Screenshots supplement behavior tests; they do not prove every state or accessibility requirement.

Normative edits must identify the exact affected sections and whether they clarify or strengthen existing requirements. Keep meaningful MUST/MUST NOT obligations explicit. Do not silently rewrite a historical validation report to imply that new code passed old tests. Preserve useful existing headings and link targets when restructuring documentation.

## Verification

Follow the [verification guide](docs/GETTING-STARTED.md#verification). Documentation-only changes should run:

```sh
python scripts/check_docs.py
python -m unittest discover -s tests -p 'test_docs.py'
```

The same check compares current component counts and the roadmap matrix with `packages/react/src/index.ts`. After adding, removing or renaming a component export, run `python scripts/check_docs.py --sync-components`, review the generated diff, then run the checks again. Synchronization leaves historical reports and normative design-pattern counts intact. See [Documentation checks](docs/DOCUMENTATION-CHECKS.md) for the checked locations and source convention.

Changes to tokens require their build/check cycle and committed generated outputs. Component/API changes require typechecking, contract and React tests, package checks, relevant browser tests, and updated examples/docs. A dependency update requires a reviewed manifest/lockfile change and dated audit output. Do not remove a failing check or suppress peer validation merely to obtain a green run.

The documentation checker intentionally uses no network and does not execute Markdown examples. Review code snippets against source and test important examples separately.

## Source-of-truth rules

Edit `tokens/tokens.json`, not generated CSS or the generated token report. Use the actual public exports and props, not historical illustrative contracts. Synchronize the current implementation declarations and matrix when exports change. Treat generated output and evidence as different from hand-authored guidance.

Keep setup commands centralized in Getting Started. Package README links to repository-only documents should remain usable outside the monorepo. Any code example that accesses private data should avoid logging raw user input, secrets, or tool payloads.

## New component checklist

Define the human question, anatomy, states, semantics, and host responsibilities. Include typed props, an explicit public export, semantic styling, empty/blocked/failed states where relevant, keyboard behavior, accessible names, and tests of misleading or unsafe transitions. Add a simulated example and package-export checks. Do not claim the full design pattern is production-ready merely because a visual component renders.

## Evidence and releases

Record source SHA, toolchain, commands, counts, failures/skips, and artifact availability for validation. A private package version is not a public release. Publication, release tags, deployments, and support commitments require a separate intentional decision. Maintain [CHANGELOG.md](CHANGELOG.md) with an Unreleased section until that decision is made.

## Reporting problems

Use repository issues for non-sensitive documentation defects, reproducible bugs, and design questions. Include a minimal sanitized example and the relevant commit. Do not post credentials, personal data, live exploit details, or confidential customer material publicly. Use an already established private contact with the owner for sensitive findings; this document does not assert that a private GitHub reporting channel, bounty, or response-time commitment exists.

## Scope of automation

AI-assisted changes receive the same review as human-authored changes. An agent may propose an implementation; it must not invent permissions, test results, citations, or release status. Keep execution, approval, verification, and recovery separate throughout examples and documentation.
