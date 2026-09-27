#!/usr/bin/env python3
"""Build/check TUN's typed token subset using only the Python standard library.
Not a complete DTCG validator or an accessibility audit. Python 3.10+.
"""
from __future__ import annotations
import argparse
import json
import math
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'tokens/tokens.json'
CSS = ROOT / 'styles/tun.css'
REPORT = ROOT / 'docs/TOKEN-VALIDATION-v0.1.md'
TYPES = {'color', 'dimension', 'fontFamily', 'fontWeight', 'number', 'duration', 'cubicBezier'}
STATES = {
    'agent': dict(idle='neutral', listening='info', thinking='info', planning='info',
                  waiting='warning', acting='info', verifying='info', blocked='warning',
                  completed='success', failed='danger', escalated='warning'),
    'approval': dict(awaiting='warning', approved='info', rejected='neutral',
                     expired='warning', superseded='neutral'),
    'consequence': dict(C0='neutral', C1='neutral', C2='info', C3='warning', C4='danger'),
    'uncertainty': dict(U0='neutral', U1='neutral', U2='warning', U3='warning'),
    'memory': dict(M0='neutral', M1='neutral', M2='info', M3='info'),
    'tool': dict(idle='neutral', active='info', waiting='warning', completed='success', failed='danger'),
}

def require(ok: bool, message: str) -> None:
    if not ok:
        raise ValueError(message)

def numeric(v: Any) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v)

def flatten(node: dict, prefix: str = '', inherited: str | None = None) -> dict:
    require(isinstance(node, dict), f'{prefix}: expected object')
    typ = node.get('$type', inherited)
    if '$value' in node:
        require(bool(prefix) and typ in TYPES, f'{prefix}: missing/unsupported type {typ}')
        require(all(k.startswith('$') for k in node), f'{prefix}: token also contains a group')
        return {prefix: (typ, node['$value'])}
    result = {}
    for key, child in node.items():
        if key.startswith('$'):
            continue
        require(re.fullmatch(r'[A-Za-z0-9-]+', key) is not None, f'Invalid TUN name: {key}')
        result.update(flatten(child, f'{prefix}.{key}'.lstrip('.'), typ))
    return result

def resolve(tokens: dict, path: str, trail: tuple = ()) -> tuple:
    require(path in tokens, f'Missing alias target: {path}')
    require(path not in trail, f'Alias cycle: {" -> ".join((*trail, path))}')
    typ, value = tokens[path]
    if isinstance(value, str) and value.startswith('{'):
        require(re.fullmatch(r'\{[^{}]+\}', value) is not None, f'{path}: malformed alias')
        target_type, value = resolve(tokens, value[1:-1], (*trail, path))
        require(typ == target_type, f'{path}: alias type mismatch')
    return typ, value

def validate_value(path: str, typ: str, value: Any) -> None:
    if typ == 'color':
        require(isinstance(value, dict) and value.get('colorSpace') == 'srgb', f'{path}: expected sRGB color')
        parts = value.get('components', [])
        require(isinstance(parts, list) and len(parts) == 3 and all(numeric(x) and 0 <= x <= 1 for x in parts), f'{path}: invalid color channels')
        require(numeric(value.get('alpha', 1)) and value.get('alpha', 1) == 1, f'{path}: this exporter only supports opaque colors')
        hexx = value.get('hex', '')
        require(re.fullmatch(r'#[0-9a-fA-F]{6}', hexx) is not None, f'{path}: hex fallback required by TUN')
        require(all(round(x * 255) == int(hexx[i:i+2], 16) for x, i in zip(parts, (1, 3, 5))), f'{path}: hex/components disagree')
    elif typ in ('dimension', 'duration'):
        units = ('px', 'rem') if typ == 'dimension' else ('ms', 's')
        require(isinstance(value, dict) and value.get('unit') in units and numeric(value.get('value')) and value['value'] >= 0, f'{path}: invalid {typ}')
    elif typ in ('number', 'fontWeight'):
        require(numeric(value), f'{path}: expected finite number')
        if typ == 'fontWeight':
            require(1 <= value <= 1000, f'{path}: invalid font weight')
    elif typ == 'fontFamily':
        require(isinstance(value, list) and bool(value) and all(isinstance(x, str) and x.strip() for x in value), f'{path}: expected non-empty font stack')
    elif typ == 'cubicBezier':
        require(isinstance(value, list) and len(value) == 4 and all(numeric(x) for x in value), f'{path}: invalid easing')
        require(0 <= value[0] <= 1 and 0 <= value[2] <= 1, f'{path}: easing x values must be in [0,1]')

