# Getting started

[Documentation index](README.md) · [React API](REACT-COMPONENTS-v0.1.md)

## Choose a path

The HTML visual specimen needs only Python for its optional local server and token validation. The React component lab additionally needs Node, npm, and initial access to the npm registry. Neither example connects to an AI model or external execution service.

## Obtain the repository

```sh
git clone https://github.com/kochrisdev/TUN-Systemic-Design.git
cd TUN-Systemic-Design
```

For an existing clean checkout, use `git pull --ff-only` on the branch you intend to update. Do not discard local work to follow this guide. To reproduce a historical result, use the exact commit recorded in its validation report rather than assuming today's `main` is identical.

## Toolchain

| Tool | Reference setup | Source |
|---|---|---|
| Node | 22.23.2 | [.nvmrc](../.nvmrc) |
| npm | 12.1.0 | [package.json](../package.json) `packageManager` |
| Python | 3.10+ for token and documentation tools | Standard-library scripts |
| React and React DOM | Declared package peer range: `>=19.2.0 <20` | [React package manifest](../packages/react/package.json) |

Use your preferred Node version manager or install the reference version manually. The manifest's engine range is broader than the reference setup; it is not a promise that every allowed runtime has been tested. The historical React report identifies the exact resolved dependencies that were tested.

On Windows, the Python launcher may be `py -3`; on macOS/Linux it may be `python3`. Substitute your available Python 3 command in the examples. Run npm commands from the repository root unless a step explicitly says otherwise.

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

Open `http://127.0.0.1:4173`. Keep the development-server terminal open while using the lab; press Ctrl+C to stop it. GitHub's file viewer shows source, not a running application.

The demo lets you prepare a proposal, approve or reject its simulated publication, and inspect a simulated receipt. Approval and receipt are distinct states. The unconfirmed-response option demonstrates a blocked retry without claiming that a real action ran.

### Library changes during development

`npm run dev` builds the library once before launching Vite. The demo consumes the built package, so source changes in `packages/react/src` need `npm run build:library` or a server restart through `npm run dev`. There is no library watch command in this increment. Edits to the Vite app follow its normal development reload behavior.

## Visual specimen without npm

```sh
python scripts/tokens.py check
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/examples/visual-system.html`. It uses the adjacent repository stylesheet, so copying the HTML alone is not a substitute for copying its assets. For token changes, edit `tokens/tokens.json`, run `python scripts/tokens.py build`, then run `check` again. Commit the source, generated CSS, and generated validation report together.

## Verification

| Command | Checks or produces | Does not include |
|---|---|---|
| `npm run typecheck` | TypeScript checking | Browser behavior |
| `npm test` | Library build, 59 baseline contract tests, 21 baseline React tests | Browser, token, or dependency audits |
| `npm run check` | Typecheck, `npm test`, production demo build, local package inventory/exports | Browser tests, tokens, docs, dependency audit |
| `npm run test:browser` | Playwright Chromium suite | Firefox, WebKit, or a manual assistive-technology audit |
| `python scripts/tokens.py check` | Token structure, declared contrast pairs, generated-file drift | Every possible rendered color combination |
| `python scripts/check_docs.py` | Repository Markdown local links/fragments and fenced-code balance | External-link availability, code-example execution, or factual correctness |
| `npm audit` | Current known advisories for the installed graph | Proof that the application is secure |

The numeric test counts above describe the audited four-component baseline; use current runner output for subsequent changes.

For a full local verification pass after `npm ci`:

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

Linux environments missing browser system libraries can use `npx playwright install --with-deps chromium`; that command may require system-package privileges. Review the command and environment first. The [React workflow](../.github/workflows/react.yml) and [documentation workflow](../.github/workflows/docs.yml) define CI behavior. CI artifacts are temporary, not durable release storage.

## Build and consume a local package

```sh
npm run pack:react
```

This builds and creates `tun-systemic-react-0.1.0.tgz` in the repository root for the current manifest version. Separately, `npm run check` produces a checked archive under `artifacts/`. Neither command publishes to npm.

In an existing compatible React application, substitute the real path to the archive:

```sh
npm install /absolute/path/to/tun-systemic-react-0.1.0.tgz
```

```tsx
import { IntentComposer } from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';
```

Import CSS once in the host's permitted global-style entry. The stylesheet includes token CSS. The package is ESM with TypeScript declarations; the manifest does not declare a CommonJS `require` export. The workspace package check is not a fresh independent-consumer installation test. Test that integration in your own toolchain before adoption.

Set `data-tun-theme="light"` or `data-tun-theme="dark"` on the document's `<html>` element. Remove the attribute to follow the system preference. Nested theme islands and persisted preferences are not implemented.

## Troubleshooting

| Symptom | Check and response |
|---|---|
| Engine or install error | Confirm `node --version`, `npm --version`, and the root working directory. Keep the committed lockfile; do not bypass peer validation with force flags. |
| Registry/DNS error | Dependency installation requires network access. Fix connectivity rather than treating syntax-only checks as a completed build. |
| Missing `dist` or stale component changes | Run `npm run build:library`; the demo imports built package files. |
| Browser executable missing | Run `npx playwright install chromium` using the installed project toolchain. |
| Port 4173 unavailable | Stop the process you own using that port or configure the demo and browser-test URL together; do not silently test a different application. |
| Unstyled components | Import package CSS and put the theme attribute on `<html>`. |
| Approval buttons disabled | Inspect completeness, status, expiry, changed material fields under the same version, and unknown/pending outcomes. Do not bypass the latch to force execution. |
| Receipt says pending verification | The host has not supplied a verified result and nonempty verification detail. Clicking Approve is not sufficient. |
| Documentation link check fails | Update a moved local target and its links together. External links are not fetched by the checker. |

For production use, complete the [integration checklist](INTEGRATION-CHECKLIST.md). No npm publication, hosted deployment, full accessibility audit, or backend execution is implied by a successful local demo.
