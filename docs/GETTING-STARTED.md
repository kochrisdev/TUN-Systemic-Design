# Getting started

[Documentation index](README.md) · [Core React API](REACT-COMPONENTS-v0.1.md) · [Review workflow](REVIEW-WORKFLOW-v0.1.md) · [Evidence and memory](EVIDENCE-AND-MEMORY-v0.1.md) · [Supervision and recovery](SUPERVISION-AND-RECOVERY-v0.1.md)

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

Do not discard local work. PR branches can contain unmerged work; check the actual PR status before assuming main contains it. Use a recorded commit to reproduce historical results rather than assuming a moving branch is unchanged.

## Toolchain

| Tool | Reference setup | Source |
|---|---|---|
| Node | 22.23.2 | [.nvmrc](../.nvmrc) |
| npm | 12.1.0 | [package.json](../package.json) packageManager |
| Python | 3.10+ for token/documentation tools | Standard-library scripts |
| React/React DOM | Declared peer range: >=19.2.0 <20 | [Package manifest](../packages/react/package.json) |

Select the reference Node version with a version manager or manual installation. The broader engine range does not prove every allowed runtime was tested. On Windows, Python may be `py -3`; on macOS/Linux it may be `python3`. Substitute your Python 3 command below. Run npm commands from the repository root unless stated otherwise.

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

Open `http://127.0.0.1:4173`. Keep the server terminal open; Ctrl+C stops it. GitHub's file viewer shows source, not a running application.

The lab presents all fourteen canonical reference components across separately scoped examples. **All effects are simulated.** No production worker, tool, memory store, model, or external action service is supplied.

