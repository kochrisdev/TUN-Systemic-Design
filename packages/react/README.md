# @tun-systemic/react — v0.1.0

Reference implementation of four TUN components: `IntentComposer`, `AgentCard`, `ApprovalGate`, and `ActionReceipt`.

This package is private to the repository workspace. It has **not** been published to npm. The private flag prevents accidental publication; it does not restrict the public repository license.

The development toolchain is pinned to Node 22.23.2 (`.nvmrc`) and npm 12.1.0. From the repository root, use the committed lockfile:

```sh
npm install --global npm@12.1.0
npm ci
npm run check
npm run dev
```

React 19.2–19.x is the declared peer range; the committed dependency graph currently resolves React 19.3.0. Import the stylesheet once:

```tsx
import { IntentComposer } from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';
```

Use `npm run pack:react` at the repository root to create a local package archive after building. `npm run check` also creates and checks an archive under `artifacts/`, without publishing it. A consuming React project can install a local archive; do not use an npm-registry installation command until the package is deliberately published.

The stylesheet includes the existing TUN tokens. Set `data-tun-theme="light"` or `"dark"` on the root `<html>` element; remove the attribute for the system preference. Components do not load remote fonts, connect to models, or persist preferences.

Read [React Components v0.1](../../docs/REACT-COMPONENTS-v0.1.md) in the repository for complete contracts and application responsibilities. Read [validation status](../../docs/REACT-VALIDATION-v0.1.md) before adopting.

**An approval control is not an authorization service.** Callbacks request state changes; the application must authenticate, revalidate, deduplicate, execute, verify, and retain audit records. A resolved callback is not a completed action. Do not automatically retry an unconfirmed external action.

License: the repository's existing CC0-1.0 license, copied into the local package at build time. Third-party dependencies retain their own licenses.
