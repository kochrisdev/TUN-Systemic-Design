#!/usr/bin/env python3
"""Audit both npm dependency graphs, retain reports, and fail on any finding/error.

Uses the configured npm registry. No installs, fixes, or lockfile edits are made.
Run with Python 3.10+ after npm ci. Reports are written under artifacts/.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import shutil
import subprocess
import sys
from typing import Callable

SEVERITIES = ('info', 'low', 'moderate', 'high', 'critical')
MODES = (
    ('full', 'dependency-audit.json', ('--include=dev', '--include=optional', '--include=peer')),
    ('runtime', 'dependency-audit-runtime.json', ('--omit=dev', '--include=optional', '--include=peer')),
)


def unique_object(pairs: list[tuple[str, object]]) -> dict:
    result: dict = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('Duplicate audit JSON key')
        result[key] = value
    return result


def audit_counts(raw: str) -> dict[str, int]:
    """Validate npm's v2 audit summary instead of treating missing data as zero."""
    report = json.loads(raw, object_pairs_hook=unique_object)
    if not isinstance(report, dict) or report.get('auditReportVersion') != 2 or 'error' in report:
        raise ValueError('Missing, unsupported, or error audit report')
    metadata = report.get('metadata')
    counts = metadata.get('vulnerabilities') if isinstance(metadata, dict) else None
    expected = set(SEVERITIES) | {'total'}
    if not isinstance(counts, dict) or set(counts) != expected:
        raise ValueError('Incomplete audit severity summary')
    if any(type(counts[key]) is not int or counts[key] < 0 for key in expected):
        raise ValueError('Invalid audit severity count')
    if counts['total'] != sum(counts[key] for key in SEVERITIES):
        raise ValueError('Inconsistent audit severity total')
    return counts


def output_text(value: str | bytes | None) -> str:
    return value.decode('utf-8', errors='replace') if isinstance(value, bytes) else value or ''


def run_audits(root: Path, npm: str, runner: Callable = subprocess.run) -> dict:
    """Always attempt both audits; aggregate their failure without suppressing it."""
    root = root.resolve()
    artifacts = root / 'artifacts'
    artifacts.mkdir(parents=True, exist_ok=True)
    summary_path = artifacts / 'dependency-audit-summary.json'
    summary = {
        'schema_version': 1,
        'started_at': datetime.now(timezone.utc).isoformat(),
        'threshold': 'info',
        'status': 'not-passed',
        'audits': [],
    }
    # Invalidate an earlier successful summary before making registry requests.
    summary_path.write_text(json.dumps(summary, indent=2) + '\n', encoding='utf-8')
    for name, filename, flags in MODES:
        command = [npm, 'audit', '--json', '--audit-level=info', *flags]
        raw, stderr, code, failure = '', '', None, None
        try:
            result = runner(command, cwd=root, capture_output=True, text=True, timeout=120, shell=False)
            raw, stderr, code = result.stdout, result.stderr, result.returncode
        except subprocess.TimeoutExpired as exc:
            raw, stderr = output_text(exc.stdout), output_text(exc.stderr)
            failure = 'Audit timed out; registry result unavailable.'
        except OSError:
            failure = 'Audit process could not start.'
        # Replace both outputs even on failures; no previous result is reused.
        (artifacts / filename).write_text(raw or '{}\n', encoding='utf-8')
        (artifacts / filename.replace('.json', '.stderr.txt')).write_text(stderr, encoding='utf-8')
        counts = None
        try:
            counts = audit_counts(raw)
        except (ValueError, TypeError):
            failure = failure or 'Audit did not return a complete npm v2 severity summary.'
        if code != 0:
            failure = failure or 'npm audit returned a nonzero exit status.'
        if counts is not None and counts['total']:
            failure = failure or 'Known vulnerabilities were reported.'
        summary['audits'].append({
            'scope': name, 'command': command[1:], 'report': filename,
            'exit_code': code, 'counts': counts,
            'status': 'failed' if failure else 'passed', 'reason': failure,
        })
    summary['status'] = 'passed' if all(a['status'] == 'passed' for a in summary['audits']) else 'not-passed'
    summary['finished_at'] = datetime.now(timezone.utc).isoformat()
    summary_path.write_text(json.dumps(summary, indent=2) + '\n', encoding='utf-8')
    return summary


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args(argv)
    root = args.root.resolve()
    if not (root / 'package-lock.json').is_file():
        parser.error('--root must contain the committed package-lock.json')
    npm = shutil.which('npm')
    # A missing executable is handled as two failed audits, preserving artifacts.
    try:
        summary = run_audits(root, npm or 'npm')
    except OSError:
        print('FAIL: unable to persist dependency audit artifacts.', file=sys.stderr)
        return 1
    for audit in summary['audits']:
        total = audit['counts']['total'] if audit['counts'] is not None else 'unavailable'
        print(f"{audit['scope']}: {audit['status']}; findings={total}; npm exit={audit['exit_code']}")
    print('Reports: artifacts/dependency-audit{,-runtime,-summary}.json')
    return 0 if summary['status'] == 'passed' else 1


if __name__ == '__main__':
    raise SystemExit(main())
