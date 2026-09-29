import { expect, test } from '@playwright/test';
import { expectBadgeText, inspectBadgeText } from './badge-text.js';

test('visible inert badges still require visible text', async ({ page }) => {
  await page.setContent('<style>.tun-badge{display:inline-block;min-width:30px;min-height:20px;border:1px solid}</style><section inert><p class="tun-badge"></p></section>');
  let result = await inspectBadgeText(page);
  expect(result.checked).toBe(1);
  expect(result.failures).toHaveLength(1);
  await page.locator('.tun-badge').evaluate(el => { el.textContent = 'Waiting for approval'; });
  result = await inspectBadgeText(page);
  expect(result.checked).toBe(1);
  expect(result.labels).toEqual(['Waiting for approval']);
  await expectBadgeText(page);
});
