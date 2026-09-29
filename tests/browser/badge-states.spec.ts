import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from '@playwright/test';
import type { ActionProposal, ActivityRecord, ActivityStatus, AgentState, Consequence, UncertaintyLevel } from '../../packages/react/src/index.js';
// Import compiled JSX: Playwright's source JSX transform is for its component
// testing protocol, not react-dom/server. CI builds the package before browsers.
const { AgentActivity, AgentCard, ApprovalGate, ToolActivity, UncertaintySignal }: typeof import('../../packages/react/src/index.js') =
  await import(new URL('../../packages/react/dist/index.js', import.meta.url).href);
import { expectBadgeText, inspectBadgeText } from './badge-text.js';

// Render real components and real CSS into an isolated browser document. These
// static fixtures extend state coverage; the explorer and workflow tests cover
// hydrated components, transitions and callbacks separately.
const css = readFileSync(new URL('../../styles/tun.css', import.meta.url), 'utf8') + '\n' +
  readFileSync(new URL('../../packages/react/src/styles.css', import.meta.url), 'utf8').replace("@import './tokens.css';", '');
const actor = { id: 'badge-agent', name: 'Badge fixture agent', type: 'agent' as const };
const proposal: ActionProposal = { id: 'badge-proposal', version: '1', actor, action: 'Review fixture change', target: 'Local synthetic fixture', consequence: 'C0', effect: 'No external effect.', authority: 'Fixture only.', recovery: { kind: 'irreversible', description: 'No live operation; illustrates disclosure.' } };
const activity: ActivityRecord = { id: 'badge-run', version: '1', actor, task: 'Read the fixture', scope: 'Isolated test', status: 'running', effects: 'No external effects', observedAt: '2026-09-28T10:00:00Z', evidence: 'Synthetic readback supplied by the test' };
const cases: { name: string; markup: string; label: string }[] = [];
const consequences: Record<Consequence, string> = { C0: 'Informational', C1: 'Local reversible', C2: 'Shared reversible', C3: 'External consequential', C4: 'High consequence' };
for (const [code, label] of Object.entries(consequences)) {
  cases.push({ name: `consequence-${code}`, label: `${code} · ${label}`, markup: renderToStaticMarkup(createElement(ApprovalGate, {
    proposal: { ...proposal, consequence: code as Consequence }, status: 'awaiting', approveLabel: 'Confirm fixture change', onDecision: () => {},
  })) });
}
const uncertainty: Record<UncertaintyLevel, string> = { U0: 'Confirmed within stated scope', U1: 'High confidence within stated scope', U2: 'Inferred', U3: 'Unknown' };
for (const [code, label] of Object.entries(uncertainty)) {
  cases.push({ name: `uncertainty-${code}`, label: `${code} · ${label}`, markup: renderToStaticMarkup(createElement(UncertaintySignal, {
    assessment: { level: code as UncertaintyLevel, scope: 'Fixture claim', explanation: 'Fixture explanation', basis: 'Synthetic supporting evidence' },
  })) });
  if (code !== 'U3') cases.push({ name: `unsupported-${code}`, label: 'U3 · Unknown', markup: renderToStaticMarkup(createElement(UncertaintySignal, {
    assessment: { level: code as UncertaintyLevel, scope: 'Fixture claim', explanation: 'No evidence supplied' },
  })) });
}
const states: Record<ActivityStatus, string> = { idle: 'Idle', queued: 'Queued', running: 'Running', waiting: 'Waiting', verifying: 'Verifying', completed: 'Completed', partial: 'Partially completed', failed: 'Failed', unknown: 'Outcome unknown' };
for (const family of ['agent', 'tool'] as const) {
  function add(name: string, record: ActivityRecord, label: string) {
    const element = family === 'agent' ? createElement(AgentActivity, { activity: record }) : createElement(ToolActivity, { activity: { ...record, tool: 'Fixture reader', category: 'reading', target: 'Fixture note', authority: 'No live credentials' } });
    cases.push({ name: `${family}-${name}`, label, markup: renderToStaticMarkup(element) });
  }
  for (const [status, label] of Object.entries(states)) add(status, { ...activity, status: status as ActivityStatus }, label);
  for (const status of ['completed', 'partial', 'failed'] as const) add(`unverified-${status}`, { ...activity, status, evidence: undefined }, 'Outcome not verified');
  add('invalid-time', { ...activity, observedAt: '2026-02-30T10:00:00Z' }, 'Observation time unavailable');
}
const agentStates: Record<AgentState, string> = { idle: 'Idle', listening: 'Listening', thinking: 'Analyzing', planning: 'Planning', waiting: 'Waiting for approval', acting: 'Acting', verifying: 'Verifying', blocked: 'Blocked', completed: 'Completed', failed: 'Failed', escalated: 'Escalated' };
for (const [state, label] of Object.entries(agentStates)) cases.push({ name: `agent-card-${state}`, label, markup: renderToStaticMarkup(createElement(AgentCard, { agent: { id: actor.id, name: actor.name, purpose: 'Fixture only', autonomy: 2, authority: ['Read fixture'] }, state: state as AgentState })) });

for (const theme of ['light', 'dark', 'forced-colors'] as const) {
  test(`consequence, uncertainty and activity states have explicit text: ${theme}`, async ({ page }, info) => {
    await page.setViewportSize({ width: 320, height: 900 });
    if (theme === 'forced-colors') await page.emulateMedia({ forcedColors: 'active' });
    await page.setContent(`<!doctype html><html lang="en" data-tun-theme="${theme === 'dark' ? 'dark' : 'light'}"><head><style>${css}</style></head><body><main>${cases.map(c => `<div data-badge-case="${c.name}">${c.markup}</div>`).join('')}</main></body></html>`);
    for (const c of cases) {
      const specimen = page.locator(`[data-badge-case="${c.name}"]`);
      await expect(specimen.locator('.tun-badge')).toHaveCount(1);
      await expect(specimen.locator('.tun-badge')).toBeVisible();
      await expect(specimen.locator('.tun-badge')).toHaveText(c.label);
      expect((await inspectBadgeText(specimen)).labels, c.name).toEqual([c.label]);
    }
    const report = await inspectBadgeText(page);
    expect(report.checked).toBe(cases.length);
    await expectBadgeText(page);
    await info.attach('badge-state-labels', { body: JSON.stringify({ theme, specimens: cases.map(({ name, label }) => ({ name, label })), ...report }, null, 2), contentType: 'application/json' });
  });
}
