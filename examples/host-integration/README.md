# A real host boundary for TUN

**The provider can commit a write while the UI still refuses to show success.** This runnable pilot connects TUN's components to a Python HTTP server, a durable authorization ledger, and a separate local sandbox-board database. Only a later server readback creates an action receipt.

[Protocol and boundaries](#what-is-real-and-what-is-a-fixture) · [Failure journeys](#try-the-failure-journeys) · [Requirement/test map](TRACEABILITY.md) · [Adoption plan](../../docs/STATUS-AND-ROADMAP.md#next-milestones)

## Run it

From the repository root, use the repository's [Node/npm toolchain](../../docs/GETTING-STARTED.md) and Python 3.10+ with `sqlite3`:

```sh
npm ci
npm run demo:host
```

Open **http://127.0.0.1:4180**. Paste the **operator token printed in your terminal** into the connection form. The separate reviewer token can inspect the tenant's records but cannot prepare, approve, or execute changes. Tokens stay in browser memory, not local storage; after refreshing, paste the token again to reconnect.

The command builds the existing library and this example, then starts the loopback-only host. Python uses its standard library: no `pip install`, database server, API key, or AI provider is needed. On Windows systems without a `python3` command, run `npm run host:build` and then `py -3 examples/host-integration/server.py`.

The ordinary Vercel showcase is unchanged. This pilot is **not** served by that static deployment.

## The five-minute proof

Enter project-update text and choose **Prepare server proposal**. Review the exact text and target in the TUN proposal and approval components, then choose **Authorize local publication**. The server stores authorization; it creates no board post and no receipt.

Choose **Execute authorized action**. The sandbox provider commits a real local post. The UI reports **Provider returned — not verified**, and there is still **no `ActionReceipt`**. Repeated **Refresh server records** calls do not verify the action.

Choose **Verify with server**. The host independently reads the provider database and compares operation identity, tenant, action parameters, and stored content. Only a match persists a verified receipt and renders **Completed**. The acceptance test also queries the board before verification to demonstrate that the effect already exists while the UI withholds success.

```text
React / TUN                           Python host                     Sandbox provider
Prepare text ----------------------> immutable proposal              (separate SQLite file)
ApprovalGate decision -------------> authorized operation
                                     durable dispatch reservation
Execute ---------------------------> recheck grant/revision/expiry --> commit local board post
                                     pending-verification <---------- acknowledgement
                                     receipt = null
Verify with server ----------------> read back the same operation ---> lookup actual record/content
                                     compare canonical parameters <-- stored effect
ActionReceipt <--------------------- persist verified receipt
```

`onDecision` only posts a version-bound decision and refreshes state. It never manufactures a receipt. `receiptFor` additionally requires a matching server operation in the verified state. The client decoder rejects contradictory status/receipt combinations.

## What is real and what is a fixture

| Layer | Implementation |
|---|---|
| Client/server boundary | Actual same-origin HTTP requests. No mocked fetch, in-browser ledger, or timeout that automatically declares success. |
| Identity and policy | Real bearer-token validation against hashed tokens and server-owned tenant/write grants. The two local principals are fixtures, not SSO users. |
| Canonical proposals | Immutable content per ID/version, explicit decision records, expiry checks, and old-review invalidation. Request bodies cannot override actor, target, authority, or verification. |
| Host ledger | On-disk SQLite transactions, a unique operation per approved proposal/version, durable state and sanitized event history. |
| Provider | A deliberately local substitute for an external publishing service. It atomically stores a board change and an idempotency record in a **second** SQLite database. |
| Verification | A separate server readback of the provider record and its content. A callback, `accepted: true`, or local receipt absence is not proof of outcome. |
| Recovery | Reconciliation never dispatches another effect. Withdrawal is a separate reviewed/authorized/verified action and retains the original receipt/history. |
| AI planning | Not included. The text you enter becomes the candidate local change; no model-generated authority is trusted. |

The provider adapter lives in `SandboxBoard` in [service.py](service.py). It can later be replaced without allowing the UI to become the authority. The host and provider currently run in one Python process, with independent database commits; this is not a remote-service resilience test.

## Try the failure journeys

**Lost acknowledgement:** Before execution, select **Drop HTTP response after provider commits**. The server actually closes that HTTP connection after the provider transaction commits. The UI and durable host operation remain unknown, with no receipt. Reconnect or refresh, then verify the same operation. There is one board post, not a repeated write.

**Absent provider result:** Select **Provider unavailable before writing**. A durable unknown reservation exists, but no provider post. Verification leaves the outcome unknown and execution stays disabled. Missing readback does not authorize retry. An equivalent new proposal is also refused while this operation is unresolved.

**Revocation race:** Authorize in one window. In another connected window, choose **Revoke write permission**, then try executing from the stale first window. The API refuses dispatch even though that window previously showed an enabled button. The local administrator can restore the fixture grant; an ordinary reviewer cannot. A revoked operator can still inspect and reconcile records.

**Stale revision:** Change the editor text and choose **Revise with editor text** before dispatch. The server creates a new immutable version and cancels the old authorized operation. Old references cannot execute the new content. Once dispatch has begun, revision cannot erase it.

**Concurrent requests:** Open two windows on the same proposal, or run the concurrency test. The host resolves approvals to the same operation ID; a second execute call cannot repeat an unknown or pending effect. Deduplication is per canonical operation, not a claim that two intentionally distinct approved actions can never have similar content.

**Withdrawal:** After verification, choose **Prepare separate withdrawal**. Approval, execution, and readback are required again. The provider removes the post from the active board, while the publication and withdrawal records both remain. This is not deletion from logs or backups.

**Cancellation:** **Cancel before dispatch** only cancels authorized, undispatched work. It does not claim to interrupt a provider write already in progress. Worker stopping and multi-step partial effects belong to the next pilot increment.

## HTTP protocol

All private routes require `Authorization: Bearer <local-token>`. POST bodies use `application/json`; unknown fields, duplicate JSON keys, malformed values, and bodies larger than 16 KiB are rejected. Content is limited to 4,000 characters. Tenant identity is never taken from the request body.

| Method / path | Body / result |
|---|---|
| `GET /api/snapshot` | Authenticated tenant's proposals, operations, receipts, and recent audit events. Read-only; does not verify. |
| `POST /api/proposals` | `{ "kind": "publish", "content": "Exact text" }`, or `{ "kind": "withdraw", "target": "verified-operation-id" }`. Returns proposal ID/version. |
| `POST /api/proposals/{id}/revise` | `{ "proposalVersion": "1", "content": "New exact text" }`. Invalidates the old review. |
| `POST /api/decisions` | `{ "proposalId": "...", "proposalVersion": "1", "decision": "approve" }` or `reject`. Returns operation ID or null. |
| `POST /api/operations/{id}/execute` | `{}`; local administrators can instead choose `fault: "drop-ack"` or `"before-write"`. Never accepts replacement action parameters. |
| `POST /api/operations/{id}/verify` | `{}`. Reads the original provider record; matching evidence creates the receipt. |
| `POST /api/operations/{id}/cancel` | `{}`. Cancels only before dispatch. |
| `POST /api/session/permission` | `{ "canWrite": false }`. Local-administrator fixture only; affects that principal's grant. |
| `GET /api/board` | Authenticated tenant's raw sandbox posts, including inactive posts. This is not the verification endpoint. |

Examples show field shapes; use the server-returned identifiers rather than inventing an operation ID. Successful command acknowledgements contain no receipt. The authoritative receipt is retrieved from the ledger after verification.

## Persistence and local safety

State lives in ignored `examples/host-integration/.data/`: `host.sqlite3`, `sandbox-board.sqlite3`, and private local bootstrap tokens. Stop and restart the server to retain grants, pending operations, provider effects, and historical receipts. Startup does not restore revoked grants. The interface displays the latest 100 records per collection; the database retains older records. Inspect older records through a deliberate operator workflow rather than treating them as deleted.

To start a disposable run without altering your persistent records:

```sh
python3 examples/host-integration/server.py --ephemeral
```

The host binds only `127.0.0.1`, checks the Host/Origin boundary, exposes no permissive CORS, and serves only built UI assets. The local token file and raw database are never static files or CI artifacts. Request errors do not reflect raw database exceptions, credentials, or submitted content. Keep tokens and data private, use synthetic content, and stop the process when finished.

Python's [`http.server`](https://docs.python.org/3/library/http.server.html) is explicitly a local-reference choice, not the public server for an adopting product. Its worker pool, transport protection, rate limits, and identity lifecycle are not a production security profile. See the [threat model](../../docs/THREAT-MODEL.md) and [security policy](../../SECURITY.md).

## Run the evidence

```sh
npm run test:host
npm run host:build
npx playwright install chromium
npm run test:host:browser
```

The backend suite uses real loopback HTTP, temporary databases, concurrent callers, and restart tests. It writes named results and input hashes to `artifacts/host-backend-results.json`. The browser suite starts a separate ephemeral Python process, uses its real HTTP API, and writes `artifacts/host-browser-results.json`. The UI decoder tests run in the normal Vitest suite. Neither browser suite intercepts requests to fabricate backend outcomes.

Both pilot suites run in the existing `verify` CI job. Browser traces are off to avoid retaining bootstrap tokens. The test token file is ignored, excluded from artifacts, and removed on ordinary server shutdown. The normal showcase browser suite remains intact.

## Replace the fixture through one bounded internal pilot

Select one reversible internal workflow and name its product owner, backend owner, and reviewer. Replace local bearer principals with the application's identity and tenant model; replace the sandbox provider with one narrowly scoped adapter that supports durable idempotency and authoritative readback. Repeat the mapped fault tests using a controlled provider environment before enabling real effects.

The sample uses short SQLite write transactions to serialize local policy changes and dispatch. It does **not** hold a distributed authorization guarantee across arbitrary network calls. A real adapter needs its own reservation/outbox, revocation/lease or fencing strategy, retry limits, and provider reconciliation contract. Two independent databases alone cannot guarantee exactly-once effects at an arbitrary external destination.

General runtime-schema adoption, multi-worker stopping, resource limits, pagination, session rotation, and operational incident recovery remain explicit handoff work. The narrow request/response validators here belong to this pilot protocol; they do not replace the separate runtime-contract package work. Complete the [integration checklist](../../docs/INTEGRATION-CHECKLIST.md) and attach real pilot evidence to the [threat/specification map](TRACEABILITY.md).

Engineering references: [Python SQLite transactions](https://docs.python.org/3/library/sqlite3.html#transaction-control), [SQLite transaction behavior](https://www.sqlite.org/lang_transaction.html), and [Playwright-managed local servers](https://playwright.dev/docs/test-webserver). These describe the tools used; the tests establish this example's observed behavior.
