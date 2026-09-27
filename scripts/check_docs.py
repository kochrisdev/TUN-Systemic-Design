#!/usr/bin/env python3
"""Offline checks for TUN's Markdown subset; not a full CommonMark parser.

Checks local inline/reference/quoted-HTML links, Markdown heading fragments,
and fenced-code balance. Skips remote URLs and code. Never fetches the network
or executes document examples. Run from any directory with Python 3.10+.
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


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    if not args.root.is_dir():
        parser.error('--root must be an existing repository directory')
    errors, count, links = check(args.root)
    if not count:
        errors.append('No Markdown files found; refusing to report a successful check.')
    for error in errors:
        print(error, file=sys.stderr)
    print(f'{"FAIL" if errors else "PASS"}: {count} Markdown files; {links} local link occurrences; {len(errors)} errors.')
    return 1 if errors else 0


if __name__ == '__main__':
    raise SystemExit(main())
