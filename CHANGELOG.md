# Changelog

This records repository milestones, not published npm releases. Private package version 0.1.0 and document version 0.1 do not imply a stable public API, release tag, hosted deployment, or certification.

## Unreleased

### Context, plan, and proposal workflow — September 28, 2026

Implemented ContextPanel, PlanView, and ProposalCard with typed contracts, source availability/usage separation, visible revisions, approval checkpoints, and navigation-only proposal review. Seven canonical components are exported in this increment.

Added optional `ActionProposal.reviewBasis` and `contentPreview`, included in material-field fingerprints and displayed at the Approval Gate. Preserved legacy callers and existing timestamp/latch safeguards. The local deterministic lab now supports approach review, versioned proposals, explicit action approval, context/plan invalidation, unconfirmed-outcome reconciliation, and retained receipts.

Added contract, component, model, and browser coverage, and expanded existing archive inventory/export checks. Updated the implementation matrix, API guides, architecture, walkthrough, package README, and validation record. Dependencies, lockfile, tokens, license, and existing workflow permissions are unchanged.

A proposed installer/CI write was blocked by a tool safety check and omitted. The fresh independent-consumer installation test remains outstanding. This is a draft pull-request increment, not an npm release or claim that all acceptance work is complete. See [Review validation](docs/REVIEW-VALIDATION-v0.1.md) and [PR 4](https://github.com/kochrisdev/TUN-Systemic-Design/pull/4).

## Repository milestones — September 27, 2026

### Documentation review

Reviewed the complete ten-file Markdown baseline at `0226ec535e08eab09f840c4119ff9b71a57ad952` against repository source and configuration.

Added a documentation index, onboarding/troubleshooting guide, architecture map, implementation matrix/roadmap, integration checklist, contribution guidance, this changelog, and an audit record. Updated the homepage, specification, component catalog, visual profile, React guide, and package README.

Clarified C4 action-specific approval, self-assessed conformance, memory versus retention, evidence versus certainty, and approval/execution/verification/recovery distinctions. Made control accessibility requirements explicit. Replaced illustrative token/API names with actual contracts. These draft-rule changes are documented in the [audit](docs/DOCUMENTATION-AUDIT-v0.1.md), not mislabeled as runtime changes.

Added an offline Markdown checker, regression tests, and read-only documentation CI. Preserved application code, dependencies, tokens/generated outputs, license, founding documents, and historical evidence.

| Milestone | Evidence | Scope |
|---|---|---|
| Visual system | [2f01c20](https://github.com/kochrisdev/TUN-Systemic-Design/commit/2f01c2077eace2a26c00bcf244dc461efdb10395) | Tokens, themes, HTML specimen, validation |
| First React components | [PR 1](https://github.com/kochrisdev/TUN-Systemic-Design/pull/1) | Intent Composer, Agent Card, Approval Gate, Action Receipt |
| Validation hardening | [PR 2](https://github.com/kochrisdev/TUN-Systemic-Design/pull/2) | Locked graph, reference toolchain, strict timestamps, package checks, evidence |
| Documentation audit | [PR 3](https://github.com/kochrisdev/TUN-Systemic-Design/pull/3) / [5cbf9a5](https://github.com/kochrisdev/TUN-Systemic-Design/commit/5cbf9a5816358b9c4db3f64af90fbebd04406a2b) | Reconciled guides, matrix, local link checks, audit record |

Historical [React validation](docs/REACT-VALIDATION-v0.1.md) remains tied to its exact source. Proposed work belongs in the [roadmap](docs/STATUS-AND-ROADMAP.md), not in completed milestone entries.
