import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ComponentSpecimen } from '../examples/react/ComponentExplorer.js';
import { componentCatalog } from '../examples/react/showcase-catalog.js';
describe('read-only public component specimens', () => {
  for (const item of componentCatalog) for (const edge of [false, true]) {
    it(`${item.symbol} ${edge ? 'edge' : 'standard'} renders without requesting work`, () => {
      // Any callback activation throws; rendering must stay side-effect free.
      const html = renderToStaticMarkup(<ComponentSpecimen name={item.symbol} edge={edge} />);
      expect(html).toContain('tun-component'); expect(html).not.toContain('<script>');
      if (['IntentComposer', 'ApprovalGate', 'HumanOverride', 'RecoveryControl'].includes(item.symbol)) expect(html).toContain('disabled');
    });
  }
  it('does not present unsupported confidence as confirmed', () => expect(renderToStaticMarkup(<ComponentSpecimen name="UncertaintySignal" edge />)).toContain('Unknown'));
  it('does not expose restricted source quotations', () => expect(renderToStaticMarkup(<ComponentSpecimen name="SourceView" edge />)).not.toContain('<blockquote'));
});
