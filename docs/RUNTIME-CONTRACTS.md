# Runtime contracts for agent and tool data

**Turn an unknown payload into a checked TUN record before rendering or acting on it.**

[Contracts package](../contracts/README.md) · [JSON Schema](../contracts/json-schema/contracts.schema.json) · [Semantic algorithms](../contracts/SEMANTICS.md) · [Getting started](GETTING-STARTED.md)

## The input boundary

```text
Agent / tool JSON
       ↓
Strict shape + field validation
       ↓
Calendar, plan, memory and recovery consistency checks
       ↓
Typed TUN record → component presentation
       ↓
Application authorization → execution → verified receipt
```

Use Zod schemas rather than asserting that unknown data matches a TypeScript interface:

```ts
import {
  ActionProposalSchema,
  proposalBlockReason,
  type ActionProposal,
} from '@tun-systemic/react/contracts';

export function reviewInput(input: unknown, now: number):
  | { ok: true; proposal: ActionProposal }
  | { ok: false; reason: string } {
  const parsed = ActionProposalSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: 'Proposal data is invalid.' };
  const reason = proposalBlockReason(parsed.data, now);
  return reason ? { ok: false, reason } : { ok: true, proposal: parsed.data };
}
```

For a service without React, import the identical API from `@tun-systemic/contracts`. Both entry points resolve the same schema and shared helper implementations. Existing readonly types and helper names remain compatible. Component imports remain separate from the opt-in runtime schema entry.

A rejected payload should produce a controlled invalid-data state. Keep raw payloads and complete validation errors out of public notifications and logs; the example returns a generic message. Use body-size and collection limits at your application's request boundary.

## Validation behavior

Objects are closed, unknown fields fail, required strings must be nonblank, and strings/numbers/booleans are not coerced. Restricted or unavailable evidence/context records reject extra content and URLs rather than silently dropping them. The result's `data` is the value to pass onward.

`RuntimeSchemas` covers every public serialized record and enum across the four contract families. `ActionProposalSchema`, `TaskPlanSchema`, `MemoryRecordSchema`, and the other named exports include the applicable semantic checks. `ContractValue<'TaskPlan'>` is inferred from the schema; compile-time parity checks compare these shapes with the existing public types.

A valid record can still describe an expired proposal, an unknown outcome, or pending verification. Parsing checks representation and consistency; the existing `proposalBlockReason`, `effectiveReceiptStatus`, and control helpers continue to handle time-dependent/display decisions. Application services enforce actual grants and execution.

## JSON Schema and language-neutral consumers

The generated bundle uses Draft 2020-12 and local `$defs`. Register it locally and select `urn:tun:contracts:0.1.0#/$defs/ActionProposal` or another named contract. The bundle root rejects instances to catch accidental validation against the inventory itself.

Python and Go examples in `contracts/consumers/` validate the same wire fixtures as Zod, with remote schema retrieval disabled. They cover nested shape rejection, source-access variants, enum values, Unicode whitespace, timestamp syntax, and strict object fields. Their tests compare the `wire` expectation in each fixture.

Some checks compare fields, calendar validity, or a dependency graph. They are applied by named runtime schemas and listed as `x-tun-semantic-checks` in JSON Schema. [SEMANTICS.md](../contracts/SEMANTICS.md) supplies their algorithms. Foreign-language integrations implement and test those residual checks to match the `runtime` fixture expectation. Generation rejects accidental custom refinements in the wire layer.

## Install the repository-local packages

The packages are maintained in this repository at version 0.1.0. From a checkout with the pinned toolchain and dependencies:

```sh
npm run build:library
mkdir -p artifacts
npm pack --workspace @tun-systemic/contracts --pack-destination artifacts
npm pack --workspace @tun-systemic/react --pack-destination artifacts
```

Install both resulting archives into a React application in one command:

```sh
npm install /path/to/tun-systemic-contracts-0.1.0.tgz /path/to/tun-systemic-react-0.1.0.tgz
```

A non-React service needs only the contracts archive. Zod is its pinned runtime dependency; npm resolves it normally during installation. The isolated repository tests instead pack the locked installed Zod copy and use offline local archives, then reinstall from the consumer's own lockfile.

## Development checks

`npm run check` includes typechecking, existing application tests, runtime fixtures, package installation checks, and JSON Schema drift detection. Generate reviewed schema changes with `npm run schemas:generate`, then rerun `npm run schemas:check`.

To validate the Python wire consumer, create an environment and install `contracts/consumers/python/requirements.txt`, then run `python -m unittest discover -s contracts/consumers/python -p 'test_*.py'`. For Go, run `go test -mod=readonly -count=1 ./...` from `contracts/consumers/go`. CI executes both and retains their reports with the existing artifacts.

Selected malformed-input assertions are linked to the [conformance matrix](../conformance/TRACEABILITY.md). Runtime validation strengthens those checks while leaving their separately recorded product/service assessment work intact.
