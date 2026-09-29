/** Deterministically export the portable wire layer; custom checks must be explicit. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { z } from 'zod';
import { WireSchemas, SemanticChecks } from '../dist/schemas.js';

export function rejectCustomChecks(value, seen = new WeakSet()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  if (value._zod?.def?.check === 'custom') throw new Error('Wire schemas cannot silently omit custom refinements');
  for (const child of Object.values(value._zod?.def ?? value)) {
    if (typeof child !== 'function') rejectCustomChecks(child, seen);
  }
}
export function buildBundle(schemas = WireSchemas) {
  const registry = z.registry();
  for (const [name, schema] of Object.entries(schemas)) {
    assert.match(name, /^[A-Za-z][A-Za-z0-9]+$/);
    rejectCustomChecks(schema);
    registry.add(schema, { id: name });
  }
  const generated = z.toJSONSchema(registry, {
    target: 'draft-2020-12', uri: name => `#/$defs/${name}`,
    unrepresentable: 'throw', cycles: 'throw', reused: 'inline',
  }).schemas;
  const definitions = {};
  for (const name of Object.keys(generated).sort()) {
    const { $schema, $id, ...body } = generated[name];
    definitions[name] = { ...body, 'x-tun-semantic-checks': SemanticChecks[name] ?? [] };
  }
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'urn:tun:contracts:0.1.0',
    title: 'TUN portable wire contracts',
    description: 'Select a named $defs entry. Cross-field algorithms are listed in x-tun-semantic-checks and contracts/SEMANTICS.md.',
    not: {}, // A direct validation against the bundle root fails; choose a contract explicitly.
    $defs: definitions,
  };
}
export function renderBundle(bundle) {
  const { $defs, ...header } = bundle;
  return JSON.stringify(header, null, 2).slice(0, -2) + ',\n  "$defs": {\n' +
    Object.entries($defs).map(([name, schema]) => `    ${JSON.stringify(name)}: ${JSON.stringify(schema)}`).join(',\n') + '\n  }\n}\n';
}
export function checkOrWrite(write = false) {
  const output = fileURLToPath(new URL('../json-schema/contracts.schema.json', import.meta.url));
  const expected = renderBundle(buildBundle());
  if (write) { mkdirSync(fileURLToPath(new URL('../json-schema/', import.meta.url)), { recursive: true }); writeFileSync(output, expected); }
  assert.equal(readFileSync(output, 'utf8'), expected, 'JSON Schema drift: run npm run schemas:generate and review the diff');
  console.log(`PASS: ${Object.keys(WireSchemas).length} wire contracts; generated JSON Schema matches source`);
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const flags = process.argv.slice(2);
  assert.ok(flags.every(flag => flag === '--write'), 'Only --write is supported');
  checkOrWrite(flags.includes('--write'));
}
