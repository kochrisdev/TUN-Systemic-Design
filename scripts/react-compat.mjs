/** Prepare a disposable CI checkout for a named peer profile; never use in a working checkout.
 * Non-React package contents stay locked. Reports retain both graphs for reproduction.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const profiles = Object.freeze({
  locked: null,
  'react-18.3.0': Object.freeze({ react: '18.3.0', 'react-dom': '18.3.0', '@types/react': '18.3.12', '@types/react-dom': '18.3.1' }),
  'react-18.3.1': Object.freeze({ react: '18.3.1', 'react-dom': '18.3.1', '@types/react': '18.3.12', '@types/react-dom': '18.3.1' }),
});
const peerNames = ['react', 'react-dom', '@types/react', '@types/react-dom'];
// React 18's dependency closure, not a general dependency-update allowance.
const permitted = new Set([...peerNames, 'scheduler', 'loose-envify', 'js-tokens', '@types/prop-types']);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const write = (path, value) => writeFileSync(path, JSON.stringify(value, null, 2) + '\n');

export function profileFor(name) {
  assert.ok(Object.hasOwn(profiles, name), `Unknown React compatibility profile: ${name}`);
  return profiles[name];
}
export function adaptManifests(root, demo, name) {
  const selected = profileFor(name);
  const result = { root: structuredClone(root), demo: structuredClone(demo) };
  if (selected) {
    for (const [dependency, version] of Object.entries(selected)) {
      assert.ok(Object.hasOwn(result.root.devDependencies, dependency), `Missing root peer: ${dependency}`);
      result.root.devDependencies[dependency] = version;
    }
    for (const dependency of ['react', 'react-dom']) {
      assert.ok(Object.hasOwn(result.demo.dependencies, dependency), `Missing demo peer: ${dependency}`);
      result.demo.dependencies[dependency] = selected[dependency];
    }
  }
  return result;
}

export function assertGraphPreserved(before, after, name) {
  const selected = profileFor(name);
  assert.equal(before.lockfileVersion, after.lockfileVersion);
  if (!selected) { assert.deepEqual(after, before, 'Locked profile must not change its graph'); return; }
  const expected = adaptManifests(before.packages[''], before.packages['examples/react'], name);
  assert.deepEqual(after.packages[''], expected.root, 'Only named root peer versions may change');
  assert.deepEqual(after.packages['examples/react'], expected.demo, 'Only demo React versions may change');
  // Dev/peer classification can change when React 18 adds a runtime edge to js-tokens.
  const contents = entry => {
    if (!entry) return entry;
    const { dev, peer, optional, devOptional, ...rest } = entry;
    return rest;
  };
  for (const path of new Set([...Object.keys(before.packages), ...Object.keys(after.packages)])) {
    if (path === '' || path === 'examples/react') continue;
    if (path === 'packages/react') {
      assert.deepEqual(after.packages[path], { ...before.packages[path], peerDependencies: { react: '>=18.3.0 <20', 'react-dom': '>=18.3.0 <20' } }, 'Only the widened library peer metadata may refresh');
      continue;
    }
    if (path.startsWith('node_modules/') && permitted.has(path.slice('node_modules/'.length))) continue;
    assert.deepEqual(contents(after.packages[path]), contents(before.packages[path]), `Unrelated dependency drift: ${path}`);
  }
  for (const [dependency, version] of Object.entries(selected)) {
    assert.equal(after.packages[`node_modules/${dependency}`]?.version, version, `Wrong resolved ${dependency}`);
  }
}

export function assertSinglePeers(lock, expected) {
  for (const name of peerNames) {
    const matches = Object.keys(lock.packages).filter(path => path === `node_modules/${name}` || path.endsWith(`/node_modules/${name}`));
    assert.deepEqual(matches, [`node_modules/${name}`], `Duplicate or missing ${name}`);
    assert.equal(lock.packages[matches[0]].version, expected[name], `Wrong ${name} version`);
  }
  assert.equal(expected.react, expected['react-dom'], 'React and React DOM must be a matched pair');
}

export function prepare(root, name, npmCli = process.env.npm_execpath) {
  profileFor(name); // Validate before writing anything.
  assert.ok(npmCli, 'Use npm run compat:prepare -- <profile>');
  const artifacts = join(root, 'artifacts');
  mkdirSync(artifacts, { recursive: true });
  const reportFile = join(artifacts, 'react-compatibility-preparation.json');
  write(reportFile, { status: 'running', profile: name });
  try {
    const bytes = readFileSync(join(root, 'package-lock.json'));
    const before = JSON.parse(bytes.toString('utf8'));
    const manifests = adaptManifests(read(join(root, 'package.json')), read(join(root, 'examples/react/package.json')), name);
    writeFileSync(join(artifacts, 'compat-baseline-package-lock.json'), bytes);
    if (profiles[name]) {
      write(join(root, 'package.json'), manifests.root);
      write(join(root, 'examples/react/package.json'), manifests.demo);
      execFileSync(process.execPath, [npmCli, 'install', '--package-lock-only', '--ignore-scripts', '--strict-peer-deps', '--no-audit', '--no-fund'], {
        cwd: root, stdio: 'inherit', timeout: 180000,
      });
    }
    const effective = readFileSync(join(root, 'package-lock.json'));
    const after = JSON.parse(effective.toString('utf8'));
    assertGraphPreserved(before, after, name);
    const expected = profiles[name] ?? Object.fromEntries(peerNames.map(n => [n, after.packages[`node_modules/${n}`]?.version]));
    assertSinglePeers(after, expected);
    writeFileSync(join(artifacts, 'compat-effective-package-lock.json'), effective);
    write(reportFile, { status: 'prepared', profile: name, expected, baselineLockSha256: hash(bytes), effectiveLockSha256: hash(effective) });
  } catch (error) { write(reportFile, { status: 'failed', profile: name }); throw error; }
}

export function verify(root, name, npmCli = process.env.npm_execpath) {
  profileFor(name);
  assert.ok(npmCli, 'Use npm run compat:verify -- <profile>');
  const reportFile = join(root, 'artifacts/react-compatibility.json');
  write(reportFile, { status: 'running', profile: name });
  try {
    const prepared = read(join(root, 'artifacts/react-compatibility-preparation.json'));
    assert.equal(prepared.status, 'prepared'); assert.equal(prepared.profile, name);
    const lockBytes = readFileSync(join(root, 'package-lock.json'));
    assert.equal(hash(lockBytes), prepared.effectiveLockSha256, 'Install/build changed the prepared lockfile');
    const lock = JSON.parse(lockBytes.toString('utf8'));
    assertSinglePeers(lock, prepared.expected);
    const resolution = {};
    for (const base of ['package.json', 'packages/react/package.json', 'examples/react/package.json', 'node_modules/@testing-library/react/package.json']) {
      const require = createRequire(join(root, base));
      resolution[base] = {};
      for (const name of peerNames) {
        const file = realpathSync(require.resolve(`${name}/package.json`));
        assert.equal(file, realpathSync(join(root, 'node_modules', name, 'package.json')), `${base} has another ${name}`);
        assert.equal(read(file).version, prepared.expected[name]);
        resolution[base][name] = read(file).version;
      }
    }
    execFileSync(process.execPath, [npmCli, 'ls', '--all', '--json'], { cwd: root, stdio: 'pipe', timeout: 60000, maxBuffer: 8 * 1024 * 1024 });
    write(reportFile, { status: 'passed', profile: name, versions: prepared.expected, resolution,
      node: process.version, effectiveLockSha256: prepared.effectiveLockSha256, baselineLockSha256: prepared.baselineLockSha256,
      checks: 'Exact matching runtime and type packages; single-copy resolution; dependency graph validity. Test results are separate.' });
    console.log(`PASS: ${name}; matched React ${prepared.expected.react}; matching type major; single-copy runtime resolution`);
  } catch (error) { write(reportFile, { status: 'failed', profile: name }); throw error; }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [mode, profile, ...extra] = process.argv.slice(2);
  assert.ok(!extra.length && ['prepare', 'verify'].includes(mode), 'Use npm run compat:{prepare,verify} -- <profile>');
  const root = realpathSync(fileURLToPath(new URL('../', import.meta.url)));
  if (mode === 'prepare') prepare(root, profile); else verify(root, profile);
}
