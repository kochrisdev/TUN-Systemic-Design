# @tun-systemic/react — v0.1.0

Reference React components for **TUN Systemic Design**: `IntentComposer`, `AgentCard`, `ApprovalGate`, and `ActionReceipt`.

The package is repository-local and **not published to npm**. The other ten canonical design patterns are not exported. The `private` manifest flag prevents accidental publication; it does not restrict access to the public repository.

## Build in the repository

Use the reference development toolchain, Node **22.23.2** and npm **12.1.0**, from the repository root:

```sh
npm install --global npm@12.1.0
npm ci
npm run check
npm run dev
```

`npm run check` typechecks, builds, runs contract/React tests, builds the demo, and checks a local package archive. Browser, token, documentation, and dependency-audit checks are separate. The local lab at `http://127.0.0.1:4173` is a simulation, not an AI or execution service.

## Consume a local archive

Run `npm run pack:react` at the repository root. It creates `tun-systemic-react-0.1.0.tgz`; `npm run check` also creates a checked archive under `artifacts/`. Neither publishes anything.

In a compatible React application, replace this path with the actual archive location:

```sh
npm install /absolute/path/to/tun-systemic-react-0.1.0.tgz
```

```tsx
import { IntentComposer, ApprovalGate } from '@tun-systemic/react';
import type { ActionProposal, DecisionRequest } from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';
```

The declared peer range is React/React DOM `>=19.2.0 <20`. The package exposes ESM JavaScript, TypeScript declarations, a `contracts` subpath, `styles.css`, and `tokens.css`; no CommonJS require entry is declared. The recorded validation used one locked dependency graph, not every allowed peer version. Fresh independent-consumer and host-framework validation remain adoption work.

Import component CSS once in the host's permitted global-style entry. It includes generated TUN tokens. Put `data-tun-theme="light"` or `"dark"` on the document's `<html>` element, or remove the attribute for system preference. Nested theme islands, remote fonts, and preference persistence are not implemented.

## Contracts and limits

Components render supplied state and emit requests. **An approval button is not an authorization service.** The host authenticates, validates input, binds authorization, rechecks expiry/revocation, deduplicates, executes, verifies, and stores protected audit records. A resolved callback is not a completed action. Never automatically retry an unconfirmed external effect.

The package does not implement model calls, persistent memory, external tool execution, Human Override, or recovery services. UI checks do not authenticate host-supplied evidence. TypeScript props are not a complete runtime schema for untrusted JSON.

## Documentation

These absolute repository links also work when this README is extracted from a package archive:

- [Getting started and troubleshooting](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/GETTING-STARTED.md)
- [React API and state behavior](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/REACT-COMPONENTS-v0.1.md)
- [Architecture and trust boundary](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/ARCHITECTURE.md)
- [Implementation matrix](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/STATUS-AND-ROADMAP.md)
- [Dated validation evidence](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/REACT-VALIDATION-v0.1.md)

Links to main may evolve. Use the commit recorded in a validation report for exact historical reproduction. There is no hosted deployment, npm release, full accessibility audit, or independent conformance certification in this increment.

License: the repository's existing CC0-1.0 license, copied into this package at build time. Third-party dependencies retain their own licenses.
