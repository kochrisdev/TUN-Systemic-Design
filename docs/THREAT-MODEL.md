# TUN threat model

**Protect the connection between what a person reviews, what the system is authorized to do, and what actually happens.**

**Audience:** Adopting organizations' security reviewers, product owners, and application engineers.  
**Model version:** 0.1 · September 29, 2026.  
**Assessed source:** [`b2e8ba4`](https://github.com/kochrisdev/TUN-Systemic-Design/tree/b2e8ba400665cf7053add4f0600b7f4bcdc2130c).  
**Model owner:** `@kochrisdev`; each adopter assigns its own service owners and risk approver.

[Architecture](ARCHITECTURE.md) · [Threat register](#4-stride-threat-register) · [Acceptance scenarios](#7-adopter-acceptance-scenarios) · [Conformance evidence](../conformance/README.md) · [Report a vulnerability](../SECURITY.md)

## 1. Security objective and scope

An agent proposes publishing a project update. The person reviews one destination and one text. A different destination, a duplicate publication after a timeout, or an invented success receipt would all break the same contract: **the reviewed action, authorized action, executed effect, and verified outcome must remain connected.** TUN makes these distinctions visible; the adopting application enforces them across services.

This model covers the reference React components, their typed presentation records, the local demonstration models, and the interfaces an adopting host needs to implement. It includes hostile inputs and ordinary distributed-system failures that an attacker could exploit. A row is an analysis scenario, not a report of an exploited vulnerability.

The assessed `main` source contains the canonical components and in-memory demos. Runtime schemas in [draft PR #12](https://github.com/kochrisdev/TUN-Systemic-Design/pull/12) are **not credited as merged controls in this snapshot**. A deployed adopter must add its real identity provider, storage, tools, model provider, networks, and operational controls to the diagram.

**Requirement interpretation:** The register's “host must” column states the control needed to address that scenario when it is applicable. Linked `SPEC-*` IDs identify existing normative obligations; concrete mechanisms are implementation guidance, not new specification clauses. Read each complete requirement and its residual assessment in the [traceability matrix](../conformance/TRACEABILITY.md). Provider-specific, organizational, and legal requirements are recorded by the adopter.

## 2. Assets, attackers, and assumptions

| Protected asset | Security objective |
|---|---|
| Human intent and review basis | Preserve the exact target, content, consequences, context/plan revisions, and recovery limits that informed a decision. |
| Identity, grants, and credentials | Keep principal, tenant, tool scope, duration, and revocation separate from agent names or model-generated claims. |
| External resources and operation records | Prevent unauthorized or duplicate effects; distinguish acceptance, delivery, partial effects, failure, and unresolved outcomes. |
| Private context, memory, and evidence | Restrict access and retention; prevent another tenant or injected document from influencing authority or disclosing protected data. |
| Audit and verification records | Retain attributable, integrity-protected evidence without unnecessarily retaining sensitive payloads. |
| Availability and human control | Bound work and cost, preserve inspection/intervention paths, and stop future work within stated limits. |

**Adversaries:** An unauthenticated caller; an authenticated user acting outside their tenant or role; a malicious document, message, or retrieved source author; a compromised agent/tool or webhook sender; and a compromised dependency, build, or deployment account. An authorized user can also make an unintended choice under misleading presentation. Insider privileges and segregation of duties need an adopter-specific review.

**Operating assumptions:** Clients, browser storage, and agent-supplied records are not authorization authorities. Multiple tabs and workers can act concurrently. Messages may be delayed, duplicated, reordered, or lost; a timeout says nothing conclusive about an external effect. The server's clock and policy state govern execution. Valid structure does not authenticate a principal, prove evidence, or grant permission.

The authorization/execution service and its deployment are trusted enforcement points in this model. Their compromise defeats client-side presentation controls; supply-chain and operational defenses therefore belong in the assessment rather than being attributed to a component. Availability failures should block unsafe effects while preserving authorized status inspection and escalation where possible.

## 3. Data flow and trust boundaries

```text
Person / browser containing TUN components
  intent, proposal inspection, decision, intervention request
                       |
                     [B1]
                       v
Host: authenticate + resolve tenant + validate + authorize
  |                    |                          |
  |                  [B2]                         |
  |                    v                          |
  |          Agent/model + retrieved context       |
  |          + memory + external documents         |
  |                    |                          |
  |          candidate plan/proposal (data)        |
  |                    v                          |
  +--> canonical proposal + approved operation record
                       |
                     [B3]
                       v
              Executor / tools / provider --> external effect
                       |
       observations, webhooks, readback, partial results
                     [B4]
                       v
            Host operation ledger + verifier
                       |
          authorized, minimized view of known state
                     [B5]
                       v
        TUN activity / receipt / evidence / recovery views

[B6] Reviewed repository + dependencies + CI artifacts --> deployed UI/services
```

| Boundary | What crosses it | Enforcement owner |
|---|---|---|
| B1 — Client to host | Intent, proposal references, decisions, status queries, control requests | Application API: authenticate, authorize each resource/tenant, validate inputs, enforce permitted transitions; protect browser-originated mutations against CSRF as applicable. |
| B2 — Untrusted content to reasoning | Retrieved text, memory, model output, candidate tool parameters | Agent gateway/data services: constrain data access and tool capabilities; keep source content out of the permission model. |
| B3 — Authorized operation to effect | Canonical parameters, scoped credentials, operation identity | Executor/worker: enforce current policy and deduplication at the effect boundary; constrain destinations and execution environment. |
| B4 — Provider observation to recorded outcome | Callback/webhook/readback, identity, result, timestamp | Adapter/verifier: authenticate observations, bind them to the operation, reject stale transitions, reconcile ambiguity. |
| B5 — Stored state to viewer | Receipts, context, evidence, logs, memory influence | Read API and UI integrator: authorize the viewer and minimize data before transmission; preserve outcome semantics in presentation. |
| B6 — Source to deployed artifact | Reviewed code, dependency graph, build output, release identity | Maintainer/platform team: protect review/build/deploy credentials and verify artifact provenance. |

Model-generated proposals return to the host as **data**, never as a path around B1/B3. Status and recovery APIs need the same tenant isolation as execution APIs. [Architecture](ARCHITECTURE.md) describes the reference component contracts in detail.

## 4. STRIDE threat register

STRIDE groups threats as **S**poofing, **T**ampering, **R**epudiation, **I**nformation disclosure, **D**enial of service, and **E**levation of privilege. A scenario may span categories. This use of STRIDE follows [Microsoft's definitions][stride] and the system/boundary approach in [OWASP threat modeling][threat-modeling]. Likelihood and severity are assigned for the adopting deployment, not guessed from a generic UI library.

“Presentation safeguard” describes current component behavior or useful visibility, not service enforcement. “None” is deliberate. Test references below establish only the stated local behavior; the host acceptance scenarios remain to be exercised by each adopter.

| ID / STRIDE / boundary | Threat and consequence | TUN presentation safeguard | What the host must do; existing specification basis |
|---|---|---|---|
| **TM-01 · S/E · B1** | A caller spoofs a human/agent identity or submits approval under another tenant. | `AgentCard` and `ApprovalGate` show actor and authority separately. They display supplied identities; they do not authenticate them. | Authenticate principal and service identity; derive tenant/role from trusted session state, authorize the actual resource, and resolve actor attribution server-side. Do not accept an `actor.id` or capability label as proof. [SPEC-8-004](../conformance/TRACEABILITY.md#SPEC-8-004), [SPEC-26-001](../conformance/TRACEABILITY.md#SPEC-26-001). |
| **TM-02 · T/E · B1/B3** | Target, content, context, or plan changes after review; old consent is applied to different work. | `ProposalCard`, `PlanView`, and `ApprovalGate` flag same-version material changes. The gate emits proposal ID/version, not an executed result. | Load the immutable canonical proposal and its material basis; bind consent to those exact parameters and principal. Invalidate consent on material change and require new review. A client fingerprint is not an authorization token. [SPEC-8-003](../conformance/TRACEABILITY.md#SPEC-8-003). |
| **TM-03 · T/R · B1/B3** | Approval is replayed from another tab, remount, retrying proxy, or concurrent worker, creating duplicate effects. | `ApprovalGate` and `HumanOverride`/`RecoveryControl` latch repeated requests within a mounted revision. | Enforce durable, atomic deduplication and legal state transitions across all callers/workers. Bind a stable operation key to tenant, action, proposal version, and canonical parameters; reject key reuse with different data. A new browser request ID must not defeat deduplication. [SPEC-8-003](../conformance/TRACEABILITY.md#SPEC-8-003), [SPEC-4-001](../conformance/TRACEABILITY.md#SPEC-4-001). |
| **TM-04 · E/T · B1/B3** | Authority expires or is revoked between approval and execution; a background tab presents stale permission. | `ApprovalGate` and control components check proposal/control expiry at activation and accept host blocking reasons. | Recheck current authority, revocation, scope, and expiry immediately before dispatch and at later effect boundaries. Use server time and conditional state transitions; define how revocation affects already-dispatched work. [SPEC-8-004](../conformance/TRACEABILITY.md#SPEC-8-004), [SPEC-4.4-001](../conformance/TRACEABILITY.md#SPEC-4.4-001). |
| **TM-05 · R/T · B3/B4** | A provider commits an effect but its acknowledgement is lost; retry duplicates the action. | `ApprovalGate` preserves an unknown decision outcome; `RecoveryControl` blocks effectful recovery on unknown original outcomes and permits reconciliation. | Persist the operation identity, query authoritative provider records, and preserve unknown/partial outcomes. Retry only after resolving the prior operation and checking duplicate-effect protection. Absence of a local receipt is not proof of no external effect. [SPEC-15-001](../conformance/TRACEABILITY.md#SPEC-15-001), [SPEC-18-003](../conformance/TRACEABILITY.md#SPEC-18-003). |
| **TM-06 · S/T/R · B4/B5** | A forged, replayed, or reordered observation invents success, revives an old run, or overwrites a newer outcome. | `ActionReceipt` downgrades unverified success; control components require matching control/run revisions for terminal evidence. Matching fields do not authenticate the sender or establish freshness. | Authenticate provider events/readback, bind resource/tenant/operation, deduplicate event IDs, and enforce authoritative event order or permitted transitions. Reconcile conflicting observations; distinguish provider acceptance from downstream delivery. [SPEC-15-001](../conformance/TRACEABILITY.md#SPEC-15-001), [SPEC-13-002](../conformance/TRACEABILITY.md#SPEC-13-002). |
| **TM-07 · E/T/I · B2/B3** | Prompt injection or a delegated agent converts document text, memory, or tool output into an instruction to exceed authority or exfiltrate data. | `ContextPanel`, `PlanView`, `ProposalCard`, and `ToolActivity` expose context, intended work, and reported tool use. Visibility is not injection prevention. | Treat retrieved/model content as untrusted data; enforce tool/argument/destination policy outside the model. Give each worker narrowly scoped credentials, isolate delegated workloads, and require appropriate approval for changed consequences. Apply least privilege even when the model or a guardrail says an action is safe. [SPEC-26-001](../conformance/TRACEABILITY.md#SPEC-26-001), [SPEC-11-002](../conformance/TRACEABILITY.md#SPEC-11-002), [SPEC-27-002](../conformance/TRACEABILITY.md#SPEC-27-002). |
| **TM-08 · T/D · B1/B2** | Malformed nested records, excessive arrays/text, or invalid values crash rendering or are misinterpreted as valid action metadata. | **None at the raw-input boundary in the assessed snapshot.** Typed helpers perform bounded checks after assuming particular record shapes. | Parse unknown input with runtime schemas before typed helpers/rendering; bound bytes, depth, collection size, and work. Validate semantic relationships separately and reject unsupported fields/types rather than coerce them into authority. Protect the ingress before parsing large bodies. [SPEC-19-001](../conformance/TRACEABILITY.md#SPEC-19-001), [SPEC-26-001](../conformance/TRACEABILITY.md#SPEC-26-001); schema rollout is an integration prerequisite. |
| **TM-09 · T/I/E · B2/B5** | Agent text becomes active HTML, a dangerous navigation link, or an unintended server-side fetch. | `ProposalCard`, `SourceView`, and `ActionReceipt` render text without interpreting supplied HTML; URL helpers omit unsupported links. Allowed HTTP(S) schemes do not make a destination trustworthy. | Use context-appropriate output handling and safe rendering. Enforce destination policy, sanitize any separately added rich-text renderer, and protect server fetches against SSRF, including redirects and resolved private addresses. Never pass agent strings to a shell or executable template. [SPEC-25-001](../conformance/TRACEABILITY.md#SPEC-25-001), [SPEC-26-001](../conformance/TRACEABILITY.md#SPEC-26-001). |
| **TM-10 · I/E · B2/B5** | Another tenant's source, memory, action status, or private exception leaks through payloads, caches, telemetry, or “hidden” panels. | `ContextPanel`/`SourceView` omit restricted content from rendering. Request errors use fixed messages. | Apply object/tenant access checks before transmission and at retrieval; partition caches and memory; redact secrets and minimize logs. Authorize receipt/status endpoints and exports independently. Hiding content after delivery cannot protect it. [SPEC-25-001](../conformance/TRACEABILITY.md#SPEC-25-001). |
| **TM-11 · T/I/E · B2/B5** | Poisoned persistent memory changes later decisions; “no memory” falsely implies no logs/backups; remembered preference becomes a permission grant. | `MemoryIndicator` distinguishes memory modes, scope, and influence; inspection does not perform a mutation. | Authorize memory reads/writes, preserve provenance and tenant separation, define retention/deletion, and invalidate materially affected review bases. Keep memory outside the permission source of truth. [SPEC-4.5-001](../conformance/TRACEABILITY.md#SPEC-4.5-001), [SPEC-12.1-001](../conformance/TRACEABILITY.md#SPEC-12.1-001), [SPEC-26-001](../conformance/TRACEABILITY.md#SPEC-26-001). |
| **TM-12 · S/T · B2/B5** | Fabricated citations, stale support, or generated interpretations are presented as verified evidence, inducing harmful consent. | `SourceView` separates quotation/paraphrase/generated material and preserves declared conflicts. `UncertaintySignal` downgrades unsupported certainty. | Check source provenance, access, relevance, freshness, and quote attribution; independently classify uncertainty. Bind material evidence changes into proposal review. A well-formed “verified” field is not verification. [SPEC-13-001](../conformance/TRACEABILITY.md#SPEC-13-001), [SPEC-14-001](../conformance/TRACEABILITY.md#SPEC-14-001). |
| **TM-13 · D/T/R · B1/B3/B4** | “Stop accepted” is shown as stopped while a worker continues or a stale worker commits after revocation. | `HumanOverride` separates pending/acknowledged/confirmed states and checks bound evidence. Activity views disclose supplied prior effects. | Authenticate the intervention, enforce worker cancellation/leases or fencing at commit boundaries, and verify cessation. Preserve in-flight effects and provide an escalation route if the worker is unreachable. Do not report confirmed stop from an accepted request alone. [SPEC-6-001](../conformance/TRACEABILITY.md#SPEC-6-001), [SPEC-17-001](../conformance/TRACEABILITY.md#SPEC-17-001). |
| **TM-14 · T/E/R · B1/B3/B4** | Recovery targets the wrong run, repeats an unknown effect, or calls compensation “undo” while prior copies/effects remain. | `RecoveryControl` binds run/control versions, blocks unknown-outcome retry, and labels compensation distinctly. | Authorize recovery as a new scoped operation, verify its target and original outcome, and apply idempotency and any required C4 approval. Record original and recovery effects separately; verify restoration before claiming undo. [SPEC-18-002](../conformance/TRACEABILITY.md#SPEC-18-002), [SPEC-18-003](../conformance/TRACEABILITY.md#SPEC-18-003), [SPEC-7.1-001](../conformance/TRACEABILITY.md#SPEC-7.1-001). |
| **TM-15 · R/I · B4/B5** | A party denies the action; records are deleted, misattributed, or leak private payloads during investigation. | `ActionReceipt` presents host-supplied action/actor/time; the review demo preserves previous receipts. Browser state is not the durable record. | Maintain access-controlled, integrity-protected decision and effect history with correlation IDs, policy/revision references, timestamps, and verification provenance. Restrict deletion/export and minimize sensitive payloads; preserve incident evidence under the product's retention policy. [SPEC-11-001](../conformance/TRACEABILITY.md#SPEC-11-001), [SPEC-15-001](../conformance/TRACEABILITY.md#SPEC-15-001), [SPEC-25-001](../conformance/TRACEABILITY.md#SPEC-25-001). |
| **TM-16 · D · B1/B2/B3** | Runaway delegation, excessive context, repeated retries, or a flooded queue exhausts budget and prevents intervention. | `AgentActivity`/`ToolActivity` communicate measured work and blockers; `HumanOverride` exposes a request path. Components enforce no service quotas. | Limit requests, concurrency, execution time, tokens/cost, delegation depth, and retries. Bound queue growth and preserve separate capacity for status/intervention; cancel or escalate stalled operations without inventing outcomes. [SPEC-6-001](../conformance/TRACEABILITY.md#SPEC-6-001), [SPEC-17-001](../conformance/TRACEABILITY.md#SPEC-17-001), [SPEC-19-001](../conformance/TRACEABILITY.md#SPEC-19-001). |
| **TM-17 · S/E · B1** | Deceptive labels, clickjacking, urgency, inaccessible controls, or approval fatigue induces consent to an unintended effect. | `ApprovalGate` shows the action, target, consequence, recovery limits, and distinct reject/approve controls. The host supplies the approve label. | Preserve material details in responsive/localized layouts; enforce an honest action-specific label and usable rejection. Protect framing and authenticated mutations; use step-up or independent confirmation where risk demands it. A compromised browser needs an additional trusted approval channel for high-risk cases. [SPEC-8-001](../conformance/TRACEABILITY.md#SPEC-8-001), [SPEC-8-002](../conformance/TRACEABILITY.md#SPEC-8-002), [SPEC-24-002](../conformance/TRACEABILITY.md#SPEC-24-002). |
| **TM-18 · T/E · B6** | A dependency, build artifact, or privileged deployment change compromises the UI or host enforcement. | **None in a component.** Repository upkeep is documented in [Security maintenance](SECURITY-MAINTENANCE.md). | Protect review/build/deploy credentials, check actual required-check enforcement, review dependency changes, verify deployed artifact identity, and maintain rollback and incident procedures. Repository maintenance is defense in depth, not a component-level grant of conformance. [SPEC-26-001](../conformance/TRACEABILITY.md#SPEC-26-001) applies to host authority; delivery controls are adopter-specific. |

The injection scenario is informed by [OWASP agent security][agent-security] and [prompt-injection guidance][prompt-injection]. Approval binding and the final server-side authorization check are also discussed in [OWASP transaction authorization][transaction-auth]. These references inform the threat analysis; the table's TUN mappings are based on this repository's code and specification.

## 5. Existing evidence and its precise scope

The following are real test titles in the assessed source. They are evidence pointers, not a declaration that the corresponding host threat is resolved. The [conformance runner](../conformance/README.md#run-the-checks) records fresh outcomes for the tests already mapped in its manifest; the additional pointers below do not silently extend that manifest.

| Threats | Existing test ID | What the assertion establishes |
|---|---|---|
| TM-01 | `tests/components.test.tsx::separates capability from permission` | AgentCard displays capability and authority as separate concepts. |
| TM-02 | `tests/components.test.tsx::blocks same-version changes to the target` | An unchanged proposal version with a changed target disables the mounted gate. |
| TM-02 | `tests/review-components.test.tsx::blocks changed content under the same proposal version` | Changed content disables approval for the mounted version. |
| TM-03 | `tests/components.test.tsx::latches both controls while a decision is pending` | Local concurrent clicks emit only one decision callback. |
| TM-04 | `tests/review-model.test.ts::expiry is rechecked immediately before execution` | The in-memory host model rejects an expired operation before its local write. |
| TM-05 | `tests/review-model.test.ts::lost acknowledgement is reconciled rather than resubmitted` | The local model reads its existing record and retains one publication entry. |
| TM-06 | `tests/components.test.tsx::downgrades unverified success` | Pending verification cannot be displayed as completed. |
| TM-06/TM-14 | `tests/supervision-components.test.tsx::rejects evidence for another run` | Mismatched run evidence does not confirm the intervention. |
| TM-09 | `tests/components.test.tsx::escapes supplied text instead of rendering HTML` | The receipt renders supplied markup as text. |
| TM-11 | `tests/evidence-components.test.tsx::reflects supplied inactive state without claiming deletion` | Inactive memory changes the presentation without asserting deletion. |
| TM-12 | `tests/evidence-components.test.tsx::never styles generated interpretation as source quotation or checked support` | Generated interpretation is not quotation markup or checked support. |
| TM-13 | `tests/supervision-components.test.tsx::acknowledgement is not completion and remains latched` | Accepted control requests remain unconfirmed and latched. |
| TM-14 | `tests/supervision-components.test.tsx::calls compensation compensation, not undo` | Compensation confirmation does not claim original-state restoration. |
| TM-15 | `tests/review-model.test.ts::context changes do not erase historical receipts` | Previous receipts survive a context change in the local model. |

Sources: [core component tests](../tests/components.test.tsx), [review component tests](../tests/review-components.test.tsx), [review model tests](../tests/review-model.test.ts), [evidence tests](../tests/evidence-components.test.tsx), [supervision tests](../tests/supervision-components.test.tsx). Presentation code: [ApprovalGate](../packages/react/src/ApprovalGate.tsx), [ControlAction](../packages/react/src/ControlAction.tsx), [SourceView](../packages/react/src/SourceView.tsx), [contract helpers](../packages/react/src/contracts.ts), [supervision contracts](../packages/react/src/supervision-contracts.ts).

No listed unit test exercises a real provider, shared database, multiple independent browsers, compromised identity, or production deployment. Those are the acceptance tests below, owned by the adopter.

## 6. Three failure walkthroughs

### A. Stale review plus a second tab

The user reviews proposal P/version 1. A second tab changes its destination. The service creates a new immutable proposal version, invalidates the old decision path, and refuses the first tab's stale submission. Two simultaneous approvals of the same eligible operation contend on the same durable operation record; only one may dispatch that operation. Using two newly generated request IDs is not a reason to execute twice.

TUN's fingerprint/latch makes accidental local misuse visible. Server-side canonical binding and concurrency control establish the real invariant. If the API receives material fields as well as references, reject mismatches rather than silently executing different content from what the client displayed.

### B. An effect succeeds but acknowledgement is lost

```text
Persist operation identity -> dispatch effect -> provider commits
                                              -> response is lost
Host/UI outcome: unknown -> inspect same operation -> verify known result
```

A durable local reservation is necessary but not sufficient for exactly-once external effects. Use a provider-supported idempotency key or another integration-specific atomic design, and test its retention and replay semantics. When the destination offers neither idempotency nor authoritative status, retain the unknown outcome, prevent blind retries, and escalate for reconciliation. Do not label “no record found locally” as “nothing happened.”

### C. Stop acknowledged, worker still active

The stop API acknowledges a request while a worker already holds a queued write. The host revokes further dispatch, applies a cancellation token, lease, or fencing mechanism at the worker's effect boundary, then reports the verified outcome. An irreversible request already accepted by a provider may remain outside that cancellation boundary. Show the known partial effects and the exact stop limit; use a separate authorized recovery operation when appropriate.

Changing views, unmounting a control, or refreshing a browser cannot be the cancellation mechanism. The service retains operation state, and reconnecting clients inspect it before initiating new work.

## 7. Adopter acceptance scenarios

These **proposed integration tests are not implemented by this documentation change**. Run them in an isolated environment with synthetic data and a controllable test provider; attach results to the relevant threat and specification IDs.

| Scenario | Fault or adversarial action | Required observation |
|---|---|---|
| **AT-01 — Identity/tenant isolation** | Submit another tenant's proposal/receipt/control identifier through direct API calls. | No effect and no protected data; a privacy-safe denial is attributable to the authenticated caller. TM-01/TM-10. |
| **AT-02 — Material substitution** | Change target, content, or evidence basis between review and execution. | Old approval cannot authorize altered parameters; a fresh review is required. TM-02. |
| **AT-03 — Concurrent replay** | Submit the same approval from two browser sessions and two workers; repeat after a restart. | One permitted operation dispatch under the integration's tested idempotency contract; mismatched-parameter key reuse is rejected. TM-03. |
| **AT-04 — Revocation race** | Revoke permission or expire a proposal while queued. | No later unauthorized dispatch; already-accepted work is explicitly reported and handled. TM-04. |
| **AT-05 — Lost acknowledgement** | Commit at the test provider, then drop the response before host acknowledgement. | Unknown stays visible; reconciliation reads the same operation without a duplicate effect. TM-05. |
| **AT-06 — Forged/reordered events** | Deliver an unauthenticated event, duplicate an event, then replay an old success after a newer terminal state. | No fabricated or backward state transition; conflicts are reconciled. TM-06. |
| **AT-07 — Injected tool instructions** | Put an out-of-scope action or destination in retrieved content, model output, and remembered context. | The service denies the disallowed call independent of model compliance; no unauthorized disclosure. TM-07/TM-11. |
| **AT-08 — Malformed and oversized input** | Send null/missing nested records, unsupported enums/fields, oversized context, and cyclic plan references. | Bounded rejection before typed rendering/execution; no raw exception or payload leak. TM-08/TM-16. |
| **AT-09 — Output and source isolation** | Supply active markup, disallowed links/fetch destinations, restricted source content, and invented verification claims. | No active-content execution or unauthorized fetch/disclosure; uncertainty and access limits remain visible. TM-09/TM-10/TM-12. |
| **AT-10 — Stop race and saturation** | Fill the work queue, request stop, and allow a stale worker to attempt another commit. | Authorized control remains reachable; no forbidden later commit; prior effects are retained. TM-13/TM-16. |
| **AT-11 — Recovery and audit** | Recover the wrong run, retry an unknown effect, or replay compensation; then inspect history. | Invalid recovery is denied, permitted recovery is deduplicated, and original plus recovery records stay attributable and access-controlled. TM-14/TM-15. |
| **AT-12 — Approval and delivery integrity** | Review narrow-screen/keyboard flows, hostile framing, direct mutation requests, and an unreviewed deployment candidate. | Meaningful decisions remain usable; framing/request protections and actual repository/deployment gates enforce their policy. TM-17/TM-18. |

## 8. Review packet and residual-risk decisions

For each applicable threat, record **product/workflow and revision; threat ID and SPEC IDs; concrete asset/tenant scope; pre-control likelihood and impact; selected mitigation and enforcing service; executed evidence; residual likelihood/impact; named owner; decision; approver/date; and review expiry**. Use `mitigate`, `avoid`, `transfer`, or `accept` as the risk response, and `pass`, `fail`, `not-assessed`, or justified `not-applicable` for the requirement assessment. Acceptance of business risk does not turn an unmet mandatory requirement into a conformance pass.

Begin the pilot with threats that can authorize unintended effects or expose private data. Assess replay, stale revision, revocation, injection, tenant isolation, and recovery before enabling consequential tools; assess intervention and exhaustion before higher autonomy. These are review priorities, not universal severity ratings.

| Residual decision | Evidence needed before sign-off |
|---|---|
| Provider cannot deduplicate or reliably answer status queries | A documented unknown-outcome escalation path and an explicit limitation on automatic retries. |
| A browser or operator account is compromised | Step-up/independent approval design where required by risk, session controls, detection, and revocation response. |
| An authoritative source or tool lies within valid credentials | Independent verification where feasible, bounded authority, source provenance, and consequence limits. |
| Irreversible effects cannot be recalled | Accurate pre-action disclosure, a tested intervention boundary, and clearly labeled compensation options. |
| Data/log/backup copies outlive an AI-memory setting | A verified retention/deletion policy with access controls and an accountable owner. |

The adopter's security reviewer signs the scoped review; `@kochrisdev` maintaining this reference model is not approval of another organization's deployment. Keep detailed private infrastructure and findings in that organization's review packet, not public repository issues. Use [SECURITY.md](../SECURITY.md) for confidential reporting.

## 9. Maintenance and evidence links

Review this model when introducing a new tool/provider, tenant boundary, memory mode, runtime schema, approval parameter, recovery action, persistence mechanism, authentication method, deployment path, or autonomy level, and after an incident. Keep TM IDs stable; add new IDs for new threats and retain history for retired scenarios.

Changes to implementation status need a new assessed commit. In particular, merging runtime schemas should update TM-08 and its input tests; it should not mark authorization, freshness, or durable deduplication as solved. Review live GitHub settings using [Security maintenance](SECURITY-MAINTENANCE.md), rather than treating a committed ruleset template as activation evidence.

Trace links and Markdown fragments are checked by `python scripts/check_docs.py`. `python scripts/check_conformance.py` checks the separate normative requirement-to-test manifest; `--run` gathers fresh mapped-test evidence. This document adds no new tests to that runner. Attach the adopter's AT results and manual findings to the same `SPEC-*` assessment records through the [conformance assessment workflow](../conformance/README.md#complete-a-scoped-product-assessment).

## 10. Method references

The threat register and control allocation are TUN-specific analysis. These primary references supply the method and supporting engineering guidance; they do not certify TUN. Consulted September 29, 2026.

| Reference | Used for |
|---|---|
| [Microsoft STRIDE definitions][stride] | The six threat categories. |
| [OWASP Threat Modeling Cheat Sheet][threat-modeling] | Data flows, boundaries, actionable mitigations, and continuing review. |
| [OWASP Transaction Authorization Cheat Sheet][transaction-auth] | Displayed transaction binding and server-side authorization at execution. |
| [OWASP Authorization Cheat Sheet][authorization] | Per-request authorization, tenant/resource access, and least privilege. |
| [OWASP AI Agent Security Cheat Sheet][agent-security] | Agent/tool, memory, and delegated-authority attack surfaces. |
| [OWASP LLM Prompt Injection Prevention Cheat Sheet][prompt-injection] | Untrusted retrieved content and layered controls outside model behavior. |

[stride]: https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats
[threat-modeling]: https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html
[transaction-auth]: https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html
[authorization]: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
[agent-security]: https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html
[prompt-injection]: https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html
