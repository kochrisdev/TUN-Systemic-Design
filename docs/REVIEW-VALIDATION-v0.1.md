# Review workflow validation v0.1

**Validation date:** September 28, 2026.  
**Status:** Named CI checks passed; independent-consumer installation remains an open acceptance item.  
**Tested source:** `09bbc2f4924f450bbd8bed21318fed7be73323a3`.  
**Implementation baseline:** `5cbf9a5816358b9c4db3f64af90fbebd04406a2b`.

[Workflow API](REVIEW-WORKFLOW-v0.1.md) · [Historical four-component validation](REACT-VALIDATION-v0.1.md) · [PR 4](https://github.com/kochrisdev/TUN-Systemic-Design/pull/4)

## Verified runs

[React run 36370845642](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36370845642), job `108766677210`, passed for the tested source. The pull-request runner checked synthetic merge `00c797f772446c5dd2a641fdce4d4615da80ba2d` against the baseline above. [Documentation run 36370845644](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36370845644) also passed.

This report records observed results, not an assurance about another commit, dependency graph, framework, or deployment. The report update follows the tested source and changes documentation only. Inspect the actual final PR checks before merging; a successful check does not complete outstanding acceptance work.

## Results

| Check | Observed result |
|---|---|
| Locked installation | npm ci passed; committed lockfile unchanged |
| Full TypeScript check | Passed |
| Node contract tests | **90 passed**, zero failed or skipped |
| React component tests | **56 passed**: 21 original, 33 review-component, 2 landmark/state regressions |
| Pure demonstration-model tests | **23 passed** |
| Chromium browser tests | **18 passed**, zero unexpected, skipped, or flaky results |
| Library and production demo builds | Passed |
| Package inventory and workspace exports | Passed; **25 archive files and seven component exports** |
| Existing visual tokens | **212 typed tokens and 142 declared contrast pairs passed** |
| Full dependency audit | Zero known vulnerabilities reported at validation time |
| Runtime dependency audit | Zero known vulnerabilities reported at validation time |
| Documentation workflow | Local-link/fence check and checker regression tests passed |

The application suites total **187 passing tests**: 90 contracts + 56 React + 23 model + 18 browser. The Vitest log reports 79 tests because it combines the 56 React tests and 23 model tests. Documentation, token, build, audit, and packaging checks are additional, not counted again in 187.

Reference environment: Node 22.23.2, npm 12.1.0, Ubuntu 24.04 runner, TypeScript 5.8.3, Vitest 4.1.11, Vite 7.3.6, and the committed dependency graph. Chromium was Chrome for Testing 153.0.8010.12, Playwright build 1243. These are observed tested versions, not claims about the latest releases or all supported peer versions. Non-failing tooling and module-directive notices remain; no warning-free claim is made.

## What was exercised

Contract tests preserve original timestamp, approval, fingerprint, URL, and receipt behavior while adding context-state, dependency/cycle, plan-evidence, review-reference, and exact-content checks. React tests cover source usage versus availability, restricted/missing content suppression, disclosure, state labels, plan revisions, proposal expiry, plain-text previews, version-bound review navigation, and final-gate bindings.

Model tests exercise the local context-to-receipt flow, separate approach review and action authorization, context/plan invalidation, expired/stale decisions, duplicate local writes, unknown outcomes, reconciliation, and retention of historical receipts. These test the demonstration, not a production backend.

All 18 browser cases passed, including explicit approve/reject paths, keyboard focus and native disclosure activation, 320-pixel reflow, long unbroken content, reduced motion, missing/restricted/stale context, revised plans, reconciliation without another write, and receipt preservation. Light and dark axe samples ran at both the review and verified-receipt stages.

The generated light/dark desktop screenshots and 320-pixel screenshot were inspected. They are representative renders, not every possible state, viewport, locale, or assistive-technology experience.

## Corrections made during validation

The first run passed the 90 contract tests but exposed a DOM-environment native-disclosure keyboard assertion. That assertion was split into DOM disclosure activation and a retained real-Chromium Enter test; no keyboard support was removed or fabricated.

A subsequent run passed 167 non-browser tests and 16 browser tests, but the two theme tests stopped at a selector lookup. Using the named combobox locator allowed their accessibility assertions to run. The scan then identified identical region names for proposal inspection and final approval of the same action. ProposalCard now includes its stage label in the accessible region name; a regression verifies that distinction. A Testing Library query option was corrected without removing assertions.

The final state-copy regression also ensures that an approved proposal says **Proposal — execution tracked separately**, rather than asserting that nothing executed. Before approval, the card uses **Proposal — not executed**. The action receipt remains the separate execution/verification record. This qualifies the abbreviated proposal-label description in the workflow guide.

No tests are disabled or skipped to obtain the passing result. Existing workflow permissions and dependencies remain unchanged.

## Retained evidence

Artifact **10949063000** from run 36370845642 includes the compiled demo, browser report/screenshots, package archive/inventory, lockfile, and audit JSON. The downloaded ZIP digest was verified:

```text
08239e4bd62ebd37e09c56071e0dc176ed7beb1239ed2e97a6ee2bb231b89b6b
```

The seven-component package archive SHA-256 was also checked:

```text
42f8c9dd1758ae92c45f416e48f9cd85891526a211767c46f0bfbd230ab6c606
```

The audit files contained empty vulnerability maps. The browser report recorded 18 expected results and no unexpected, skipped, or flaky results. Artifact retention is limited; do not assume indefinite availability. The private package retains version 0.1.0, so distinguish this archive from the earlier four-component archive using source SHA and digest, not version alone.

## Open acceptance and adoption items

The proposed **fresh independent-consumer installation smoke test is not included or completed**. A bulk tool write containing the installer and CI changes was blocked by a safety check, so those changes were omitted rather than bypassed. There is no new installer script or workflow-permission change. Existing package inventory and workspace-export checks are not an independent installation test. PR 4 remains draft pending that acceptance item and review.

Cross-browser, manual assistive-technology, localization, full runtime-schema, consuming-framework hydration/RSC, production authorization, durable idempotency, revocation, actual external execution, and real recovery validation remain outside this increment. A passing dependency audit is not a security guarantee; axe samples and token contrast checks are not full accessibility certification.

The ledger is an in-memory local simulation, not trusted or durable authorization infrastructure. No npm publication, hosted deployment, complete fourteen-component implementation, or full TUN certification is claimed. The older four-component validation record is preserved unchanged.

## Reproduce

Use the repository's reference Node/npm toolchain and committed dependencies:

```sh
npm ci
python scripts/check_docs.py
python -m unittest discover -s tests -p 'test_docs.py'
python scripts/tokens.py check
npm run check
npx playwright install chromium
npm run test:browser
npm audit
npm audit --omit=dev
```

npm run check does not include the separate browser, documentation, token, audit, or independent-consumer checks. See [Getting Started](GETTING-STARTED.md#verification) for command scope and local preview instructions.
