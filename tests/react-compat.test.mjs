import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { adaptManifests, assertGraphPreserved, assertSinglePeers, profileFor } from '../scripts/react-compat.mjs';
const versions = { react: '19.3.0', 'react-dom': '19.3.0', '@types/react': '19.3.0', '@types/react-dom': '19.3.0' };
function graph() {
  return { lockfileVersion: 3, packages: {
    '': { name: 'fixture', devDependencies: { ...versions, typescript: '5.8.3' } },
    'examples/react': { dependencies: { react: '^19.2.0', 'react-dom': '^19.2.0', '@tun-systemic/react': '0.1.0' } },
    'packages/react': { peerDependencies: { react: '>=18.3.0 <20', 'react-dom': '>=18.3.0 <20' } },
    'node_modules/typescript': { version: '5.8.3', integrity: 'fixture-integrity', resolved: 'fixture-url', dev: true },
    ...Object.fromEntries(Object.entries(versions).map(([name, version]) => [`node_modules/${name}`, { version }])),
  } };
}
function selected() {
  const lock = graph(); const m = adaptManifests(lock.packages[''], lock.packages['examples/react'], 'react-18.3.0');
  lock.packages[''] = m.root; lock.packages['examples/react'] = m.demo;
  for (const [name, version] of Object.entries(profileFor('react-18.3.0'))) lock.packages[`node_modules/${name}`] = { version };
  return lock;
}
test('compatibility rejects an unknown profile before adaptation', () => assert.throws(() => profileFor('react-17')));
test('locked compatibility profile leaves manifests and graph unchanged', () => {
  const l = graph(); const m = adaptManifests(l.packages[''], l.packages['examples/react'], 'locked');
  assert.deepEqual(m.root, l.packages['']); assert.deepEqual(m.demo, l.packages['examples/react']); assertGraphPreserved(l, structuredClone(l), 'locked');
});
test('React 18 adaptation changes both runtime and type peers and the demo', () => {
  const l = graph(); const before = structuredClone(l);
  const m = adaptManifests(l.packages[''], l.packages['examples/react'], 'react-18.3.0');
  assert.equal(m.root.devDependencies.react, '18.3.0'); assert.equal(m.root.devDependencies['@types/react'], '18.3.12');
  assert.equal(m.demo.dependencies['react-dom'], '18.3.0'); assert.equal(m.root.devDependencies.typescript, '5.8.3'); assert.deepEqual(l, before);
});
test('React 18 compatibility allows only its named dependency closure', () => {
  const l = selected(); l.packages['node_modules/loose-envify'] = { version: '1.4.0' }; assertGraphPreserved(graph(), l, 'react-18.3.0');
});
test('compatibility rejects an unrelated package update', () => {
  const l = selected(); l.packages['node_modules/typescript'].version = '6.0.0'; assert.throws(() => assertGraphPreserved(graph(), l, 'react-18.3.0'), /Unrelated dependency drift/);
});
test('compatibility rejects altered package integrity without a version change', () => {
  const l = selected(); l.packages['node_modules/typescript'].integrity = 'changed'; assert.throws(() => assertGraphPreserved(graph(), l, 'react-18.3.0'), /Unrelated/);
});
test('compatibility rejects an unrelated addition or removal', () => {
  const l = selected(); l.packages['node_modules/unrelated'] = { version: '1' }; assert.throws(() => assertGraphPreserved(graph(), l, 'react-18.3.0'));
  delete l.packages['node_modules/unrelated']; delete l.packages['node_modules/typescript']; assert.throws(() => assertGraphPreserved(graph(), l, 'react-18.3.0'));
});
test('compatibility rejects a wrong resolved floor version', () => {
  const l = selected(); l.packages['node_modules/react'].version = '18.3.1'; assert.throws(() => assertGraphPreserved(graph(), l, 'react-18.3.0'), /Wrong resolved/);
});
test('compatibility rejects nested React copies', () => {
  const l = selected(); l.packages['examples/react/node_modules/react'] = { version: '19.3.0' }; assert.throws(() => assertSinglePeers(l, profileFor('react-18.3.0')), /Duplicate/);
});
test('compatibility rejects React 19 types in a React 18 job', () => {
  const l = selected(); l.packages['node_modules/@types/react'].version = '19.3.0'; assert.throws(() => assertSinglePeers(l, profileFor('react-18.3.0')), /Wrong/);
});
test('the distributed manifest advertises the tested React floor', () => {
  const pkg = JSON.parse(readFileSync(new URL('../packages/react/package.json', import.meta.url)));
  for (const n of ['react', 'react-dom']) {
    assert.equal(pkg.peerDependencies[n], '>=18.3.0 <20');
  }
});
test('matrix completion gate cannot pass a skipped failed or cancelled matrix', () => {
  const workflow = readFileSync(new URL('../.github/workflows/react.yml', import.meta.url), 'utf8');
  assert.match(workflow, /profile: \[locked, react-18\.3\.0, react-18\.3\.1\]/);
  assert.match(workflow, /fail-fast: false/);
  assert.match(workflow, /  verify:\n    if: \$\{\{ always\(\) \}\}\n    needs: \[compatibility\]/);
  assert.match(workflow, /test "\$MATRIX_RESULT" = "success"/);
  assert.match(workflow, /name: tun-react-check-artifacts-\$\{\{ matrix.profile \}\}/);
});
