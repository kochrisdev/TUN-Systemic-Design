import { expect, test } from '@playwright/test';
import { inspectBadgeText, expectBadgeText } from './badge-text.js';
import { componentCatalog, type ComponentName } from '../../examples/react/showcase-catalog.js';

// Deliberately independent of production label dictionaries: a blank/misleading
// dictionary entry must not become its own passing expected value.
const specimenLabels = {
  IntentComposer: [null, null],
  AgentCard: ['Planning', 'Blocked'],
  ContextPanel: ['Active context', 'Restricted context'],
  PlanView: ['Proposed approach', 'Blocked'],
  ProposalCard: ['Ready for review', 'This proposal has expired. Request a fresh proposal.'],
  ApprovalGate: ['C3 · External consequential', 'C3 · External consequential'],
  ActionReceipt: ['Completed', 'Pending verification'],
  MemoryIndicator: ['Session context — in use', 'Memory unavailable'],
  SourceView: ['Evidence checked — application reported', 'Evidence unavailable'],
  UncertaintySignal: ['U2 · Inferred', 'U3 · Unknown'],
  ToolActivity: ['Running', 'Outcome not verified'],
  AgentActivity: ['Running', 'Outcome not verified'],
  HumanOverride: ['Available for explicit request', 'Request acknowledged — result not confirmed'],
  RecoveryControl: ['Available for explicit request', 'Available for explicit request'],
} satisfies Record<ComponentName, readonly (string | null)[]>;

for (const theme of ['light', 'dark', 'forced-colors'] as const) {
  test(`all component specimens retain descriptive badge text: ${theme}`, async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 320, height: 900 });
    if (theme === 'forced-colors') await page.emulateMedia({ forcedColors: 'active' });
    await page.goto('/#components');
    if (theme !== 'forced-colors') await page.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(theme);
    for (const entry of componentCatalog) {
      await page.locator('.sc-component-menu button').filter({ hasText: entry.name }).click();
      await expect(page.locator('#component-title')).toHaveText(entry.name);
      for (const [index, state] of ['standard', 'edge'].entries()) {
        await page.getByRole('combobox', { name: 'Example state', exact: true }).selectOption(state);
        const specimen = page.locator('.sc-specimen');
        await expect(specimen.locator(':scope > .tun-component')).toHaveCount(1);
        const expected = specimenLabels[entry.symbol][index];
        const badges = specimen.locator('.tun-badge');
        await expect(badges).toHaveCount(expected === null ? 0 : 1);
        if (expected !== null) {
          await expect(badges).toBeVisible();
          await expect(badges).toHaveText(expected);
          const result = await inspectBadgeText(specimen);
          expect(result.checked, `${entry.symbol}/${state} must actually exercise its badge`).toBe(1);
          expect(result.labels).toEqual([expected]);
        }
        await expectBadgeText(specimen);
      }
    }
  });
}

// Prove that the assertion catches regressions rather than passing by finding
// a label attribute, SVG title, pseudo-element or text invisible to sighted users.
const badBadges = [
  ['empty', '<span></span>'],
  ['whitespace', '<span> \n </span>'],
  ['icon-only', '<span>● ✓</span>'],
  ['state-code-only', '<span>C4</span>'],
  ['aria-label-only', '<span aria-label="High consequence"></span>'],
  ['SVG-title-only', '<span><svg width="20" height="20"><title>High consequence</title><circle r="5" cx="10" cy="10" /></svg></span>'],
  ['pseudo-element-only', '<span class="pseudo"></span>'],
  ['display-none-child', '<span><b style="display:none">High consequence</b></span>'],
  ['hidden-child', '<span><b hidden>High consequence</b></span>'],
  ['visibility-hidden-child', '<span><b style="visibility:hidden">High consequence</b></span>'],
  ['transparent-child', '<span><b style="color:transparent">High consequence</b></span>'],
  ['zero-opacity-child', '<span><b style="opacity:0">High consequence</b></span>'],
  ['zero-font-child', '<span><b style="font-size:0">High consequence</b></span>'],
  ['aria-hidden-child', '<span><b aria-hidden="true">High consequence</b></span>'],
  ['screen-reader-only', '<span><b class="sr-only">High consequence</b></span>'],
  ['off-badge-text', '<span><b style="position:absolute;left:-10000px">High consequence</b></span>'],
] as const;
const fixtureStyle = '<style>.tun-badge{display:inline-block;min-width:30px;min-height:20px;border:1px solid;padding:4px}.pseudo::before{content:"High consequence"}.sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);clip-path:inset(50%);white-space:nowrap}</style>';
for (const [name, markup] of badBadges) {
  test(`badge text guard rejects ${name}`, async ({ page }) => {
    await page.setContent(fixtureStyle + markup);
    await page.locator('body > span').evaluate(el => el.classList.add('tun-badge'));
    const result = await inspectBadgeText(page);
    expect(result.checked).toBe(1);
    expect(result.failures).toHaveLength(1);
  });
}

