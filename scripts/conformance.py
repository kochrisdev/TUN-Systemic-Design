#!/usr/bin/env python3
"""Check/build a component-and-threat view of the canonical conformance manifest.

Adapts the contributed check/build interface without introducing another rule
inventory or test runner. Standard library only; no network or test execution.
"""
from __future__ import annotations

import argparse
from collections import Counter
import html
import os
from pathlib import Path
import re
import sys
import tempfile

import check_conformance as core
import check_docs as docs

RELATIONS = 'conformance/relations.json'
TARGET = 'docs/CONFORMANCE-MATRIX.md'
THREATS = {
    'docs/THREAT-MODEL.md': ('TM-[0-9]{2,}', '4-stride-threat-register'),
    'docs/MISREPRESENTATION-THREATS.md': ('TM-M-[1-9][0-9]*', None),
}
OWNERS = {'ui': 'P', 'host': 'H', 'shared': 'P/H', 'product-review': 'D'}


def string_list(value, label: str) -> list[str]:
    if not isinstance(value, list) or any(not isinstance(v, str) or not v for v in value):
        raise core.Invalid(f'{label}: an array of nonempty strings is required')
    if len(value) != len(set(value)):
        raise core.Invalid(f'{label}: duplicate values')
    return value


def threat_targets(root: Path) -> dict[str, str]:
    """Only table definitions count, not mentions in prose, comments or fences."""
    targets: dict[str, str] = {}
    for file, (pattern, section_anchor) in THREATS.items():
        lines, errors = docs.prose(core.local(root, file).read_text(encoding='utf-8'))
        if errors:
            raise core.Invalid(f'{file}: {errors[0]}')
        anchors = docs.heading_ids(lines)
        if section_anchor and section_anchor not in anchors:
            raise core.Invalid(f'{file}: missing threat-register heading')
        definition = re.compile(r'^\|\s*(?:<a id="([^"]+)"></a>)?\*\*(' + pattern + r')(?=\s|\*\*)')
        count = 0
        for line in lines:
            found = definition.match(line)
            if not found:
                continue
            explicit, tid = found.groups()
            if tid in targets:
                raise core.Invalid(f'{file}: duplicate threat definition {tid}')
            if explicit and explicit != tid:
                raise core.Invalid(f'{tid}: mismatched threat anchor')
            anchor = section_anchor or tid
            if not section_anchor and (explicit != tid or tid not in anchors):
                raise core.Invalid(f'{tid}: missing explicit threat anchor')
            targets[tid] = file + '#' + anchor
            count += 1
        if not count:
            raise core.Invalid(f'{file}: no threat table definitions found')
    return targets


def load(root: Path) -> tuple[dict, dict, list[tuple[str, str]], dict[str, str]]:
    # Reuse the existing strict inventory, exact source text/strength checks,
    # unique file::title bindings and canonical matrix drift check.
    manifest = core.load_manifest(root)
    if core.local(root, core.MATRIX).read_text(encoding='utf-8') != core.render_matrix(manifest, root):
        raise core.Invalid('Canonical traceability drift: run check_conformance.py --write-matrix after review')
    relations = core.read_json(core.local(root, RELATIONS))
    core.keys(relations, {'schema_version', 'source', 'rules'}, RELATIONS)
    if type(relations['schema_version']) is not int or relations['schema_version'] != 1:
        raise core.Invalid('Unsupported relations schema version')
    if relations['source'] != core.MANIFEST:
        raise core.Invalid('Relations must reference the canonical manifest')
    if not isinstance(relations['rules'], list):
        raise core.Invalid('Relations rules must be an array')
    components = docs.public_components(root)
    names = {name for name, _ in components}
    threats = threat_targets(root)
    ids = {rule['id'] for rule in manifest['rules']}
    seen: set[str] = set()
    for row in relations['rules']:
        # No second copy of text, owner, status, tests or run results is allowed.
        allowed = {'id', 'components', 'threats'}
        if isinstance(row, dict) and 'note' in row: allowed.add('note')
        core.keys(row, allowed, 'Relation')
        rid = core.text(row['id'], 'Relation ID')
        if rid not in ids or rid in seen:
            raise core.Invalid(f'{rid}: unknown or duplicate canonical rule ID')
        seen.add(rid)
        associated = string_list(row['components'], f'{rid} components')
        if '*' in associated and associated != ['*']:
            raise core.Invalid(f'{rid}: wildcard must stand alone')
        if set(associated) - names - {'*'}:
            raise core.Invalid(f'{rid}: unknown public component')
        if set(string_list(row['threats'], f'{rid} threats')) - set(threats):
            raise core.Invalid(f'{rid}: unknown threat definition')
        if 'note' in row: core.text(row['note'], f'{rid} association scope')
    if seen != ids:
        raise core.Invalid(f'Missing relations for: {", ".join(sorted(ids - seen))}')
    return manifest, relations, components, threats


def escape(value: str) -> str:
    """Keep hand-authored text inert and preserve Markdown table boundaries."""
    return html.escape(value, quote=False).replace('|', '&#124;').replace('`', '&#96;').replace('\n', '<br>')


