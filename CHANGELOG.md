# Changelog

Repository milestones and development history. See [Scope and non-claims](docs/SCOPE.md#release-status-and-conformance) for package release and conformance status.

## Unreleased

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
