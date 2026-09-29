/** Install contracts independently of React, from local archives and a fresh lockfile. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = realpathSync(fileURLToPath(new URL('../', import.meta.url)));
const npmCli = process.env.npm_execpath;
assert.ok(npmCli, 'Use npm run test:contract-package');
const scratch = realpathSync(mkdtempSync(join(tmpdir(), 'tun-contract-package-')));
const app = join(scratch, 'consumer'), archives = join(scratch, 'archives'), cache = join(scratch, 'cache');
const output = join(root, 'artifacts');
for (const p of [app, archives, cache, output]) mkdirSync(p, { recursive: true });
const resultPath = join(output, 'contracts-package-check.json');
writeFileSync(resultPath, '{"status":"running"}\n');
const lockBytes = readFileSync(join(root, 'package-lock.json'));
const lock = JSON.parse(lockBytes);
const run = args => execFileSync(process.execPath, args, { cwd: app, encoding: 'utf8', timeout: 120000,
  maxBuffer: 8 * 1024 * 1024, env: { ...process.env, NODE_PATH: '' } });
const npm = args => run([npmCli, ...args, '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--workspaces=false', `--cache=${cache}`]);
try {
  const dependencies = {};
  let contractArchive;
  for (const [name, path, version] of [
    ['@tun-systemic/contracts', join(root, 'contracts'), lock.packages.contracts.version],
    ['zod', join(root, 'node_modules/zod'), lock.packages['node_modules/zod'].version],
  ]) {
    assert.equal(JSON.parse(readFileSync(join(path, 'package.json'))).version, version);
    const packed = JSON.parse(npm(['pack', path, '--json', '--pack-destination', archives]));
    const records = Array.isArray(packed) ? packed : Object.values(packed);
    assert.equal(records.length, 1); assert.equal(records[0].name, name);
    assert.match(records[0].filename, /^[A-Za-z0-9_.-]+\.tgz$/);
    dependencies[name] = `file:../archives/${records[0].filename}`;
    if (name === '@tun-systemic/contracts') contractArchive = join(archives, records[0].filename);
  }
  writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'tun-contract-consumer', version: '0.0.0', private: true, type: 'module', dependencies }));
  npm(['install', '--strict-peer-deps']); npm(['ci', '--strict-peer-deps']); npm(['ls', '--all', '--json']);
  const installedLock = JSON.parse(readFileSync(join(app, 'package-lock.json')));
  for (const [path, entry] of Object.entries(installedLock.packages)) {
    if (path) assert.ok(!entry.link && entry.resolved?.startsWith('file:'), `Non-local package ${path}`);
  }
  for (const name of ['react', 'react-dom', '@types/react']) assert.ok(!existsSync(join(app, 'node_modules', name)), `Unexpected React dependency ${name}`);
  for (const name of Object.keys(dependencies)) {
    const installed = join(app, 'node_modules', name);
    assert.ok(!lstatSync(installed).isSymbolicLink());
    const rel = relative(join(app, 'node_modules'), realpathSync(installed));
    assert.ok(!isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${sep}`));
  }
  writeFileSync(join(app, 'consumer.ts'), `import { ActionProposalSchema, validateContract, type ActionProposal, type ContractValue } from '@tun-systemic/contracts';
export function parse(value: unknown): ActionProposal | null {
  const result = ActionProposalSchema.safeParse(value);
  return result.success ? result.data : null;
}
export function generic(value: unknown): ContractValue<'DecisionRequest'> | null {
  const result = validateContract('DecisionRequest', value);
  return result.success ? result.data : null;
}
// @ts-expect-error: invalid compile-time schema selector
validateContract('NotAContract', {});
`);
  writeFileSync(join(app, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES2022', lib: ['ES2022', 'DOM'],
    module: 'NodeNext', moduleResolution: 'NodeNext', strict: true, skipLibCheck: false, noEmit: true, types: [] }, include: ['consumer.ts'] }));
  run([join(root, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.json']);
  writeFileSync(join(app, 'cases.json'), readFileSync(join(root, 'contracts/fixtures/cases.json')));
  writeFileSync(join(app, 'verify.mjs'), `import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { RuntimeSchemas, WireSchemas, validateContract, proposalBlockReason } from '@tun-systemic/contracts';
const cases = JSON.parse(readFileSync('cases.json')).cases;
const bundle = JSON.parse(readFileSync(fileURLToPath(import.meta.resolve('@tun-systemic/contracts/json-schema/contracts.schema.json'))));
assert.deepEqual(Object.keys(bundle.$defs).sort(), Object.keys(WireSchemas).sort());
for (const row of cases) {
 assert.equal(WireSchemas[row.contract].safeParse(row.input).success, row.wire, row.id);
 assert.equal(validateContract(row.contract, row.input).success, row.runtime, row.id);
}
assert.equal(typeof proposalBlockReason, 'function');
assert.equal((await import('@tun-systemic/contracts/core')).proposalBlockReason, proposalBlockReason);
for (const name of ['review-contracts', 'evidence-contracts', 'supervision-contracts']) await import('@tun-systemic/contracts/' + name);
console.log(JSON.stringify({ contracts: Object.keys(RuntimeSchemas).length, cases: cases.length }));
`);
  const checked = JSON.parse(run(['verify.mjs']));
  assert.deepEqual(readFileSync(join(root, 'package-lock.json')), lockBytes);
  const bytes = readFileSync(contractArchive);
  writeFileSync(join(output, 'tun-systemic-contracts-0.1.0.tgz'), bytes);
  const report = { status: 'passed', checkedAt: new Date().toISOString(), node: process.version, npm: run([npmCli, '--version']).trim(),
    ...checked, reactInstalled: false, freshInstall: true, lockedReinstall: true, workspaceLinks: false, typecheck: 'passed',
    archiveSha256: createHash('sha256').update(bytes).digest('hex'), lockfileSha256: createHash('sha256').update(lockBytes).digest('hex') };
  writeFileSync(resultPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  writeFileSync(resultPath, JSON.stringify({ status: 'failed', checkedAt: new Date().toISOString() }) + '\n');
  throw error;
} finally { rmSync(scratch, { recursive: true, force: true }); }
