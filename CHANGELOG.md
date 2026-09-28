# Changelog

This records repository work, not published npm releases. Private package version 0.1.0 and document version 0.1 do not imply a stable public API, release tag, deployment, or certification. PR history records merge state for an exact revision.

## September 28, 2026 — review workflow and package acceptance

[PR 4](https://github.com/kochrisdev/TUN-Systemic-Design/pull/4) adds ContextPanel, PlanView, and ProposalCard, bringing the implementation to seven canonical React components. Source availability and usage are separate; plans show revisions, dependencies, and approval checkpoints; proposal inspection is navigation, not consent.

Optional ActionProposal.reviewBasis and contentPreview are fingerprinted and shown at the Approval Gate. Existing callers and timestamp/latch safeguards are preserved. The deterministic local lab includes approach review, versioned proposals, explicit approval, context/plan invalidation, unknown-outcome reconciliation, and retained receipts.

Application tests, browser coverage, exports, guides, and validation records were expanded. Testing corrected native-disclosure assumptions, ambiguous landmark names, keyboard-readiness timing, and transient button contrast. The [workflow record](docs/REVIEW-VALIDATION-v0.1.md) preserves named failures and successes rather than hiding them.

The subsequent **isolated offline consumer acceptance** increment closes the previous installer-test gap without new workflow permissions or dependency versions. It installs local archives into a fresh external directory, reinstalls from its own lockfile, checks real package resolution and exported types, renders seven components, and verifies CSS/token paths. npm run check includes this new gate. [Consumer validation](docs/CONSUMER-VALIDATION-v0.1.md) records source `1f53c6b60c1e0a997b53213c54ab8184e0c690e0`, observed CI, artifact identity, and limitations.

Dependencies, lockfile, generated tokens, license, founding documents, and workflow permissions are unchanged. The package remains private and unpublished. Framework hydration, independently resolved peers, registry distribution, and production backend validation are not established by the smoke test.

## September 27, 2026 — repository milestones

### Documentation review

Reviewed all ten Markdown files at `0226ec535e08eab09f840c4119ff9b71a57ad952` against source and configuration. Added the documentation index, setup/troubleshooting guide, architecture, implementation matrix, integration checklist, contribution guidance, changelog, audit record, and an offline documentation checker with regression tests.

Clarified C4 action-specific approval, scoped self-assessment, memory versus retention, evidence versus certainty, and approval/execution/verification/recovery. Made control accessibility requirements explicit and replaced illustrative API/token names with actual contracts. The [audit](docs/DOCUMENTATION-AUDIT-v0.1.md) identifies draft-rule changes rather than mislabeling them as runtime changes.

| Milestone | Evidence | Scope |
|---|---|---|
| Visual system | [2f01c20](https://github.com/kochrisdev/TUN-Systemic-Design/commit/2f01c2077eace2a26c00bcf244dc461efdb10395) | Tokens, themes, HTML specimen, validation |
| First React components | [PR 1](https://github.com/kochrisdev/TUN-Systemic-Design/pull/1) | Intent Composer, Agent Card, Approval Gate, Action Receipt |
| Validation hardening | [PR 2](https://github.com/kochrisdev/TUN-Systemic-Design/pull/2) | Locked graph, toolchain, timestamps, package checks, evidence |
| Documentation audit | [PR 3](https://github.com/kochrisdev/TUN-Systemic-Design/pull/3) / [5cbf9a5](https://github.com/kochrisdev/TUN-Systemic-Design/commit/5cbf9a5816358b9c4db3f64af90fbebd04406a2b) | Reconciled guides, matrix, link checks, audit record |

Historical [React validation](docs/REACT-VALIDATION-v0.1.md) remains tied to its source. Proposed future work belongs in the [roadmap](docs/STATUS-AND-ROADMAP.md), not completed milestone entries.
