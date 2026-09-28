import { expect, test } from '@playwright/test';

test('button color pairs switch atomically when enabled in both themes', async ({ page }) => {
  for (const theme of ['light', 'dark']) {
    await page.goto('/?lab=1');
    await page.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(theme);
    await page.getByRole('button', { name: 'Prepare plan', exact: true }).click();
    const create = page.getByRole('button', { name: 'Create proposal', exact: true });
    await expect(create).toBeDisabled();
    expect(await create.evaluate(el => getComputedStyle(el).transitionProperty)).toBe('none');
    await page.getByRole('button', { name: 'Review approach', exact: true }).click();
    await expect(create).toBeEnabled();
    const colors = await create.evaluate(el => {
      const style = getComputedStyle(el);
      const luminance = (color: string) => {
        const channels = (color.match(/\d+(?:\.\d+)?/g) ?? []).slice(0, 3).map(Number);
        if (channels.length !== 3) throw new Error('Expected an opaque computed RGB color');
        const linear = channels.map(value => {
          const s = value / 255;
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        });
        return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722;
      };
      const foreground = luminance(style.color), background = luminance(style.backgroundColor);
      return { transition: style.transitionProperty,
        ratio: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05) };
    });
    expect(colors.transition).toBe('none');
    expect(colors.ratio).toBeGreaterThanOrEqual(4.5);
  }
});
