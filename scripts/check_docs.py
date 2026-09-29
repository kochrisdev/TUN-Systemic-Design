#!/usr/bin/env python3
"""Offline checks for TUN's Markdown subset and source-derived component inventory.

Checks local inline/reference/quoted-HTML links, Markdown heading fragments,
fenced-code balance, and current implementation declarations against index.ts.
Skips remote URLs and document code. Never fetches the network or executes
examples. --sync-components updates only the declared count and inventory sites.
Run from any directory with Python 3.10+.
"""
from __future__ import annotations

import argparse
import html
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

EXCLUDED = {'.git', 'node_modules', 'dist', 'artifacts', 'coverage',
            'playwright-report', 'test-results', '__pycache__', '.venv', 'venv'}
FENCE = re.compile(r'^ {0,3}(`{3,}|~{3,})(.*)$')
INLINE = re.compile(r'!?\[[^\]\n]*\]\(\s*(<[^>\n]*>|[^\s)]+)(?:\s+["\'][^\n]*?["\'])?\s*\)')
DEFINITION = re.compile(r'^ {0,3}\[([^\]]+)\]:\s*(<[^>\n]*>|\S+)')
REFERENCE = re.compile(r'!?\[([^\]\n]+)\]\[([^\]\n]*)\]')
HTML_LINK = re.compile(r'\b(?:href|src)=["\']([^"\']+)["\']', re.I)
HTML_ID = re.compile(r'\b(?:id|name)=["\']([^"\']+)["\']', re.I)


def prose(text: str) -> tuple[list[str], list[str]]:
    """Replace fences/comments with blank lines without shifting line numbers."""
    text = re.sub(r'<!--[\s\S]*?-->', lambda m: '\n' * m[0].count('\n'), text)
    lines, errors = [], []
    opening: tuple[str, int, int] | None = None
    for number, line in enumerate(text.splitlines(), 1):
        match = FENCE.match(line)
        if opening:
            if match and match[1][0] == opening[0] and len(match[1]) >= opening[1] and not match[2].strip():
                opening = None
            lines.append('')
        elif match:
            opening = (match[1][0], len(match[1]), number)
            lines.append('')
        else:
            lines.append(line)
    if opening:
        errors.append(f'{opening[2]}: unclosed code fence')
    return lines, errors


def heading_ids(lines: list[str]) -> set[str]:
    """GitHub-style IDs for the ordinary ATX headings used by this project."""
    seen: set[str] = set()
    for line in lines:
        seen.update(HTML_ID.findall(line))
        match = re.match(r'^ {0,3}#{1,6}\s+(.+?)\s*#*\s*$', line)
        if not match:
            continue
        title = re.sub(r'!?(\[([^\]]+)\])\([^)]*\)', r'\2', match[1])
        title = re.sub(r'<[^>]*>', '', html.unescape(title))
        title = title.replace('`', '').replace('*', '')
        stem = re.sub(r'[^\w\- ]', '', title.lower()).replace(' ', '-')
        candidate, suffix = stem, 0
        while candidate in seen:
            suffix += 1
            candidate = f'{stem}-{suffix}'
        seen.add(candidate)
    return seen


def markdown_files(root: Path) -> list[Path]:
    return sorted(p for p in root.rglob('*.md')
                  if not any(part in EXCLUDED for part in p.relative_to(root).parts))


def check(root: Path) -> tuple[list[str], int, int]:
    root = root.resolve()
    files = markdown_files(root)
    errors: list[str] = []
    documents: dict[Path, list[str]] = {}
    anchors: dict[Path, set[str]] = {}
    checked = 0
    for path in files:
        try:
            lines, problems = prose(path.read_text(encoding='utf-8'))
        except (OSError, UnicodeError) as exc:
            errors.append(f'{path.relative_to(root)}: cannot read Markdown ({type(exc).__name__})')
            continue
        documents[path.resolve()] = lines
        anchors[path.resolve()] = heading_ids(lines)
        errors.extend(f'{path.relative_to(root)}:{problem}' for problem in problems)
    for path, lines in documents.items():
        refs: dict[str, str] = {}
        for line in lines:
            match = DEFINITION.match(line)
            if match:
                refs[' '.join(match[1].split()).casefold()] = match[2].strip('<>')
        for number, line in enumerate(lines, 1):
            label = f'{path.relative_to(root)}:{number}'
            definition = DEFINITION.match(line)
            # Do not interpret a documented example inside an inline code span.
            clean = re.sub(r'(`+).*?\1', '', line)
            targets = [m[1].strip('<>') for m in INLINE.finditer(clean)]
            targets += HTML_LINK.findall(clean)
            if definition:
                targets.append(definition[2].strip('<>'))
            else:
                for match in REFERENCE.finditer(clean):
                    key = ' '.join((match[2] or match[1]).split()).casefold()
                    if key not in refs:
                        errors.append(f'{label}: undefined link reference [{key}]')
                    else:
                        targets.append(refs[key])
            for target in targets:
                target = html.unescape(target)
                try:
                    parsed = urlsplit(target)
                except ValueError:
                    errors.append(f'{label}: malformed link {target!r}')
                    continue
                if parsed.scheme or parsed.netloc:
                    continue  # External/custom schemes are deliberately not checked.
                if not parsed.path:
                    dest = path
                else:
                    name = unquote(parsed.path)
                    dest = ((root / name.lstrip('/')) if name.startswith('/') else (path.parent / name)).resolve()
                try:
                    dest.relative_to(root)
                except ValueError:
                    errors.append(f'{label}: link escapes repository: {target}')
                    continue
                checked += 1
                if not dest.exists():
                    errors.append(f'{label}: missing local target: {target}')
                elif parsed.fragment and dest.suffix.lower() == '.md':
                    if unquote(parsed.fragment) not in anchors.get(dest, set()):
                        errors.append(f'{label}: missing Markdown fragment: {target}')
    return errors, len(files), checked


