# React compatibility

**Use TUN in a React 18.3 or React 19 application without migrating the application to a different major.**

[Getting started](GETTING-STARTED.md) · [React API](REACT-COMPONENTS-v0.1.md) · [Peer manifest](../packages/react/package.json) · [CI workflow](../.github/workflows/react.yml)

## Supported peers and tested profiles

The library declares **`react >=18.3.0 <20`** and **`react-dom >=18.3.0 <20`**. Keep React and React DOM on matching versions and install type packages for that major. The repository's development and Vercel demo graph stays on its committed React 19 selection; widening the library peers does not downgrade the showcase.

| CI profile | React / React DOM | Type declarations |
|---|---|---|
| `locked` | The exact committed root lockfile pair | The exact committed root type pair |
| `react-18.3.0` | `18.3.0` / `18.3.0` — the advertised lower bound | `@types/react 18.3.12`, `@types/react-dom 18.3.1` |
| `react-18.3.1` | `18.3.1` / `18.3.1` | `@types/react 18.3.12`, `@types/react-dom 18.3.1` |

The [profile runner](../scripts/react-compat.mjs) verifies the installed runtime/type versions, rejects nested React copies, and checks that the library, demo and test harness resolve the same packages. The exact resolved versions and lockfile hashes are written to `artifacts/react-compatibility.json`. The peer range expresses intended compatibility; the table identifies the configurations continuously exercised, not every possible patch or framework combination.

## What each profile checks

Every matrix leg runs the existing typecheck, Node contracts, React/component/model tests, library and demo builds, package inventory, isolated consumer installation/reinstallation, mapped conformance checks, design tokens, full/runtime dependency audits and Chromium interaction/accessibility samples.

Before selecting an alternate peer profile, each job builds and preserves the archive against the committed default React 19 graph. After selection it tests **both that unchanged archive and the profile-local build** in separate fresh consumers. This detects declarations that only work when the library is rebuilt for the consuming React major. `artifacts/consumer-canonical.json` identifies the original build archive by digest.

The [isolated consumer](../scripts/check-consumer.mjs) includes the selected React dependency closure. For React 18 this includes `loose-envify`, `js-tokens` and `@types/prop-types`; installation is still offline from local archives, with lifecycle scripts disabled and no workspace links. Consumer declarations are checked with `skipLibCheck: false`, followed by fourteen static component renders and seven negative type cases.

[Hydration and StrictMode samples](../tests/react-hydration.test.tsx) additionally check that all fourteen exported specimens hydrate with stable, unique IDs and valid label references, that a repeated decision remains single-shot, and that a changed target or unknown result cannot reopen approval. These are jsdom hydration samples; the Chromium suite separately exercises the built client application.

React 18.3.0's Testing Library fallback emits a one-time `ReactDOMTestUtils.act` deprecation warning. The hydration test initializes that harness before observing component hydration. The warning remains visible in logs; hydration errors and warnings are not suppressed. React's [upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) explains the 18.3 migration release.

## Reproduce a profile

Ordinary development keeps using `npm ci` and `npm run check`. To reproduce an alternate profile, use a **separate disposable clone or worktree** with the [pinned Node/npm toolchain](GETTING-STARTED.md#toolchain). Preparation edits that checkout's root/demo manifests and effective lockfile.

```sh
npm ci --strict-peer-deps --no-fund --no-audit
npm run build:library
npm run test:package
mkdir -p artifacts/canonical
cp artifacts/tun-systemic-react-0.1.0.tgz artifacts/canonical/
cp artifacts/package-check.json artifacts/canonical/
npm run compat:prepare -- react-18.3.0
npm ci --strict-peer-deps --no-fund --no-audit
npm run compat:verify -- react-18.3.0
npm run check
npm run test:consumer -- --canonical
python scripts/audit_dependencies.py
python scripts/tokens.py check
python scripts/check_conformance.py --run
npx playwright install chromium
npm run test:browser
```

Use `react-18.3.1` for the patched React 18 profile, or `locked` in a fresh checkout for the committed development graph. Do not prepare profiles successively in the same modified checkout. Do not commit profile-generated manifest or lockfile changes back as a development downgrade.

React 18 preparation resolves only the named React/runtime/type family and its small dependency closure. The runner rejects unrelated package version, integrity, source, dependency or engine changes. It retains the effective lockfile before `npm ci`, then checks that installation did not change it. Archive both baseline and effective locks when preserving a test run; transitive React-family resolutions are recorded rather than represented as a second permanently maintained lockfile.

## Required checks and artifacts

The required check names remain **`documentation`** and **`verify`**. The React matrix uses separate `React compatibility (...)` jobs; the always-running `verify` job succeeds only when the matrix result is `success`. Failure, cancellation or skipping cannot produce a green aggregate. No live branch-rule change is required when the existing two-check policy is already active.

Artifacts are named `tun-react-check-artifacts-locked`, `tun-react-check-artifacts-react-18.3.0` and `tun-react-check-artifacts-react-18.3.1`. Each contains the default-build archive, both consumer reports, and that profile's peer report, effective/baseline locks, audit and conformance evidence, consumer results, browser outputs and compiled demo. Do not treat an artifact uploaded after a failure as passing evidence; inspect the job and report statuses.

[PR #16](https://github.com/kochrisdev/TUN-Systemic-Design/pull/16) records the final tested revision and outcomes. Historical validation reports retain their original single-graph scope.

## Maintenance

Keep the profile checks when changing hooks, refs, JSX declarations, dependencies or packaging. A matching installed React major alone is insufficient if the example or test library still resolves another copy. Review new runtime APIs against the lowest supported profile; do not remove that leg just to make an upgrade pass.

The [scope page](SCOPE.md#what-validation-establishes) records broader adoption boundaries. Runtime-schema PR #12 is separate work and must preserve the peer range, matrix gate, peer-closure consumer packaging and compatibility tests when integrating its contracts workspace.