The review workflow is **Prepare plan → Review approach → Create proposal → Review action → Simulate publish or Reject action → Verified receipt**. Approach review grants no execution permission. Notes availability and Revise plan invalidate reviews. An unconfirmed response requires reconciliation rather than repetition. See the [review walkthrough](REVIEW-WORKFLOW-v0.1.md#7-walk-through-the-local-lab).

**Evidence for the current task** explains memory influence, source use and application-reported checks, and scoped uncertainty. Availability is not use. Restricted notes remove readable evidence and memory inspection. The separate **Explore evidence and memory states** disclosure demonstrates conflicts, inaccessible sources, generated interpretations, and M0–M3/unavailable memory without changing task authority or storing data. See [Evidence and Memory](EVIDENCE-AND-MEMORY-v0.1.md#6-component-lab).

Use **Explore supervision and recovery** for the final four components. Request stop is acknowledged before any stop is confirmed; Advance simulated worker then supplies a local observation. Prior effects remain visible. The lost-acknowledgement scenario permits Check original action status rather than another write. Compensation creates a separate record without deleting the originals. These controls govern only the stepped fixture, **not the publication-review lab**. See the [supervision walkthrough](SUPERVISION-AND-RECOVERY-v0.1.md#8-working-local-example).

### Library changes during development

`npm run dev` builds the library once before Vite. The demo imports built files, so changes to packages/react/src need `npm run build:library` or a restart through npm run dev. No library watch command is supplied. The demo models are local fixtures, not exported workflow engines.

## Visual specimen without npm

```sh
python scripts/tokens.py check
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/examples/visual-system.html`. The specimen needs repository CSS. Edit tokens.json, run `python scripts/tokens.py build`, then `check`. Commit token source, generated CSS, and report together.

## Verification

| Command | Checks or produces | Does not include |
|---|---|---|
| npm run typecheck | TypeScript checking | Browser behavior |
| npm test | Library build, Node contracts, React components, metadata and demo-model tests | Browser, tokens, docs, audit, isolated installation |
| npm run test:package | Archive inventory and workspace exports; requires a current build | Independent installation |
| npm run test:consumer | Offline fresh install/reinstall, declarations, fourteen static renders, seven negative type cases, package/CSS paths | Hydration, CSS bundlers, registry distribution |
| npm run check | Typecheck, npm test, demo build, package inventory, isolated consumer checks | Browser, tokens, docs, audits |
| npm run test:browser | Chromium browser suite | Firefox, WebKit, manual assistive-technology review |
| python scripts/tokens.py check | Structure, declared contrast, generated-file drift | Every rendered combination |
| python scripts/check_docs.py | Local Markdown links/fragments and fences | External URLs, code execution, factual correctness |
| npm audit | Known advisories for the installed graph at run time | Proof of application security |

Use actual runner output for the current commit, not historical counts. [PR 6](https://github.com/kochrisdev/TUN-Systemic-Design/pull/6) tracks fourteen-component acceptance. Earlier [evidence](EVIDENCE-VALIDATION-v0.1.md), [consumer](CONSUMER-VALIDATION-v0.1.md), and [review](REVIEW-VALIDATION-v0.1.md) reports retain their dated scope.

After npm ci, run the full set:

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

Linux environments missing browser libraries may use `npx playwright install --with-deps chromium`; review system-package privileges first. [React CI](../.github/workflows/react.yml) and [documentation CI](../.github/workflows/docs.yml) define the existing workflows. Artifacts are temporary evidence, not durable releases.

### Isolated package acceptance only

```sh
npm run build:library
npm run test:package
npm run test:consumer
```

The consumer test packs built TUN and installed lockfile-matched peers/type packages. It uses a new application and cache outside the repository, offline npm installation with lifecycle scripts disabled, its own lockfile reinstall, and real installed package paths without workspace links. It writes artifacts/consumer-check.json and removes only its temporary directory. Initial repository setup may need registry access; the acceptance test does not. Investigate failures rather than enabling scripts or adding network fallback.

## Build and consume a local package

```sh
npm run pack:react
```

This creates tun-systemic-react-0.1.0.tgz in the repository root; npm run check also creates a checked archive under artifacts/. Neither publishes to npm. Record source SHA and digest because repository-local builds share private version 0.1.0.

In a compatible existing React app, substitute the actual path:

```sh
npm install /absolute/path/to/tun-systemic-react-0.1.0.tgz
```

```tsx
import { ContextPanel, PlanView, ProposalCard, ApprovalGate,
  MemoryIndicator, SourceView, UncertaintySignal,
  ToolActivity, AgentActivity, HumanOverride, RecoveryControl } from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';
```

Evidence/memory and supervision types/helpers are root-only exports. No evidence-contracts or supervision-contracts package subpath is declared. Core/review types remain available through the existing contracts subpath.

Import CSS once in the host's permitted global entry; token CSS is included. The package is ESM with declarations, not CommonJS require. The isolated test covers one locked graph and static rendering. Validate CSS bundling, hydration, framework boundaries, and actual service integration in the consuming application.

Set data-tun-theme light/dark on html, or remove it for system preference. Nested themes and persisted preferences are not implemented.

## Troubleshooting

| Symptom | Check and response |
|---|---|
| Engine/install error | Confirm Node/npm versions and root directory. Keep the lockfile; do not force peer compatibility. |
| Initial registry/DNS error | Restore connectivity. Syntax checks are not a completed build. |
| Consumer dependency mismatch | Restore the committed graph with npm ci; do not silently choose newer peers. |
| Consumer archive/report mismatch | Rebuild, run test:package, then test:consumer. |
| Missing dist or stale edits | Run npm run build:library. |
| Missing new contract import | Use the package root rather than inventing subpaths. |
| Missing Chromium | Run npx playwright install chromium using the installed toolchain. |
| Port 4173 unavailable | Stop a process you own or update demo/test URLs together. |
| Unstyled components | Import package CSS and set the theme on html. |
| Prepare plan disabled | Restore current available notes; unresolved outcomes deliberately block work. |
| Create proposal disabled | Review the current approach; revisions clear review. |
| Approval/override/recovery disabled | Inspect scope, versions, expiry, policy, evidence and local pending/unknown latches. Never bypass a latch. |
| Stop acknowledged but not confirmed | In the fixture, advance the simulated worker. In production, wait for genuine host observations. |
| Recovery blocked on unknown outcome | Reconcile the original action first. A network failure is not proof of no effects. |
| Completion stays unverified | Supply authentic evidence for the exact control/run revision; a click is insufficient. |
| Uncertainty becomes Unknown | Provide valid scope, explanation and a genuine basis; never invent evidence for a preferred badge. |
| Source summary stays Partial | Check support, access, excerpt type and source checks; generated text is not source evidence. |
| Memory inspection absent | Only valid active M1–M3 records with onInspect offer navigation. No storage service is implied. |
| Local link checker failure | Update targets and links together; remote URLs are not fetched. |

Before production use complete the [integration checklist](INTEGRATION-CHECKLIST.md). A demo or smoke test is not publication, deployment, full accessibility assessment, or authorization infrastructure.
