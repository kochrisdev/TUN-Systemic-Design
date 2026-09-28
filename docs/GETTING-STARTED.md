# Getting started

[Documentation index](README.md) · [Core React API](REACT-COMPONENTS-v0.1.md) · [Review workflow](REVIEW-WORKFLOW-v0.1.md)

## Choose a path

The HTML visual specimen needs only Python for its optional local server and token validation. The React lab additionally needs Node, npm, and initial registry access. Neither connects to an AI model or external execution service.

## Obtain the repository

```sh
git clone https://github.com/kochrisdev/TUN-Systemic-Design.git
cd TUN-Systemic-Design
```

For an existing clean checkout, use `git pull --ff-only` on the intended branch. Do not discard local work to follow this guide. To inspect the unmerged review-workflow increment, fetch and switch to its branch:

```sh
git fetch origin
git switch feat/context-plan-proposal-v0.1
```

Check the actual PR status; branch contents do not establish that main contains them. To reproduce a historical result, use its recorded commit rather than assuming main or a branch is unchanged.

## Toolchain

| Tool | Reference setup | Source |
|---|---|---|
| Node | 22.23.2 | [.nvmrc](../.nvmrc) |
| npm | 12.1.0 | [package.json](../package.json) packageManager |
| Python | 3.10+ for token/documentation tools | Standard-library scripts |
| React/React DOM | Declared peer range: >=19.2.0 <20 | [Package manifest](../packages/react/package.json) |

Select the reference Node version with your preferred version manager or install it manually. The engine range is broader than the reference setup; it does not prove every allowed runtime was tested. Validation reports identify specific tested dependencies.

On Windows, Python may be `py -3`; on macOS/Linux it may be `python3`. Substitute your Python 3 command below. Run npm commands from the repository root unless stated otherwise.

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

The seven-component lab follows **Prepare plan → Review approach → Create proposal → Review action → Simulate publish or Reject action → Verified receipt**. Approach review and opening action review grant no execution permission. Notes availability and Revise plan demonstrate invalidation. The unconfirmed-response option writes only an in-memory simulation record, then requires reconciliation rather than retry. See the [walkthrough](REVIEW-WORKFLOW-v0.1.md#7-walk-through-the-local-lab).

### Library changes during development

`npm run dev` builds the library once before Vite. The demo imports the built package, so edits in `packages/react/src` require `npm run build:library` or restarting through `npm run dev`. No library watch command is supplied. The demo model is local example code, not an exported workflow engine.

## Visual specimen without npm

```sh
python scripts/tokens.py check
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/examples/visual-system.html`. This separate HTML specimen uses repository CSS; copying its HTML alone does not copy its assets. For token changes, edit tokens.json, run `python scripts/tokens.py build`, then `check`. Commit source, generated CSS, and generated report together.

## Verification

| Command | Checks or produces | Does not include |
|---|---|---|
| npm run typecheck | TypeScript checking | Browser behavior |
| npm test | Library build, Node contracts, React components, demo-model tests | Browser, token, documentation, or audit checks |
| npm run check | Typecheck, npm test, production demo build, package inventory/exports | Browser, tokens, docs, audit, independent-consumer installation |
| npm run test:browser | Playwright Chromium suite | Firefox, WebKit, manual assistive-technology review |
| python scripts/tokens.py check | Structure, declared contrast pairs, generated-file drift | Every rendered color combination |
| python scripts/check_docs.py | Local Markdown links/fragments and fence balance | External URLs, example execution, factual correctness |
| npm audit | Known advisories for the installed graph at run time | Proof of application security |

Use actual runner counts, not historical numbers, for the current commit. The [review validation record](REVIEW-VALIDATION-v0.1.md) tracks this increment; the earlier React report remains historical.

After npm ci, run the separate checks:

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

Linux environments missing browser system libraries may use `npx playwright install --with-deps chromium`; review its environment/system-package privileges first. The [React workflow](../.github/workflows/react.yml) and [documentation workflow](../.github/workflows/docs.yml) define CI. Artifacts are temporary evidence, not durable release storage.

## Build and consume a local package

```sh
npm run pack:react
```

This builds `tun-systemic-react-0.1.0.tgz` in the repository root. `npm run check` separately creates a checked archive under artifacts/. Neither publishes to npm. The private version is unchanged between increments: record source SHA and digest when sharing an archive.

In a compatible existing React app, replace the path with the actual archive:

```sh
npm install /absolute/path/to/tun-systemic-react-0.1.0.tgz
```

```tsx
import { ContextPanel, PlanView, ProposalCard, ApprovalGate } from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';
```

Import CSS once in the permitted global entry; token CSS is included. The package is ESM with declarations and no CommonJS require export. The workspace inventory check is **not a fresh independent-consumer installation test**. That planned test remains outstanding in this increment; no automated installer is supplied. Validate the archive in the actual consumer before adoption.

Set `data-tun-theme="light"` or `"dark"` on `<html>`; remove it for system preference. Nested theme islands and persisted preferences are not implemented.

## Troubleshooting

| Symptom | Check and response |
|---|---|
| Engine/install error | Confirm Node/npm versions and repository-root directory. Keep the lockfile; do not bypass peer validation with force flags. |
| Registry/DNS error | Fix connectivity; syntax-only checks are not a completed build. |
| Missing dist or stale edits | Run npm run build:library; components are imported from built files. |
| Missing Chromium | Run npx playwright install chromium with the installed toolchain. |
| Port 4173 unavailable | Stop a process you own or update the demo and test URL together; do not test another app. |
| Unstyled components | Import package CSS and put theme attributes on html. |
| Prepare plan disabled | Restore available notes; missing, restricted, stale, or unresolved outcomes deliberately block the demo. |
| Create proposal disabled | Review the current approach; a revision clears that review. |
| Approval disabled | Inspect status, expiry, completeness, same-version changes, pending/unknown outcomes. Never bypass a latch. |
| Unknown publication outcome | Check the simulated action record; do not retry. Missing evidence stays unknown. |
| Receipt pending verification | The host must supply verified state and meaningful evidence; a click is insufficient. |
| Local link checker failure | Move targets and their links together. Remote URLs are not fetched. |

For production, complete the [integration checklist](INTEGRATION-CHECKLIST.md). A successful local demo implies no npm publication, hosted deployment, full accessibility audit, or real backend execution.