# These are CURRENT implementation declarations, not historical test reports or
# the normative number of design patterns. Keep their prose outside the matched
# count untouched. Missing/ambiguous declarations fail rather than skip coverage.
COMPONENT_INDEX = Path('packages/react/src/index.ts')
NUMBER = r'(?P<count>[0-9]+|[A-Za-z]+)'
COMPONENT_CLAIMS = {
    'README.md': re.compile(r'\*\*' + NUMBER + r' React components\*\*'),
    'docs/SPECIFICATION-v0.1.md': re.compile(
        r'^\*\*Implementation:\*\* ' + NUMBER + r' (?:reference )?React components\b', re.M),
    'docs/STATUS-AND-ROADMAP.md': re.compile(
        r'\*\*Current milestone:\*\* ' + NUMBER + r'-component foundation\b'),
    'docs/SCOPE.md': re.compile(
        r'^The repository includes ' + NUMBER + r' reference React components\b', re.M),
}
NUMBER_WORDS = ('zero one two three four five six seven eight nine ten eleven '
                'twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty').split()
# Helper/type barrels are deliberately explicit: a new barrel needs review so it
# cannot hide component exports from the inventory. This list is not a count.
CONTRACT_MODULES = {'./contracts.js', './review-contracts.js',
                    './evidence-contracts.js', './supervision-contracts.js'}
TS_COMMENTS = re.compile(r"'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\"|//[^\n]*|/\*[\s\S]*?\*/")
REEXPORT = re.compile(
    r"export\s+(?P<type>type\s+)?(?P<items>\{[^{}]*\}|\*)\s+from\s*"
    r"(?P<quote>['\"])(?P<module>[^'\"]+)(?P=quote)\s*;", re.S)
EXPORT_ITEM = re.compile(r'(?P<type>type\s+)?(?P<local>[A-Za-z_$][\w$]*)(?:\s+as\s+(?P<public>[A-Za-z_$][\w$]*))?')
MATRIX = re.compile(
    r'(?m)^\| Design component \| React symbol \| Source \|\n'
    r'^\|---\|---\|---\|\n(?P<rows>(?:^\|[^\n]*\|\n)+)')


def within(root: Path, path: Path) -> Path:
    resolved = path.resolve()
    if not resolved.is_relative_to(root.resolve()):
        raise ValueError('component documentation path escapes repository')
    return resolved


def public_components(root: Path) -> list[tuple[str, str]]:
    """Read TUN's explicit named TSX re-exports; never execute TypeScript.

    This is a deliberately narrow entry-point grammar, not a TypeScript parser.
    Reject unsupported syntax/barrels rather than silently undercount exports.
    """
    root = root.resolve()
    entry = within(root, root / COMPONENT_INDEX)
    text = entry.read_text(encoding='utf-8')
    text = TS_COMMENTS.sub(lambda m: ' ' if m[0].startswith(('//', '/*')) else m[0], text)
    text = re.sub(r"^\s*(['\"])use client\1\s*;", '', text)
    components: list[tuple[str, str]] = []
    names: set[str] = set()
    position = 0
    while text[position:].strip():
        position += len(text[position:]) - len(text[position:].lstrip())
        match = REEXPORT.match(text, position)
        if not match:
            raise ValueError(f'{COMPONENT_INDEX}: unsupported entry-point syntax; use explicit named component re-exports')
        position = match.end()
        target = match['module']
        if not re.fullmatch(r'\./[A-Za-z0-9_/-]+\.js', target):
            raise ValueError(f'{COMPONENT_INDEX}: unsupported module path {target!r}')
        stem = entry.parent / target[:-3]
        candidates = [within(root, stem.with_suffix(extension)) for extension in ('.tsx', '.ts')]
        sources = [path for path in candidates if path.is_file()]
        if len(sources) != 1:
            raise ValueError(f'{COMPONENT_INDEX}: expected one TS/TSX source for {target}')
        source = sources[0]
        if source.suffix == '.ts' and target not in CONTRACT_MODULES:
            raise ValueError(f'{COMPONENT_INDEX}: unreviewed helper/barrel {target}; export components directly from their TSX modules')
        if match['items'] == '*':
            if source.suffix == '.tsx' and not match['type']:
                raise ValueError(f'{COMPONENT_INDEX}: wildcard component export {target}; name each component explicitly')
            continue
        entries = match['items'][1:-1].split(',')
        if entries and not entries[-1].strip():
            entries.pop()  # A trailing comma is valid; empty intermediate items are not.
        for item in entries:
            specifier = EXPORT_ITEM.fullmatch(item.strip())
            if not specifier:
                raise ValueError(f'{COMPONENT_INDEX}: unsupported export item {item!r}')
            if match['type'] or specifier['type']:
                continue
            name = specifier['public'] or specifier['local']
            if source.suffix != '.tsx':
                continue
            if not re.fullmatch(r'[A-Z][A-Za-z0-9]*', name):
                raise ValueError(f'{COMPONENT_INDEX}: TSX value export {name!r} must name a PascalCase component')
            if name in names:
                raise ValueError(f'{COMPONENT_INDEX}: duplicate component export {name}')
            names.add(name)
            components.append((name, source.relative_to(root).as_posix()))
    if not components:
        raise ValueError(f'{COMPONENT_INDEX}: no public components found; refusing an empty inventory')
    return components


