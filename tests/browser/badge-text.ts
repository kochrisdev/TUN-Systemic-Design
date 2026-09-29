import { expect, type Locator, type Page } from '@playwright/test';

/** Inspect rendered badges, including those below the fold. Inactive/closed views
 * are checked when opened. CSS-generated content, icons, aria-label and hidden
 * text cannot substitute for a visible text label. Exact meaning is tested by
 * the component state fixtures, not inferred by this generic check. */
export async function inspectBadgeText(root: Page | Locator) {
  return root.locator('.tun-badge').evaluateAll(elements => {
    const normalize = (value: string) => value.replace(/\p{Cf}/gu, '').replace(/\s+/g, ' ').trim();
    const transparent = (color: string) => color === 'transparent' || /^rgba\([^)]*,\s*0(?:\.0+)?\s*\)$/.test(color) || /\/\s*0(?:\.0+)?%?\s*\)$/.test(color);
    const labels: string[] = [];
    const failures: { index: number; text: string; reason: string }[] = [];
    let checked = 0;
    elements.forEach((badge, index) => {
      // display:none (including inactive routes) and closed <details> do not
      // present a badge. The explorer tests assert badge counts independently.
      if (!badge.getClientRects().length || badge.closest('[hidden]')) return;
      checked++;
      const bounds = badge.getBoundingClientRect();
      const walker = document.createTreeWalker(badge, NodeFilter.SHOW_TEXT);
      const pieces: string[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (!normalize(node.textContent ?? '')) continue;
        const parent = node.parentElement;
        if (!parent || parent.closest('svg, script, style, template, noscript, [aria-hidden="true"], [hidden]')) continue;
        const range = document.createRange(); range.selectNodeContents(node);
        let rects = [...range.getClientRects()].map(r => ({ left: Math.max(r.left, bounds.left), right: Math.min(r.right, bounds.right), top: Math.max(r.top, bounds.top), bottom: Math.min(r.bottom, bounds.bottom) }));
        let visible = true;
        for (let ancestor: Element | null = parent; ancestor; ancestor = ancestor.parentElement) {
          const style = getComputedStyle(ancestor);
          if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) === 0 || parseFloat(style.fontSize) === 0) { visible = false; break; }
          // Common clipped screen-reader-only labels have no visible text area.
          if ((style.clip !== 'auto' && /rect\(0px[, ]+0px[, ]+0px[, ]+0px\)/.test(style.clip)) || /inset\(50%\)/.test(style.clipPath)) { visible = false; break; }
          if (/(hidden|clip|scroll|auto)/.test(style.overflowX + ' ' + style.overflowY)) {
            const clip = ancestor.getBoundingClientRect();
            rects = rects.map(r => ({ left: Math.max(r.left, clip.left), right: Math.min(r.right, clip.right), top: Math.max(r.top, clip.top), bottom: Math.min(r.bottom, clip.bottom) }));
          }
        }
        const style = getComputedStyle(parent);
        if (transparent(style.color) || transparent(style.getPropertyValue('-webkit-text-fill-color'))) visible = false;
        if (visible && rects.some(r => r.right - r.left > 1 && r.bottom - r.top > 1)) pieces.push(node.textContent ?? '');
      }
      const label = normalize(pieces.join(' '));
      labels.push(label);
      if (!/\p{L}/u.test(label) || /^(?:[CUM]\d|\d+)(?:[\s·,:/\-]+(?:[CUM]\d|\d+))*$/i.test(label)) {
        failures.push({ index, text: normalize(badge.textContent ?? '').slice(0, 120), reason: 'Badge needs visible descriptive text, not only color, an icon, an accessible-name attribute, or a state code.' });
      }
    });
    return { checked, labels, failures };
  });
}

export async function expectBadgeText(root: Page | Locator): Promise<void> {
  const result = await inspectBadgeText(root);
  expect(result.failures, 'Every rendered .tun-badge must have non-color descriptive text').toEqual([]);
}
