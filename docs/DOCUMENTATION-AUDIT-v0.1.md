# Documentation audit v0.1

**Date:** September 27, 2026.  
**Reviewed baseline:** `0226ec535e08eab09f840c4119ff9b71a57ad952`.  
**Scope:** All ten Markdown documents in that baseline, cross-checked against source contracts, exports, package scripts, build configuration, and retained validation evidence.

[Documentation index](README.md) · [Changelog](../CHANGELOG.md)

## Findings and corrections

| Finding | Change |
|---|---|
| No single entry point or audience-specific reading paths | Added docs index and rebuilt the root README around actual availability |
| Four implemented components could be confused with the fourteen-pattern catalog | Added a complete implementation matrix and status vocabulary |
| Visual guide described React support as future work | Linked the existing React package and retained explicit limits for other adapters |
| Catalog showed old illustrative props and token names | Replaced them with exported types, `onDecision`, and exact token paths |
| C4 approval and standing-delegation wording could conflict | Required explicit approval of the particular C4 proposal; standing delegation is not enough |
| Broad conformance language could look like certification | Scoped self-assessment now requires identified revision, evidence, reviewer, and exceptions; no certification program is claimed |
| M0/no-memory could imply no retained logs or backups | Separated reusable AI context from storage, retention, deletion, and training policies |
| Confidence and completion could imply certainty | Separated claim evidence, approval, execution, verification, and recovery |
| Accessibility MUST/SHOULD wording was uneven | Made named, keyboard-operable, visibly focusable controls explicit in both draft specifications |
| Runtime safeguards and host obligations were not centrally mapped | Added architecture and integration checklists |
| React sample logged raw user input | Replaced with a local-state-only preview example |
| Package README relative links fail outside the repository | Replaced repository-document links with absolute GitHub links |
| Commands and test scope were spread across pages | Added a canonical setup/verification/troubleshooting guide and explicit exclusions from `npm run check` |
| No documentation regression checks | Added an offline local-link/fragment/fence checker, fixture tests, and read-only CI |

## Baseline document disposition

| Existing file | Disposition |
|---|---|
| Root README | Reorganized and corrected |
| Concept Note | Reviewed; retained as informative founding text |
| Manifesto v0.1 | Reviewed; retained as informative philosophy, not an empirical history or certification claim |
| Specification v0.1 | Revised draft rules and clarified scope; retained numbered primary sections |
| Components v0.1 | Reorganized all fourteen contracts; distinguished implemented APIs; retained numbered primary sections |
| Design Tokens and Visual System v0.1 | Updated implementation status and usage; values remain tied to token source |
| React Components v0.1 | Added precise prop/behavior tables and safer examples |
| React Validation v0.1 | Reviewed; preserved as a historical record tied to its tested commit |
| Token Validation v0.1 | Reviewed; preserved as generated output |
| Package README | Updated for archive consumers and actual implementation limits |

The founding documents' universal design-language ambition, IX terminology, interface progression, and prospective certification are contextualized in the index rather than rewritten as delivered facts. Their preserved wording is not a claim that AI capabilities or design history are uniform across products.

## Change classification

This is a documentation and documentation-tooling change, not an application-code release. The draft specification has substantive clarifications and strengthened explicit requirements, especially sections 7.1, 8, 12, 13, 15, 17–18, 24–26, and 31. Adopters should compare revisions; do not assume every statement is merely cosmetic editing. No automatic conformance migration is implied.

Application source, package manifests, lockfile, existing React CI, tokens, generated CSS, license, and both historical validation reports are intentionally unchanged. Package README bytes change, so newly packed archives have different digests from historical archives even though component code is unchanged.

## Validation method

The offline checker covers the Markdown subset used here: inline and reference-style local links, quoted HTML href/src links, ordinary ATX heading/explicit HTML-ID fragments in Markdown targets, and fenced-code balance. It skips remote/custom-scheme URLs and does not execute examples. It is not a full CommonMark parser, external-link monitor, general HTML checker, runtime API validator, or factual-accuracy checker. Complex nested/escaped link syntax and non-Markdown fragments need manual review.

## Observed validation results

**Tested change:** `5ddf2a4a39ba8f30266cf6ecfe0becf01168f626`. The following GitHub pull-request workflows completed successfully on September 27, 2026:

| Check | Observed result | Evidence |
|---|---|---|
| Repository Markdown local links, fragments and fences | Passed | [Documentation run 36308092245](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36308092245), job 108588562238 |
| Documentation checker regressions | All 18 tests passed locally; CI test step passed | Same documentation run |
| Locked install and dependency audit | Passed | [React run 36308092255](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36308092255), job 108588562461 |
| Token validation | Passed | Same React run |
| Typecheck, contract/React tests, library/demo build and package checks | Passed | Same React run |
| Chromium interaction and accessibility samples | Passed | Same React run |

The repository comparison contains 17 changed files: six revised Markdown documents, eight new Markdown documents, and three documentation-tooling files. The full documentation set is now 18 Markdown files. Only documentation and its checker/workflow changed; the runtime and existing test sources were preserved.

This evidence entry is added after those runs and changes only this audit document. The documentation workflow reruns for the evidence commit; inspect the PR checks for that final result. The historical 88-test report remains unchanged rather than being relabeled as a new run. Passing checks are snapshot-specific, not guarantees for later commits or dependency graphs.

## Reproduce

```sh
python scripts/check_docs.py
python -m unittest discover -s tests -p 'test_docs.py'
python scripts/tokens.py check
```

For full application validation, follow [Getting Started](GETTING-STARTED.md#verification). Use the exact source SHA in a run for reproduction.

## Remaining limits

This audit does not implement the remaining ten components, a Figma/Tailwind adapter, a backend authority service, or a hosted deployment. It does not certify accessibility, security, legal compliance, DTCG interoperability, or complete TUN conformance. A fresh independent consumer installation, cross-browser/localization coverage, and assistive-technology review remain adoption work.

External implementation references were selectively checked against primary documentation; the offline checker deliberately does not verify every external URL. The repository can evolve after this snapshot. Keep the status matrix, public exports, examples, and dated evidence synchronized in future changes.
