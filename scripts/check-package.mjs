/** Validate the local npm archive inventory and built public entry points. No publication. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'artifacts');
mkdirSync(output, { recursive: true });
assert.ok(process.env.npm_execpath, 'Run this check through npm run test:package.');
const raw = execFileSync(process.execPath, [process.env.npm_execpath,
  'pack', '--workspace', '@tun-systemic/react', '--json', '--ignore-scripts',
  '--pack-destination', output], { cwd: root, encoding: 'utf8' });
writeFileSync(join(output, 'package-inventory.json'), raw);
// npm 12 keys pack output by package name; it is not the old array format.
const records = JSON.parse(raw);
assert.ok(records && typeof records === 'object' && !Array.isArray(records));
assert.deepEqual(Object.keys(records), ['@tun-systemic/react']);
const archive = records['@tun-systemic/react'];
assert.equal(archive.name, '@tun-systemic/react');
assert.equal(archive.version, '0.1.0');
assert.ok(Array.isArray(archive.files), 'Package inventory must contain a file list.');
const paths = new Set(archive.files.map(file => file.path));
for (const name of ['index', 'contracts', 'IntentComposer', 'AgentCard', 'ApprovalGate', 'ActionReceipt']) {
  for (const extension of ['js', 'd.ts']) assert.ok(paths.has(`dist/${name}.${extension}`), `Missing ${name}.${extension}`);
}
for (const path of ['dist/styles.css', 'dist/tokens.css', 'package.json', 'LICENSE', 'README.md']) {
  assert.ok(paths.has(path), `Missing package file ${path}`);
}
assert.ok(![...paths].some(path => /(^|\/)(node_modules|\.env|\.git)(\/|$)/.test(path)));
const components = await import('@tun-systemic/react');
const componentNames = ['IntentComposer', 'AgentCard', 'ApprovalGate', 'ActionReceipt'];
for (const name of componentNames) assert.equal(typeof components[name], 'function', `Missing export ${name}`);
const contracts = await import('@tun-systemic/react/contracts');
assert.equal(typeof contracts.proposalBlockReason, 'function');
assert.equal(typeof contracts.parseTimestamp, 'function');
assert.ok(readFileSync(fileURLToPath(import.meta.resolve('@tun-systemic/react/styles.css')), 'utf8').length > 0);
assert.equal(readFileSync(fileURLToPath(import.meta.resolve('@tun-systemic/react/tokens.css')), 'utf8'),
  readFileSync(join(root, 'styles/tun.css'), 'utf8'));
assert.equal(readFileSync(join(root, 'packages/react/LICENSE'), 'utf8'), readFileSync(join(root, 'LICENSE'), 'utf8'));
const result = { status: 'passed', filename: archive.filename, integrity: archive.integrity,
  packageFiles: archive.files.length, components: componentNames,
  note: 'Archive inventory and workspace-built exports checked; not a fresh external consumer installation.' };
writeFileSync(join(output, 'package-check.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
