#!/usr/bin/env python3
"""Validate TUN requirement traceability; --run collects fresh mapped-test evidence.

Standard-library-only checking. --run uses the repository's installed Vitest.
No specification edits, package installation, network access or shell execution.
"""
from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

SPEC = 'docs/SPECIFICATION-v0.1.md'
MANIFEST = 'conformance/spec-v0.1.json'
MATRIX = 'conformance/TRACEABILITY.md'
REPORT = 'artifacts/conformance-results.json'
STRENGTH = re.compile(r'\bMUST(?: NOT)?\b')
ID = re.compile(r'SPEC-(\d+(?:\.\d+)?)-\d{3}')
# These two sentences discuss the requirement vocabulary rather than issue a
# new instruction. Match exact text: an unfamiliar MUST sentence is not ignored.
MENTIONS = {
    ('31', 'A scoped, self-assessed claim that all applicable MUST and MUST NOT requirements of an identified revision are satisfied.'),
    ('31', 'An applicable unmet MUST prevents this claim for that scope.'),
}
TOKEN = re.compile(r'''(?P<comment>//[^\n]*|/\*[\s\S]*?\*/)|(?P<string>'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(?P<word>[A-Za-z_$][\w$]*)|(?P<symbol>[^\s])''')


class Invalid(ValueError):
    """An invalid source, mapping or result; never a passing assessment."""


def normalize(text: str) -> str:
    return ' '.join(text.split())


def local(root: Path, name: str) -> Path:
    if not isinstance(name, str) or not name or '\\' in name:
        raise Invalid('Expected a repository-relative POSIX path')
    relative = Path(name)
    if relative.is_absolute() or '..' in relative.parts:
        raise Invalid(f'Unsafe repository path: {name}')
    result = (root / relative).resolve()
    if not result.is_relative_to(root.resolve()):
        raise Invalid(f'Path escapes repository: {name}')
    return result


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise Invalid(f'Duplicate JSON key: {key}')
        result[key] = value
    return result


def read_json(path: Path):
    return json.loads(path.read_text(encoding='utf-8'), object_pairs_hook=unique_object)


def keys(value, expected: set[str], label: str):
    if not isinstance(value, dict) or set(value) != expected:
        raise Invalid(f'{label}: expected keys {sorted(expected)}')