def component_label(name: str) -> str:
    name = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1 \2', name)
    return re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', name)


def component_row(name: str, path: str) -> str:
    return f'| {component_label(name)} | {name} | [Implemented](../{path}) |'


def number_value(text: str) -> int | None:
    if text.isdecimal():
        return int(text)
    return NUMBER_WORDS.index(text.lower()) if text.lower() in NUMBER_WORDS else None


def format_number(number: int, original: str) -> str:
    # Preserve existing editorial casing and words; use digits above twenty.
    if original.isdecimal() or number >= len(NUMBER_WORDS):
        return str(number)
    word = NUMBER_WORDS[number]
    return word.title() if original.istitle() else word


def check_components(root: Path, sync: bool = False) -> tuple[list[str], int, int]:
    """Check four declared count sites and the complete roadmap matrix.

    Explicit sync repairs valid, uniquely located sites. Plan all changes first;
    missing files, unsupported exports or ambiguous sites cause no writes.
    Returns errors, source export count, and files written.
    """
    root = root.resolve()
    try:
        components = public_components(root)
        total = len(components)
        updated: dict[Path, str] = {}
        drift: list[str] = []
        for name, pattern in COMPONENT_CLAIMS.items():
            path = within(root, root / name)
            content = path.read_text(encoding='utf-8')
            # Use comment/code-free lines so an example cannot masquerade as a declaration.
            visible = re.sub(r'(`+).*?\1', '', '\n'.join(prose(content)[0]))
            matches = list(pattern.finditer(content))
            if len(matches) != 1 or len(list(pattern.finditer(visible))) != 1:
                raise ValueError(f'{name}: expected exactly one current component-count declaration')
            match = matches[0]
            if number_value(match['count']) != total:
                drift.append(f'{name}: component count {match["count"]!r}; index.ts exports {total}')
                content = content[:match.start('count')] + format_number(total, match['count']) + content[match.end('count'):]
            updated[path] = content
        roadmap = within(root, root / 'docs/STATUS-AND-ROADMAP.md')
        content = updated[roadmap]
        tables = list(MATRIX.finditer(content))
        if len(tables) != 1 or len(list(MATRIX.finditer('\n'.join(prose(content)[0]) + '\n'))) != 1:
            raise ValueError('docs/STATUS-AND-ROADMAP.md: expected exactly one canonical component matrix')
        table = tables[0]
        actual = table['rows'].splitlines()
        expected = [component_row(name, path) for name, path in components]
        # Keep intentional presentation order if names, labels and paths agree.
        if sorted(actual) != sorted(expected):
            drift.append('docs/STATUS-AND-ROADMAP.md: component matrix differs from index.ts names, labels or source paths')
            updated[roadmap] = content[:table.start('rows')] + '\n'.join(expected) + '\n' + content[table.end('rows'):]
        if not sync:
            return drift, total, 0
        written = 0
        for path, content in updated.items():
            if path.read_text(encoding='utf-8') != content:
                path.write_text(content, encoding='utf-8')
                written += 1
        return [], total, written
    except (OSError, UnicodeError, ValueError) as exc:
        return [f'Component documentation: {exc}'], 0, 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--sync-components', action='store_true',
                        help='Update current component declarations and roadmap matrix from index.ts, then check documentation')
    args = parser.parse_args()
    if not args.root.is_dir():
        parser.error('--root must be an existing repository directory')
    component_errors, components, written = check_components(args.root, sync=args.sync_components)
    errors, count, links = check(args.root)
    errors.extend(component_errors)
    if not count:
        errors.append('No Markdown files found; refusing to report a successful check.')
    if args.sync_components:
        print(f'Component documentation: {written} file(s) updated from {components} public exports.')
    for error in errors:
        print(error, file=sys.stderr)
    if component_errors:
        print('Repair source/declaration errors, then run python scripts/check_docs.py --sync-components and review the diff.', file=sys.stderr)
    print(f'{"FAIL" if errors else "PASS"}: {count} Markdown files; {links} local link occurrences; {components} component exports; {len(errors)} errors.')
    return 1 if errors else 0


if __name__ == '__main__':
    raise SystemExit(main())
