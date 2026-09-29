# Product integration checklist

**Status:** Application review worksheet, not a certification or an implemented backend.  
[Documentation index](README.md) · [Specification](SPECIFICATION-v0.1.md) · [Architecture](ARCHITECTURE.md) · [Threat model](THREAT-MODEL.md)

## Record the assessed scope

Fill in product/version, TUN document revision or commit, environment, human owner/reviewer, date, supported users/browsers/locales, operations in scope, and excluded operations. Record autonomy and consequence by operation, not only at product level.

| Area | Evidence to record | Typical gap to investigate |
|---|---|---|
| Intent | Outcome, constraints, targets, scope, and uncertainty in interpretation | Vague instructions unexpectedly trigger external changes |
| Identity and authority | Authenticated principal/tenant; role policy; tool permissions | Agent capability or UI state treated as permission |
| Proposal | Canonical ID/version, exact parameters, effects, expiry and recovery | A reviewed target or amount changes without a new review |
| Approval | Explicit decision bound to that version; recorded authority | A clicked button treated as completed backend authorization |
| Execution | Revalidation, durable deduplication, bounded retries and limits | A remount, second tab, or timeout repeats an external effect |
| Verification | Operation-specific evidence and timestamp | Provider acceptance described as downstream delivery |
| Accountability | Actor, target, partial effects, provenance, protected record access | Logs omit material steps or expose private payloads |
| Intervention | Actual stop/revocation behavior and in-flight limits | Stop requested displayed as stopped before confirmation |
| Recovery | Restore, compensation, reconciliation and retry distinctions | A local reset or compensating action called undo |
| Context and memory | Sources, availability, persistence, influence, controls | M0/no-memory label presented as a zero-retention guarantee |
| Evidence and uncertainty | Claim-specific support, limitations, conflicts and freshness | A source badge or model confidence treated as certainty |
| Accessibility | Keyboard/focus, reflow, status announcements and manual review | Automated axe sample treated as a complete audit |

## Approval and execution review

C4 proposals need explicit action-specific approval. Any C3 standing delegation should have bounded targets, effect limits, duration, revocation, and exceptions. A remembered preference or agent autonomy level is not sufficient authority.

The backend should validate the authenticated user, tenant, proposal version, canonical parameters, policy, expiry and revocation immediately before execution. Protect effectful operations with durable idempotency. Bind authorization to the server's canonical record, not editable text or a client-only fingerprint.

A rejected callback can mean an acknowledgement was lost after execution. Query the authoritative record before offering another attempt. Record partial effects and explain what remains unknown. Neither the gate's local latch nor TypeScript props solve multi-tab races, malicious requests, or malformed external JSON.

The current gate disables both decision controls for invalid or expired reviews. Provide a separate safe dismissal/escalation path where needed. Rejection is not cancellation of work already in flight. HumanOverride now provides a reference request interface; actual cancellation and verification remain host responsibilities.

## Privacy and memory review

Specify retention separately for session context, reusable user memory, operational state, logs, analytics, backups, and training data. Explain deletion limits without promising deletion that has not occurred. Show only authorized evidence to the client; a collapsed panel is not an access-control mechanism.

Sanitize exceptions and audit metadata. Do not put secrets, user prompts, sensitive tool payloads, or private query parameters into console logs, notifications, shared screenshots, or telemetry. Retrieved content and model output are data, not instructions that can grant new authority.

## Accessibility and comprehension review

Test meaningful labels, keyboard-only completion/rejection, visible focus, focus after replacement, screen-reader announcements, 320px reflow where applicable, text enlargement, reduced motion, forced colors, and supported locales. Check essential information in every consequential state, including unknown and partial outcomes.

Reference guidance includes [W3C keyboard access](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html), [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), and [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html). Token contrast tests and a browser sample are limited evidence, not a substitute for applicable requirements or user evaluation.

The reference components contain English copy. A locale API, all assistive-technology combinations, and cross-browser coverage are not claimed. Test framework-specific hydration and CSS placement in the consuming app.

## Package and release review

Use the committed dependency graph for reproduction; review deliberate updates. Test the local package in a fresh consumer project, including exports, declarations, CSS and assets. Workspace-built export checks do not prove that independent installation works.

Record source SHA, dependency/toolchain versions, commands, test counts, skipped/failing cases, manual observations, artifact locations, and retention. Do not reuse historical passed counts as proof for new code. An npm audit is dated advisory evidence, not a security guarantee.

## Threat-model review

Use the [STRIDE threat register](THREAT-MODEL.md#4-stride-threat-register) to identify applicable assets, boundaries and failure scenarios. Assign a service owner to each relevant threat and execute the [adopter acceptance scenarios](THREAT-MODEL.md#7-adopter-acceptance-scenarios), including concurrent replay, lost acknowledgements, revocation races, tenant isolation and worker stopping. Record the threat ID, linked SPEC IDs, evidence, residual risk and approver in the [review packet](THREAT-MODEL.md#8-review-packet-and-residual-risk-decisions). Keep proposed integration tests separate from existing local component/model evidence.

## Decision record

For each applicable MUST/MUST NOT, record the requirement section, enforcing component/service, evidence, reviewer, and result. Mark justified non-applicability explicitly; do not use it to excuse an unmet applicable rule. Record SHOULD departures and tradeoffs. A product with an unmet applicable MUST cannot claim TUN-Conformant for that scope.

Suggested release decision: Ready for the stated limited scope / Needs remediation / Not assessed. This is a team's review result, not an independent TUN certificate. Publication, deployment, and support commitments are separate intentional decisions.
