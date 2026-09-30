# ADR 0001: Reconcile contributed threat and conformance drafts

**Status:** Accepted in [PR #21](https://github.com/kochrisdev/TUN-Systemic-Design/pull/21). **Decision owner:** `@kochrisdev`.

This is a historical architecture decision record, not adopter guidance. The body records the original integration decision and its dated implementation observations. The seven misrepresentation rows now live in the [main threat register](../THREAT-MODEL.md#41-misrepresentation-and-human-understanding); links below follow their current locations.

## Context

**Decision: enrich the existing system; do not replace its canonical rules or evidence checker.** This review incorporates the useful structure from the supplied `THREAT-MODEL.md`, `conformance.py`, `requirements.json` and `CONFORMANCE-MATRIX.md` while preserving established meanings and evidence boundaries.

**Repository baseline:** [64e7ce6](https://github.com/kochrisdev/TUN-Systemic-Design/tree/64e7ce6eb864deac1f0513a5d040a318116c959a). **Reviewed:** September 30, 2026. This is an AI-assisted integration review, not independent security certification. The supplied drafts are identified by their hashes below; their statements are distinguished from this review's decisions.

[Generated view](../CONFORMANCE-MATRIX.md) · [Misrepresentation threats](../THREAT-MODEL.md#41-misrepresentation-and-human-understanding) · [Canonical manifest](../../conformance/spec-v0.1.json) · [Existing assessment workflow](../../conformance/README.md)

## Decision

| Supplied material | Contribution retained | Integration decision |
|---|---|---|
| Threat model | Human understanding as a protected asset; explicit misrepresentation scenarios; presentation/host/evidence/residual columns; error-boundary guidance | Add the seven stable `TM-M-*` scenarios as a companion to the current STRIDE register. Preserve current `TM-01`–`TM-18` meanings and broader boundaries. |
| Requirements JSON | Component associations, responsibility vocabulary and threat references | Store reviewed associations in [relations.json](../../conformance/relations.json). Obtain complete text, ownership, coverage and file-qualified tests from the existing canonical manifest. Do not maintain a second normative inventory. |
| Matrix document | A scan-friendly requirement/component/threat table and product-assessment framing | Generate [CONFORMANCE-MATRIX.md](../CONFORMANCE-MATRIX.md), with a reverse lookup by component. Include shared P/H ownership and retain D obligations in product review. |
| Python tool | Offline standard-library `check` and `build` commands | Adapt the interface in [scripts/conformance.py](../../scripts/conformance.py), reusing the existing strict conformance and public-export parsers. The existing execution-evidence runner remains untouched. |

The attachment's `mapped` terminology correctly distinguishes test presence from a passed run. The repository's `partial`/`manual`/`gap` coverage and separately recorded run outcome remain authoritative, however: their scope cannot be inferred from a title-only list or automatically changed by the new view.

## Requirement IDs: why direct replacement would break traceability

The attachment contains **49 clause-oriented entries**. The canonical manifest contains **46 complete mandatory sentences**, retaining compound obligations. This is a granularity difference, not evidence of three missing requirements. Three sentences in sections 8, 24 and 26 are split in the attachment. Later section-8 IDs consequently have different meanings.

| Supplied draft ID | Existing canonical ID | Reason |
|---|---|---|
| `SPEC-8-002` and `SPEC-8-003` | `SPEC-8-002` | The canonical sentence includes both non-deceptive/rejectable controls and the ban on hiding consequential actions behind generic Continue labels. |
| `SPEC-8-004` | `SPEC-8-003` | Approval binding to proposal identity/version/material parameters. Canonical `SPEC-8-004` already means host authorization. |
| `SPEC-8-005` | `SPEC-8-004` | Host validation of authority and scope before execution. |
| `SPEC-8-006` | `SPEC-8-005` | Separate dismissal, escalation or withdrawal for blocked review. |
| `SPEC-24-003` and `SPEC-24-004` | `SPEC-24-003` | The canonical sentence includes both non-color critical meaning and distinguishable approval/rejection. |
| `SPEC-26-001` and `SPEC-26-002` | `SPEC-26-001` | The canonical sentence combines host scope enforcement with the prohibition on treating model/content/memory/UI state as permission. |

Other supplied IDs align by subject, but the attachment paraphrases their text. No draft wording replaces the exact canonical quotation. In particular, the supplied `SPEC-34-001` reduces the minimum requirement to distinguishing proposals from actions; the current sentence also requires human authority, uncertainty, state, accountability, scope, irreversible-effect disclosure, feasible recovery, context/persistence distinctions and avoidance of unnecessary cognitive complexity. The generated view retains that entire sentence.

These translations describe the submitted draft only. They are not aliases that redefine the published canonical IDs, and they do not renumber historical evidence or change the specification.

## Threat identifiers: keep both perspectives without duplicate authorities

The supplied threat draft has **28 rows**: six STRIDE groups plus seven misrepresentation scenarios. The current primary model uses 18 cross-boundary scenarios with sequential IDs. The following is a reviewed correspondence by subject, not a claim of identical scope or identical mitigations.

| Supplied draft ID | Existing related scenario(s) | Qualification |
|---|---|---|
| TM-S-1 | TM-01, TM-07 | Identity claims and untrusted content do not grant authority. |
| TM-S-2 | TM-11, TM-12 | Source provenance and memory influence; not itself the whole generated-quotation rule. |
| TM-S-3 | TM-06 | Fabricated verification and unauthenticated observations. |
| TM-T-1 | TM-02 | Material proposal change without fresh review. |
| TM-T-2 | TM-02 | Changed context/plan basis invalidating approval. |
| TM-T-3 | TM-02 | Narrow fingerprint ordering/normalization subcase, not a generic tamper-proof guarantee. |
| TM-T-4 | TM-06, TM-14 | Wrong-run control/evidence binding. |
| TM-R-1 | TM-15 | Attributable decisions and durable records. |
| TM-R-2 | TM-06, TM-15 | Timestamp interpretation and evidence correlation. |
| TM-I-1 | TM-10 | Viewer access checks and redaction before transmission. |
| TM-I-2 | TM-11 | Memory use, persistence, writes and retention. |
| TM-I-3 | TM-09 | Unsafe destinations and navigation; URL shape is not destination trust. |
| TM-I-4 | TM-10, TM-15 | Sensitive payloads in diagnostics and audit exports. |
| TM-D-1 | TM-05, TM-16 | Safe reconciliation/escalation after a latched unknown result. |
| TM-D-2 | TM-04 | Expiry checks and background-tab timing. |
| TM-D-3 | TM-13 | Actual intervention capability and confirmation. |
| TM-D-4 | TM-08 | Malformed/oversized input and isolated render failure. |
| TM-E-1 | TM-01, TM-04, TM-07 | Host misuse of UI decisions and model authority claims. |
| TM-E-2 | TM-02, TM-07 | Plan review is not blanket action authorization. |
| TM-E-3 | TM-03, TM-05, TM-14 | Retry, deduplication and unknown original outcomes. |
| TM-E-4 | TM-17 | Misclassified or misleading consequential controls. |
| TM-M-1 | TM-06, TM-12 | Retained as [TM-M-1](../THREAT-MODEL.md#TM-M-1): full progress is not completion. |
| TM-M-2 | TM-13 | Retained as [TM-M-2](../THREAT-MODEL.md#TM-M-2): stop requested is not stopped. |
| TM-M-3 | TM-14 | Retained as [TM-M-3](../THREAT-MODEL.md#TM-M-3): compensation is not undo. |
| TM-M-4 | TM-05 | Retained as [TM-M-4](../THREAT-MODEL.md#TM-M-4): network failure is not proof of no effect. |
| TM-M-5 | TM-17 | Retained as [TM-M-5](../THREAT-MODEL.md#TM-M-5): color-only meaning. |
| TM-M-6 | TM-12 | Retained as [TM-M-6](../THREAT-MODEL.md#TM-M-6): false precision. |
| TM-M-7 | TM-03 | Retained as [TM-M-7](../THREAT-MODEL.md#TM-M-7): remounts/tabs do not create fresh authority. |

See the complete [current STRIDE register](../THREAT-MODEL.md#4-stride-threat-register). Associations in relations.json were reviewed against each rule's full meaning; the draft threat IDs were not translated mechanically and treated as proof.

## Checker review

The supplied Python script is candid that it checks references rather than executing tests. Its owner/status consistency checks and generated table are useful. It should not replace the existing checker for the following source-observable reasons:

| Supplied implementation | Gap compared with current tooling | Preserved/adapted behavior |
|---|---|---|
| Collects a global set of matching `test(...)`/`it(...)` titles | A title in a different file, a comment or a disabled suite can satisfy the textual lookup; duplicates lose their identity in a set. | Keep unique `file::title` mappings and the existing source locator and fresh runner results. |
| Verifies section numbers but not exact normative text or a complete inventory | A missing obligation or changed MUST can go undetected while its heading remains. | Reuse the current exact sentence/strength and completeness checks. |
| `check` does not read the generated Markdown target | A stale generated matrix can pass. | Compare both the existing canonical matrix and the new rendered view; `build` validates before writing. |
| Reads `TM-[A-Z]-n` occurrences anywhere in the supplied threat document | It does not recognize current sequential IDs and a mere mention can count as a threat. | Resolve actual table definitions in the fixed primary/companion documents; reject missing/duplicate definitions and invalid anchors. |
| Uses `json.loads` defaults and required-key indexing | Duplicate object keys are silently replaced, and malformed structures can raise an uncaught exception. | Reuse duplicate-key rejection and exact-shape validation; reject stale/unknown IDs and component exports with a failing exit. |

The adapted tool does not add another test runner or redefine a passing rule. `python scripts/check_conformance.py --run` remains the fresh Vitest collector. Badge and host tests retain their separate reports, as described in [badge accessibility](../BADGE-ACCESSIBILITY.md) and the [host evidence map](../../examples/host-integration/TRACEABILITY.md).

## Statements reconciled rather than copied

**Design/product requirements are not automatically exempt.** The attachment labels seven D rows `n/a` and its declaration instructions focus on P/H rows. The current assessment process includes every applicable rule, including product review and the declaration itself. Lack of a code artifact is not non-applicability, and an exception does not make an unmet applicable MUST pass.

**Some stated gaps have already been addressed.** The draft calls the badge assertion unmapped, describes multi-tab deduplication as only planned, and says no conformance connection exists. Current source includes [badge regressions](../BADGE-ACCESSIBILITY.md), a [real local host pilot](../../examples/host-integration/README.md), and [canonical traceability](../../conformance/README.md). These have different evidence scopes; none is silently converted into a product-wide pass.

**Security housekeeping is not absent.** The draft's table says audit never fails and ownership/reporting guidance is missing. Current source has an explicit blocking [audit policy](../SECURITY-MAINTENANCE.md), [CODEOWNERS](../../.github/CODEOWNERS), [Dependabot configuration](../../.github/dependabot.yml) and [SECURITY.md](../../SECURITY.md). Actual private-reporting and required-check activation remain owner settings; this review does not change or infer their live state.

**Runtime schemas do not replace authorization or every semantic helper.** Arbitrary malformed nested JSON may still throw before a typed helper reaches a fail-closed label. The broad claim that all contracts fail closed is therefore not adopted. The draft-schema branch is not credited as merged input protection. The new companion carries forward isolated error-fallback guidance without promising a working stop service after a render crash.

**Duplicate handling should prevent another effect, not require a particular HTTP error.** The draft says a second decision must be rejected. The current pilot can explicitly return the same durable operation for a duplicate. Both patterns can avoid duplicate effects; returning an existing result is not silently accepting another operation.

**New policy ideas remain proposals.** Expiry linting for C3/C4, generic-label deny-lists, typed confirmation and tighter recovery classification require separate specification/API review. No new normative requirements or runtime behavior are introduced by this reconciliation.

## Consequences and maintenance

Edit canonical rule text/strength/owner/test mappings only in the existing manifest through its review process. Edit component/threat associations in relations.json and run the new check/build commands. A new canonical rule needs an explicit relation row; a removed component or threat makes stale references fail. A D requirement remains in the generated view and the adopter's assessment packet.

Semantic accuracy, evidence sufficiency, uncatalogued risks and user comprehension still need review. The metadata checks prove that references resolve and the view is synchronized, not that an association is causally sufficient or that a test passed.

## Supplied input fingerprints

The four original attachments were reviewed, not installed verbatim as active tooling or policy. These SHA-256 values identify the submitted inputs; they do not authenticate authorship or assert independent review.

| Supplied file | SHA-256 |
|---|---|
| `THREAT-MODEL.md` | `e111de81d6050d8769e7c7b8db908129b4ed601fc667805ee2b7b38a864ea01a` |
| `conformance.py` | `d4f8bac511bab566b39f9afa0e723ffa9f62c1e00082de6f40d52a097cc09790` |
| `requirements.json` | `4c762e82d13ff17c9c1aa9235d04fd63579f1679385d8b7ca0c0ebd41907886e` |
| `CONFORMANCE-MATRIX.md` | `2f2d2c8419f293e0131adf1d66a7f994d08e8b3c6e632c39ffeaf8e584002905` |
