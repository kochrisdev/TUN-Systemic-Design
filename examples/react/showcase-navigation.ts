/** Hash navigation is presentation only. It never approves, executes, or resets a task. */
export const showcaseViews = ['overview', 'demo', 'components', 'trust'] as const;
export type ShowcaseView = typeof showcaseViews[number];
export function showcaseView(hash: string): ShowcaseView {
  const value = hash.replace(/^#/, '').toLowerCase();
  if (value === 'supervision') return 'trust';
  return showcaseViews.includes(value as ShowcaseView) ? value as ShowcaseView : 'overview';
}
export const showcaseLinks = {
  repository: 'https://github.com/kochrisdev/TUN-Systemic-Design',
  documentation: 'https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/README.md',
  specification: 'https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/docs/SPECIFICATION-v0.1.md',
  source: 'https://github.com/kochrisdev/TUN-Systemic-Design/blob/main/',
} as const;
