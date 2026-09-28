# Public showcase validation v0.1

**Recorded:** September 28, 2026.  
**Implementation checked:** `d39e2c982fbaf1aa6e0443b818f3cf1a70250ade`.  
**Baseline:** `5da43a18468eb5f02ac53a9db63930d487e159d4`.  
**Scope:** GitHub CI checks and inspection of its built artifacts/screenshots, not a live-production validation.

[Public Showcase guide](PUBLIC-SHOWCASE-v0.1.md) · [Documentation index](README.md) · [PR 7](https://github.com/kochrisdev/TUN-Systemic-Design/pull/7)

This report names an already-observed source and run. The containing documentation commit and the final PR head require their own reruns. Their results belong in PR 7 rather than a self-referential report/commit cycle. Subsequent documentation and example-copy edits do not retroactively become tested by an earlier run.

## Recorded runs

| Source | Workflow | Observed result |
|---|---|---|
| `10bab100243edb411b955d02771825eb9a07e152` | [React 36446492777](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36446492777) | Failed browser step: initial focus and missing sharing image; prior build/test/package gates passed |
| `10bab100243edb411b955d02771825eb9a07e152` | [Documentation 36446492639](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36446492639) | Passed for that snapshot |
| `d39e2c982fbaf1aa6e0443b818f3cf1a70250ade` | [React 36447985632](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36447985632) | Passed |
| `d39e2c982fbaf1aa6e0443b818f3cf1a70250ade` | [Documentation 36447985549](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36447985549) | Passed for that snapshot |

The successful React job was `109015127541`. GitHub checked synthetic merge `52eecc3e2656da5618c4e24ef060d452723cb149` against the unchanged baseline. The runner used Ubuntu 24.04, Node 22.23.2, npm 12.1.0, the committed dependency graph, and Playwright Chromium 153.0.8010.12. These are observed CI versions, not a claim about the Vercel runtime.

## Application tests

| Group | Passed |
|---|---:|
| Node contract/timestamp/review tests | 90 |
| Existing Vitest component/metadata/model tests | 249 |
| New showcase catalog/routing tests | 17 |
| New read-only specimen tests | 30 |
| New StrictMode/focus regression tests | 3 |
| Existing technical-lab Chromium tests | 31 |
| New public-showcase Chromium tests | 20 |
| **Total application tests** | **440** |

The actual runner totals were **90 Node + 299 Vitest + 51 Chromium**. The downloaded browser report showed 51 expected results, zero unexpected, zero flaky, and zero skipped. Existing technical-lab assertions were preserved and redirected to `/?lab=1`; no tests or accessibility assertions were disabled.

New checks cover the guided decision path, rejection without a receipt, context invalidation, no automatic retry after an unknown outcome, retained state across navigation, no inactive-view focus stealing, all 28 representative component specimens, search/filter empty states, mobile disclosure navigation, keyboard focus, hash history, source/uncertainty presentation, and static metadata/assets.

## Build, package, and tokens

Locked installation, TypeScript checking, library/demo builds, the 45-file package inventory, fourteen public exports, and isolated consumer acceptance passed. The unchanged consumer harness installs real local archives into a fresh directory/cache outside the workspace, reinstalls from its own lockfile, checks installed declarations and paths, renders fourteen specimens, and verifies seven negative type cases. Operations remain offline with lifecycle scripts disabled.

The token check passed **212 tokens and 142 declared contrast pairs**. The inspected full/runtime dependency audit reports both contained zero known vulnerabilities at validation time. These reports are not a guarantee of application security.

The component package archive is byte-identical to the validated fourteen-component baseline: SHA-256 `44a704ea29a6d398cc5edf77158a24bdfa90f38a4c87748714d320f21324820f`. This showcase does not change the library API or component implementation. The preserved repository lockfile SHA-256 is `d311ee4a51ccb75b6f36c2f119a1e5d08044ed0b6053a96c2a3a8d164e296ef1`.

## Visual and accessibility evidence

CI produced overview screenshots at 1440, 390, and 320 CSS pixels in light and dark themes. At each tested size the primary start action fit inside the initial 844-pixel-high viewport, and the page did not overflow horizontally. Guided approval and Source View explorer states were also captured at 320 pixels. Representative desktop/light/mobile/dark screenshots were inspected for hierarchy, wrapping, readable controls, and preserved material approval details.

Automated accessibility samples ran on both overview themes and the public guided/explorer/trust paths, in addition to the existing technical examples. These samples are not complete accessibility conformance, manual assistive-technology testing, cross-browser assurance, or universal screen-size coverage.

## Findings corrected

The first browser report contained 49 passes and two failures. A one-time focus flag was not safe under StrictMode effect replay, causing initial overview focus to move past the skip link. The handler now compares the previous and current view, leaving initial focus untouched and moving it only for real navigation. Three regression tests were added; the original browser keyboard assertion now passes.

The initial HTML referenced a social PNG before it had been included. The valid PNG and editable SVG are now in the public directory. The browser asset test checks PNG signature and 1200-by-630 dimensions. The local downloaded PNG was decoded successfully, not accepted by filename alone. Metadata alt text describes the actual geometric wordmark.

No source, authorization, expiry, reconciliation, or recovery requirement was weakened to obtain passing results. Canonical components and both local workflow models are preserved.

## Artifact identity

Successful-run artifact `10981970821`, named tun-react-check-artifacts, was downloaded and its ZIP digest verified: `fa5be05b644d06ded52fe960a72401c12e6af693cdee3c412ccd312b8a13f8bf`.

The artifact includes the compiled demo, package/consumer reports, audit reports, and browser screenshots/report. CI artifact retention is temporary. Use the source commit and locked graph to reproduce results. Package version remains private 0.1.0; hosting the demo does not publish it to npm.

## Limits and remaining checks

The editing container could not complete an additional local browser run: its default Playwright binary was absent, and the installed system browser refused local navigation under administrator policy. No policy was bypassed; interactive results here come from the successful CI browser suite. Local work inspected downloaded artifacts and screenshots only.

The public Vercel URL was not successfully opened by the available web fetch during implementation. Therefore this report does not establish the production deployment's exact commit, incognito access, response headers, loading performance, or a social network's cached preview. Those remain separate post-deployment checks. Static configuration and passing builds do not prove a live deployment succeeded.

Independent peer graphs, Firefox/WebKit, CSS-bundler/hydration integrations, localization, screen readers, complete runtime schemas, production authorization/cancellation/recovery, and full conformance remain outside this increment. This is assistant-performed implementation review with scoped automated evidence, not independent certification.
