import { expect, test } from '@playwright/test';
import axe from 'axe-core';
test.beforeEach(async ({ page }) => { await page.goto('/'); });
test('approval produces only a simulated, verified receipt', async ({ page }) => {
  await expect(page.getByText('Local simulation only.')).toBeVisible();
  await page.getByRole('button', { name: 'Prepare proposal' }).click();
  await expect(page.getByText('No action receipt.')).toBeVisible();
  await page.getByRole('button', { name: 'Simulate publish' }).click();
  await expect(page.getByRole('heading', { name: 'Simulated publication' })).toBeVisible();
  await expect(page.getByText('Nothing was published, sent, or saved outside this page.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate publish' })).toBeDisabled();
});
test('rejection does not create a receipt', async ({ page }) => {
  await page.getByRole('button', { name: 'Prepare proposal' }).click();
  await page.getByRole('button', { name: 'Reject action' }).click();
  await expect(page.getByText('No action receipt.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate publish' })).toBeDisabled();
});
test('unconfirmed outcome fails closed', async ({ page }) => {
  await page.getByRole('button', { name: 'Prepare proposal' }).click();
  await page.getByLabel('Simulate an unconfirmed response').check();
  await page.getByRole('button', { name: 'Simulate publish' }).click();
  await expect(page.getByText(/Decision outcome is unknown/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate publish' })).toBeDisabled();
  await expect(page.getByText('No action receipt.')).toBeVisible();
});
test('keyboard focus remains visible and submission works', async ({ page }) => {
  await page.getByRole('textbox').focus();
  await page.keyboard.press('Tab');
  const button = page.getByRole('button', { name: 'Prepare proposal' });
  await expect(button).toBeFocused();
  expect(await button.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Reject action' })).toBeVisible();
});
test('320px layout has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.getByRole('button', { name: 'Prepare proposal' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('button', { name: 'Reject action' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate publish' })).toBeVisible();
});
test('reduced motion disables component transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.getByRole('button', { name: 'Prepare proposal' }).evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
});
for (const theme of ['light', 'dark']) {
  test(`${theme} theme passes the automated accessibility sample`, async ({ page }) => {
    await page.getByLabel('Theme').selectOption(theme);
    await expect(page.locator('html')).toHaveAttribute('data-tun-theme', theme);
    await page.getByRole('button', { name: 'Prepare proposal' }).click();
    await page.getByRole('button', { name: 'Simulate publish' }).click();
    await expect(page.getByRole('heading', { name: 'Simulated publication' })).toBeVisible();
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const engine = (window as unknown as { axe: { run(): Promise<{ violations: unknown[] }> } }).axe;
      return (await engine.run()).violations;
    });
    expect(violations).toEqual([]);
  });
}
