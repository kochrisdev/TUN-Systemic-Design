# Isolated consumer validation v0.1

**Date:** September 28, 2026.  
**Status:** Passed for the source and environment recorded below.  
**Tested PR head:** `1f53c6b60c1e0a997b53213c54ab8184e0c690e0`.  
**CI checkout:** `8ff620dd566cc430c9b7117ee52866e0b9e1b160` (GitHub's synthetic merge with the PR base).

[Documentation index](README.md) · [Getting started](GETTING-STARTED.md) · [Earlier review-workflow evidence](REVIEW-VALIDATION-v0.1.md)

## Evidence

[React checks run 36397125818](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36397125818), job `108846064394`, completed successfully. The new `artifacts/consumer-check.json` records the checks below. The existing typecheck, contract/React/model tests, builds, package inventory, token checks, dependency audits, and Chromium suite also passed in that run. [Documentation run 36397125774](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36397125774) is the associated documentation run; inspect its recorded conclusion separately.

| Consumer check | Observed result |
|---|---|
| Fresh install outside the repository | Passed using local package archives in a new temporary directory and cache |
| Consumer lockfile reinstall | `npm ci` passed against the new consumer's own lockfile |
| Peer and dependency tree | `npm ls --all` passed with strict peer checking during installation |
| Workspace isolation | Real installed packages, no workspace symlinks; public entry points resolved inside consumer node_modules |
| TypeScript declarations | Consumer compiled without repository path aliases and without skipLibCheck |
| Negative type cases | Invalid execution decision and content-bearing restricted-source record rejected by declarations |
| Component exports | All seven imported from the installed archive |
| Static rendering | All seven rendered; no action callback was invoked |
| Contract behavior | Plan checks, proposal checks, and context/plan revision matching passed |
| Defensive presentation samples | Preview text escaped; unverified success remained pending verification |
| Styling and license | Public CSS/token paths resolved, token import existed, CC0 license was present |
| Archive identity | Installed archive matched the integrity recorded by the existing package checker |
| Repository lockfile | Unchanged |

These are additional package-acceptance checks, not seven new browser tests or an increase to the earlier 188-test application-suite count.

## Test design and safety boundary

The earlier attempt at a consumer installer and CI change was omitted after a tool safety check. This increment uses a narrower **offline-only test**, implemented in [check-consumer.mjs](../scripts/check-consumer.mjs), without editing workflow permissions or adding dependencies.

The test packs the already-installed, lockfile-matched React runtime and type packages, then installs those local archives and the built TUN archive in a temporary application outside the repository. Every npm packing/install step uses `--offline` and `--ignore-scripts`; there is no registry fallback, publication, remote installer, lifecycle execution, or credential upload. A fresh cache prevents dependency resolution from silently borrowing the developer's global cache. Cleanup is limited to the temporary directory created by that invocation.

The consumer uses the existing locked TypeScript compiler, but imported TUN/React declarations resolve from its own installed packages. Fixtures live in [tests/consumer](../tests/consumer). Static rendering uses React's server renderer; browser interactions remain covered by the separate Chromium suite.

A failed attempt writes a failed report rather than leaving an earlier green consumer report in place. The existing read-only CI runs this check through `npm run check` and retains its JSON in the ordinary artifacts folder.

## Tested graph

| Package/tool | Version |
|---|---|
| Node / npm | 22.23.2 / 12.1.0 |
| TUN React package | 0.1.0, private and unpublished |
| React / React DOM | 19.3.0 / 19.3.0 |
| Scheduler | 0.28.0 |
| React / React DOM type declarations | 19.3.0 / 19.3.0 |
| csstype | 3.2.3 |
| TypeScript compiler | 5.8.3 from the repository's locked toolchain |

The environment was GitHub's Ubuntu 24.04 runner. These are observed versions, not a recommendation to upgrade dependencies automatically or a claim that every permitted peer version works.

## Retained artifact identity

Artifact `10958289305` was downloaded, and its SHA-256 was checked:

```text
d43d6f249b6728697cc6aff208c5bb9079d64f8db20e8daf96351cf6bdd90965
```

Installed TUN archive SHA-256:

```text
c0b5bf1537ca9a231c347b5dd13bd8763e46ba747fcd924144265337d09f67b4
```

Unchanged repository lockfile SHA-256:

```text
d311ee4a51ccb75b6f36c2f119a1e5d08044ed0b6053a96c2a3a8d164e296ef1
```

Artifact retention is limited. Package README edits can change a later archive's digest even when runtime code is unchanged. Identify builds by source and digest, not private version 0.1.0 alone. This document records an observed run; subsequent documentation commits and the final PR head must pass their own checks before merge. Final-head evidence belongs in the PR discussion without rewriting this historical snapshot.

## Reproduce

After selecting the reference Node/npm toolchain:

```sh
npm ci
npm run check
```

To run only package acceptance after installing the committed graph:

```sh
npm run build:library
npm run test:package
npm run test:consumer
```

The first repository `npm ci` may require registry access. The consumer test itself is offline. Read the [full verification guide](GETTING-STARTED.md#verification) for separate documentation, token, browser, and audit commands.

## Acceptance conclusion and limits

This closes the **fresh isolated packaged-install smoke-test** gap recorded in the earlier review-workflow report. It does not prove npm-registry distribution, independently resolved peer graphs, CSS bundler integration, hydration, server-component boundaries, cross-browser behavior, localization, or all consumer frameworks. Those remain adoption/release work. No deployment, npm publication, production authorization backend, security certification, or complete accessibility audit is implied.

Implementation review checked the source-to-proposal flow, version invalidation, navigation-versus-approval separation, retained receipts, unknown-outcome reconciliation, package exports, and test registration. This is an implementation review, not an independent third-party security audit.

External references: [npm pack](https://docs.npmjs.com/cli/commands/npm-pack/), [npm install](https://docs.npmjs.com/cli/commands/npm-install/), and [React renderToStaticMarkup](https://react.dev/reference/react-dom/server/renderToStaticMarkup).
