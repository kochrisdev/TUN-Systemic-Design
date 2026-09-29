import { expectBadgeText } from './badge-text.js';
import { expect, test, type Page } from '@playwright/test';
import axe from 'axe-core';
import { componentCatalog } from '../../examples/react/showcase-catalog.js';
async function navigate(page: Page, name: string) {
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  const link = nav.getByRole('link', { name, exact: true });
  if (!await link.isVisible()) await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await link.click();
}
async function start(page: Page) {
  await page.getByRole('link', { name: 'Try the guided demo' }).click();
  await page.getByRole('button', { name: 'Inspect context', exact: true }).click();
  await page.getByRole('button', { name: 'Prepare plan', exact: true }).click();
}
async function proposal(page: Page) {
  await start(page);
  await page.getByRole('button', { name: 'Review approach', exact: true }).click();
  await page.getByRole('button', { name: 'Create proposal', exact: true }).click();
}
async function approval(page: Page) {
  await proposal(page); await page.getByRole('button', { name: 'Review action', exact: true }).click();
}
async function noAxeViolations(page: Page) {
  await expectBadgeText(page);
  await page.addScriptTag({ content: axe.source });
  expect(await page.evaluate(async () => (await (window as any).axe.run()).violations)).toEqual([]);
}
test.beforeEach(async ({ page }) => { await page.goto('/'); });
for (const width of [1440, 390, 320]) for (const theme of ['light', 'dark']) {
  test(`public overview ${width}px ${theme}: visible start, reflow, accessibility`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 844 });
    await page.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(theme);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Design intelligence');
    const box = await page.getByRole('link', { name: 'Try the guided demo' }).boundingBox();
    expect(box).not.toBeNull(); expect(box!.y).toBeGreaterThanOrEqual(0); expect(box!.y + box!.height).toBeLessThanOrEqual(844);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await noAxeViolations(page);
    await page.screenshot({ path: info.outputPath(`overview-${theme}-${width}.png`), fullPage: true });
  });
}
test('mobile navigation supports Escape, focus return, and browser history', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const button = page.getByRole('button', { name: 'Menu', exact: true });
  await button.click(); await expect(button).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape'); await expect(button).toBeFocused(); await expect(button).toHaveAttribute('aria-expanded', 'false');
  await navigate(page, 'Components'); await expect(page.locator('#component-title')).toHaveText('Intent Composer');
  await navigate(page, 'Overview'); await page.goBack(); await expect(page.locator('#component-title')).toBeVisible();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
});
test('guided intent keyboard entry focuses context and each subsequent stage', async ({ page }) => {
  await page.getByRole('link', { name: 'Try the guided demo' }).click();
  await expect(page.locator('#guided-step-title')).toBeFocused();
  await page.getByRole('textbox').focus(); await page.keyboard.press('Control+Enter');
  await expect(page.locator('#guided-step-title')).toHaveText('Context'); await expect(page.locator('#guided-step-title')).toBeFocused();
  await expect(page.getByText('Not used', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Prepare plan', exact: true }).click();
  await expect(page.locator('#guided-step-title')).toHaveText('Plan'); await expect(page.locator('#guided-step-title')).toBeFocused();
  await expect(page.getByRole('button', { name: 'Create proposal', exact: true })).toBeDisabled();
});
test('guided review separates approach, proposal, approval, and receipt', async ({ page }) => {
  await proposal(page);
  await expect(page.getByRole('button', { name: 'Simulate publish', exact: true })).toHaveCount(0);
  await expect(page.locator('.sc-guided .tun-receipt')).toHaveCount(0);
  await page.getByRole('button', { name: 'Review action', exact: true }).click();
  await expect(page.locator('.sc-guided .tun-approval')).toContainText('Project update');
  await expect(page.locator('.sc-guided .tun-receipt')).toHaveCount(0);
  await page.getByRole('button', { name: 'Simulate publish', exact: true }).click();
  await expect(page.locator('#guided-step-title')).toHaveText('Receipt'); await expect(page.locator('#guided-step-title')).toBeFocused();
  await expect(page.locator('.sc-guided .tun-receipt')).toContainText('Nothing was published');
  await expect(page.getByText('Retained local receipts (1)', { exact: true })).toBeVisible();
});
test('guided rejection creates no receipt', async ({ page }) => {
  await approval(page); await page.getByRole('button', { name: 'Reject action', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Action rejected.' })).toBeVisible();
  await expect(page.locator('.sc-guided .tun-receipt')).toHaveCount(0);
  await expect(page.getByText('Retained local receipts (0)', { exact: true })).toBeVisible();
});
test('guided context changes invalidate earlier reviews', async ({ page }) => {
  await approval(page); await page.getByRole('button', { name: 'Inspect context', exact: true }).click();
  await page.getByText('Change the source scenario', { exact: true }).click();
  await page.getByRole('combobox', { name: 'Notes availability', exact: true }).selectOption('restricted');
  await expect(page.getByRole('button', { name: 'Prepare plan', exact: true })).toBeDisabled();
  await expect(page.locator('.sc-guided .tun-approval')).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Notes availability', exact: true }).selectOption('available');
  await page.getByRole('button', { name: 'Prepare plan', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Create proposal', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Review approach', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Create proposal', exact: true })).toBeEnabled();
});
test('navigation cannot reset an unknown outcome or cause duplicate publication', async ({ page }) => {
  await approval(page); await page.getByText('Test an unconfirmed outcome', { exact: true }).click();
  await page.getByLabel('Simulate an unconfirmed response').check();
  await page.getByRole('button', { name: 'Simulate publish', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Check simulated action record', exact: true })).toBeVisible();
  await navigate(page, 'Components'); await navigate(page, 'Guided demo');
  await expect(page.getByRole('button', { name: 'Simulate publish', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Inspect context', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Check simulated action record', exact: true }).click();
  await expect(page.getByText('Retained local receipts (1)', { exact: true })).toBeVisible();
  await navigate(page, 'Overview'); await navigate(page, 'Guided demo');
  await expect(page.locator('.sc-guided .tun-receipt')).toHaveCount(1);
  await page.getByRole('button', { name: 'Return to intent', exact: true }).click();
  await expect(page.getByText('Retained local receipts (1)', { exact: true })).toBeVisible();
});
test('pending work settles without stealing focus from another view', async ({ page }) => {
  await approval(page); await page.getByRole('button', { name: 'Simulate publish', exact: true }).click();
  await navigate(page, 'Components'); await expect(page.locator('[data-route="components"] [data-view-title]')).toBeFocused();
  await expect(page.locator('[data-route="demo"] #guided-step-title')).toHaveText('Receipt');
  await expect(page.locator('[data-route="components"] [data-view-title]')).toBeFocused();
  await navigate(page, 'Guided demo'); await expect(page.getByText('Retained local receipts (1)', { exact: true })).toBeVisible();
});
test('all fourteen components offer two read-only specimens', async ({ page }) => {
  await navigate(page, 'Components');
  for (const entry of componentCatalog) {
    await page.locator('.sc-component-menu button').filter({ hasText: entry.name }).click();
    await expect(page.locator('#component-title')).toHaveText(entry.name);
    for (const variant of ['standard', 'edge']) {
      await page.getByRole('combobox', { name: 'Example state', exact: true }).selectOption(variant);
      await expect(page.locator('.sc-specimen > .tun-component')).toHaveCount(1);
      await expectBadgeText(page.locator('.sc-specimen'));
      for (const control of await page.locator('.sc-specimen button').all()) await expect(control).toBeDisabled();
    }
  }
});
test('component search and groups have an honest empty state', async ({ page }) => {
  await navigate(page, 'Components'); await page.getByRole('searchbox').fill('memory');
  await expect(page.locator('#component-title')).toHaveText('Memory Indicator');
  await expect(page.locator('.sc-component-menu button')).toHaveCount(1);
  await page.getByRole('combobox', { name: 'Component group', exact: true }).selectOption('Supervision & recovery');
  await expect(page.getByRole('heading', { name: 'No matching components.' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(page.locator('.sc-component-menu button')).toHaveCount(14);
});
test('trust lab preserves acknowledged requests while navigating', async ({ page }) => {
  await navigate(page, 'Trust & control');
  const lab = page.locator('#supervision');
  await lab.getByRole('button', { name: 'Request stop', exact: true }).click();
  await expect(lab.locator('.tun-override')).toContainText('result not confirmed');
  await navigate(page, 'Overview'); await navigate(page, 'Trust & control');
  await expect(lab.getByRole('button', { name: 'Request stop', exact: true })).toBeDisabled();
  await lab.getByRole('button', { name: 'Advance simulated worker', exact: true }).click();
  await expect(lab.locator('.tun-override')).toContainText('Stop confirmed');
  await lab.getByRole('button', { name: 'Request compensation', exact: true }).click();
  await lab.getByRole('button', { name: 'Advance simulated worker', exact: true }).click();
  await expect(lab.locator('.tun-recovery')).toContainText('Compensation confirmed — not undo');
});
for (const theme of ['light', 'dark']) test(`showcase journeys and explorer ${theme} at 320px`, async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(theme);
  await approval(page); await noAxeViolations(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath(`guided-${theme}-320.png`), fullPage: true });
  await navigate(page, 'Components'); await page.getByRole('searchbox').fill('SourceView'); await noAxeViolations(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath(`explorer-${theme}-320.png`), fullPage: true });
  await navigate(page, 'Trust & control'); await noAxeViolations(page);
});
test('skip link, reduced motion, and no page errors', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.keyboard.press('Tab'); await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.locator('#showcase-main')).toBeFocused();
  await navigate(page, 'Guided demo');
  expect(await page.getByRole('button', { name: 'Inspect context', exact: true }).evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
  await navigate(page, 'Trust & control'); expect(errors).toEqual([]);
});
test('static HTML contains sharing metadata and deployable assets', async ({ request }) => {
  const response = await request.get('/'); const html = await response.text();
  expect(html).toContain('og:image'); expect(html).toContain('summary_large_image'); expect(html).toContain('<noscript>');
  const icon = await request.get('/favicon.svg'); expect(icon.ok()).toBe(true); expect(await icon.text()).toContain('<svg');
  const image = await request.get('/social-card.png'); expect(image.ok()).toBe(true);
  const bytes = await image.body(); expect(bytes.subarray(1, 4).toString()).toBe('PNG');
  expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
});

// Complement axe/contrast checks with the visible non-color badge contract.
test.afterEach(async ({ page }) => { await expectBadgeText(page); });
