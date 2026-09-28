import { expect, test, type Page } from '@playwright/test';
import axe from 'axe-core';
async function prepare(page: Page) {
  await page.getByRole('button', { name: 'Prepare plan' }).click();
  await page.getByRole('button', { name: 'Review approach', exact: true }).click();
  await page.getByRole('button', { name: 'Create proposal', exact: true }).click();
}
async function openReview(page: Page) {
  await prepare(page);
  await page.getByRole('button', { name: 'Review action', exact: true }).click();
}
test.beforeEach(async ({ page }) => { await page.goto('/'); });
test('approval produces only a simulated verified receipt', async ({ page }) => {
  await expect(page.getByText('Local simulation only.')).toBeVisible();
  await openReview(page);
  await expect(page.getByText('No action receipt.')).toBeVisible();
  await page.getByRole('button', { name: 'Simulate publish' }).click();
  await expect(page.getByRole('heading', { name: 'Simulated publication' })).toBeVisible();
  await expect(page.getByText('Nothing was published, sent, or saved outside this page.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate publish' })).toBeDisabled();
});
test('rejection creates no receipt', async ({ page }) => {
  await openReview(page);
  await page.getByRole('button', { name: 'Reject action' }).click();
  await expect(page.getByText('No action receipt.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate publish' })).toBeDisabled();
});
test('unconfirmed outcome fails closed', async ({ page }) => {
  await openReview(page);
  await page.getByLabel('Simulate an unconfirmed response').check();
  await page.getByRole('button', { name: 'Simulate publish' }).click();
  await expect(page.getByText(/Decision outcome is unknown/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate publish' })).toBeDisabled();
  await expect(page.getByText('No action receipt.')).toBeVisible();
});
test('keyboard focus and review navigation are visible', async ({ page }) => {
  await page.getByRole('textbox').focus();
  await page.keyboard.press('Tab');
  const prepareButton = page.getByRole('button', { name: 'Prepare plan' });
  await expect(prepareButton).toBeFocused();
  expect(await prepareButton.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Review approach', exact: true }).focus(); await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Create proposal', exact: true }).focus(); await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Review action', exact: true }).focus(); await page.keyboard.press('Enter');
  const region = page.locator('[aria-label="Action approval review"]');
  await expect(region).toBeFocused();
  expect(await region.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
  await expect(page.getByRole('button', { name: 'Reject action' })).toBeVisible();
});
test('320px layout preserves details and has no horizontal overflow', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 900 }); await openReview(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('button', { name: 'Reject action' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate publish' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true });
});
test('reduced motion disables component transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.getByRole('button', { name: 'Prepare plan' }).evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
});
for (const theme of ['light', 'dark']) {
  test(`${theme} theme passes review and receipt accessibility samples`, async ({ page }, testInfo) => {
    await page.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(theme);
    await expect(page.locator('html')).toHaveAttribute('data-tun-theme', theme);
    await openReview(page); await page.addScriptTag({ content: axe.source });
    const violations = () => page.evaluate(async () => {
      const engine = (window as unknown as { axe: { run(): Promise<{ violations: unknown[] }> } }).axe;
      return (await engine.run()).violations;
    });
    expect(await violations()).toEqual([]);
    await page.getByRole('button', { name: 'Simulate publish' }).click();
    await expect(page.getByRole('heading', { name: 'Simulated publication' })).toBeVisible();
    expect(await violations()).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`${theme}.png`), fullPage: true });
  });
}
test('approach review and proposal viewing do not authorize actions', async ({ page }) => {
  await page.getByRole('button', { name: 'Prepare plan' }).click();
  await page.getByRole('button', { name: 'Review approach', exact: true }).click();
  await expect(page.getByText('No proposal yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Create proposal', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Simulate publish' })).toHaveCount(0);
  await expect(page.getByText('No action receipt.')).toBeVisible();
  await page.getByRole('button', { name: 'Review action', exact: true }).click();
  await expect(page.getByText('No action receipt.')).toBeVisible();
});
test('context distinguishes available from used sources', async ({ page }) => {
  await expect(page.getByText('Not used', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Prepare plan' }).click();
  await expect(page.getByText('Used for this task', { exact: true })).toBeVisible();
});
for (const availability of ['missing', 'restricted', 'stale']) {
  test(`${availability} context supersedes the earlier review`, async ({ page }) => {
    await openReview(page); await page.getByLabel('Notes availability').selectOption(availability);
    await expect(page.getByRole('button', { name: 'Simulate publish' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Review action', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Prepare plan' })).toBeDisabled();
    await expect(page.getByText('No action receipt.')).toBeVisible();
  });
}
test('revised plan requires a fresh proposal and action review', async ({ page }) => {
  await openReview(page);
  const first = await page.locator('.tun-proposal .tun-caption').last().textContent();
  await page.getByRole('button', { name: 'Revise plan', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Create proposal', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Simulate publish' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Review approach', exact: true }).click();
  await page.getByRole('button', { name: 'Create proposal', exact: true }).click();
  expect(await page.locator('.tun-proposal .tun-caption').last().textContent()).not.toBe(first);
  await page.getByRole('button', { name: 'Review action', exact: true }).click();
  await expect(page.locator('.tun-approval')).toContainText('Scope reminder');
  await expect(page.getByText('No action receipt.')).toBeVisible();
});
test('unknown outcome blocks mutation until record reconciliation', async ({ page }) => {
  await openReview(page); await page.getByLabel('Simulate an unconfirmed response').check();
  await page.getByRole('button', { name: 'Simulate publish' }).click();
  const reconcile = page.getByRole('button', { name: 'Check simulated action record' });
  await expect(reconcile).toBeVisible();
  for (const name of ['Prepare plan', 'Revise plan', 'Create proposal']) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled();
  await expect(page.getByLabel('Notes availability')).toBeDisabled();
  await reconcile.click();
  await expect(page.getByRole('heading', { name: 'Simulated publication' })).toBeVisible();
  await expect(page.getByText(/1 record\(s\) retained/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate publish' })).toHaveCount(0);
});
test('long unbroken content wraps on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 }); await page.getByRole('textbox').fill('x'.repeat(1000)); await openReview(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.locator('.tun-approval .tun-preview')).toContainText('x'.repeat(1000));
});
test('source disclosure opens using the keyboard', async ({ page }) => {
  const summary = page.getByText('Inspect Supplied project notes', { exact: true }); await summary.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.tun-context details')).toHaveAttribute('open', '');
  await expect(page.locator('.tun-context details p')).toBeVisible();
});
test('verified receipts are retained when context changes', async ({ page }) => {
  await openReview(page); await page.getByRole('button', { name: 'Simulate publish' }).click();
  await expect(page.getByRole('heading', { name: 'Simulated publication' })).toBeVisible();
  await page.getByLabel('Notes availability').selectOption('missing');
  await expect(page.getByRole('heading', { name: 'Simulated publication' })).toBeVisible();
  await expect(page.getByText(/1 record\(s\) retained/)).toBeVisible();
});
