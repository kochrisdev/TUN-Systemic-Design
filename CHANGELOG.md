# Changelog

This records repository milestones, not published npm releases. The private package version `0.1.0` and document version `0.1` do not imply a stable public API, release tag, hosted deployment, or certification.

## Unreleased

### Documentation review — September 27, 2026

Reviewed the complete ten-file Markdown baseline at `0226ec535e08eab09f840c4119ff9b71a57ad952` against repository source and configuration.

Added a documentation index, onboarding/troubleshooting guide, architecture map, implementation matrix/roadmap, integration checklist, contribution guidance, this changelog, and a review record. Updated the homepage, behavioral specification, component catalog, visual profile, React guide, and package README.

Clarified C4 action-specific approval, scoped self-assessed conformance, memory versus retention, evidence versus certainty, and approval/execution/verification/recovery distinctions. Made interactive-control accessibility requirements explicit. Replaced illustrative token/API names with actual shipped contracts. These draft-rule changes are documented in the [audit](docs/DOCUMENTATION-AUDIT-v0.1.md); they are not runtime changes.

Added an offline Markdown checker, regression tests, and a read-only documentation CI workflow. Preserved application code, dependency manifests/lockfile, tokens/generated outputs, the existing license, founding concept/manifesto, and historical validation records.

## Repository milestones — September 27, 2026

| Milestone | Evidence | Scope |
|---|---|---|
| Visual system foundation | [2f01c20](https://github.com/kochrisdev/TUN-Systemic-Design/commit/2f01c2077eace2a26c00bcf244dc461efdb10395) | Tokens, generated themes, HTML specimen, token validation |
| First React components | [PR 1](https://github.com/kochrisdev/TUN-Systemic-Design/pull/1) | Intent Composer, Agent Card, Approval Gate, Action Receipt |
| Validation hardening | [PR 2](https://github.com/kochrisdev/TUN-Systemic-Design/pull/2) / [0226ec5](https://github.com/kochrisdev/TUN-Systemic-Design/commit/0226ec535e08eab09f840c4119ff9b71a57ad952) | Locked graph, reference toolchain, strict timestamp regressions, package checks, dated evidence |

See [React validation](docs/REACT-VALIDATION-v0.1.md) for exact test scope and limitations. Proposed future work belongs in the [roadmap](docs/STATUS-AND-ROADMAP.md), not in completed milestone entries.
