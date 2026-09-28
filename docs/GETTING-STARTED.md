# Getting started

[Documentation index](README.md) · [Core React API](REACT-COMPONENTS-v0.1.md) · [Review workflow](REVIEW-WORKFLOW-v0.1.md) · [Consumer validation](CONSUMER-VALIDATION-v0.1.md)

## Choose a path

The HTML visual specimen needs Python for its optional server and token validation. The React lab additionally needs Node, npm, and initial registry access. Neither connects to an AI model or external execution service.

## Obtain the repository

```sh
git clone https://github.com/kochrisdev/TUN-Systemic-Design.git
cd TUN-Systemic-Design
```

For an existing clean checkout:

```sh
git switch main
git pull --ff-only
```

Do not discard local work to follow this guide. PR branches may contain unmerged work; check PR status before assuming main includes it. To reproduce a historical result, use its recorded commit rather than assuming a moving branch is unchanged.

## Toolchain

| Tool | Reference setup | Source |
|---|---|---|
| Node | 22.23.2 | [.nvmrc](../.nvmrc) |
| npm | 12.1.0 | [package.json](../package.json) packageManager |
| Python | 3.10+ for token/documentation tools | Standard-library scripts |
| React/React DOM | Declared peer range: >=19.2.0 <20 | [Package manifest](../packages/react/package.json) |

Select the reference Node version with your version manager or install it manually. The broader engine range does not prove every allowed runtime was tested. On Windows, Python may be `py -3`; on macOS/Linux it may be `python3`. Substitute your Python 3 command below. Run npm commands from the repository root unless stated otherwise.

## React component lab

After selecting Node 22.23.2:

```sh
node --version
npm install --global npm@12.1.0
npm --version
npm ci
npm run check
npm run dev
```

Open `http://127.0.0.1:4173`. Keep the development-server terminal open; Ctrl+C stops it. GitHub's file viewer shows source, not a running app.

The lab follows **Prepare plan → Review approach → Create proposal → Review action → Simulate publish or Reject action → Verified receipt**. Approach review and opening review grant no action permission. Notes availability and Revise plan demonstrate invalidation. An unconfirmed response requires reconciliation rather than retry. See the [walkthrough](REVIEW-WORKFLOW-v0.1.md#7-walk-through-the-local-lab).

### Library changes during development

`npm run dev` builds the library once before Vite. The demo imports the built package; changes to `packages/react/src` require `npm run build:library` or restarting through `npm run dev`. No library watch command is supplied. The demo model is local example code, not an exported workflow engine.

## Visual specimen without npm

```sh
python scripts/tokens.py check
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/examples/visual-system.html`. This separate specimen needs the repository CSS. For token changes, edit tokens.json, run `python scripts/tokens.py build`, then `check`. Commit source, generated CSS, and generated report together.

## Verification

| Command | Checks or produces | Does not include |
|---|---|---|
| npm run typecheck | TypeScript checking | Browser behavior |
| npm test | Library build, Node contracts, React components, demo-model tests | Browser, tokens, docs, audit, isolated install |
| npm run test:package | Archive inventory and workspace exports; requires a current library build | Independent installation |
| npm run test:consumer | Offline isolated install/reinstall, consumer types, seven static renders, package/CSS resolution; requires current build and package report | Hydration, bundler integration, registry distribution |
| npm run check | Typecheck, npm test, demo build, package inventory, and isolated consumer checks | Browser, tokens, docs, dependency audits |
| npm run test:browser | Chromium browser suite | Firefox, WebKit, manual assistive-technology review |
| python scripts/tokens.py check | Structure, declared contrast, generated-file drift | Every rendered combination |
| python scripts/check_docs.py | Local Markdown links/fragments and fences | External URLs, code execution, factual correctness |
| npm audit | Known advisories for the installed graph at run time | Proof of application security |

Use actual runner output, not historical counts, for the current commit. [Consumer validation](CONSUMER-VALIDATION-v0.1.md) records the isolated acceptance result; [Review validation](REVIEW-VALIDATION-v0.1.md) preserves the earlier application-workflow results and findings.

After npm ci, run the full set of checks:

```sh
python scripts/check_docs.py
python -m unittest discover -s tests -p 'test_docs.py'
python scripts/tokens.py check
npm run check
npx playwright install chromium
npm run test:browser
npm audit
npm audit --omit=dev
```

Linux environments missing browser system libraries may use `npx playwright install --with-deps chromium`; review system-package privileges first. The [React workflow](../.github/workflows/react.yml) and [documentation workflow](../.github/workflows/docs.yml) define CI. Artifacts are temporary evidence, not durable release storage.

### Isolated package acceptance only

```sh
npm run build:library
npm run test:package
npm run test:consumer
```

The consumer test packs only installed lockfile-matched runtime/type packages and the built TUN library. It uses a new application and cache outside the repository, offline npm installation with lifecycle scripts disabled, its own lockfile reinstall, and real package resolution without workspace links. It records `artifacts/consumer-check.json` and removes only its temporary directory. The initial repository installation may need registry access; this acceptance test does not. A failure must be investigated, not bypassed by enabling scripts or adding a network fallback.

## Build and consume a local package

```sh
npm run pack:react
```

This builds `tun-systemic-react-0.1.0.tgz` in the repository root. `npm run check` also creates a checked archive under artifacts/. Neither publishes to npm. The private version is unchanged between increments; record source SHA and digest when sharing an archive.

In a compatible existing React app, replace the path with the actual archive:

```sh
npm install /absolute/path/to/tun-systemic-react-0.1.0.tgz
```

```tsx
import { ContextPanel, PlanView, ProposalCard, ApprovalGate } from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';
```

Import CSS once in the permitted global entry; token CSS is included. The package is ESM with declarations and no CommonJS require export. The isolated smoke test validates one locked React graph and static rendering; validate CSS bundling, hydration, and framework boundaries in your actual consumer before adoption.

Set `data-tun-theme="light"` or `"dark"` on `<html>`; remove it for system preference. Nested themes and persisted preferences are not implemented.

## Troubleshooting

| Symptom | Check and response |
|---|---|
| Engine/install error | Confirm Node/npm versions and root directory. Keep the lockfile; do not force peer compatibility. |
| Registry/DNS error on initial setup | Restore connectivity. Syntax-only checks are not a completed build. |
| Consumer dependency mismatch | Restore the committed graph with npm ci; do not silently select a newer peer. |
| Consumer archive/report mismatch | Rebuild the library, run test:package, then test:consumer. |
| Missing dist or stale edits | Run npm run build:library; the demo imports built files. |
| Missing Chromium | Run npx playwright install chromium using the installed toolchain. |
| Port 4173 unavailable | Stop a process you own or update demo/test URLs together. |
| Unstyled components | Import package CSS and set the theme on html. |
| Prepare plan disabled | Restore available notes; missing/restricted/stale or unresolved outcomes block the demo. |
| Create proposal disabled | Review the current approach; revisions clear that review. |
| Approval disabled | Inspect status, expiry, completeness, same-version changes, and pending/unknown outcomes. Never bypass a latch. |
| Unknown publication outcome | Check the simulated action record; do not repeat publication. Missing evidence stays unknown. |
| Receipt pending verification | Supply verified state and meaningful evidence; a click is insufficient. |
| Local link checker failure | Move targets and links together. Remote URLs are not fetched. |

For production, complete the [integration checklist](INTEGRATION-CHECKLIST.md). A local demo or passing smoke test implies no publication, hosted deployment, complete accessibility audit, or real backend execution.
