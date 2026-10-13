// @vitest-environment node
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const css = 'a { color: red; }';
const flatMap = {
  version: 3, sources: ['original.css'], sourcesContent: [css], names: [], mappings: 'AAAA',
};
function indexed(line: number | string, map: object = flatMap) {
  return { version: 3, sections: [{ offset: { line, column: 0 }, map }] };
}

describe('PostCSS source-map security (GHSA-68fv-2mgg-jv7q)', () => {
  // Parse only: a vulnerable install must fail the assertions without expanding
  // the attacker-controlled line gap or blocking the test process.
  for (const delivery of ['previous map', 'inline annotation'] as const) {
    it.each([
      ['oversized line offset', indexed(1e12)],
      ['oversized cumulative nested offsets', indexed(6e6, indexed(6e6))],
      ['string line offset', indexed('1')],
      ['fractional line offset', indexed(1.5)],
    ])(`rejects %s via ${delivery}`, (_name, map) => {
      const json = JSON.stringify(map);
      const parse = () => delivery === 'previous map'
        ? postcss.parse(css, { from: 'input.css', map: { prev: json } })
        : postcss.parse(`${css}\n/*# sourceMappingURL=data:application/json;base64,${Buffer.from(json).toString('base64')} */`, { from: 'input.css' });
      expect(parse).toThrow(/Section offset/);
    });
  }

  it('preserves CSS and source content with a valid flat map', () => {
    const result = postcss().process(css, {
      from: 'input.css', to: 'output.css',
      map: { prev: JSON.stringify(flatMap), inline: false, annotation: false },
    });
    expect(result.css).toBe(css);
    expect(result.map?.toJSON().sources).toEqual(['original.css']);
    expect(result.map?.toJSON().sourcesContent).toEqual([css]);
    expect(result.map?.toJSON().mappings).not.toBe('');
  });

  it('parses valid indexed maps without changing the CSS or source identity', () => {
    const root = postcss.parse(css, { from: 'input.css', map: { prev: JSON.stringify(indexed(0)) } });
    expect(root.toString()).toBe(css);
    expect(root.source?.input.map?.consumer().sources).toEqual(['original.css']);
  });
});
