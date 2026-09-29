/** Offline package acceptance test. No network, lifecycle scripts, publication, or workspace links. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = realpathSync(fileURLToPath(new URL('../', import.meta.url)));
const output = join(root, 'artifacts');
const npmCli = process.env.npm_execpath;
assert.ok(npmCli, 'Run through npm run test:consumer.');
assert.ok(existsSync(join(root, 'packages/react/dist/index.js')), 'Run npm run build:library first.');
const lockBytes = readFileSync(join(root, 'package-lock.json'));
const lock = JSON.parse(lockBytes.toString('utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const scratch = realpathSync(mkdtempSync(join(tmpdir(), 'tun-consumer-')));
const consumer = join(scratch, 'app');
const archives = join(scratch, 'archives');
const cache = join(scratch, 'cache');
const within = (parent, child) => {
  const path = relative(parent, child);
  return path === '' || (!isAbsolute(path) && path !== '..' && !path.startsWith(`..${sep}`));
};
assert.ok(!within(root, consumer), 'Consumer must be outside the repository.');
for (const directory of [consumer, archives, cache, output]) mkdirSync(directory, { recursive: true });
const reportFile = join(output, 'consumer-check.json');
// A failed attempt must never leave an earlier green report at this path.
writeFileSync(reportFile, JSON.stringify({ status: 'running' }) + '\n');
const exec = (args, cwd = consumer) => execFileSync(process.execPath, args, {
  cwd, encoding: 'utf8', timeout: 120000, maxBuffer: 8 * 1024 * 1024,
  env: { ...process.env, NODE_PATH: '' },
});
const npm = args => exec([npmCli, ...args, '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--workspaces=false', `--cache=${cache}`]);
const packages = [
  { name: '@tun-systemic/react', directory: join(root, 'packages/react') },
  { name: '@tun-systemic/contracts', directory: join(root, 'contracts') },
  ...['zod', 'react', 'react-dom', 'scheduler', '@types/react', '@types/react-dom', 'csstype'].map(name => ({ name, directory: join(root, 'node_modules', name) })),
];
try {
  const dependencies = {};
  const versions = {};
  let libraryArchive;
  for (const { name, directory } of packages) {
    const manifest = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
    assert.equal(manifest.name, name);
    if (!name.startsWith('@tun-systemic/')) assert.equal(manifest.version, lock.packages[`node_modules/${name}`]?.version, `${name} differs from the lockfile`);
    if (name === '@tun-systemic/contracts') assert.equal(manifest.version, lock.packages.contracts?.version);
    if (name === '@tun-systemic/react') assert.equal(manifest.version, lock.packages['packages/react']?.version);
    versions[name] = manifest.version;
    const result = JSON.parse(npm(['pack', directory, '--json', '--pack-destination', archives]));
    // npm 12 uses a package-name-keyed object; older npm uses an array.
    const records = Array.isArray(result) ? result : Object.values(result);
    assert.equal(records.length, 1, `Expected one archive for ${name}`);
    assert.equal(records[0].name, name);
    const file = records[0].filename;
    assert.ok(typeof file === 'string' && /^[A-Za-z0-9_.-]+\.tgz$/.test(file), 'Unexpected archive filename');
    dependencies[name] = `file:../archives/${file}`;
    if (name === '@tun-systemic/react') libraryArchive = join(archives, file);
  }
  const manifest = { name: 'tun-isolated-consumer', version: '0.0.0', private: true, type: 'module', dependencies };
  writeFileSync(join(consumer, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
  for (const file of ['consumer.tsx', 'verify.mjs']) copyFileSync(join(root, 'tests/consumer', file), join(consumer, file));
  writeFileSync(join(consumer, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler',
      jsx: 'react-jsx', strict: true, skipLibCheck: false, types: ['react', 'react-dom'], outDir: 'build' },
    include: ['consumer.tsx'],
  }, null, 2) + '\n');
  npm(['install', '--strict-peer-deps']);
  // Reinstall from this consumer's own lockfile; no workspace or registry fallback.
  npm(['ci', '--strict-peer-deps']);
  npm(['ls', '--all', '--json']);
  const consumerLock = JSON.parse(readFileSync(join(consumer, 'package-lock.json'), 'utf8'));
  for (const [path, entry] of Object.entries(consumerLock.packages)) {
    if (!path) continue;
    assert.ok(!entry.link && typeof entry.resolved === 'string' && entry.resolved.startsWith('file:'), `Non-local installation: ${path}`);
  }
  // Use the already-locked compiler, but resolve every imported type inside the consumer.
  const compiler = join(root, 'node_modules/typescript/bin/tsc');
  exec([compiler, '-p', join(consumer, 'tsconfig.json')]);
  const verified = JSON.parse(exec([join(consumer, 'verify.mjs')]));
  assert.equal(verified.status, 'passed');
  assert.deepEqual(readFileSync(join(root, 'package-lock.json')), lockBytes, 'Repository lockfile changed');
  assert.ok(libraryArchive);
  const inventory = JSON.parse(readFileSync(join(root, 'artifacts/package-check.json'), 'utf8'));
  const integrity = `sha512-${createHash('sha512').update(readFileSync(libraryArchive)).digest('base64')}`;
  assert.equal(integrity, inventory.integrity, 'Consumer must install the same archive checked by test:package');
  const report = { status: 'passed', checkedAt: new Date().toISOString(),
    sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    node: process.version, npm: exec([npmCli, '--version']).trim(), versions,
    installMode: 'Offline local tarballs from the repository-locked installed graph; fresh temporary directory and cache',
    freshInstall: true, lockedReinstall: true, workspaceLinks: false, lifecycleScripts: false,
    typecheck: 'passed', ...verified, archiveSha256: sha256(readFileSync(libraryArchive)), lockfileSha256: sha256(lockBytes),
    limits: 'One locked React peer graph; static rendering and package/types/CSS resolution, not hydration, bundler, registry, or cross-framework certification.' };
  writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  writeFileSync(reportFile, JSON.stringify({ status: 'failed', checkedAt: new Date().toISOString() }) + '\n');
  throw error;
} finally {
  // Only remove the unique temporary directory created by this invocation.
  rmSync(scratch, { recursive: true, force: true });
}
