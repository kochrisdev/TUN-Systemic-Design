import { describe, expect, it } from 'vitest';
import { componentCatalog, filterCatalog } from '../examples/react/showcase-catalog.js';
import { showcaseLinks, showcaseView } from '../examples/react/showcase-navigation.js';
describe('public showcase routing', () => {
  it.each([['', 'overview'], ['#overview', 'overview'], ['#demo', 'demo'], ['#components', 'components'], ['#trust', 'trust'], ['#supervision', 'trust'], ['#DEMO', 'demo'], ['#unknown', 'overview'], ['#execute', 'overview']])('%s maps only to a view', (hash, result) => expect(showcaseView(hash)).toBe(result));
  it('never encodes task input or authority in its links', () => { for (const link of Object.values(showcaseLinks)) expect(link).toMatch(/^https:\/\/github\.com\/kochrisdev\/TUN-Systemic-Design/); });
});
describe('canonical component catalog', () => {
  it('contains fourteen unique components, each with two named examples', () => {
    expect(componentCatalog).toHaveLength(14);
    expect(new Set(componentCatalog.map(item => item.symbol)).size).toBe(14);
    for (const item of componentCatalog) { expect(item.states).toHaveLength(2); expect(item.boundary.length).toBeGreaterThan(20); expect(item.guide).toMatch(/\.md/); }
  });
  it('empty filters show all components', () => expect(filterCatalog('', 'All groups')).toHaveLength(14));
  it('supports case-insensitive names', () => expect(filterCatalog('MEMORY', 'All groups').map(item => item.symbol)).toEqual(['MemoryIndicator']));
  it('supports exported symbols', () => expect(filterCatalog('ApprovalGate', 'All groups').map(item => item.symbol)).toEqual(['ApprovalGate']));
  it('scopes groups without inventing components', () => expect(filterCatalog('', 'Supervision & recovery')).toHaveLength(4));
  it('combines search and group filters', () => expect(filterCatalog('memory', 'Supervision & recovery')).toHaveLength(0));
  it('unknown searches are empty, not fabricated results', () => expect(filterCatalog('does-not-exist', 'All groups')).toHaveLength(0));
});
