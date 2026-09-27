# TUN React validation v0.1

**Status:** CI-validated reference implementation of the first four components.  
**Validation date:** September 27, 2026.  
**Tested source:** `56585b3b28f675e06c40d4dbd1fb36c198a91887`.  
**Evidence:** [TUN React checks, run 36306734006](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36306734006), job `108584743481`.

This record supersedes the initial partial-local-validation report. It records an observed successful run, not an assurance that future commits or dependency updates will pass. The report itself is a documentation-only addition after the tested source commit.

## Verified results

| Check | Observed result |
|---|---|
| Committed dependency installation | `npm ci` passed; the lockfile remained unchanged |
| Full TypeScript check | Passed |
| Node contract tests | **59 passed, 0 failed** |
| React DOM tests | **21 passed, 0 failed** |
| Chromium browser tests | **8 passed, 0 failed, 0 skipped, 0 flaky** |
| Library and production demo builds | Passed |
| Package inventory and built exports | Passed; 17 archive files and all four component exports checked |
| Existing design tokens | 212 typed tokens and 142 declared contrast pairs passed |
| Full dependency audit | Zero known vulnerabilities reported by npm at the validation date |
| Runtime-only dependency audit | Zero known vulnerabilities reported by npm at the validation date |

The three test suites total **88 passing tests**. Token, build, audit, and package checks are additional checks, not included in that total.

The reference toolchain was **Node 22.23.2 and npm 12.1.0 on Ubuntu 24.04**. The committed lockfile resolves Vitest 4.1.11, React/React DOM 19.3.0, Vite 7.3.6, Playwright 1.63.0, and TypeScript 5.8.3. These are recorded tested versions, not a claim that they are the latest releases.

## What the tests cover

Contract tests exercise proposal completeness, consequence/recovery classification, exact expiry, material-field fingerprints, verification downgrade, record-link handling, timestamps, and label coverage. The added 22 regressions cover impossible calendar dates, leap years, unsupported timestamp forms, unavailable clocks, and honest receipt-date presentation. February 30 must not silently become a March expiry.

React tests cover labels, controlled input, in-flight submission, keyboard/IME handling, unique IDs, safe error text, declared agent authority, approve/reject callbacks, stale proposal versions, expired proposals, unknown outcomes, and receipts.

Browser tests cover the simulated approve/reject flow, unknown outcomes, keyboard focus, 320-pixel reflow, reduced motion, and automated axe samples in light and dark themes. The saved light, dark, and 320-pixel screenshots were also inspected. They show representative states, not every possible component state or locale.

## Dependency and packaging changes

The earlier installation reported two moderate dependency advisories. The test framework was moved to the patched Vitest 4.1 release line, the resolved graph was audited, and its lockfile was committed. CI now requires `npm ci` rather than silently generating a fresh graph.

The runner's npm 10 resolver failed during dependency resolution. Pinning npm 12.1.0 resolved that failure without `--force` or `--legacy-peer-deps`. The package checker was then adapted to npm 12's package-name-keyed JSON output while retaining its inventory, export, stylesheet, and license checks.

The package check creates `tun-systemic-react-0.1.0.tgz`, verifies its declared file inventory, and imports the workspace-built component and contract exports. It also verifies the copied token stylesheet and license. **It is not a fresh external-consumer installation test.** The package remains repository-local and is not published to npm.

The temporary dependency-snapshot workflow created only a candidate Git blob; it did not modify refs. It is absent from this follow-up and was removed from the earlier feature branch. The normal validation workflow uses read-only repository-content permissions.

## Retained evidence

The successful run uploaded artifact `10927960824`, containing the package archive and inventory, dependency audit JSON, lockfile, compiled demo, browser report, and screenshots. GitHub artifact retention is limited; availability should not be assumed indefinitely.

Artifact ZIP SHA-256:

```text
09d0a790015ac82d286ada26614de485c1e200b961dede020e98c967fc6ab3e4
```

Committed lockfile SHA-256:

```text
d311ee4a51ccb75b6f36c2f119a1e5d08044ed0b6053a96c2a3a8d164e296ef1
```

Both digests were checked against the downloaded evidence. The complete and runtime audit reports contained empty vulnerability maps. The browser report recorded eight expected results with no unexpected, skipped, or flaky results.

## Reproduce

Use the Node version in `.nvmrc` and npm 12.1.0. From the repository root:

```sh
npm ci
python3 scripts/tokens.py check
npm run check
npx playwright install chromium
npm run test:browser
```

Linux CI uses `npx playwright install --with-deps chromium` when browser system packages are needed. `npm run check` includes package checks; `npm run dev` starts the local component lab.

## Boundaries and remaining work

A passing npm audit means no known advisories were reported for this graph at that time; it does not prove the application is secure. A passing axe sample and token contrast check are not WCAG certification or a complete accessibility audit. CI includes non-failing tooling/deprecation notices; no warning-free claim is made.

Only Chromium and the recorded Node toolchain were exercised in this run. Cross-browser, assistive-technology, localization, deployment, and fresh external-consumer testing remain application/release work. Runtime props are typed contracts, not a complete schema validator for untrusted JSON.

This increment does not implement a production authorization backend, durable idempotency, revocation, external execution, or recovery services. Applications must validate data before rendering and enforce those responsibilities outside the UI. No Figma library, registry publication, hosted deployment, full TUN conformance certification, or completed fourteen-component library is claimed.
