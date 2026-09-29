# Wire validation and semantic validation

[Contracts guide](README.md) · [Schema source](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/contracts/src/schemas.ts) · [Fixture corpus](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/contracts/fixtures/cases.json)

## Two explicit layers

**Wire validation** checks JSON shapes, closed objects, required fields, allowed enums, finite numbers, string patterns, and discriminated source records. These checks are represented by `WireSchemas` and the generated Draft 2020-12 bundle.

**Semantic validation** runs after wire parsing. Named exports such as `TaskPlanSchema` and `validateContract('TaskPlan', input)` apply both layers. The JSON definitions list the additional algorithms in `x-tun-semantic-checks`; standard JSON Schema validators treat that extension as annotation. The Python and Go examples validate the wire layer and report its expected results, not a full semantic pass.

## Portable string conventions

Required text contains at least one character outside ECMAScript whitespace. The explicit character class avoids the differing Unicode meanings of `\S` in regex engines. Timestamps use ASCII digits, uppercase `T` and `Z`, seconds, optional one-to-three fractional digits, and an explicit offset or `Z`. Patterns use a strict end assertion to reject trailing newlines. Use an ECMAScript-compatible regex engine for this JSON Schema; the supplied Go adapter includes a one-second match timeout.

URL wire validation permits a single-slash root-relative path or a lowercase `http://`/`https://` URL, excluding controls, spaces, and backslashes. Authority parsing and credentials are checked by the runtime URL algorithm. Host-specific destination allowlists are an application decision.

## Residual algorithms

Apply only the checks listed for the selected contract. For nested records, timestamp and URL checks cover all included timestamp/URL fields.

| Algorithm | Required behavior after wire validation |
|---|---|
| `timestamp` | For `timestamp`, `observedAt`, `expiresAt`, or the standalone Timestamp value, validate Gregorian calendar dates with years 0001–9999 and the leap-year rule; hours 00–23, minutes/seconds 00–59; numeric offset hours 00–23 and minutes 00–59. Reject the unknown offset `-00:00`. Preserve the original representation. Validation does not compare expiry with the current clock. |
| `url` | Validate URL fields or the standalone DetailsUrl value using the existing `safeDetailsUrl` navigation policy: single-slash root-relative paths, or parseable HTTP(S) absolute URLs without credentials. Reject unsupported or invalid authorities. The TypeScript reference uses the platform URL parser; test the target language's URL behavior before asserting equivalent acceptance. |
| `unique-source-ids` | All IDs in a context or evidence collection must be distinct. Empty collections are valid representations of missing context/evidence. |
| `plan-graph` | Apply `planIssues`: identity, context and objective must be present; expected outputs and steps must be nonempty; step IDs must be unique; dependencies must name existing steps and form an acyclic graph. A plan in `changed` state requires a change summary. A completed plan's evidence is evaluated separately by the display helpers. |
| `memory-state` | M0 cannot be active. An active M1/M2/M3 record requires a nonblank influence explanation. Inactive/unavailable records remain representable. |
| `evidence-metadata` | Apply `evidenceIssues`: source IDs are unique, source identity and relationship descriptions are present, verification metadata has a supported state, verified checks have a description, and available excerpts have explicit kind/text. A supplied verification statement remains application-reported evidence. |
| `uncertainty-basis` | U0, U1 and U2 require a nonblank supporting basis. U3 can represent missing information without one. |
| `progress-range` | Completed work must not exceed total work. Wire validation already requires finite values, completed ≥ 0 and total > 0. |
| `recovery-policy` | An unknown original outcome permits only `reconcile`. `retry` requires a nonblank `retrySafety` explanation. Current permissions, expiry and actual duplicate-effect prevention are evaluated by the application. |

The reference algorithms live in [core](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/contracts/src/contracts.ts), [review](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/contracts/src/review-contracts.ts), [evidence](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/contracts/src/evidence-contracts.ts), and [runtime schemas](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/contracts/src/schemas.ts). Existing helpers are preserved as shared implementations rather than replaced by a second, inconsistent policy engine.

## Success states and time

Schema-valid does not mean executable now. A proposal that expired yesterday is still useful for action history. Parse it, then evaluate `proposalBlockReason(proposal, now)` before offering execution. A structurally complete receipt may report a completed action with pending verification; `effectiveReceiptStatus` continues to show pending verification. The schemas never promote unsupported success.

## Extending the format

New fields need a reviewed schema and type change. Unknown keys fail instead of silently disappearing, including extra content on restricted sources. Add fixtures with independently chosen expected results, run TypeScript/Python/Go wire tests, and regenerate the bundle. Add or update residual algorithm annotations whenever a new check cannot be exported as ordinary JSON Schema. A change in acceptance is a contract change and belongs in the changelog.
