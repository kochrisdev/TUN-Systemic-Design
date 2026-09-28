import { StrictMode } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it } from 'vitest';
import { Showcase } from '../examples/react/Showcase.js';
beforeEach(() => { window.history.replaceState(null, '', '/'); delete document.documentElement.dataset.tunTheme; });
it('StrictMode does not steal initial overview focus', () => {
  render(<StrictMode><Showcase /></StrictMode>);
  expect(document.activeElement).toBe(document.body);
  expect(document.title).toContain('Interactive AI Product Design System');
});
it('the first tab reaches the skip link and Enter moves into content', async () => {
  const user = userEvent.setup(); render(<StrictMode><Showcase /></StrictMode>);
  await user.tab(); expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveFocus();
  await user.keyboard('{Enter}'); expect(screen.getByRole('main')).toHaveFocus();
});
it('an actual route change updates the title and focuses its heading', () => {
  render(<StrictMode><Showcase /></StrictMode>);
  act(() => { window.history.replaceState(null, '', '/#components'); window.dispatchEvent(new HashChangeEvent('hashchange')); });
  expect(document.title).toContain('Component Explorer');
  expect(screen.getByRole('heading', { name: 'One language. Fourteen building blocks.' })).toHaveFocus();
});