def text(value, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise Invalid(f'{label}: nonempty text required')
    return value


def extract_requirements(markdown: str) -> list[dict]:
    """Inventory mandatory sentences in numbered sections >=3.

    Keep compound sentences intact; tests state which part they check. IDs are
    stored in the manifest, not regenerated from document order.
    """
    section, anchor = '', ''
    fence = None
    paragraph = []
    found = []
    markdown = re.sub(r'<!--[\s\S]*?-->', '', markdown)

    def flush():
        if not paragraph or not section or int(section.split('.')[0]) < 3:
            paragraph.clear()
            return
        for sentence in re.split(r'(?<=[.!?])\s+', normalize(' '.join(paragraph))):
            levels = list(dict.fromkeys(STRENGTH.findall(sentence)))
            if levels and (section, sentence) not in MENTIONS:
                found.append({'section': section, 'anchor': anchor, 'text': sentence, 'strength': levels})
        paragraph.clear()

    for line in markdown.splitlines():
        marker = re.match(r'^ {0,3}(`{3,}|~{3,})(.*)$', line)
        if fence:
            if marker and marker[1][0] == fence[0] and len(marker[1]) >= fence[1] and not marker[2].strip():
                fence = None
            continue
        if marker:
            flush()
            fence = (marker[1][0], len(marker[1]))
            continue
        heading = re.match(r'^#{1,6}\s+(.+?)\s*$', line)
        if heading:
            flush()
            numbered = re.match(r'(\d+(?:\.\d+)*)(?:\.|\s)\s*(.*)', heading[1])
            if numbered:
                section = numbered[1]
                anchor = re.sub(r'[^\w\- ]', '', heading[1].lower()).replace(' ', '-')
            continue
        if not line.strip():
            flush()
        else:
            paragraph.append(line.strip())
    flush()
    if fence:
        raise Invalid('Specification contains an unclosed code fence')
    if not found:
        raise Invalid('No mandatory specification requirements found')
    identities = [(r['section'], r['text']) for r in found]
    if len(set(identities)) != len(identities):
        raise Invalid('Duplicate mandatory sentence in a section; clarify its source identity')
    return found


def literal_titles(source: str) -> Counter:
    """Locate literal it/test declarations; ignore strings, templates and comments.

    This source locator is deliberately narrower than a TypeScript parser. Live
    collection below resolves unique file/title IDs and rejects skips/missing
    results, so declaration presence is never used as execution evidence.
    """
    tokens = [(m.lastgroup, m[0]) for m in TOKEN.finditer(source) if m.lastgroup != 'comment']
    titles = Counter()
    for i, (kind, value) in enumerate(tokens):
        if kind != 'word' or value not in {'it', 'test', 'describe', 'suite'}:
            continue
        tail = tokens[i + 1:]
        if len(tail) >= 2 and tail[0][1] == '.' and tail[1][1] in {'only', 'skip', 'todo'}:
            raise Invalid('Mapped test file has a focused/skipped declaration; use executable tests')
        if value not in {'it', 'test'} or len(tail) < 3 or tail[0][1] != '(' or tail[1][0] != 'string' or tail[2][1] != ',':
            continue
        literal = tail[1][1]
        if literal[0] == '`':
            continue  # Parameterized titles need a future collector adapter.
        # Only unescaped titles are eligible in this initial locator.
        if '\\' not in literal[1:-1]:
            titles[literal[1:-1]] += 1
    return titles


def load_manifest(root: Path) -> dict:
    manifest = read_json(local(root, MANIFEST))
    keys(manifest, {'schema_version', 'profile', 'specification', 'scope', 'rules'}, MANIFEST)
    if type(manifest['schema_version']) is not int or manifest['schema_version'] != 1:
        raise Invalid('Unsupported conformance schema version')
    if manifest['profile'] != 'reference-ui-v0.1' or manifest['specification'] != SPEC:
        raise Invalid('Unknown profile or specification')
    text(manifest['scope'], 'Profile scope')
    if not isinstance(manifest['rules'], list) or not manifest['rules']:
        raise Invalid('Nonempty rules array required')
    source_rules = extract_requirements(local(root, SPEC).read_text(encoding='utf-8'))
    expected = {(r['section'], r['text']): r for r in source_rules}
    seen_ids, seen_sources, tests = set(), set(), {}
    for rule in manifest['rules']:
        keys(rule, {'id', 'section', 'text', 'strength', 'owner', 'coverage', 'automated', 'review'}, 'Rule')
        rid = text(rule['id'], 'Rule ID')
        match = ID.fullmatch(rid)
        if not match or match[1] != rule['section'] or rid in seen_ids:
            raise Invalid(f'{rid}: invalid, duplicate, or section-mismatched ID')
        seen_ids.add(rid)
        key = (rule['section'], text(rule['text'], rid))
        if key not in expected or key in seen_sources:
            raise Invalid(f'{rid}: stale, duplicate or missing source sentence; review the specification change')
        seen_sources.add(key)
        if rule['strength'] != expected[key]['strength']:
            raise Invalid(f'{rid}: normative strength drift')
        if rule['owner'] not in {'ui', 'host', 'shared', 'product-review'}:
            raise Invalid(f'{rid}: unknown responsibility owner')
        if rule['coverage'] not in {'partial', 'manual', 'gap'}:
            raise Invalid(f'{rid}: coverage must be partial, manual or gap')
        if not isinstance(rule['automated'], list):
            raise Invalid(f'{rid}: automated must be an array')
        if bool(rule['automated']) != (rule['coverage'] == 'partial'):
            raise Invalid(f'{rid}: partial coverage requires mappings; manual/gap requires none')
        keys(rule['review'], {'procedure', 'evidence'}, f'{rid} review')
        text(rule['review']['procedure'], f'{rid} remaining review procedure')
        text(rule['review']['evidence'], f'{rid} required evidence')
        used = set()
        for mapping in rule['automated']:
            keys(mapping, {'test_id', 'proves'}, f'{rid} mapping')
            test_id = text(mapping['test_id'], f'{rid} test ID')
            text(mapping['proves'], f'{rid} assertion scope')
            if test_id in used or test_id.count('::') != 1:
                raise Invalid(f'{rid}: duplicate or malformed test ID')
            used.add(test_id)
            file, title = test_id.split('::')
            if not re.fullmatch(r'tests/[A-Za-z0-9_-]+\.test\.tsx?', file):
                raise Invalid(f'{test_id}: this profile supports Vitest tests/*.test.ts(x) only')
            if file not in tests:
                tests[file] = literal_titles(local(root, file).read_text(encoding='utf-8'))
            if tests[file][title] != 1:
                raise Invalid(f'{test_id}: expected one literal test declaration; found {tests[file][title]}')
    missing = set(expected) - seen_sources
    if missing:
        section, quote = sorted(missing)[0]
        raise Invalid(f'{len(missing)} uncatalogued mandatory requirement(s); section {section}: {quote}')
    return manifest


def mapped_tests(manifest: dict) -> list[str]:
    return sorted({m['test_id'] for r in manifest['rules'] for m in r['automated']})


def render_matrix(manifest: dict, root: Path) -> str:
    rules = manifest['rules']
    counts = Counter(r['coverage'] for r in rules)
    source = {(r['section'], r['text']): r for r in extract_requirements(local(root, SPEC).read_text(encoding='utf-8'))}
    out = ['# TUN v0.1 requirement traceability', '',
           '<!-- Generated by scripts/check_conformance.py --write-matrix. Edit spec-v0.1.json. -->', '',
           '[How to assess](README.md) · [Machine-readable mapping](spec-v0.1.json) · [Specification](../' + SPEC + ')', '',
           f"**{len(rules)} mandatory statements · {counts['partial']} partially mapped · {counts['manual']} manual review · {counts['gap']} explicit gaps · {len(mapped_tests(manifest))} distinct test IDs.**", '',
           'Each mapping records what its tests prove, the remaining assessment procedure and the evidence to retain in [spec-v0.1.json](spec-v0.1.json). This table is coverage, not a passing-test report. Run the mapped tests to collect fresh execution evidence.', '',
           '| Rule and source | Mandatory statement | Owner / coverage | Automated test IDs |',
           '|---|---|---|---|']
    for r in rules:
        anchor = source[(r['section'], r['text'])]['anchor']
        label = f'<a id="{r["id"]}"></a>[{r["id"]}](../{SPEC}#{anchor})'
        ids = '<br>'.join(f"`{v['test_id']}`" for v in r['automated']) or 'Review procedure in manifest'
        quote = r['text'].replace('|', '\\|')
        out.append(f"| {label} | {quote} | {r['owner']} / {r['coverage']} | {ids} |")
    out += ['', '## Assessment workflow', '',
            'Use the rule IDs to join execution results with the product review record. Complete the remaining procedure for each rule; record pass, fail, not-assessed or justified non-applicability for the declared product scope. See [the assessment guide](README.md#complete-a-scoped-product-assessment).', '']
    return '\n'.join(out)



def collect_results(manifest: dict, payload: dict) -> tuple[dict, list[str]]:
    """Join fresh Vitest file/title results to mappings; missing is not passed."""
    if not isinstance(payload, dict) or not isinstance(payload.get('testResults'), list):
        raise Invalid('Malformed Vitest JSON report')
    errors = []
    observed = {}
    for suite in payload['testResults']:
        if not isinstance(suite, dict) or not isinstance(suite.get('name'), str) or not isinstance(suite.get('assertionResults'), list):
            raise Invalid('Malformed Vitest test suite')
        file = suite['name'].replace('\\', '/')
        # Runner filenames may be absolute. Match only exact repo-relative suffixes
        # from the selected file set, rejecting ambiguous observations below.
        candidates = {tid.split('::')[0] for tid in mapped_tests(manifest)}
        matches = [f for f in candidates if file == f or file.endswith('/' + f)]
        if not matches:
            continue
        if len(matches) != 1:
            raise Invalid('Ambiguous test file in runner results')
        for assertion in suite['assertionResults']:
            if not isinstance(assertion, dict) or not isinstance(assertion.get('title'), str):
                raise Invalid('Malformed Vitest assertion result')
            key = matches[0] + '::' + assertion['title']
            observed.setdefault(key, []).append(assertion.get('status'))
    results = {}
    for test_id in mapped_tests(manifest):
        states = observed.get(test_id, [])
        if len(states) != 1:
            results[test_id] = 'missing' if not states else 'ambiguous'
        else:
            state = states[0]
            results[test_id] = state if state in {'passed', 'failed', 'skipped', 'pending', 'todo'} else 'unrecognized'
        if results[test_id] != 'passed':
            errors.append(f'{test_id}: {results[test_id]}')
    if payload.get('success') is not True:
        errors.append('Vitest did not report a successful suite run')
    assessment = []
    for rule in manifest['rules']:
        statuses = [results[m['test_id']] for m in rule['automated']]
        outcome = 'unassessed' if not statuses else ('passed' if all(s == 'passed' for s in statuses) else 'not-passed')
        assessment.append({'rule_id': rule['id'], 'automated_checks': outcome,
                           'coverage': rule['coverage'], 'remaining_review': rule['review'],
                           'conformance': 'unassessed'})
    return {'tests': results, 'rules': assessment}, errors


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def input_hashes(root: Path) -> dict:
    # Includes all source/configuration the current mapped suites can use, not just
    # their test files. Reports identify the evaluated content even in a dirty tree.
    paths = {SPEC, MANIFEST, 'scripts/check_conformance.py', 'package.json',
             'package-lock.json', 'vitest.config.ts', 'tsconfig.json'}
    for directory in ('packages/react', 'examples/react', 'tests'):
        base = root / directory
        for p in base.rglob('*'):
            if p.is_file() and not any(part in {'dist', 'node_modules', '__pycache__'} for part in p.relative_to(base).parts):
                paths.add(p.relative_to(root).as_posix())
    return {name: sha256(local(root, name)) for name in sorted(paths) if local(root, name).is_file()}


def run_evidence(root: Path, manifest: dict) -> tuple[dict, list[str]]:
    node = shutil.which('node')
    runner = local(root, 'node_modules/vitest/vitest.mjs')
    if not node or not runner.is_file():
        raise Invalid('Install the locked project dependencies first; --run requires local Node and Vitest')
    before = input_hashes(root)
    started = datetime.now(timezone.utc).isoformat()
    files = sorted({tid.split('::')[0] for tid in mapped_tests(manifest)})
    if not files:
        raise Invalid('No mapped tests to execute')
    with tempfile.TemporaryDirectory(prefix='tun-conformance-') as directory:
        output = Path(directory) / 'vitest.json'
        command = [node, str(runner), 'run', *files, '--reporter=json', '--outputFile=' + str(output)]
        completed = subprocess.run(command, cwd=root, capture_output=True, text=True, timeout=240)
        if not output.is_file():
            raise Invalid(f'Vitest produced no fresh JSON report (exit {completed.returncode})')
        raw = read_json(output)
        joined, errors = collect_results(manifest, raw)
        raw_sha = sha256(output)
    if completed.returncode:
        errors.append(f'Vitest exited with status {completed.returncode}')
    if before != input_hashes(root):
        errors.append('Source inputs changed during evaluation; discard this evidence and rerun')
    git = shutil.which('git')
    commit = subprocess.run([git, 'rev-parse', 'HEAD'], cwd=root, capture_output=True, text=True).stdout.strip() if git else ''
    report = {'schema_version': 1, 'profile': manifest['profile'], 'scope': manifest['scope'],
              'source_commit': commit if re.fullmatch(r'[a-f0-9]{40,64}', commit) else None,
              'started_at': started, 'finished_at': datetime.now(timezone.utc).isoformat(),
              'input_sha256': before, 'runner_report_sha256': raw_sha,
              'ci_run_id': os.environ.get('GITHUB_RUN_ID'),
              'node': subprocess.run([node, '--version'], capture_output=True, text=True, timeout=10).stdout.strip(),
              'vitest': read_json(local(root, 'node_modules/vitest/package.json')).get('version'),
              'runner_exit_code': completed.returncode, 'mapped_test_count': len(joined['tests']),
              'mapped_tests_passed': sum(s == 'passed' for s in joined['tests'].values()),
              'evidence_status': 'passed' if not errors else 'not-passed',
              'product_conformance': 'unassessed', **joined, 'errors': errors}
    return report, errors


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--write-matrix', action='store_true', help='Regenerate traceability Markdown from reviewed mappings')
    mode.add_argument('--run', action='store_true', help='Execute mapped Vitest files and write a fresh evidence report')
    args = parser.parse_args(argv)
    root = args.root.resolve()
    try:
        manifest = load_manifest(root)
        expected = render_matrix(manifest, root)
        matrix = local(root, MATRIX)
        if args.write_matrix:
            matrix.write_text(expected, encoding='utf-8')
        if not matrix.is_file() or matrix.read_text(encoding='utf-8') != expected:
            raise Invalid('Traceability matrix drift: review mappings then run --write-matrix')
        if args.run:
            report, errors = run_evidence(root, manifest)
            output = local(root, REPORT)
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
            print(f"Mapped test evidence: {report['mapped_tests_passed']}/{report['mapped_test_count']} passed; {REPORT}")
            if errors:
                raise Invalid('; '.join(errors))
        print(f"PASS: {len(manifest['rules'])} mandatory statements; {len(mapped_tests(manifest))} mapped test IDs; traceability checked.")
        return 0
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError, subprocess.SubprocessError) as exc:
        if args.run:
            # A failed attempt must not leave a previous success at the current-report path.
            try:
                output = local(root, REPORT)
                if not output.is_file() or 'report' not in locals():
                    output.parent.mkdir(parents=True, exist_ok=True)
                    output.write_text(json.dumps({'schema_version': 1, 'evidence_status': 'not-passed',
                        'product_conformance': 'unassessed', 'errors': [str(exc)]}, indent=2) + '\n', encoding='utf-8')
            except (Invalid, OSError):
                pass
        print(f'FAIL: conformance evidence: {exc}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
