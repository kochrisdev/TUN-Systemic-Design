# Evidence and memory validation v0.1

**Date:** September 28, 2026.  
**Validated implementation:** `0b70837a014488ca165b29855a446f535202a76e`.  
**Baseline:** `1f4aacc99cf631124e0f7d768b04855c9db935b4`.  
**Scope:** Ten-component reference library and its simulated lab, not a production service or certification.

[Evidence and memory API](EVIDENCE-AND-MEMORY-v0.1.md) · [Implementation matrix](STATUS-AND-ROADMAP.md) · [PR 5](https://github.com/kochrisdev/TUN-Systemic-Design/pull/5)

## Observed runs

Both [React run 36403041712](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36403041712) and [documentation run 36403041702](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36403041702) passed for the named implementation head. GitHub tested the synthetic merge checkout `e0c4954b7019c6a21d9df17a6bd8a059e89aea62` against the unchanged baseline. The consumer report records that checkout SHA, not a different implementation.

This report is added after those checks. A later documentation-only head still needs its own CI run before merging; PR 5 records that final-head result without rewriting historical evidence.

## Application tests

| Group | Passed | Coverage |
|---|---:|---|
| Existing Node contracts | 90 | Proposal, timestamp, plan, receipt, and review safeguards |
| Evidence/memory metadata | 34 | M0–M3, invalid/missing metadata, source relationship/access, generated versus source support, scoped uncertainty |
| React components | 89 | 56 prior component cases plus 33 new memory/source/uncertainty cases |
| Pure demonstration model | 23 | Existing review, invalidation, unknown-outcome, and reconciliation behavior |
| Chromium browser | 25 | 19 prior cases plus 6 evidence/memory scenarios, keyboard interaction, both themes, accessible labels, and 320px layouts |
| **Total application tests** | **261** | Consumer and documentation checks are additional, not double-counted here |

Vitest runs the 34 metadata, 89 React, and 23 model cases together: **146 passed**. Node runs 90 separately. The downloaded final Playwright report records **25 expected, zero unexpected, zero flaky, and zero skipped**.

The browser suite includes automated accessibility samples for both themes, review/receipt stages, and expanded evidence examples. The narrow-screen evidence cases additionally check that selector labels have readable width/height and controls stay inside their labels. Passing no-horizontal-overflow checks alone did not establish readable labels, as the visual review below demonstrated.

## Builds and package acceptance

Locked installation, full TypeScript checking, library build, client-demo production build, 33-file archive inventory, ten public component exports, **212 typed tokens / 142 declared contrast pairings**, and documentation checks passed. No token or dependency updates were introduced.

The independent consumer test installs the actual built archive into a fresh directory and cache outside the repository, performs its own-lockfile reinstall, and verifies consumer-local paths rather than workspace symlinks. Consumer npm operations are offline with lifecycle scripts disabled. Its report confirms ten static renders, four negative declaration cases, contract helpers, escaped generated/source text, unsupported-confidence fallback, pending-verification behavior, and CSS/token resolution.

The tested environment used Node **22.23.2**, npm **12.1.0**, React/React DOM **19.3.0**, scheduler **0.28.0**, matching React type packages **19.3.0**, and csstype **3.2.3**, from the preserved repository graph. These are observed versions, not a claim about every compatible peer range.

Both full and runtime dependency audits reported **zero known vulnerabilities at validation time**. This is advisory-database evidence for the installed graph, not a security guarantee. The CI toolchain's existing nonfatal build/runner warnings were not addressed through dependency or workflow-permission changes in this increment.

## Artifact identity

Downloaded artifact **10961207058** from React run 36403041712 was checked before inspection.

| Artifact | SHA-256 |
|---|---|
| CI artifact ZIP | `e4ac0fd0330d2d703730bf46974158b0880e822e11f610dbd5a8dcab40e28e3f` |
| Installed TUN package archive | `796054ebc23ae05fadd610627c44185eede2357b77cfdbf483cbea4ff9479890` |
| Unchanged repository lockfile | `d311ee4a51ccb75b6f36c2f119a1e5d08044ed0b6053a96c2a3a8d164e296ef1` |

The package inventory also records its SHA-512 integrity. Package version remains private 0.1.0; use source commit and digest to distinguish archives. CI artifacts have temporary retention and are not registry releases.

## Findings and corrections

The initial [React run 36400458667](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36400458667), for source `58d4d1347cb3b3f735f52ab339e354113a99a278`, failed TypeScript checking in the context-to-evidence demo adapter. The readable source branch was made explicit with positive union discrimination, rather than bypassing the type system or exposing inaccessible fields.

The next [run 36400806057](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36400806057), for `18c02d214a012da534979cfc16ec53011c85bbca`, passed build/package/consumer checks and 20 of 25 browser tests. Five new browser cases used exact label-text selectors that did not match the nested select labels. They were changed to explicit combobox roles with accessible names; the assertions and scenarios were retained.

Source `4abb84a9127b8c7692abf27c70ddde28c9c97206` then passed [React run 36401660902](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36401660902). Visual inspection of its CI screenshots found that the example selectors compressed their labels into very narrow columns on mobile despite no horizontal overflow. The final implementation stacks labels over their controls, uses a responsive grid, separates example cards, and adds label-dimension and mobile-accessibility regression assertions. The corrected light and dark 320px screenshots were inspected. Earlier desktop light/dark review-and-evidence screenshots were also inspected; this was representative visual review, not exhaustive testing of every possible supplied record.

No tests or accessibility assertions were disabled to obtain the successful result. Existing core approval, receipt, context/plan logic, demo state machine, dependency graph, generated tokens, and workflow permissions were preserved.

## Reproduce

With the reference toolchain and registry access for the initial installation:

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

Full builds and interaction tests for this work ran in the repository's GitHub CI. The editing container could not resolve repository/registry hosts, and its local browser navigation was unavailable. No separate successful local full-suite run is claimed. Artifact hashes and representative CI screenshots were inspected locally.

## Remaining limits

Evidence records, memory classifications, source checks, and uncertainty are application-supplied metadata. The UI is not a source authenticator, memory store, confidence-calibration system, or authority service. Host filtering before transmission remains essential; display suppression alone is not access control. Bounded typed-metadata checks are not complete schemas for hostile JSON.

Static rendering does not prove hydration or CSS-bundler compatibility. Registry distribution, independent peer matrices, cross-browser coverage, localization, manual assistive-technology review, production authorization/execution, retention policy enforcement, and full security/accessibility assessments remain outside this increment. Four supervision/recovery components are still specified only. No npm publication, hosted deployment, independent certification, or complete TUN conformance is claimed.

Historical [consumer](CONSUMER-VALIDATION-v0.1.md), [workflow](REVIEW-VALIDATION-v0.1.md), and [first React](REACT-VALIDATION-v0.1.md) reports retain their earlier source snapshots and counts.
