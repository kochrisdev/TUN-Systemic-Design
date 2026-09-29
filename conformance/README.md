# TUN conformance: from requirements to evidence

**Connect a specification requirement to a real test, then record what the test actually established.**

[Traceability matrix](TRACEABILITY.md) · [Machine-readable rules](spec-v0.1.json) · [Specification](../docs/SPECIFICATION-v0.1.md) · [Integration checklist](../docs/INTEGRATION-CHECKLIST.md)

## What is assessable now

The reference UI profile catalogs the mandatory statements in Specification v0.1 and links selected aspects to existing Vitest tests. Each record names the responsible layer, exact source text, what its tests prove, and the remaining procedure and evidence. The [generated matrix](TRACEABILITY.md) shows the current totals for partially mapped requirements, manual reviews, explicit gaps and distinct tests. Those totals are calculated from the mapping and checked in CI.

For example:

```text
SPEC-8-003
Approval MUST be bound to the displayed proposal's identity, version,
and material parameters.
    ↓
tests/components.test.tsx::blocks same-version changes to the target
tests/review-components.test.tsx::blocks changed content under the same proposal version
    ↓
Fresh runner results + source hashes + remaining server-side binding review
```

The canonical machine identifier is `file::literal test title`, matching exactly one declaration in that file. The complete mapping also covers proposal/action separation, unsupported certainty, generated quotations, receipt verification, stop acknowledgement, unknown-outcome reconciliation, and compensation versus undo.

## Run the checks

Use Python 3.10+ from the repository root. Structural checking needs no Node installation:

```sh
python scripts/check_conformance.py
python -m unittest discover -s tests -p 'test_conformance.py'
```

The first command checks complete mandatory-statement inventory, source text and strength, unique rule IDs, test declarations, and generated matrix consistency. It fails on added/unmapped requirements, stale wording, deleted or renamed tests, ambiguous titles, unsupported mappings, or missing review procedures. It does not write files.

After [installing the locked project dependencies](../docs/GETTING-STARTED.md), collect fresh execution evidence:

```sh
python scripts/check_conformance.py --run
```

This runs the mapped files with the installed Vitest JSON reporter and writes **`artifacts/conformance-results.json`**. It does not install packages or call an external service. Missing, skipped, failed, ambiguous or unrecognized mapped results fail the run. Results are collected in a fresh temporary directory; an old report cannot make a failed run pass.

The report records the source commit when available, evaluated file hashes, runner version, CI run identifier when present, run times, test outcomes, and per-rule remaining assessments. Source changes during a run invalidate its evidence. Execution uses fixed commands rather than commands supplied in the mapping.

## Read the result correctly

| Field or label | Meaning |
|---|---|
| `coverage: partial` | Named tests cover the stated aspects; the remaining procedure still needs assessment. |
| `coverage: manual` | An explicit product/design review is required. |
| `coverage: gap` | A specific service integration or automated test is still needed. |
| `automated_checks: passed` | Every mapped test for that rule passed in this run. |
| `automated_checks: unassessed` | The rule has no automated mapping in this profile. |
| `product_conformance: unassessed` | The runner has not performed the product-wide assessment. |

For example, a test that rejects a changed target demonstrates a UI safeguard. Complete assessment of SPEC-8-003 additionally requires the server to bind the same immutable proposal and authority. Both observations belong under the same rule ID.

Execution reports are evidence produced by the named runner and source. The hashes identify evaluated inputs; they do not authenticate an externally supplied or edited report. Retain the CI run and original artifact when sharing results.

## Complete a scoped product assessment

Start with this record and attach one row for every applicable rule in the matrix:

| Assessment field | Required record |
|---|---|
| Product and scope | Product name, workflow, supported environment and responsible service boundaries |
| Revisions | Product commit/build, specification revision and traceability manifest digest |
| Reviewer and date | Named assessor and assessment date |
| Rule outcome | `pass`, `fail`, `not-assessed`, or `not-applicable` |
| Evidence | Test report/artifact references and the manual or integration evidence requested by the rule |
| Exceptions | Remaining work, owner and rationale; explicit justification for any non-applicability |

A reviewer can mark a rule passed only after assessing its full text and applicable residual procedure. A failed or unassessed applicable mandatory rule keeps a full conformance claim open. Not-applicable is a documented product-scope decision, never inferred from the absence of a test. [Specification section 31](../docs/SPECIFICATION-v0.1.md#31-tun-conformance) defines the claim.

## Maintain the mapping

Edit [spec-v0.1.json](spec-v0.1.json) when a requirement, test, or assessment procedure changes. Keep established rule IDs stable; a new sentence receives a new unused suffix in its source section rather than renumbering existing records. Review removed/replaced requirements explicitly and retain their history in Git.

```sh
python scripts/check_conformance.py --write-matrix
python scripts/check_conformance.py
```

`--write-matrix` regenerates only [TRACEABILITY.md](TRACEABILITY.md) after validating the source and mappings. It does not alter requirements, invent test evidence, or auto-resolve coverage gaps. Review the diff alongside the source change.

This initial inventory uses complete mandatory sentences in numbered sections 3 onward, preserving compound obligations and their source links. The RFC-language glossary and two exact terminology-only sentences in section 31 are excluded. Standalone SHOULD/MAY recommendations and the separate component catalog are the next traceability expansion. The source locator supports unique literal `it(...)`/`test(...)` titles; parameterized/generated names need a future collector adapter. Assertion scope is a reviewed mapping, not something inferred from a test name.

## CI integration

The documentation workflow checks traceability and its Python regressions on every push and PR. The React workflow runs the mapped tests and uploads the report with its existing artifacts; changes to `conformance/` or the specification trigger that workflow. Existing test suites, dependency pins and read-only CI permissions are preserved.

**The next conformance milestone is to close the recorded integration gaps through one bounded application pilot, then attach its evidence to these same stable rule IDs.**