def render(manifest: dict, relations: dict, components: list[tuple[str, str]], threats: dict[str, str]) -> str:
    rows = {r['id']: r for r in relations['rules']}
    counts = Counter(r['coverage'] for r in manifest['rules'])
    out = ['# TUN component and threat conformance matrix', '',
        '<!-- Generated by python scripts/conformance.py build; do not edit. -->', '',
        '[Assessment guide](../conformance/README.md) · [Canonical traceability](../conformance/TRACEABILITY.md) · [Threat model](THREAT-MODEL.md) · [Misrepresentation](MISREPRESENTATION-THREATS.md) · [Reconciliation decisions](ATTACHMENT-RECONCILIATION.md)', '',
        '## 1. Purpose and sources', '',
        'Find which components surface a rule and which threats it relates to. [spec-v0.1.json](../conformance/spec-v0.1.json) remains the sole source of requirement IDs, complete wording, normative strength, responsibility, coverage and executable test mappings. [relations.json](../conformance/relations.json) adds associations only. A component association does not assert that the component enforces the whole rule.', '',
        f"**{len(manifest['rules'])} canonical mandatory statements · {len(components)} public components · {len(core.mapped_tests(manifest))} distinct canonical test IDs.**", '',
        '## 2. Responsibility, coverage and assessment', '',
        '**P** = presentation; **H** = host; **P/H** = shared presentation/host responsibility; **D** = design/product review. These labels are derived from canonical ownership, not independently maintained.', '',
        '`partial`, `manual` and `gap` are canonical coverage states, not passed-run or conformance outcomes. D requirements still need assessment; neither absent code nor absent tests makes a rule not-applicable. A scoped declaration assesses every applicable rule, including D. Keep exceptions and justified non-applicability explicit in the assessment guide.', '',
        '| Coverage | Statements |', '|---|---|']
    out.extend(f'| {state} | {counts[state]} |' for state in ('partial', 'manual', 'gap'))
    out += ['', '## 3. Requirement associations', '',
        'Test IDs below are source mappings, not fresh results. Full assertion scope and remaining review are retained in the canonical manifest. A threat association explains relevance, not a claim that the threat is eliminated.', '',
        '| Rule | Strength | Complete normative statement | Owner / coverage | Components | Canonical test IDs | Threats | Association scope |',
        '|---|---|---|---|---|---|---|---|']
    paths = dict(components)
    for rule in manifest['rules']:
        rid = rule['id']; row = rows[rid]
        linked = f'[{rid}](../conformance/TRACEABILITY.md#{rid})'
        comps = 'Library-wide' if row['components'] == ['*'] else '<br>'.join(f'[{c}](../{paths[c]})' for c in row['components']) or 'No single component'
        test_ids = '<br>'.join(f"<code>{escape(m['test_id'])}</code>" for m in rule['automated']) or 'Remaining assessment in manifest'
        threat_links = '<br>'.join(f'[{t}]({threats[t].removeprefix("docs/")})' for t in row['threats']) or 'No specific association asserted'
        out.append(f"| {linked} | {' / '.join(rule['strength'])} | {escape(rule['text'])} | {OWNERS[rule['owner']]} / {rule['coverage']} | {comps} | {test_ids} | {threat_links} | {escape(row.get('note', '')) or '—'} |")
    out += ['', '## 4. Component-first lookup', '',
        'Library-wide associations apply to every export and do not imply a badge or enforcement implementation in each component.', '',
        '| Component | Associated canonical rules |', '|---|---|']
    for component, path in components:
        linked = [f'[{r["id"]}](../conformance/TRACEABILITY.md#{r["id"]})' for r in manifest['rules'] if component in rows[r['id']]['components'] or rows[r['id']]['components'] == ['*']]
        out.append(f'| [{component}](../{path}) | {", ".join(linked) or "No component-specific association recorded"} |')
    out += ['', '## 5. Check, regenerate and collect evidence', '',
        '```sh', 'python scripts/conformance.py check', 'python scripts/conformance.py build', 'python scripts/check_conformance.py --run', '```', '',
        '`check` is read-only: it reuses the strict canonical checker, resolves component exports and threat definitions, and fails on view drift. `build` validates first and writes only this generated view; it does not modify the specification or canonical matrix. For a changed canonical mapping, first use `python scripts/check_conformance.py --write-matrix`, review its diff, then rebuild this view.', '',
        'Only the separate `--run` command executes mapped Vitest tests and collects fresh results. [Badge/browser evidence](BADGE-ACCESSIBILITY.md) and [host-integration evidence](../examples/host-integration/TRACEABILITY.md) remain separately scoped reports, not extra Vitest mappings or product-wide passes.', '',
        'Standalone SHOULD/MAY requirements, semantic review of association quality, multi-runner evidence ingestion and product sign-off remain separate work. See the [attachment review](ATTACHMENT-RECONCILIATION.md) for why the supplied alternative inventory was reconciled rather than substituted.', '']
    return '\n'.join(out)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', nargs='?', choices=('check', 'build'), default='check')
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args(argv)
    root = args.root.resolve()
    try:
        data = load(root)
        expected = render(*data)
        if (root / 'docs').is_symlink() or (root / TARGET).is_symlink():
            raise core.Invalid('Generated view may not be a symlink or use a symlinked directory')
        target = core.local(root, TARGET)
        if args.command == 'build':
            target.parent.mkdir(parents=True, exist_ok=True)
            # Validate everything before opening the output, then replace atomically.
            temp = None
            try:
                with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', newline='\n', dir=target.parent, delete=False) as stream:
                    temp = Path(stream.name); stream.write(expected)
                os.replace(temp, target)
            finally:
                if temp and temp.exists(): temp.unlink()
        if not target.is_file() or target.read_text(encoding='utf-8') != expected:
            raise core.Invalid('Component/threat matrix drift: review relations then run scripts/conformance.py build')
        print(f'PASS: {len(data[0]["rules"])} canonical relations; {len(data[2])} component exports; component/threat view current.')
        return 0
    except (ValueError, OSError, UnicodeError) as exc:
        print(f'FAIL: conformance relations: {exc}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