test('badge text guard accepts visible nested and non-Latin labels below the fold', async ({ page }) => {
  await page.setContent(fixtureStyle + '<div style="height:2000px"></div><p class="tun-badge"><span>C4</span> · <strong>High consequence</strong><svg><title>Ignored decoration</title></svg></p><p class="tun-badge">確認待ち</p>');
  const result = await inspectBadgeText(page);
  expect(result.checked).toBe(2);
  expect(result.labels).toEqual(['C4 · High consequence', '確認待ち']);
  await expectBadgeText(page);
});

test('inactive badges are checked after their view opens', async ({ page }) => {
  await page.setContent(fixtureStyle + '<section hidden><p class="tun-badge"></p></section><p class="tun-badge">Running</p>');
  expect((await inspectBadgeText(page)).checked).toBe(1);
  await expectBadgeText(page);
  await page.locator('section').evaluate(el => el.removeAttribute('hidden'));
  expect((await inspectBadgeText(page)).failures).toHaveLength(1);
});

for (const theme of ['light', 'dark', 'forced-colors'] as const) {
  test(`changing review, evidence and supervision states retain badge text: ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    if (theme === 'forced-colors') await page.emulateMedia({ forcedColors: 'active' });
    await page.goto('/?lab=1');
    if (theme !== 'forced-colors') await page.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(theme);
    // Test at actual state changes, not just the initial DOM.
    for (const name of ['Prepare plan', 'Review approach', 'Create proposal', 'Review action']) {
      await page.getByRole('button', { name, exact: true }).click();
      await expectBadgeText(page);
    }
    await page.getByLabel('Simulate an unconfirmed response').check();
    await page.getByRole('button', { name: 'Simulate publish', exact: true }).click();
    const reconcile = page.getByRole('button', { name: 'Check simulated action record', exact: true });
    await expect(reconcile).toBeVisible(); await expectBadgeText(page);
    await reconcile.click();
    await expect(page.locator('.tun-receipt .tun-badge')).toHaveText('Completed');
    await expectBadgeText(page);
    const examples = page.getByRole('region', { name: 'Evidence and memory examples', exact: true });
    await examples.getByText('Explore example states', { exact: true }).click();
    for (const state of ['supported', 'conflicting', 'generated', 'unavailable']) {
      await examples.getByRole('combobox', { name: 'Example evidence', exact: true }).selectOption(state);
      await expectBadgeText(examples);
    }
    const lab = page.locator('#supervision');
    await lab.getByRole('button', { name: 'Request stop', exact: true }).click();
    await expect(lab.locator('.tun-override .tun-badge')).toHaveText('Request acknowledged — result not confirmed');
    await expectBadgeText(lab);
    await lab.getByRole('button', { name: 'Advance simulated worker', exact: true }).click();
    await expect(lab.locator('.tun-agent-activity .tun-badge')).toHaveText('Partially completed');
    await expect(lab.locator('.tun-override .tun-badge')).toHaveText('Stop confirmed');
    await expectBadgeText(lab);
    await lab.getByRole('button', { name: 'Request compensation', exact: true }).click();
    await expectBadgeText(lab);
    await lab.getByRole('button', { name: 'Advance simulated worker', exact: true }).click();
    await expect(lab.locator('.tun-recovery .tun-badge')).toHaveText('Compensation confirmed — not undo');
    await expectBadgeText(page);
  });
}
