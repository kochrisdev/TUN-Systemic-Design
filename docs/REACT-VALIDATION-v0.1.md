# TUN React validation v0.1

**Status:** Partial local validation; dependency-backed checks require a connected runner.

## Executed in the authoring environment

| Check | Result |
|---|---|
| `contracts.ts` strict TypeScript compilation | Passed with TypeScript 5.8.3 targeting ES2022 |
| Built-in Node contract tests | **37 passed, 0 failed** on Node 22.16.0 |
| TypeScript/TSX transpilation diagnostics | No syntax errors in the authored TS/TSX source and test/config files |
| JSON configuration parsing | Passed |
| Static CSS variable references | All literal component/demo references exist in the existing TUN stylesheet |
| Existing token stylesheet | Local copy matched Git blob `92929591c9eba5e3e1c50f71a899fcde0dec6938`; unchanged |

Contract tests exercise proposal completeness, consequence/recovery classes, expiry, version/material-field fingerprints, verification downgrade, safe action-record links, timestamps, and label coverage.

## Authored but not executed locally

**21 React DOM tests** cover form labels, controlled input, in-flight submission, keyboard/IME handling, unique IDs, safe error text, agent authority, approve/reject callbacks, stale versions, expired proposals, fail-closed outcomes, and receipts.

**8 Chromium tests** cover the simulated approve/reject flow, unknown outcome, keyboard focus, 320px layout, reduced motion, and an axe accessibility sample in both themes.

Full dependency-backed typechecking, Vite production build, React DOM tests, browser tests, and packaging could not be run locally because the environment could not resolve the npm registry. Syntax transpilation is **not** a replacement for these tests. A pre-existing visual-system HTML screenshot is **not** validation of the new React implementation.

The `TUN React checks` workflow is supplied to run the full suite on GitHub. Inspect its actual run before merging. The workflow uploads its resolved lockfile and any browser reports; this document does not imply that a workflow ran or passed.

## Boundaries

There is no accessibility certification, full WCAG audit, dependency-security audit, tested production authorization backend, Figma library, registry publication, or hosted deployment in this increment. Runtime props are typed contracts, not a complete schema validator for untrusted JSON. The host must validate external data before rendering.

Before releasing, commit a reviewed lockfile, obtain a successful full test run, perform keyboard and assistive-technology review, test supported browsers and localizations, and verify authorization, idempotency, expiry, revocation, partial effects, and recovery in the actual application.
