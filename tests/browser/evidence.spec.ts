import { expect, test } from '@playwright/test';
import axe from 'axe-core';

test.beforeEach(async ({ page }) => { await page.goto('/'); });
test('task memory and evidence reflect use without granting approval', async ({ page }) => {
  const region = page.getByRole('region', { name: 'Evidence for the current task', exact: true });
  await expect(region.locator('.tun-memory')).toContainText('not used for this task');
  await expect(region.locator('.tun-evidence')).toContainText('Partial evidence');
  await page.getByRole('button', { name: 'Prepare plan', exact: true }).click();
  await expect(region.locator('.tun-memory')).toContainText('Session context — in use');
  await expect(region.locator('.tun-evidence')).toContainText('Evidence checked — application reported');
  await region.getByRole('button', { name: 'Inspect memory' }).click();
  await expect(region.getByText(/Inspection opened/)).toBeVisible();
  await expect(page.getByText('No action receipt.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate publish', exact: true })).toHaveCount(0);
});
test('restricted context removes current evidence text and resets inspection', async ({ page }) => {
  await page.getByRole('button', { name: 'Prepare plan', exact: true }).click();
  const region = page.getByRole('region', { name: 'Evidence for the current task', exact: true });
  await region.getByRole('button', { name: 'Inspect memory' }).click();
  await page.getByLabel('Notes availability', { exact: true }).selectOption('restricted');
  await expect(region.locator('.tun-evidence')).toContainText('Evidence unavailable');
  await expect(region.locator('blockquote')).toHaveCount(0);
  await expect(region.getByRole('button', { name: 'Inspect memory' })).toHaveCount(0);
  await expect(region.getByText(/Inspection opened/)).toHaveCount(0);
});
test('example fixtures distinguish conflict, generated interpretation and inaccessible sources', async ({ page }) => {
  const examples = page.getByRole('region', { name: 'Evidence and memory examples', exact: true });
  await examples.getByText('Explore example states', { exact: true }).click();
  await examples.getByLabel('Example evidence', { exact: true }).selectOption('conflicting');
  await expect(examples.locator('.tun-evidence')).toContainText('Contrary synthetic note');
  await expect(examples.locator('.tun-uncertainty')).toContainText('U3 · Unknown');
  await examples.getByLabel('Example evidence', { exact: true }).selectOption('generated');
  await expect(examples.locator('.tun-evidence')).toContainText('Generated interpretation — not source text');
  await expect(examples.locator('blockquote')).toHaveCount(0);
  await examples.getByLabel('Example evidence', { exact: true }).selectOption('unavailable');
  await expect(examples.locator('.tun-evidence')).toContainText('Evidence unavailable');
  await expect(page.getByText('No action receipt.', { exact: true })).toBeVisible();
});
test('memory examples never establish persistent storage or execution', async ({ page }) => {
  const examples = page.getByRole('region', { name: 'Evidence and memory examples', exact: true });
  const disclosure = examples.getByText('Explore example states', { exact: true });
  await disclosure.focus(); await page.keyboard.press('Enter');
  await expect(examples.locator('details')).toHaveAttribute('open', '');
  for (const mode of ['M1', 'M2', 'M3', 'unavailable', 'M0']) {
    await examples.getByLabel('Example memory', { exact: true }).selectOption(mode);
    await expect(examples.locator('.tun-memory')).toContainText('No persistent-memory service is connected.');
  }
  await expect(examples.locator('.tun-memory')).toContainText('No AI memory used for this task');
  await expect(page.getByRole('button', { name: 'Simulate publish', exact: true })).toHaveCount(0);
});
for (const theme of ['light', 'dark']) {
  test(`${theme} evidence states pass accessibility and 320px reflow samples`, async ({ page }, testInfo) => {
    await page.getByLabel('Theme', { exact: true }).selectOption(theme);
    await page.getByRole('button', { name: 'Prepare plan', exact: true }).click();
    const examples = page.getByRole('region', { name: 'Evidence and memory examples', exact: true });
    await examples.getByText('Explore example states', { exact: true }).click();
    await examples.getByLabel('Example evidence', { exact: true }).selectOption('conflicting');
    await examples.getByLabel('Example memory', { exact: true }).selectOption('M2');
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => (await (window as any).axe.run()).violations);
    expect(violations).toEqual([]);
    await page.setViewportSize({ width: 320, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await examples.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`evidence-${theme}-320.png`), fullPage: true });
  });
}
