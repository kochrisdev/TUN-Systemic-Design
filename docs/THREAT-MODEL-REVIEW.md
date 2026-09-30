# Threat-model incorporation record — September 30, 2026

[Current threat model](THREAT-MODEL.md) · [Misrepresentation register](THREAT-MODEL.md#misrepresentation) · [Integration checklist](INTEGRATION-CHECKLIST.md) · [Security maintenance](SECURITY-MAINTENANCE.md)

## Source and integration decisions

The maintainer supplied a draft `THREAT-MODEL.md` dated September 30, 2026. Its organizing idea is **human understanding as a protected asset**, with STRIDE threats plus **M — misrepresentation**, presentation mitigations, host obligations, evidence and residual risk. This record explains how it was incorporated, rather than presenting every submitted assertion as verified repository behavior.

**Submitted file SHA-256:** `e111de81d6050d8769e7c7b8db908129b4ed601fc667805ee2b7b38a864ea01a`.  
**Compared repository revision:** [`64e7ce6`](https://github.com/kochrisdev/TUN-Systemic-Design/tree/64e7ce6eb864deac1f0513a5d040a318116c959a).  
**Disposition:** Incorporated into threat-model revision 0.2 and the integration checklist. The original attachment remains the submitted source; the linked repository model is the maintained guidance.

The six named assets and the seven M scenarios come from the attachment. Existing source code, test declarations, merged host/badge work and security policy supply the reconciled implementation status. The distinction between the STRIDE taxonomy and an overlapping M lens is an editorial clarification, informed by the model's Microsoft method reference. Error-boundary limits additionally use React's linked documentation. Claims about other design systems having no security surface, a particular failure being “most likely,” or TUN defending against everything were not adopted: neither the attachment nor this repository review supplies evidence for those generalizations.

Existing **TM-01–TM-18**, **B1–B6**, **AT-01–AT-12**, specification links, and walkthroughs are retained. **TM-M-1–TM-M-7** are preserved as supplemental scenario identifiers, linked to the existing canonical threats. The other submitted category IDs remain traceable through the crosswalk below; they do not replace or renumber previously cited IDs. M is TUN-specific analysis, not a new official STRIDE category or proof that its scenarios cannot overlap STRIDE.

## Submitted-ID crosswalk

“Existing evidence” means the named source contains the assertion or check. It does not mean the entire threat is closed or that this document automatically adds a mapping to the conformance runner. Exact literal references are distinguished from generated test families. Shared residual risks and host ownership remain in the canonical register and review packet.

### Spoofing

| Submitted ID and concern | Retained destination | Evidence/status at the compared revision |
|---|---|---|
| **TM-S-1 — False identity in proposal text** | [TM-01](THREAT-MODEL.md#TM-01), [TM-17](THREAT-MODEL.md#TM-17) | Actor classification is checked in `proposalBlockReason`; the submitted `invalid recovery blocks approval` test is about recovery, not actor type. Dedicated invalid-actor/naming assertions remain follow-up work. Plain text can still impersonate authority semantically. |
| **TM-S-2 — False source provenance** | [TM-12](THREAT-MODEL.md#TM-12), [TM-11](THREAT-MODEL.md#TM-11) | `tests/review-components.test.tsx::distinguishes availability from actual use` asserts the displayed `provided` provenance. Ingestion truth and all provenance classifications need host evidence, not a display-only claim. |
| **TM-S-3 — Fabricated verification** | [TM-06](THREAT-MODEL.md#TM-06), [TM-12](THREAT-MODEL.md#TM-12) | `tests/contracts.test.mjs::unverified completion is downgraded` and `empty verification evidence is downgraded` check receipt display. The local host also tests separate readback and mismatched content. A dishonest host can still fabricate valid-looking evidence. |

### Tampering

| Submitted ID and concern | Retained destination | Evidence/status at the compared revision |
|---|---|---|
| **TM-T-1 — Same-version proposal mutation** | [TM-02](THREAT-MODEL.md#TM-02) | `tests/components.test.tsx::blocks same-version changes to the target`; fingerprints cover declared material fields, not arbitrary added host fields. |
| **TM-T-2 — Stale context or plan basis** | [TM-02](THREAT-MODEL.md#TM-02) | `tests/review-contracts.test.mjs::changed context invalidates review basis` and `changed plan invalidates review basis`; host use of canonical revisions remains necessary. |
| **TM-T-3 — Property order / whitespace** | [TM-02](THREAT-MODEL.md#TM-02) | `tests/contracts.test.mjs::fingerprint ignores object property order` and `tests/supervision-contracts.test.ts::ignores property order`. Ordered-field serialization does not normalize whitespace inside string values; no such equivalence is claimed. |
| **TM-T-4 — Control rebound to another run** | [TM-13](THREAT-MODEL.md#TM-13), [TM-14](THREAT-MODEL.md#TM-14) | `tests/supervision-components.test.tsx::rejects evidence for another run` tests the run mismatch directly; control fields still need authoritative host resolution. |

### Repudiation

| Submitted ID and concern | Retained destination | Evidence/status at the compared revision |
|---|---|---|
| **TM-R-1 — Insufficient decision identifiers** | [TM-15](THREAT-MODEL.md#TM-15) | `tests/components.test.tsx::emits a version-bound decision, never a receipt` and `tests/supervision-contracts.test.ts::emits identities only`. Host auditing must add authenticated actor, policy and time. |
| **TM-R-2 — Ambiguous or fabricated time** | [TM-04](THREAT-MODEL.md#TM-04), [TM-06](THREAT-MODEL.md#TM-06), [TM-15](THREAT-MODEL.md#TM-15) | `tests/contracts.test.mjs::timezone is required`, `invalid timestamp is not fabricated`, and `offset timestamp is normalized to UTC`. Parsing/formatting does not establish server provenance or client-clock accuracy. |

### Information disclosure

| Submitted ID and concern | Retained destination | Evidence/status at the compared revision |
|---|---|---|
| **TM-I-1 — Restricted source disclosure** | [TM-10](THREAT-MODEL.md#TM-10) | Beyond the discriminated union, `ContextPanel` has a runtime rendering guard and `tests/review-components.test.tsx` generates `never renders unexpected content or links for missing` / `... restricted`. Viewer authorization must happen before transmission. |
| **TM-I-2 — Silent persistent memory** | [TM-11](THREAT-MODEL.md#TM-11) | `tests/evidence-components.test.tsx::separates memory use from retention and permission` tests presentation, not a storage service. `MemoryIndicator` uses memory mode metadata; `persistence` belongs to context-source records. Unreported writes and deletion need host tests. |
| **TM-I-3 — Unsafe details links** | [TM-09](THREAT-MODEL.md#TM-09) | The `unsafe record link is blocked:` family already tests javascript/data, protocol-relative, backslash, credentials, leading whitespace and embedded newline cases. A dedicated trailing-whitespace regression is not present in that family; destination trust/SSRF remain separate host controls. |
| **TM-I-4 — Sensitive logging** | [TM-10](THREAT-MODEL.md#TM-10), [TM-15](THREAT-MODEL.md#TM-15) | Local-host `HostIntegrationTests.test_audit_events_are_durable_and_contain_no_tokens_or_content` covers its audit records. This is not a repository-wide secret/payload logging scanner. |

### Denial of service

| Submitted ID and concern | Retained destination | Evidence/status at the compared revision |
|---|---|---|
| **TM-D-1 — A latched failure leaves no next step** | [TM-05](THREAT-MODEL.md#TM-05), [TM-16](THREAT-MODEL.md#TM-16) | `tests/components.test.tsx::fails closed on an unknown decision outcome`; the local host provides a reconciliation path. Creating a new revision or remounting is not permission to repeat unresolved work. |
| **TM-D-2 — Throttled expiry timer / clock skew** | [TM-04](THREAT-MODEL.md#TM-04) | `tests/contracts.test.mjs::exact expiry blocks approval`; gate source rechecks time at activation. Host `test_server_clock_rechecks_expiry_at_dispatch` covers the server boundary, not every browser suspension case. |
| **TM-D-3 — An unavailable stop looks usable** | [TM-13](THREAT-MODEL.md#TM-13) | Control checks cover expiry and required limits/effects. `tests/supervision-components.test.tsx::blocks explicit host policy` exercises blocking; no test establishes actual worker reachability. |
| **TM-D-4 — Rendering fails while an agent continues** | [TM-08](THREAT-MODEL.md#TM-08), [TM-16](THREAT-MODEL.md#TM-16) | Selected invalid enums/timestamps fall back safely, but helpers dereference nested objects and are not general parsers. Added [degraded-UI guidance](INTEGRATION-CHECKLIST.md#degraded-ui-and-error-recovery); a host error-boundary implementation and its failure tests remain open. |

### Elevation of privilege

| Submitted ID and concern | Retained destination | Evidence/status at the compared revision |
|---|---|---|
| **TM-E-1 — Callback becomes authority or success** | [TM-01](THREAT-MODEL.md#TM-01), [TM-06](THREAT-MODEL.md#TM-06) | `tests/components.test.tsx::emits a version-bound decision, never a receipt`; the server-backed pilot now separately tests authorization, execution and verification. The submitted “documentation only” status is superseded for that local scope. |
| **TM-E-2 — Plan review authorizes every step** | [TM-02](THREAT-MODEL.md#TM-02), [TM-17](THREAT-MODEL.md#TM-17) | `tests/review-components.test.tsx::keeps approach review distinct from authorization` directly asserts the label. Host per-action authorization remains required. |
| **TM-E-3 — Retry repeats an unknown effect** | [TM-05](THREAT-MODEL.md#TM-05), [TM-14](THREAT-MODEL.md#TM-14) | `tests/supervision-contracts.test.ts::retry requires a safeguard` and `allows reconciliation of unknown outcomes`. `retrySafety` is a host explanation, not verified deduplication. |
| **TM-E-4 — High consequence disguised as routine** | [TM-17](THREAT-MODEL.md#TM-17), [TM-14](THREAT-MODEL.md#TM-14) | C0–C4 descriptions have browser fixtures. The gate checks a nonblank label, not whether every phrase is a concrete verb; `SPEC-8-002` still requires non-deceptive controls. Mandatory expiry/category linting remains a proposal. |

### Misrepresentation

| Submitted ID and concern | Retained destination | Evidence/status at the compared revision |
|---|---|---|
| **TM-M-1 — Full counter mistaken for completion** | [TM-M-1](THREAT-MODEL.md#TM-M-1) / [TM-06](THREAT-MODEL.md#TM-06) | Retained with the exact full-counter assertion and the need for independent outcome evidence. |
| **TM-M-2 — Stop requested mistaken for stopped** | [TM-M-2](THREAT-MODEL.md#TM-M-2) / [TM-13](THREAT-MODEL.md#TM-13) | Retained with the acknowledgement-versus-completion component assertion. |
| **TM-M-3 — Compensation mistaken for undo** | [TM-M-3](THREAT-MODEL.md#TM-M-3) / [TM-14](THREAT-MODEL.md#TM-14) | Retained; direct wording test replaces the weaker submitted fingerprint pointer. |
| **TM-M-4 — Network failure mistaken for no effect** | [TM-M-4](THREAT-MODEL.md#TM-M-4) / [TM-05](THREAT-MODEL.md#TM-05) | Retained with local component and actual dropped-HTTP/reconciliation evidence. |
| **TM-M-5 — Color-only critical meaning** | [TM-M-5](THREAT-MODEL.md#TM-M-5) / [TM-17](THREAT-MODEL.md#TM-17) | Already implemented in merged PR #17: visible-text guards, independent expected labels, and light/dark/forced-colors cases; no duplicate suite added. |
| **TM-M-6 — False-precision uncertainty** | [TM-M-6](THREAT-MODEL.md#TM-M-6) / [TM-12](THREAT-MODEL.md#TM-12) | Retained with U0–U3 label and unsupported-certainty evidence; arbitrary host prose is not numerically fact-checked. |
| **TM-M-7 — Another tab appears to allow another effect** | [TM-M-7](THREAT-MODEL.md#TM-M-7) / [TM-03](THREAT-MODEL.md#TM-03) | Merged PR #18 tests concurrent HTTP approvals/dispatch. Returning the same operation is a valid deduplication outcome; every duplicate need not be rejected, but no second effect may be dispatched. |

## Evidence and claim reconciliation

The submitted *does not invent absent evidence* assertion concerns control evidence, not activity evidence. Activity coverage is the generated `does not assert unverified completed/partial/failed` family in [supervision contract tests](../tests/supervision-contracts.test.ts). The crosswalk uses exact assertion scope instead of treating similar titles as interchangeable.

The [existing URL tests](../tests/contracts.test.mjs), [context rendering tests](../tests/review-components.test.tsx), [badge suite](BADGE-ACCESSIBILITY.md), and [server-backed pilot tests](../examples/host-integration/TRACEABILITY.md) supersede several submitted “unmapped” labels. The framework's [conformance manifest](../conformance/spec-v0.1.json) already exists; these additional Node/Python/Playwright references are not automatically mapped Vitest results. Test presence, a named passing run, and complete risk resolution remain separate evidence fields.

Fingerprint key-order stability does not make whitespace changes immaterial. Runtime schemas also do not make policy, expiry, revision, cross-field, or evidence checks redundant. Safe parsing and display guardrails need to compose with those checks. No helper is removed and no broad fail-closed guarantee for arbitrary JSON is claimed.

The submitted prompt-injection boundary is retained, but review friction is not presented as the only defense. The existing threat model's external tool policy, scoped credentials, destination restrictions, and tenant controls remain. An honest-looking hostile host or a compromised deployment is not made trustworthy by component checks.

## Structural recommendations

| Submitted recommendation | Disposition in this integration | Remaining work |
|---|---|---|
| Runtime schemas | **Open / separate PR #12.** General component schemas are not merged at the compared revision; local-host request validation is narrower. | Finish/reconcile schema work, semantic and resource-limit checks, and language-neutral consumers. Reassess TM-08 against the resulting source. |
| Negative URL tests | **Mostly already present.** Existing cases retained; no redundant test suite added. | Add explicit trailing-whitespace and destination-policy cases in a focused test change. Do not confuse allowed schemes with trusted destinations. |
| Color independence | **Already implemented in PR #17.** Referenced from TM-M-5. | Maintain visible-text and state-label checks when adding states, themes or localization. |
| Error-boundary guidance | **Incorporated.** The checklist defines an isolated fallback, trusted status identity, safe escalation, explicit async handling and no retry-on-remount. | Implement and fault-test the boundary in the adopting host; no library error-boundary component is added here. |
| Consequence/expiry/recovery linting | **Proposal retained, not enacted.** Expiry is currently optional. Sending/publishing/transacting are activity categories, not fields on `ActionProposal`. | Agree on policy and a representable contract linking tool semantics, consequence, expiry and restoration evidence. Use the normal normative/API review process before adding MUSTs. |
| Requirement traceability | **Existing layer retained and supplemented by pointers.** All submitted IDs have a destination. | Extend collectors deliberately for additional runners, and attach adopter evidence without claiming the risks are automatically closed. |

## Repository posture reconciliation

The attachment's security-housekeeping table predates the current security baseline. [PR #14](https://github.com/kochrisdev/TUN-Systemic-Design/pull/14) added SECURITY.md, CODEOWNERS, weekly Actions/npm Dependabot configuration and explicit dual-graph audit gating. The [audit runner](../scripts/audit_dependencies.py) fails on every reported severity or audit error and retains both reports. The previous redirected audit command also propagated its failure exit code; “writes artifacts, never fails” is not carried forward.

The [security maintenance guide](SECURITY-MAINTENANCE.md) owns the current policy and instructions for administrator activation. A committed ruleset or reporting policy is not proof that live required checks or private vulnerability reporting were enabled. Those administration settings are not changed or independently reverified by this documentation integration. Publication/provenance remains a separate intentional release decision; no workflow permission is broadened.

## Maintenance

Keep this incorporation record as the dated explanation of how the submitted draft was reconciled. Update the maintained threat model, not this snapshot, when implementation status changes. Preserve the submitted IDs as aliases and stable M identifiers. Review a weakened mitigation against existing obligations and tests; a bug is not a reason to silently weaken the specification.