def css_name(path: str) -> str:
    if path.startswith('theme.'):
        path = '.'.join(path.split('.')[2:])
    return '--tun-' + path.replace('.', '-').lower()

def css_value(typ: str, value: Any) -> str:
    if typ == 'color':
        return value['hex'].upper()
    if typ in ('dimension', 'duration'):
        return f'{value["value"]:g}{value["unit"]}'
    if typ == 'fontFamily':
        return ', '.join(x if re.fullmatch(r'[A-Za-z-]+', x) else json.dumps(x) for x in value)
    if typ == 'cubicBezier':
        return 'cubic-bezier(' + ', '.join(f'{x:g}' for x in value) + ')'
    return f'{value:g}'

def contrast(first: dict, second: dict) -> float:
    # Use the emitted 8-bit sRGB hex colors, rather than rounded source channels.
    def luminance(color: dict) -> float:
        channels = [int(color['hex'][i:i+2], 16) / 255 for i in (1, 3, 5)]
        linear = [c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in channels]
        return sum(c * w for c, w in zip(linear, (.2126, .7152, .0722)))
    a, b = sorted((luminance(first), luminance(second)))
    return (b + .05) / (a + .05)

def assess(tokens: dict) -> tuple[dict, list]:
    resolved = {p: resolve(tokens, p) for p in tokens}
    for p, (typ, value) in resolved.items():
        validate_value(p, typ, value)
    theme_paths = lambda theme: {p.removeprefix(f'theme.{theme}.') for p in tokens if p.startswith(f'theme.{theme}.')}
    require(theme_paths('light') == theme_paths('dark') and bool(theme_paths('light')), 'Theme coverage mismatch')
    rows = []
    for theme in ('light', 'dark'):
        paths = [p for p in tokens if not p.startswith('theme.') or p.startswith(f'theme.{theme}.')]
        require(len({css_name(p) for p in paths}) == len(paths), f'{theme}: CSS name collision')
        prefix = f'theme.{theme}.'
        def pair(category: str, fg: str, bg: str, threshold: float) -> None:
            ratio = contrast(resolved[prefix + fg][1], resolved[prefix + bg][1])
            require(ratio >= threshold, f'{theme} {fg} / {bg}: {ratio:.4f}:1 below {threshold}:1')
            rows.append((theme, category, fg, bg, ratio, threshold))
        for surface in ('canvas', 'panel', 'subtle'):
            for text in ('primary', 'secondary', 'muted', 'link'):
                pair('Text', f'text.{text}', f'surface.{surface}', 4.5)
            for indicator in ('focus.ring', 'border.control'):
                pair('Indicators', indicator, f'surface.{surface}', 3)
        for action in ('primary', 'danger'):
            for background in ('bg', 'hover'):
                pair('Actions', f'action.{action}.fg', f'action.{action}.{background}', 4.5)
        for tone in ('neutral', 'info', 'success', 'warning', 'danger'):
            pair('Status', f'status.{tone}.fg', f'status.{tone}.bg', 4.5)
            pair('Status borders', f'status.{tone}.border', f'status.{tone}.bg', 3)
            pair('Status borders', f'status.{tone}.border', 'surface.panel', 3)
        for family, entries in STATES.items():
            actual = {p.split('.')[-1] for p in tokens if p.startswith(prefix + f'state.{family}.')}
            require(actual == set(entries), f'{theme}: missing or unexpected {family} state')
            for name, tone in entries.items():
                path = f'state.{family}.{name}'
                require(resolved[prefix + path] == resolved[prefix + f'status.{tone}.fg'], f'{path}: update state mapping and docs together')
                pair('AI states', path, f'status.{tone}.bg', 4.5)
    return resolved, rows

