# TUN runtime contracts

**Validate agent and tool payloads before they enter your application.**

`@tun-systemic/contracts` provides Zod schemas, shared TypeScript types, and generated JSON Schema for TUN's proposal, review, evidence, memory, and supervision records. It runs without React. React applications use the same schemas through `@tun-systemic/react/contracts`.

[Integration guide](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/RUNTIME-CONTRACTS.md) · [Wire and semantic checks](SEMANTICS.md) · [JSON Schema bundle](json-schema/contracts.schema.json) · [Shared test fixtures](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/contracts/fixtures/cases.json)

## Parse an unknown proposal

```ts
import { ActionProposalSchema, type ActionProposal } from '@tun-systemic/contracts';

export function parseAgentProposal(input: unknown): ActionProposal | null {
  const result = ActionProposalSchema.safeParse(input);
  return result.success ? result.data : null;
}
```

For React, change the import to `@tun-systemic/react/contracts`. The contracts entry has no React imports or client directive. The component entry remains separate, so rendering components does not eagerly register the schema catalog.

Objects reject unknown properties, fields are not coerced, and successful parsing returns validated data. Missing nested records, invalid enums, blank required text, contradictory memory metadata, unsafe recovery requests, invalid dates, and unsupported links are rejected. Use the parsed value—not an assertion such as `payload as ActionProposal`.

## Contract families

| Family | Representative schema exports |
|---|---|
| Identity and actions | `ActorSchema`, `AgentProfileSchema`, `ActionProposalSchema`, `DecisionRequestSchema`, `ReceiptDataSchema` |
| Review | `RevisionRefSchema`, `ReviewBasisSchema`, `ContextSourceSchema`, `ContextSnapshotSchema`, `PlanStepSchema`, `TaskPlanSchema`, `ReviewRequestSchema` |
| Evidence and memory | `MemoryRecordSchema`, `MemoryInspectionRequestSchema`, `EvidenceExcerptSchema`, `EvidenceSourceSchema`, `EvidenceCollectionSchema`, `UncertaintyAssessmentSchema` |
| Supervision | `ActivityRecordSchema`, `ToolActivityRecordSchema`, `ControlRequestSchema`, `InterventionOperationSchema`, `RecoveryOperationSchema`, `ControlEvidenceSchema` |

Every exported serialized record and enum has a matching schema. `RuntimeSchemas` contains the complete catalog; `WireSchemas` contains its portable structural layer. `ContractValue<'ActionProposal'>` infers a type from that layer. Compile-time parity checks keep schema shapes aligned with the existing readonly public types.

## JSON Schema for Python, Go, and other consumers

Load `json-schema/contracts.schema.json` locally and select a named definition, for example:

```json
{ "$ref": "urn:tun:contracts:0.1.0#/$defs/ActionProposal" }
```

The bundle targets JSON Schema Draft 2020-12 and contains all references locally. Its root intentionally rejects instances: select a contract definition rather than accidentally validating against an inventory. The bundle is also available through `@tun-systemic/contracts/json-schema/contracts.schema.json` after local package installation.

[Python](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/contracts/consumers/python/consumer.py) and [Go](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/contracts/consumers/go/contracts.go) consumers disable external schema loading. Both run the same wire fixtures as the Zod implementation. Go uses an ECMAScript-compatible regular-expression adapter for JSON Schema patterns.

The JSON Schema is generated from `WireSchemas`. Named schemas such as `ActionProposalSchema` also apply the explicit algorithms listed in each definition's `x-tun-semantic-checks`. Implement those algorithms from [SEMANTICS.md](SEMANTICS.md) when matching full runtime validation in another language. The fixture corpus records separate `wire` and `runtime` expectations so a structural pass cannot hide a missing cross-field check.

## Build and verify

From the repository root after [installing dependencies](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/GETTING-STARTED.md):

```sh
npm run build:contracts
npm run schemas:check
npm run test:contract-package
python -m unittest discover -s contracts/consumers/python -p 'test_*.py'
(cd contracts/consumers/go && go test -mod=readonly -count=1 ./...)
```

Install the pinned Python consumer requirements before its first run. `npm run schemas:generate` explicitly regenerates the JSON bundle; check the diff before committing. Generation rejects custom refinements in the portable wire layer instead of silently dropping them.

The standalone package check installs local contract and Zod archives into a fresh directory outside the workspace, reinstalls that directory's lockfile, checks types and schema exports, and verifies that React is absent. See the [integration guide](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/RUNTIME-CONTRACTS.md) for consuming the repository-local packages.

## Application boundary

Parse decoded JSON at the ingress boundary, with application-owned payload size and collection limits. The schemas validate data, while the application checks identity, current authority, expiry, proposal versions, evidence provenance, and execution. A past expiry and an unverified result can be valid records: `proposalBlockReason` and the existing result helpers still determine how those records may be acted on or displayed.

This package is private and repository-local at version 0.1.0. Distribution status and project-wide scope are in [Scope](https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/SCOPE.md). The original [CC0-1.0 license](LICENSE) is preserved; Zod's dependency license is separate.
