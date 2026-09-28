# Review workflow validation v0.1

**Date:** September 28, 2026.  
**Status:** Validation in progress; this record does not predeclare successful checks.  
**Implementation baseline:** `5cbf9a5816358b9c4db3f64af90fbebd04406a2b`.

[Workflow API](REVIEW-WORKFLOW-v0.1.md) · [Historical four-component validation](REACT-VALIDATION-v0.1.md)

## Observed first run

[React run 36369728663](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36369728663) tested source `4f09588fe4fc79f464defd53027f954e4e9db326`.

Locked installation, dependency audits, 212-token/142-pair validation, full TypeScript checking, and the library build passed. All 90 Node contract tests passed. The original 21 React tests and 23 workflow-model tests passed. Of 33 new React tests, 32 passed and one disclosure-keyboard test failed in the DOM environment. Browser tests and later build/package steps were not reached in that run.

The follow-up test commit `1bd146eaeec5e81528a6c881e19ae0b070250d00` separates DOM disclosure activation from native keyboard behavior. The native Enter check remains in the real Chromium suite; no test is skipped and no custom keyboard override was added to the native control. Its actual subsequent CI result must be recorded after inspection.

## Scope

The suite includes original approval/receipt safeguards, review contract checks, context/plan/proposal component tests, pure demo-model tests, and a connected Chromium flow. Browser cases include both themes, keyboard focus and disclosure, 320px and long-text reflow, revised plans, missing/restricted/stale context, no implicit authorization, unknown-outcome reconciliation, and receipt preservation.

The package inventory checker now checks seven component exports and review-contract outputs. This does not test installation into an independent application.

## Open acceptance items

Full follow-up CI, final documentation checks, and inspection of current screenshots remain pending until evidenced. An isolated fresh-consumer install test was omitted after a tool safety check blocked the installer/CI write. It is not implemented or claimed as passing. The existing CI permissions, dependency versions, lockfile, license, and generated tokens are unchanged.

## Reproduce

With the repository's reference Node/npm toolchain and committed dependencies:

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

The lab is an in-memory local simulation; its ledger is not trusted or durable authorization infrastructure. Passing checks do not certify accessibility, production security, full TUN conformance, cross-browser/framework support, or external service behavior. The older four-component validation report is preserved unchanged.
