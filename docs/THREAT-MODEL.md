# TUN threat model

**Protect the connection between what a person reviews, what the system is authorized to do, and what actually happens.**

**Audience:** Adopting organizations' security reviewers, product owners, and application engineers.  
**Model version:** 0.2 · September 30, 2026.  
**Assessed source:** [`64e7ce6`](https://github.com/kochrisdev/TUN-Systemic-Design/tree/64e7ce6eb864deac1f0513a5d040a318116c959a).  
**Model owner:** `@kochrisdev`; each adopter assigns its own service owners and risk approver.

[Architecture](ARCHITECTURE.md) · [Threat register](#4-stride-threat-register) · [Misrepresentation](#misrepresentation) · [Acceptance scenarios](#7-adopter-acceptance-scenarios) · [Conformance evidence](../conformance/README.md) · [Report a vulnerability](../SECURITY.md)

## 1. Security objective and scope

An agent proposes publishing a project update. The person reviews one destination and one text. A different destination, a duplicate publication after a timeout, or an invented success receipt would all break the same contract: **the reviewed action, authorized action, executed effect, and verified outcome must remain connected.** TUN makes these distinctions visible; the adopting application enforces them across services.

### Why a design system needs this model

TUN sits between a person and an agent that can send, publish, transact, execute code, or change permissions. **Human understanding is a protected asset:** someone can act on a false belief about authorization, completion, or reversibility even when the individual fields on screen are technically accurate. This is the attachment's central contribution, developed in the misrepresentation register below.

**Presentation is never authority.** `ApprovalGate` emits a version-bound `DecisionRequest`; `ActionReceipt` requires host-supplied verification before presenting successful completion; `RecoveryControl` blocks effectful recovery when the original outcome is unknown. These safeguards support informed decisions, while authenticated host services enforce them.

This revision incorporates the submitted September 30 `THREAT-MODEL.md`. The [incorporation record](THREAT-MODEL-REVIEW.md) preserves its terminology and all 28 submitted threat IDs, explains adaptations, and distinguishes existing evidence from open recommendations. Existing TM-01–TM-18 identifiers and section links remain intact.

This model covers the reference React components, their typed presentation records, the local demonstration models, and the interfaces an adopting host needs to implement. It includes hostile inputs and ordinary distributed-system failures that an attacker could exploit. A row is an analysis scenario, not a report of an exploited vulnerability.

The assessed source contains the canonical components, in-memory demos, and the [server-backed local pilot](../examples/host-integration/README.md). The pilot enforces a narrow Python/SQLite protocol with local identities and a sandbox provider; its evidence is separate from the component tests. Public-showcase hosting, performance, and deployment configuration are outside this runtime assessment except for referenced badge checks and delivery threats. Runtime schemas in [draft PR #12](https://github.com/kochrisdev/TUN-Systemic-Design/pull/12) are **not credited as merged controls in this snapshot**. A deployed adopter must add its real identity provider, storage, tools, model provider, networks, and operational controls to the diagram.

**Requirement interpretation:** The register's “host must” column states the control needed to address that scenario when it is applicable. Linked `SPEC-*` IDs identify existing normative obligations; concrete mechanisms are implementation guidance, not new specification clauses. Read each complete requirement and its residual assessment in the [traceability matrix](../conformance/TRACEABILITY.md). Provider-specific, organizational, and legal requirements are recorded by the adopter.

## 2. Assets, attackers, and assumptions

| Protected asset | What is protected and why it matters |
|---|---|
| **Human understanding** | The reviewer's accurate mental model of scope, target, effect, authority, and reversibility. An informed decision requires more than individually truthful fields. |
| **Authorization integrity** | The binding between the exact reviewed proposal, its material context/plan basis, and the authorized effect. Approval of revision n cannot authorize different work in revision n+1. |
| **Outcome truth** | Whether an effect occurred, partially occurred, or remains unknown. An acknowledgement, a full progress counter, and a verified outcome are different facts. |
| **Recovery correctness** | Whether restoration, compensation, reconciliation, or no recovery is possible. Prior copies and irreversible effects must remain visible. |
| **Context and memory transparency** | What was available, actually used, and retained, with provenance and viewer access. Memory, logs, backups, and training have separate retention policies. |
| **Control efficacy** | Whether pause, stop, revoke, and takeover requests reached the host and what was confirmed. Availability, bounded work/cost, and a usable inspection/escalation path support this objective. |
| Identity, grants, credentials, and external resources | Protect principal/tenant attribution, policy, scope and duration, and prevent unauthorized or duplicate effects. Agent names and model claims are not credentials. |
| Audit and verification records | Retain attributable, integrity-protected evidence of decisions and effects, with minimized sensitive payloads and controlled access. |

**Adversaries:** An unauthenticated caller; an authenticated user acting outside their tenant or role; a malicious document, message, or retrieved source author; a compromised agent/tool or webhook sender; and a compromised dependency, build, or deployment account. An authorized user can also make an unintended choice under misleading presentation. Insider privileges and segregation of duties need an adopter-specific review.

**Non-malicious failure actors:** A faulty agent can supply plausible but incorrect records; buggy integration code can confuse acknowledgement with verification; a hurried reviewer can return to a stale tab; and infrastructure can lose or reorder messages. Review these without assuming malicious intent or treating the person being protected as an attacker.

A hostile host can fabricate otherwise valid evidence. TUN cannot authenticate that host's truthfulness from its own supplied text; the remedy is independent verification and host/infrastructure controls, not a stronger badge. Model alignment and device-compromise defenses are not supplied by this library. B6 remains in the review rather than being silently dropped from the existing model.

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
| <a id="TM-01"></a>**TM-01 · S/E · B1** | A caller spoofs a human/agent identity or submits approval under another tenant. | `AgentCard` and `ApprovalGate` show actor and authority separately. They display supplied identities; they do not authenticate them. | Authenticate principal and service identity; derive tenant/role from trusted session state, authorize the actual resource, and resolve actor attribution server-side. Do not accept an `actor.id` or capability label as proof. [SPEC-8-004](../conformance/TRACEABILITY.md#SPEC-8-004), [SPEC-26-001](../conformance/TRACEABILITY.md#SPEC-26-001). |
| <a id="TM-02"></a>**TM-02 · T/E · B1/B3** | Target, content, context, or plan changes after review; old consent is applied to different work. | `ProposalCard`, `PlanView`, and `ApprovalGate` flag same-version material changes. The gate emits proposal ID/version, not an executed result. | Load the immutable canonical proposal and its material basis; bind consent to those exact parameters and principal. Invalidate consent on material change and require new review. A client fingerprint is not an authorization token. [SPEC-8-003](../conformance/TRACEABILITY.md#SPEC-8-003). |
| <a id="TM-03"></a>**TM-03 · T/R · B1/B3** | Approval is replayed from another tab, remount, retrying proxy, or concurrent worker, creating duplicate effects. | `ApprovalGate` and `HumanOverride`/`RecoveryControl` latch repeated requests within a mounted revision. | Enforce durable, atomic deduplication and legal state transitions across all callers/workers. Bind a stable operation key to tenant, action, proposal version, and canonical parameters; reject key reuse with different data. A new browser request ID must not defeat deduplication. A repeat may be rejected or return the same authorized operation and its known state; it must not dispatch a second effect. [SPEC-8-003](../conformance/TRACEABILITY.md#SPEC-8-003), [SPEC-4-001](../conformance/TRACEABILITY.md#SPEC-4-001). |
| <a id="TM-04"></a>**TM-04 · E/T · B1/B3** | Authority expires or is revoked between approval and execution; a background tab presents stale permission. | `ApprovalGate` and control components check proposal/control expiry at activation and accept host blocking reasons. | Recheck current authority, revocation, scope, and expiry immediately before dispatch and at later effect boundaries. Use server time and conditional state transitions; define how revocation affects already-dispatched work. [SPEC-8-004](../conformance/TRACEABILITY.md#SPEC-8-004), [SPEC-4.4-001](../conformance/TRACEABILITY.md#SPEC-4.4-001). |
| <a id="TM-05"></a>**TM-05 · R/T · B3/B4** | A provider commits an effect but its acknowledgement is lost; retry duplicates the action. | `ApprovalGate` preserves an unknown decision outcome; `RecoveryControl` blocks effectful recovery on unknown original outcomes and permits reconciliation. | Persist the operation identity, query authoritative provider records, and preserve unknown/partial outcomes. Retry only after resolving the prior operation and checking duplicate-effect protection. Absence of a local receipt is not proof of no external effect. [SPEC-15-001](../conformance/TRACEABILITY.md#SPEC-15-001), [SPEC-18-003](../conformance/TRACEABILITY.md#SPEC-18-003). |
| <a id="TM-06"></a>**TM-06 · S/T/R · B4/B5** | A forged, replayed, or reordered observation invents success, revives an old run, or overwrites a newer outcome. | `ActionReceipt` downgrades unverified success; control components require matching control/run revisions for terminal evidence. Matching fields do not authenticate the sender or establish freshness. | Authenticate provider events/readback, bind resource/tenant/operation, deduplicate event IDs, and enforce authoritative event order or permitted transitions. Reconcile conflicting observations; distinguish provider acceptance from downstream delivery. [SPEC-15-001](../conformance/TRACEABILITY.md#SPEC-15-001), [SPEC-13-002](../conformance/TRACEABILITY.md#SPEC-13-002). |
| <a id="TM-07"></a>**TM-07 · E/T/I · B2/B3** | Prompt injection or a delegated agent converts document text, memory, or tool output into an instruction to exceed authority or exfiltrate data. | `ContextPanel`, `PlanView`, `ProposalCard`, and `ToolActivity` expose context, intended work, and reported tool use. Visibility is not injection prevention. | Treat retrieved/model content as untrusted data; enforce tool/argument/destination policy outside the model. Give each worker narrowly scoped credentials, isolate delegated workloads, and require appropriate approval for changed consequences. Apply least privilege even when the model or a guardrail says an action is safe. [SPEC-26-001](../conformance/TRACEABILITY.md#SPEC-26-001), [SPEC-11-002](../conformance/TRACEABILITY.md#SPEC-11-002), [SPEC-27-002](../conformance/TRACEABILITY.md#SPEC-27-002). |
| <a id="TM-08"></a>**TM-08 · T/D · B1/B2** | Malformed nested records, excessive arrays/text, or invalid values crash rendering or are misinterpreted as valid action metadata. | **No general raw-input schema layer in the React package at this snapshot.** Typed helpers check selected values after assuming record shapes. The local host separately validates its narrow protocol; that is not a parser for all component props. | Parse unknown input with runtime schemas before typed helpers/rendering; bound bytes, depth, collection size, and work. Validate semantic relationships separately and reject unsupported fields/types rather than coerce them into authority. Protect the ingress before parsing large bodies. Isolate rendering failures and retain a separate trusted status/escalation path; see [degraded-UI guidance](INTEGRATION-CHECKLIST.md#degraded-ui-and-error-recovery). [SPEC-19-001](../conformance/TRACEABILITY.md#SPEC-19-001), [SPEC-26-001](../conformance/TRACEABILITY.md#SPEC-26-001); schema rollout is an integration prerequisite. |
| <a id="TM-09"></a>**TM-09 · T/I/E · B2/B5** | Agent text becomes active HTML, a dangerous navigation link, or an unintended server-side fetch. | `ProposalCard`, `SourceView`, and `ActionReceipt` render text without interpreting supplied HTML; URL helpers omit unsupported links. Allowed HTTP(S) schemes do not make a destination trustworthy. | Use context-appropriate output handling and safe rendering. Enforce destination policy, sanitize any separately added rich-text renderer, and protect server fetches against SSRF, including redirects and resolved private addresses. Never pass agent strings to a shell or executable template. [SPEC-25-001](../conformance/TRACEABILITY.md#SPEC-25-001), [SPEC-26-001](../conformance/TRACEABILITY.md#SPEC-26-001). |
| <a id="TM-10"></a>**TM-10 · I/E · B2/B5** | Another tenant's source, memory, action status, or private exception leaks through payloads, caches, telemetry, or “hidden” panels. | `ContextPanel`/`SourceView` omit restricted content from rendering. Request errors use fixed messages. | Apply object/tenant access checks before transmission and at retrieval; partition caches and memory; redact secrets and minimize logs. Authorize receipt/status endpoints and exports independently. Hiding content after delivery cannot protect it. [SPEC-25-001](../conformance/TRACEABILITY.md#SPEC-25-001). |
| <a id="TM-11"></a>**TM-11 · T/I/E · B2/B5** | Poisoned persistent memory changes later decisions; “no memory” falsely implies no logs/backups; remembered preference becomes a permission grant. | `MemoryIndicator` distinguishes memory modes, scope, and influence; inspection does not perform a mutation. | Authorize memory reads/writes, preserve provenance and tenant separation, define retention/deletion, and invalidate materially affected review bases. Keep memory outside the permission source of truth. [SPEC-4.5-001](../conformance/TRACEABILITY.md#SPEC-4.5-001), [SPEC-12.1-001](../conformance/TRACEABILITY.md#SPEC-12.1-001), [SPEC-26-001](../conformance/TRACEABILITY.md#SPEC-26-001). |
| <a id="TM-12"></a>**TM-12 · S/T · B2/B5** | Fabricated citations, stale support, or generated interpretations are presented as verified evidence, inducing harmful consent. | `SourceView` separates quotation/paraphrase/generated material and preserves declared conflicts. `UncertaintySignal` downgrades unsupported certainty. | Check source provenance, access, relevance, freshness, and quote attribution; independently classify uncertainty. Bind material evidence changes into proposal review. A well-formed “verified” field is not verification. [SPEC-13-001](../conformance/TRACEABILITY.md#SPEC-13-001), [SPEC-14-001](../conformance/TRACEABILITY.md#SPEC-14-001). |
| <a id="TM-13"></a>**TM-13 · D/T/R · B1/B3/B4** | “Stop accepted” is shown as stopped while a worker continues or a stale worker commits after revocation. | `HumanOverride` separates pending/acknowledged/confirmed states and checks bound evidence. Activity views disclose supplied prior effects. | Authenticate the intervention, enforce worker cancellation/leases or fencing at commit boundaries, and verify cessation. Preserve in-flight effects and provide an escalation route if the worker is unreachable. Do not report confirmed stop from an accepted request alone. [SPEC-6-001](../conformance/TRACEABILITY.md#SPEC-6-001), [SPEC-17-001](../conformance/TRACEABILITY.md#SPEC-17-001). |
| <a id="TM-14"></a>**TM-14 · T/E/R · B1/B3/B4** | Recovery targets the wrong run, repeats an unknown effect, or calls compensation “undo” while prior copies/effects remain. | `RecoveryControl` binds run/control versions, blocks unknown-outcome retry, and labels compensation distinctly. | Authorize recovery as a new scoped operation, verify its target and original outcome, and apply idempotency and any required C4 approval. Record original and recovery effects separately; verify restoration before claiming undo. [SPEC-18-002](../conformance/TRACEABILITY.md#SPEC-18-002), [SPEC-18-003](../conformance/TRACEABILITY.md#SPEC-18-003), [SPEC-7.1-001](../conformance/TRACEABILITY.md#SPEC-7.1-001). |
| <a id="TM-15"></a>**TM-15 · R/I · B4/B5** | A party denies the action; records are deleted, misattributed, or leak private payloads during investigation. | `ActionReceipt` presents host-supplied action/actor/time; the review demo preserves previous receipts. Browser state is not the durable record. | Maintain access-controlled, integrity-protected decision and effect history with correlation IDs, policy/revision references, timestamps, and verification provenance. Restrict deletion/export and minimize sensitive payloads; preserve incident evidence under the product's retention policy. [SPEC-11-001](../conformance/TRACEABILITY.md#SPEC-11-001), [SPEC-15-001](../conformance/TRACEABILITY.md#SPEC-15-001), [SPEC-25-001](../conformance/TRACEABILITY.md#SPEC-25-001). |
| <a id="TM-16"></a>**TM-16 · D · B1/B2/B3** | Runaway delegation, excessive context, repeated retries, or a flooded queue exhausts budget and prevents intervention. | `AgentActivity`/`ToolActivity` communicate measured work and blockers; `HumanOverride` exposes a request path. Components enforce no service quotas. | Limit requests, concurrency, execution time, tokens/cost, delegation depth, and retries. Bound queue growth and preserve separate capacity for status/intervention; cancel or escalate stalled operations without inventing outcomes. [SPEC-6-001](../conformance/TRACEABILITY.md#SPEC-6-001), [SPEC-17-001](../conformance/TRACEABILITY.md#SPEC-17-001), [SPEC-19-001](../conformance/TRACEABILITY.md#SPEC-19-001). |
| <a id="TM-17"></a>**TM-17 · S/E · B1** | Deceptive labels, clickjacking, urgency, inaccessible controls, or approval fatigue induces consent to an unintended effect. | `ApprovalGate` shows the action, target, consequence, recovery limits, and distinct reject/approve controls. The host supplies the approve label. Badge text and known-state fixtures are covered by the [non-color regression suite](BADGE-ACCESSIBILITY.md). | Preserve material details in responsive/localized layouts; enforce an honest action-specific label and usable rejection. Protect framing and authenticated mutations; use step-up or independent confirmation where risk demands it. A compromised browser needs an additional trusted approval channel for high-risk cases. [SPEC-8-001](../conformance/TRACEABILITY.md#SPEC-8-001), [SPEC-8-002](../conformance/TRACEABILITY.md#SPEC-8-002), [SPEC-24-002](../conformance/TRACEABILITY.md#SPEC-24-002). |
| <a id="TM-18"></a>**TM-18 · T/E · B6** | A dependency, build artifact, or privileged deployment change compromises the UI or host enforcement. | **None in a component.** Repository upkeep is documented in [Security maintenance](SECURITY-MAINTENANCE.md). | Protect review/build/deploy credentials, check actual required-check enforcement, review dependency changes, verify deployed artifact identity, and maintain rollback and incident procedures. Repository maintenance is defense in depth, not a component-level grant of conformance. [SPEC-26-001](../conformance/TRACEABILITY.md#SPEC-26-001) applies to host authority; delivery controls are adopter-specific. |

The injection scenario is informed by [OWASP agent security][agent-security] and [prompt-injection guidance][prompt-injection]. Approval binding and the final server-side authorization check are also discussed in [OWASP transaction authorization][transaction-auth]. These references inform the threat analysis; the table's TUN mappings are based on this repository's code and specification.

<a id="misrepresentation"></a>
### 4.1 Misrepresentation — the human-understanding lens

The submitted model adds **M (misrepresentation)**: a record can be accurate while the overall impression is wrong. We retain that useful TUN-specific lens **alongside**, not as a seventh official STRIDE category or a claim that these scenarios never overlap STRIDE. M identifiers preserve the submitted review references; each links to an existing canonical threat and specification obligation.

| ID / canonical threat | Misleading impression | Presentation safeguard | What the host must do | Existing evidence | Residual risk |
|---|---|---|---|---|---|
| <a id="TM-M-1"></a>**TM-M-1** / [TM-06](#TM-06) | A full progress counter means completion. | `measuredProgress` displays measured counts; `AgentActivity`/`ToolActivity` obtain outcome labels from status and evidence, not progress. | Report operation-specific verification separately from progress. [SPEC-15-001](../conformance/TRACEABILITY.md#SPEC-15-001). | `tests/supervision-contracts.test.ts::does not infer completion from a full counter`. | A host can still assert false terminal evidence; reading counts is not verification. |
| <a id="TM-M-2"></a>**TM-M-2** / [TM-13](#TM-13) | Stop requested or acknowledged means stopped. | `HumanOverride` distinguishes requested, acknowledged and confirmed states and checks control/run evidence bindings. | Observe actual cessation, retain prior effects and state the intervention boundary. [SPEC-17-001](../conformance/TRACEABILITY.md#SPEC-17-001). | `tests/supervision-components.test.tsx::acknowledgement is not completion and remains latched`. | An unreachable worker or already-dispatched provider action may not be stoppable. |
| <a id="TM-M-3"></a>**TM-M-3** / [TM-14](#TM-14) | Compensation restored the original state. | `RecoveryControl` says “Compensation confirmed — not undo”; recovery labels distinguish compensation from reversibility. | Classify recovery from the real effect and preserve original plus recovery history. [SPEC-18-002](../conformance/TRACEABILITY.md#SPEC-18-002). | `tests/supervision-components.test.tsx::calls compensation compensation, not undo`. | Copies or secondary effects may remain; wording still needs comprehension testing. |
| <a id="TM-M-4"></a>**TM-M-4** / [TM-05](#TM-05) | A network failure means nothing happened. | `ApprovalGate` retains an unknown outcome and does not reopen its local latch on callback rejection. | Reconcile the original operation before another effectful attempt; a fresh proposal is not a way around unknown work. [SPEC-18-003](../conformance/TRACEABILITY.md#SPEC-18-003), [SPEC-8-005](../conformance/TRACEABILITY.md#SPEC-8-005). | `tests/components.test.tsx::fails closed on an unknown decision outcome`; real dropped-HTTP evidence in section 5. | Reconciliation can remain inconclusive; show unknown and offer safe escalation. |
| <a id="TM-M-5"></a>**TM-M-5** / [TM-17](#TM-17) | Color alone tells the person the consequence or state. | Every rendered badge requires visible descriptive text; known-state fixtures check labels in light, dark and forced-colors modes. IntentComposer intentionally has no badge. | Preserve text and meaningful approve/reject distinctions in the actual theme, locale and layout. [SPEC-22-001](../conformance/TRACEABILITY.md#SPEC-22-001), [SPEC-24-003](../conformance/TRACEABILITY.md#SPEC-24-003). | [Badge accessibility](BADGE-ACCESSIBILITY.md) and `tests/browser/badge-text.spec.ts` / `badge-states.spec.ts`. | Badge text presence does not prove contrast, comprehension, or every assistive-technology interaction. |
| <a id="TM-M-6"></a>**TM-M-6** / [TM-12](#TM-12) | A precise-looking confidence percentage establishes truth. | `UncertaintySignal` uses scoped U0–U3 descriptions and downgrades unsupported certainty. | Explain evidence and limitations; do not relabel model likelihoods as calibrated real-world certainty. [SPEC-13-001](../conformance/TRACEABILITY.md#SPEC-13-001). | `tests/evidence-components.test.tsx::downgrades an unsupported confirmed badge`; U0–U3 label fixtures in `tests/browser/badge-states.spec.ts`. | Host-supplied prose may still contain misleading numbers; no general numeric-claim detector is supplied. |
| <a id="TM-M-7"></a>**TM-M-7** / [TM-03](#TM-03) | A second tab or remount means a fresh, safe approval. | Local per-revision latches avoid repeated activation in one mounted control; they do not coordinate independent clients. | Deduplicate durably by authenticated scope and canonical operation, across clients and restarts. Return the existing operation or reject a duplicate without redispatch. [SPEC-8-003](../conformance/TRACEABILITY.md#SPEC-8-003). | `examples/host-integration/tests/test_host.py::HostIntegrationTests.test_concurrent_approvals_and_dispatches_have_one_durable_effect`. | The test covers concurrent HTTP callers in the local host, not every multi-tab UI, distributed worker or external provider. |

Plan review also needs explicit comprehension testing: `PlanView` labels it “Approach reviewed — not action authorization,” asserted by `tests/review-components.test.tsx::keeps approach review distinct from authorization`. Provenance needs similar care: `ContextPanel` displays `provided`/`retrieved`/`inferred`, but the ingestion service must establish the truthful classification. The [submitted-ID crosswalk](THREAT-MODEL-REVIEW.md#submitted-id-crosswalk) retains those related threats.

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

The unit tests above cover presentation or in-memory models. The following additional evidence now exercises actual HTTP and persistence in the local host, without claiming an external provider or production deployment.

### Server-backed and browser evidence

| Threats | Existing test or evidence | What it establishes |
|---|---|---|
| TM-01/TM-10 | `examples/host-integration/tests/test_host.py::HostIntegrationTests.test_tenant_isolation_covers_decisions_operations_status_and_board` | Local host resource access is tenant-scoped. |
| TM-02 | `examples/host-integration/tests/test_host.py::HostIntegrationTests.test_stale_revision_invalidates_existing_approval` | The server rejects an approval made stale by a material revision. |
| TM-03/TM-M-7 | `examples/host-integration/tests/test_host.py::HostIntegrationTests.test_concurrent_approvals_and_dispatches_have_one_durable_effect` | Concurrent HTTP callers resolve to one durable sandbox effect. |
| TM-04 | `examples/host-integration/tests/test_host.py::HostIntegrationTests.test_revoked_grant_blocks_queued_dispatch_and_survives_restart` | Server-owned revocation blocks undispatched work and is not reset at restart. |
| TM-05/TM-M-4 | `examples/host-integration/tests/test_host.py::HostIntegrationTests.test_actual_lost_http_ack_reconciles_without_redispatch` | A dropped acknowledgement is reconciled against the same sandbox operation. |
| TM-06 | `examples/host-integration/tests/test_host.py::HostIntegrationTests.test_provider_success_is_not_a_receipt_until_separate_readback` | A provider commit and acknowledgement are not enough to issue a receipt. |
| TM-06 | `examples/host-integration/tests/test_host.py::HostIntegrationTests.test_mismatched_provider_content_cannot_create_a_receipt` | Nonmatching stored content cannot produce a verified receipt. |
| TM-09 | `tests/contracts.test.mjs`, generated `unsafe record link is blocked:` cases | Existing negative cases reject javascript/data schemes, protocol-relative and backslash forms, URL credentials, leading whitespace, and an embedded newline. |
| TM-10 | `tests/review-components.test.tsx`, generated `never renders unexpected content or links for missing` / `... restricted` | Missing/restricted sources do not render unexpected summary/link fields, even if supplied at runtime. This cannot undo data already sent to the client. |
| TM-17/TM-M-5 | [Badge tests and coverage](BADGE-ACCESSIBILITY.md) | Descriptive visible badge text across the explorer, declared states and sampled transitions, beyond axe alone. |

Read the [host evidence map](../examples/host-integration/TRACEABILITY.md) for the full narrow protocol scope and exact backend/browser runners. The local host has real HTTP, server-side grants, durable records and separate database commits, but local identities and a same-process sandbox provider. It does not establish arbitrary distributed exactly-once delivery or running-worker cancellation.

The Python, Node test-runner and Playwright references are separate evidence sources. The existing conformance collector still ingests its mapped Vitest tests only; these links do not silently increase its mapped-test count. The submitted review's obsolete “unmapped” labels and unresolved checks are reconciled in the [incorporation record](THREAT-MODEL-REVIEW.md#evidence-and-claim-reconciliation).

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

These are **adopter acceptance scenarios**, not new passing tests supplied by this documentation revision. Some have local subsets in the [host evidence map](../examples/host-integration/TRACEABILITY.md); repeat the applicable scenarios against the adopting system. Use synthetic data and a controllable test provider, and attach results to the relevant threat and specification IDs.

| Scenario | Fault or adversarial action | Required observation |
|---|---|---|
| **AT-01 — Identity/tenant isolation** | Submit another tenant's proposal/receipt/control identifier through direct API calls. | No effect and no protected data; a privacy-safe denial is attributable to the authenticated caller. TM-01/TM-10. |
| **AT-02 — Material substitution** | Change target, content, or evidence basis between review and execution. | Old approval cannot authorize altered parameters; a fresh review is required. TM-02. |
| **AT-03 — Concurrent replay** | Submit the same approval from two browser sessions and two workers; repeat after a restart. | One permitted operation dispatch under the integration's tested idempotency contract; mismatched-parameter key reuse is rejected. TM-03. |
| **AT-04 — Revocation race** | Revoke permission or expire a proposal while queued. | No later unauthorized dispatch; already-accepted work is explicitly reported and handled. TM-04. |
| **AT-05 — Lost acknowledgement** | Commit at the test provider, then drop the response before host acknowledgement. | Unknown stays visible; reconciliation reads the same operation without a duplicate effect. TM-05. |
| **AT-06 — Forged/reordered events** | Deliver an unauthenticated event, duplicate an event, then replay an old success after a newer terminal state. | No fabricated or backward state transition; conflicts are reconciled. TM-06. |
| **AT-07 — Injected tool instructions** | Put an out-of-scope action or destination in retrieved content, model output, and remembered context. | The service denies the disallowed call independent of model compliance; no unauthorized disclosure. TM-07/TM-11. |
| **AT-08 — Malformed and oversized input** | Send null/missing nested records, unsupported enums/fields, oversized context, and cyclic plan references. | Bounded rejection before typed rendering/execution; no raw exception or payload leak. Inject a render failure as a separate test: trusted status/escalation remains reachable, no false stop/success appears, and remounting does not repeat an effect. TM-08/TM-16. |
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

### Comprehension checks for the M register

Ask reviewers to describe what was authorized, what has executed, what remains unknown, and what can actually be recovered. Repeat under interruption, delayed responses, a full progress counter, narrow/forced-color layouts, and repeated approval requests. Record observed misunderstandings and design changes rather than assuming clear labels eliminate approval fatigue. Check [TM-M-1–TM-M-7](#misrepresentation) alongside the relevant AT scenarios.

## 9. Maintenance and evidence links

Review this model when introducing a new tool/provider, tenant boundary, memory mode, runtime schema, approval parameter, recovery action, persistence mechanism, authentication method, deployment path, or autonomy level, and after an incident. Keep TM-01–TM-18 and the incorporated TM-M-1–TM-M-7 IDs stable; add new IDs for new threats and retain history for retired scenarios. Use the submitted-ID crosswalk instead of renumbering existing assessments. If a safeguard weakens, review affected specification obligations and regressions; do not weaken an obligation simply to match faulty code.

Changes to implementation status need a new assessed commit. In particular, merging runtime schemas should update TM-08 and its input tests; it should not mark authorization, freshness, or durable deduplication as solved. Review live GitHub settings using [Security maintenance](SECURITY-MAINTENANCE.md), rather than treating a committed ruleset template as activation evidence.

Trace links and Markdown fragments are checked by `python scripts/check_docs.py`. `python scripts/check_conformance.py` checks the separate normative requirement-to-test manifest; `--run` gathers fresh mapped-test evidence. This document adds no new tests to that runner. Attach the adopter's AT results and manual findings to the same `SPEC-*` assessment records through the [conformance assessment workflow](../conformance/README.md#complete-a-scoped-product-assessment).

### Follow-up decisions from the submitted model

Runtime schemas remain separate work in PR #12. They can check structure, but do not make time-dependent expiry, revision binding, semantic checks, authorization or provider verification redundant. Error-boundary and independent status-path guidance is now in the [integration checklist](INTEGRATION-CHECKLIST.md#degraded-ui-and-error-recovery); its implementation and failure tests remain adoption work.

Requiring expiry for every C3/C4 proposal or adding tool-category/reversibility linting would change the current contract or policy. Those are recorded as **proposals**, not new MUSTs: `ActionProposal.expiresAt` is currently optional, and `ToolCategory` belongs to activity records. Review real recovery evidence and bounded authority in each adoption; define a separate normative/API change before automating a universal rule. See the [recommendation disposition](THREAT-MODEL-REVIEW.md#structural-recommendations).

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
