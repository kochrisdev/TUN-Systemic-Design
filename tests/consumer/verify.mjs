/** Executes only inside the newly installed consumer; never imports workspace source. */
import assert from 'node:assert/strict';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { isAbsolute, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import * as components from '@tun-systemic/react';
import { planIssues, proposalBlockReason, reviewBasisMatches } from '@tun-systemic/react/contracts';
import { context, plan, proposal, specimens } from './build/consumer.js';

const root = realpathSync(fileURLToPath(new URL('./', import.meta.url)));
const modules = join(root, 'node_modules');
const within = path => { const part = relative(modules, realpathSync(path)); return part && !isAbsolute(part) && part !== '..' && !part.startsWith(`..${sep}`); };
const names = ['IntentComposer', 'AgentCard', 'ContextPanel', 'PlanView', 'ProposalCard', 'ApprovalGate', 'ActionReceipt', 'MemoryIndicator', 'SourceView', 'UncertaintySignal', 'ToolActivity', 'AgentActivity', 'HumanOverride', 'RecoveryControl'];
for (const name of ['@tun-systemic/react', 'react', 'react-dom', 'scheduler', '@types/react', '@types/react-dom', 'csstype']) {
  const path = join(modules, name);
  assert.ok(!lstatSync(path).isSymbolicLink() && within(path), `${name} must be a real consumer installation`);
}
for (const spec of ['@tun-systemic/react', '@tun-systemic/react/contracts', '@tun-systemic/react/styles.css', '@tun-systemic/react/tokens.css', 'react', 'react-dom/server']) {
  assert.ok(within(fileURLToPath(import.meta.resolve(spec))), `${spec} resolved outside the consumer`);
}
assert.deepEqual(Object.keys(specimens).sort(), [...names].sort());
const rendered = {};
for (const name of names) {
  assert.equal(typeof components[name], 'function', `Missing export ${name}`);
  rendered[name] = renderToStaticMarkup(specimens[name]);
  assert.ok(rendered[name].includes('tun-component'), `${name} did not render`);
}
assert.equal(components.ControlAction, undefined, 'Internal implementation must not be a canonical export');
assert.ok(rendered.ContextPanel.includes('Not used'));
assert.ok(rendered.PlanView.includes('not an action authorization'));
assert.ok(rendered.ProposalCard.includes('&lt;script&gt;not executable&lt;/script&gt;'));
assert.ok(!rendered.ProposalCard.includes('<script>'));
assert.ok(rendered.ActionReceipt.includes('Pending verification'));
assert.ok(rendered.MemoryIndicator.includes('User-controlled persistent memory'));
assert.ok(rendered.SourceView.includes('Partial evidence') && rendered.SourceView.includes('Generated interpretation'));
assert.ok(rendered.SourceView.includes('&lt;script&gt;not evidence&lt;/script&gt;') && !rendered.SourceView.includes('<script>'));
assert.ok(rendered.UncertaintySignal.includes('U3') && rendered.UncertaintySignal.includes('Unknown'));
assert.ok(rendered.AgentActivity.includes('Outcome not verified'));
assert.ok(rendered.ToolActivity.includes('No external authority'));
assert.ok(rendered.HumanOverride.includes('Outcome not verified') && !rendered.HumanOverride.includes('Stop confirmed'));
assert.ok(rendered.RecoveryControl.includes('Check the original action status') && rendered.RecoveryControl.includes('disabled'));
assert.equal(components.evidenceState({ id: 'empty', version: '1', claim: 'Unknown', sources: [] }), 'unavailable');
assert.equal(components.effectiveUncertaintyLevel({ level: 'U0', scope: 'Fixture', explanation: 'No basis' }), 'U3');
for (const name of ['controlBlockReason', 'controlEvidenceMatches', 'controlRequest', 'measuredProgress']) assert.equal(typeof components[name], 'function');
assert.deepEqual(planIssues(plan), []);
assert.equal(proposalBlockReason(proposal, Date.parse('2026-09-28T00:00:00Z')), null);
assert.equal(reviewBasisMatches(proposal, context, plan), true);
const css = readFileSync(fileURLToPath(import.meta.resolve('@tun-systemic/react/styles.css')), 'utf8');
const tokens = readFileSync(fileURLToPath(import.meta.resolve('@tun-systemic/react/tokens.css')), 'utf8');
assert.ok(css.includes("@import './tokens.css'") && css.includes('.tun-proposal'));
assert.ok(tokens.includes('--tun-surface-panel') && tokens.includes('--tun-action-primary-bg'));
assert.ok(readFileSync(join(modules, '@tun-systemic/react/LICENSE'), 'utf8').includes('CC0'));
console.log(JSON.stringify({ status: 'passed', components: names, staticRenders: names.length,
  contracts: 'passed', packageResolution: 'consumer-local', stylesAndTokens: 'resolved',
  negativeTypeCases: 7, note: 'Static rendering does not exercise hydration or browser interactions.' }));