def render_css(resolved: dict) -> str:
    common = [p for p in resolved if not p.startswith('theme.')]
    def block(selector: str, paths: list[str], extra: str = '') -> str:
        values = ''.join(f'  {css_name(p)}: {css_value(*resolved[p])};\n' for p in paths)
        return f'{selector} {{\n{extra}{values}}}\n'
    light = [p for p in resolved if p.startswith('theme.light.')]
    dark = [p for p in resolved if p.startswith('theme.dark.')]
    out = '/* Generated by python scripts/tokens.py build. Edit tokens/tokens.json, not this file. */\n'
    out += block(':root', common)
    out += block(':root, :root[data-tun-theme="light"]', light, '  color-scheme: light;\n')
    out += '@media (prefers-color-scheme: dark) {\n' + block(':root:not([data-tun-theme])', dark, '  color-scheme: dark;\n') + '}\n'
    out += block(':root[data-tun-theme="dark"]', dark, '  color-scheme: dark;\n')
    durations = [p for p in common if p.startswith('motion.duration.')]
    out += '@media (prefers-reduced-motion: reduce) {\n:root {\n' + ''.join(f'  {css_name(p)}: 0ms;\n' for p in durations) + '}\n}\n'
    return out

def render_report(tokens: dict, rows: list) -> str:
    out = '# TUN Token Validation v0.1\n\nGenerated by `python scripts/tokens.py build`.\n\n'
    out += f'**{len(tokens)} typed tokens; {len(rows)} declared contrast pairs; all checks passed.**\n\n'
    out += 'Checks cover alias resolution and cycles, supported value types, theme parity, CSS name collisions, required AI state coverage, and declared color pairings.\n\n'
    out += '| Theme | Category | Pairs | Lowest ratio | Required minimum |\n|---|---|---:|---:|---:|\n'
    for theme in ('light', 'dark'):
        for category in dict.fromkeys(r[1] for r in rows):
            group = [r for r in rows if r[0] == theme and r[1] == category]
            out += f'| {theme} | {category} | {len(group)} | {min(r[4] for r in group):.3f}:1 | {group[0][5]:g}:1 |\n'
    out += '\nRatios are tested before rounding. Text checks use 4.5:1; meaningful indicator/border checks use 3:1. Decorative `border.subtle` is deliberately not an input boundary.\n\n'
    out += 'This is a token-level test, not WCAG certification, a full DTCG validator, a screen-reader audit, or proof that every possible color combination is accessible. Test rendered products, keyboard behavior, zoom, reflow, forced colors, and assistive technologies separately.\n\n'
    out += 'Reference thresholds: [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).\n'
    return out

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', nargs='?', choices=('check', 'build'), default='check')
    args = parser.parse_args()
    try:
        tokens = flatten(json.loads(SOURCE.read_text(encoding='utf-8')))
        resolved, rows = assess(tokens)
        outputs = {CSS: render_css(resolved), REPORT: render_report(tokens, rows)}
        for path, content in outputs.items():
            if args.command == 'build':
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content, encoding='utf-8')
            else:
                require(path.exists() and path.read_text(encoding='utf-8') == content, f'{path.relative_to(ROOT)} is missing/stale; run build')
        print(f'PASS: {len(tokens)} tokens, {len(rows)} contrast pairs, both themes; {args.command} complete.')
        return 0
    except (ValueError, TypeError, KeyError, OSError) as exc:
        print(f'FAIL: {exc}', file=sys.stderr)
        return 1

if __name__ == '__main__':
    raise SystemExit(main())
