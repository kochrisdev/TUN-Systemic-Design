# Review workflow validation v0.1

**Validation date:** September 28, 2026.  
**Status:** Named CI checks passed; independent-consumer installation and PR review remain open.  
**Tested source:** `aa6a32dbcc5a6e9bc53c565aad9eb64460551c3f`.  
**Implementation baseline:** `5cbf9a5816358b9c4db3f64af90fbebd04406a2b`.

[Workflow API](REVIEW-WORKFLOW-v0.1.md) · [Historical four-component validation](REACT-VALIDATION-v0.1.md) · [PR 4](https://github.com/kochrisdev/TUN-Systemic-Design/pull/4)

## Verified runs

[React run 36371681833](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36371681833), job `108769197871`, and [documentation run 36371681809](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36371681809) passed for the tested source. This report is a subsequent documentation-only update, not a claim about every future commit or environment. Inspect the actual final PR checks before merging.

| Check | Observed result |
|---|---|
| Locked installation | npm ci passed; lockfile unchanged |
| Full TypeScript check | Passed |
| Node contract tests | **90 passed** |
| React component tests | **56 passed**: 21 original, 33 review-component, 2 landmark/state regressions |
| Pure demonstration-model tests | **23 passed** |
| Chromium browser tests | **19 passed**, zero unexpected, skipped, or flaky results |
| Library and production demo builds | Passed |
| Package inventory and workspace exports | Passed; **25 archive files, seven component exports** |
| Existing visual tokens | **212 typed tokens and 142 declared contrast pairs passed** |
| Full and runtime dependency audits | Zero known vulnerabilities reported at validation time |
| Documentation workflow | Local-link/fence check and checker regression tests passed |

The application suites total **188 passing tests**: 90 contracts + 56 React + 23 model + 19 browser. Vitest combines the React and model suites as 79 tests. Documentation, token, build, audit, and packaging checks are additional, not counted again in 188.

The reference runner used Node 22.23.2, npm 12.1.0, Ubuntu 24.04, and the committed dependency graph. These are tested conditions, not claims of latest releases or validation of every peer/runtime version. Non-failing tooling notices remain; no warning-free claim is made.

## Coverage

Contracts preserve original timestamp, approval, fingerprint, URL, and receipt behavior while adding context-state, plan dependency/cycle/evidence, review-reference, and exact-content checks. React tests cover source availability versus usage, restricted/missing content suppression, native disclosure, plan revisions, proposal expiry, text escaping, navigation-only review, final-gate bindings, and distinct proposal/approval landmarks.

Model tests exercise separate approach review and action authorization, context/plan invalidation, stale or expired decisions, duplicate local writes, unknown outcomes, reconciliation, and receipt preservation. They test an in-memory demonstration, not a trusted production backend.

Browser tests cover explicit approve/reject, keyboard focus and native disclosure activation, 320-pixel reflow, long unbroken content, reduced motion, missing/restricted/stale context, plan revisions, reconciliation without a second write, and retained receipts. Light/dark axe samples run at both review and verified-receipt stages. The additional color-state test checks that disabled-to-enabled button colors switch without animation and that enabled foreground/background contrast meets the declared text threshold in both themes.

The artifact contains 1280-pixel light/dark screenshots and a 320-pixel narrow-screen screenshot. Representative render inspection and automated samples do not cover every state, locale, viewport, or assistive technology.

## Validation findings and corrections

An earlier source, `09bbc2f4924f450bbd8bed21318fed7be73323a3`, passed 187 tests in [run 36370845642](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36370845642). Repeat runs then exposed issues that a single green run had not established as absent:

- [Run 36371224303](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36371224303) passed 17 of 18 browser cases but failed the keyboard sequence. The test attempted to focus Review action before its expiry-readiness check enabled it. The test now waits for enabled state, verifies focus, and then presses Enter, without arbitrary delays or weakened focus assertions.
- [Run 36371430854](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36371430854) passed the keyboard case but exposed temporary low contrast in both theme samples. Buttons changed foreground immediately while animating from a disabled background. The component stylesheet now switches paired colors atomically with `transition: none`; a new two-theme regression covers the fix. Accessibility assertions were not disabled or delayed to hide the issue.

Earlier fixes separated DOM disclosure activation from native Chromium keyboard behavior, corrected the theme selector locator, and gave ProposalCard a stage-specific accessible name distinct from final approval of the same action. A regression also ensures an approved proposal says execution is tracked separately rather than claiming that nothing executed. Before approval it says Proposal — not executed; this qualifies the abbreviated label description in the workflow guide.

The final named run passed all 19 browser cases with no skipped or flaky results. That is snapshot evidence, not a guarantee against future regressions. No test was disabled to obtain it.

## Retained evidence

Artifact **10949980437** from run 36371681833 contains the compiled demo, browser report/screenshots, package archive/inventory, lockfile, and audit JSON. The downloaded ZIP SHA-256 was checked:

```text
f1b7dae069dc628f56248f634a54a9df8f8041677697647da04a254e78e33df4
```

The seven-component package archive SHA-256 was also checked:

```text
c0b5bf1537ca9a231c347b5dd13bd8763e46ba747fcd924144265337d09f67b4
```

Both audit JSON files contained empty vulnerability maps. The browser report recorded 19 expected results and zero unexpected, skipped, or flaky results. The archive contains 25 files and the corrected component CSS. Artifact retention is limited. Private package version 0.1.0 is unchanged, so identify an archive by source SHA and digest, not version alone. This artifact supersedes the earlier seven-component archive for adoption of the color-transition fix.

## Open acceptance and adoption items

The proposed **fresh independent-consumer installation smoke test is not included or completed**. A bulk tool write containing the installer and CI changes was blocked by a safety check, so those changes were omitted. There is no new installer or workflow-permission change. Existing inventory/workspace-export checks are not an independent installation test. PR 4 remains draft pending that acceptance item and review.

Cross-browser, manual assistive-technology, localization, complete runtime-schema validation, consuming-framework hydration/RSC, production authorization, durable idempotency, revocation, external execution, and actual recovery remain outside this increment. A passing dependency audit is not a security guarantee; axe and token checks are not full accessibility certification. A supplementary local-browser attempt could not navigate because of an environment administrator restriction; no local repeated-browser pass is claimed.

The ledger is an in-memory simulation, not trusted or durable authorization infrastructure. No npm publication, hosted deployment, complete fourteen-component library, or full TUN certification is claimed. Earlier historical validation reports remain unchanged.

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

npm run check does not include the separate browser, documentation, token, audit, or independent-consumer checks. See [Getting Started](GETTING-STARTED.md#verification) for command scope and preview instructions.
