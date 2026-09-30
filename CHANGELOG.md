# Changelog

Repository milestones and development history. See [Scope and non-claims](docs/SCOPE.md#release-status-and-conformance) for package release and conformance status.

## Unreleased

### Contributed threat/conformance reconciliation — September 30, 2026

Integrated the contributed drafts as additive [component/threat relations](conformance/relations.json), a [generated component-first conformance view](docs/CONFORMANCE-MATRIX.md), and a [misrepresentation threat companion](docs/MISREPRESENTATION-THREATS.md). The [reconciliation record](docs/ATTACHMENT-RECONCILIATION.md) identifies the supplied inputs and explains the 49-to-46 clause/sentence crosswalk, legacy threat identifiers, stale evidence statements and retained host/design responsibilities.

The adapted `scripts/conformance.py check/build` interface reuses the existing strict canonical checker and public-export parser, validates actual threat definitions and complete relation coverage, detects generated-view drift and writes only the new view after validation. Added offline regression tests and documentation-CI checks. Canonical requirement IDs, normative text, ownership, coverage, existing test bindings and execution-evidence collection remain unchanged; no source draft is installed verbatim as a competing authority.

### Governance, citation and related approaches — September 30, 2026

Added [GOVERNANCE.md](GOVERNANCE.md), identifying Christopher Tun as creator and current sole maintainer, with open contributions, recorded decisions, explicit merge/release authority, AI-assistance disclosure and a path to additional maintainers. The README now states the stewardship model without moving the value proposition, diagram or code sample.

Added root [CITATION.cff](CITATION.cff) for the framework and reference implementation, with exact-revision citation guidance in governance. No DOI, paper, release date or published package version is invented. The existing CC0-1.0 license is unchanged.

Added [TUN and existing approaches](docs/EXISTING-APPROACHES.md), a short, primary-source comparison with Jakob Nielsen's agentic UX guidance, Anthropic's agent architecture guidance, OpenAI's agent/UI guidance and Microsoft HAX. It explains overlap and composition without claiming endorsement, superiority or untested SDK compatibility. Contribution guidance and the documentation index link the new materials. No runtime, dependency, workflow, deployment, or repository-access setting changes.

### Server-backed adoption pilot — September 30, 2026

Added [examples/host-integration](examples/host-integration/README.md): an actual Python HTTP host with local bearer principals, server-owned grants and immutable proposals, durable operation/event records, and a separate local sandbox-provider database. Authorization, dispatch and verification are separate transitions; the browser cannot construct a receipt from a successful callback. A matching server readback is required. The provider makes real local writes but contacts no external service.

Added real-HTTP tests for scope/revision enforcement, concurrent replay, durable restart, lost acknowledgement, missing/mismatched readback, pre-dispatch cancellation and separately approved withdrawal. New browser journeys exercise the server without mocked fetch. A threat/specification evidence map records the local scope. The roadmap now prioritizes one named internal adoption, real identity/provider integration, operational recovery, adoption compatibility and a scoped conformance review; showcase work is ongoing maintenance rather than the primary milestone.

The existing verify workflow runs the new backend/build/browser checks and retains their reports. No package dependency, lockfile, component API, React peer range, token, Vercel setting, live account or third-party system is changed. Unfinished runtime-schema and compatibility work remains separate.

### Threat model — September 29, 2026

Added [TUN threat model](docs/THREAT-MODEL.md) as a security-review entry point: assets, adversaries, six trust boundaries, an eighteen-scenario STRIDE register, existing test pointers, twelve proposed adopter acceptance scenarios, and a residual-risk review packet. Every threat allocates presentation behavior and host enforcement separately and links applicable specification rule IDs. Three walkthroughs cover stale multi-tab review, lost acknowledgement, and stop/worker races.

Linked the model from the README, documentation index, architecture, integration checklist, security policy and conformance assessment guide. Corrected the integration checklist's outdated statement that Human Override was not implemented. The model is tied to its assessed main commit and does not credit the draft runtime-schema PR as a merged safeguard. Normative rules, conformance mappings, application code, dependencies, CI and live security settings are unchanged.

### Security maintenance — September 29, 2026

Added a root security policy, CODEOWNERS, and weekly Dependabot entries for commit-pinned Actions and the root npm workspace graph. Contribution guidance now points to the reporting policy. The [maintenance guide](docs/SECURITY-MAINTENANCE.md) records the audit policy and owner activation steps for private vulnerability reporting and the [main required-check ruleset](.github/rulesets/main-required-checks.json).

The audit gate explicitly fails at every reported severity or on an audit error, attempts both full/runtime audits, and preserves both reports plus an aggregate summary. The previous npm audit commands already propagated failures; this improves evidence retention and makes policy testable. Added synthetic audit and configuration regressions, an ongoing weekly React check, and unfiltered pull-request/merge-group triggers for both required jobs.

Existing action SHAs, read-only permissions, application code, dependency graph, conformance mappings and historical evidence are preserved. The ruleset file is ready for owner import; administration settings were not changed. The separate draft runtime-contract PR remains independent.

### Requirement-to-test conformance — September 29, 2026

Added the [conformance layer](conformance/README.md): stable requirement IDs, exact mandatory specification text, real test mappings with assertion scope, and concrete remaining review procedures. The [generated traceability matrix](conformance/TRACEABILITY.md) reports coverage from the machine-readable manifest; current totals are checked rather than duplicated across guides.

The read-only checker detects requirement/text/strength drift, missing or renamed tests, duplicate identifiers and stale matrix output. Its explicit run mode executes mapped Vitest files and joins fresh file/title outcomes to rule IDs, recording source hashes, runner metadata and remaining assessments in artifacts/conformance-results.json. Missing, skipped, failed or ambiguous mapped results fail the run. Test evidence and full product assessment remain distinct fields.

Documentation CI now checks traceability and its Python regressions. React CI collects mapped evidence and responds to conformance/specification changes. Updated the documentation index, scope and roadmap to make requirement-level assessment a working capability. The value-first README, normative specification text, canonical components, existing application tests, dependencies, tokens, deployment settings and historical validation reports are preserved.

### Source-driven component documentation — September 29, 2026

Extended `scripts/check_docs.py` to derive the public component inventory from `packages/react/src/index.ts`, check four current implementation-count declarations, and compare the roadmap matrix's names, labels and source links. Added `--sync-components` to regenerate those sites explicitly while preserving surrounding prose and historical evidence. Missing declarations, unsupported entry-point syntax and empty inventories fail the check.

Added regression coverage for export additions/removals, same-count renames, stale wording and links, duplicate/missing declarations, synchronization and CLI behavior. The existing documentation workflow runs the new checks without dependency or permission changes. [Documentation checks](docs/DOCUMENTATION-CHECKS.md) explains the source convention and maintenance workflow. The specification's stale four-component line was already corrected in the preceding documentation revision; this increment guards against recurrence.

### Value-first documentation — September 29, 2026

Rebuilt the README around the problem TUN solves: keeping a clicked decision, authorization, execution, and verification distinct. It now leads with one value paragraph, one flow diagram, one ApprovalGate integration example, and links to the demo and deeper guides.

Added [Scope and non-claims](docs/SCOPE.md) as the central reference for service responsibilities, demo behavior, validation coverage, release status, and conformance. Refocused the roadmap on available capabilities and concrete next milestones, and updated the documentation index to use the central scope page.

Removed repeated project-level caveats from the specification while preserving its requirement language and section headings. Corrected stale references to four implemented components and ten remaining components. Action-specific approval, privacy, uncertainty, verification, and recovery rules stay beside the behavior they govern. This is a documentation revision; component APIs, application code, and deployment configuration are unchanged.

### Documentation — September 29, 2026

Added [An Introduction to TUN Systemic Design](docs/INTRODUCTION.md) as a shared entry point for developers and non-developers. It explains systemic design through a project-update example, the interaction model and eight principles, autonomy and consequences, memory and uncertainty, all fourteen components, visual tokens, role-specific adoption guidance, a display-only React example, and the current implementation boundaries. README and documentation reading paths now link to it.

This is informative documentation, not a change to normative requirements, component APIs, application behavior, dependencies, deployment configuration, or historical validation evidence.

## September 28, 2026 — public showcase

[PR 7](https://github.com/kochrisdev/TUN-Systemic-Design/pull/7) adds the public overview, a six-stage guided review task, a searchable fourteen-component explorer with two representative read-only states per component, and a separate Trust & Control Lab. Responsive navigation links the demos, documentation and repository. The original full technical lab remains at /?lab=1.

The guided controller uses the unchanged review model. Hash navigation preserves visited controllers, so leaving a view cannot reset pending/unknown outcomes or discard earlier receipts. Initial focus stays with the browser; actual route and guided-stage changes receive appropriate focus. A pending result in an inactive view does not steal focus. The first CI candidate caught a StrictMode initial-focus bug and the incomplete sharing-image asset; both were corrected without weakening browser assertions.

Added a favicon, a geometric 1200-by-630 sharing PNG with SVG source, static Open Graph/Twitter metadata and a no-JavaScript fallback. Root vercel.json records the library-first build and examples/react/dist output. Dashboard runtime, domain, permissions and production-branch settings are unchanged. A successful repository build does not prove a deployed URL has updated.

Added routing, catalog, read-only specimen, focus and public-browser regression coverage. Existing technical browser assertions remain, targeting their preserved /?lab=1 entry. Updated README, documentation index, setup, status and the [Public Showcase guide](docs/PUBLIC-SHOWCASE-v0.1.md). Canonical library code, models, dependency graph, generated tokens, licenses, workflow permissions and historical validation records are preserved. The supervision fixture's explanatory wording now works in either presentation.

No production model/service, analytics, account connection, persistent storage, new canonical component, or npm publication is included. PR history records exact final checks and merge state; deployment and live-site validation are separate.

## September 28, 2026 — supervision and recovery

[PR 6](https://github.com/kochrisdev/TUN-Systemic-Design/pull/6) adds ToolActivity, AgentActivity, HumanOverride and RecoveryControl, completing the fourteen canonical reference React exports. New root-only contracts separate observed work, measured progress, control/run revisions, requests, acknowledgements, terminal evidence and known prior effects. Internal ControlAction is shared implementation, not a fifteenth public component.

Intervention/recovery requests latch duplicate submission and do not manufacture success from promise resolution. Completion evidence must match the exact control and run revisions. Unknown original outcomes permit only reconciliation; retry additionally needs a host-described duplicate-effect safeguard. Compensation remains distinct from undo. Real authorization, cancellation and recovery services are still application responsibilities.

The lab gains a separately scoped stepped fixture showing stop acknowledgement, confirmed stoppage, lost acknowledgement, read-only reconciliation, compensation and preserved history. Package inventory and isolated-consumer fixtures now target fourteen static renders and seven negative type cases. Added metadata, React, model and browser tests without replacing existing safeguards.

The first implementation CI run passed. Subsequent visual/documentation review corrected the recovery fixture's scope wording to describe compensation or reconciliation rather than inheriting the stop request's scope. New regression cases cover those distinct scopes. Final PR checks establish acceptance of the revised head; the [validation record](docs/SUPERVISION-VALIDATION-v0.1.md) preserves named evidence and limits.

Updated README files, component catalog, API guides, setup, architecture, index and roadmap. Core approval/evidence contracts, original review model, dependency versions, lockfile, generated tokens, license, founding documents, historical reports and workflow permissions are preserved. No npm publication, hosted deployment or production service is included.

## September 28, 2026 — evidence and memory components

[PR 5](https://github.com/kochrisdev/TUN-Systemic-Design/pull/5) added MemoryIndicator, SourceView and UncertaintySignal, bringing that snapshot to ten canonical components. Root-exported types describe M0–M3 memory use, claim-to-source relationships, quoted/paraphrased/generated text, access restrictions, application-reported checks and qualitative uncertainty.

Inspection requests navigation only. Restricted evidence never renders contents/URLs. Generated interpretations cannot produce a checked-source summary and unsupported confidence falls back to Unknown. These are presentation safeguards, not source authentication, runtime schemas, storage or authority.

The existing review workflow gained read-only contextual evidence and a separate synthetic explorer. Tests and consumer acceptance expanded to ten components/four negative declarations. The first CI attempt exposed a source-union narrowing issue; the readable branch was made explicit rather than weakening types. API/setup/catalog/architecture/roadmap documentation was updated with dependencies, permissions and original safeguards preserved. This earlier increment did not implement the final four patterns; PR 6 now does.

## September 28, 2026 — review workflow and package acceptance

[PR 4](https://github.com/kochrisdev/TUN-Systemic-Design/pull/4) added ContextPanel, PlanView and ProposalCard, bringing that snapshot to seven components. Availability and use are separate; plans show revisions/dependencies/approval points; inspection is navigation, not consent.

Optional ActionProposal.reviewBasis/contentPreview are fingerprinted and shown at approval. Existing timestamp/latch behavior remained. The deterministic lab gained versioned proposals, explicit decisions, context/plan invalidation, unknown-outcome reconciliation and retained receipts.

Testing corrected disclosure assumptions, landmark names, keyboard readiness and transient button contrast. The [workflow report](docs/REVIEW-VALIDATION-v0.1.md) preserves named failures and successes.

The later isolated offline consumer increment closed the installer-test gap without new dependencies or permissions. It installs local archives into a fresh external directory, reinstalls its own lockfile, checks installed declarations and paths, renders seven components and resolves CSS/tokens. npm run check includes that gate. [Consumer validation](docs/CONSUMER-VALIDATION-v0.1.md) records source `1f53c6b60c1e0a997b53213c54ab8184e0c690e0` and limits. Hydration, independent peer configurations, registry distribution and production services were not established.

## September 27, 2026 — repository milestones

### Documentation review

Reviewed ten Markdown files at `0226ec535e08eab09f840c4119ff9b71a57ad952` against source/configuration. Added index, setup, architecture, matrix, integration checklist, contribution guidance, changelog, audit and an offline documentation checker with regression tests.

Clarified C4 action-specific approval, scoped self-assessment, memory versus retention, evidence versus certainty and approval/execution/verification/recovery. Made accessibility expectations explicit and replaced illustrative APIs/tokens with actual contracts. The [audit](docs/DOCUMENTATION-AUDIT-v0.1.md) identifies normative draft clarifications rather than presenting them as runtime changes.

| Milestone | Evidence | Scope |
|---|---|---|
| Visual system | [2f01c20](https://github.com/kochrisdev/TUN-Systemic-Design/commit/2f01c2077eace2a26c00bcf244dc461efdb10395) | Tokens, themes, HTML specimen, validation |
| First React components | [PR 1](https://github.com/kochrisdev/TUN-Systemic-Design/pull/1) | First four canonical components |
| Validation hardening | [PR 2](https://github.com/kochrisdev/TUN-Systemic-Design/pull/2) | Locked graph, toolchain, strict timestamps, package checks |
| Documentation audit | [PR 3](https://github.com/kochrisdev/TUN-Systemic-Design/pull/3) / [5cbf9a5](https://github.com/kochrisdev/TUN-Systemic-Design/commit/5cbf9a5816358b9c4db3f64af90fbebd04406a2b) | Reconciled guides, matrix, local links and audit |

Historical [React validation](docs/REACT-VALIDATION-v0.1.md) stays tied to its named source. Future work belongs in the [roadmap](docs/STATUS-AND-ROADMAP.md), not completed milestone entries.
