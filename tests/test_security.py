"""Security-maintenance regressions. All audit responses are synthetic; no network."""
from contextlib import redirect_stdout, redirect_stderr
import importlib.util
import io
import json
from pathlib import Path
import re
import subprocess
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('audit_dependencies', ROOT / 'scripts/audit_dependencies.py')
assert spec and spec.loader
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


def report(**findings):
    counts = {key: findings.get(key, 0) for key in m.SEVERITIES}
    return {'auditReportVersion': 2, 'vulnerabilities': {},
            'metadata': {'vulnerabilities': {**counts, 'total': sum(counts.values())}}}


def result(payload=None, code=0):
    return subprocess.CompletedProcess([], code, json.dumps(report() if payload is None else payload), '')


class AuditPolicyTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'package-lock.json').write_text('{}')
        self.calls = []

    def run_responses(self, responses):
        def invoke(command, **kwargs):
            self.calls.append((command, kwargs))
            response = responses[len(self.calls) - 1]
            if isinstance(response, Exception):
                raise response
            return response
        return m.run_audits(self.root, '/fixture/npm', runner=invoke)

    def test_both_clean_reports_pass(self):
        summary = self.run_responses([result(), result()])
        self.assertEqual(summary['status'], 'passed')
        self.assertEqual([a['status'] for a in summary['audits']], ['passed', 'passed'])

    def test_full_failure_still_runs_runtime_audit(self):
        summary = self.run_responses([result(report(high=1), 1), result()])
        self.assertEqual(len(self.calls), 2)
        self.assertEqual(summary['status'], 'not-passed')
        self.assertEqual(summary['audits'][1]['status'], 'passed')

    def test_runtime_failure_fails_aggregate(self):
        summary = self.run_responses([result(), result(report(low=1), 1)])
        self.assertEqual(summary['status'], 'not-passed')

    def test_every_severity_fails_even_with_zero_exit(self):
        for severity in m.SEVERITIES:
            with self.subTest(severity=severity):
                self.calls = []
                summary = self.run_responses([result(report(**{severity: 1})), result()])
                self.assertEqual(summary['status'], 'not-passed')

    def test_nonzero_with_empty_findings_still_fails(self):
        summary = self.run_responses([result(code=7), result()])
        self.assertEqual(summary['audits'][0]['exit_code'], 7)
        self.assertEqual(summary['status'], 'not-passed')

    def test_invalid_json_is_not_clean_audit(self):
        summary = self.run_responses([subprocess.CompletedProcess([], 0, '<html>registry unavailable</html>', ''), result()])
        self.assertEqual(summary['status'], 'not-passed')
        self.assertIsNone(summary['audits'][0]['counts'])

    def test_empty_output_is_not_clean_audit(self):
        summary = self.run_responses([subprocess.CompletedProcess([], 0, '', ''), result()])
        self.assertEqual(summary['status'], 'not-passed')
        self.assertEqual((self.root / 'artifacts/dependency-audit.json').read_text(), '{}\n')

    def test_registry_error_object_fails(self):
        summary = self.run_responses([result({'error': {'code': 'E503'}}), result()])
        self.assertEqual(summary['status'], 'not-passed')

    def test_missing_or_invalid_metadata_fails(self):
        for payload in ([], {}, {'auditReportVersion': 2}, {'auditReportVersion': 1, 'metadata': report()['metadata']}):
            with self.subTest(payload=payload), self.assertRaises(ValueError):
                m.audit_counts(json.dumps(payload))

    def test_error_object_cannot_hide_behind_valid_summary(self):
        payload = {**report(), 'error': {'code': 'E503'}}
        with self.assertRaises(ValueError):
            m.audit_counts(json.dumps(payload))

    def test_duplicate_json_key_is_rejected(self):
        with self.assertRaises(ValueError):
            m.audit_counts('{"auditReportVersion":2,"auditReportVersion":2}')

    def test_each_severity_is_required(self):
        for severity in (*m.SEVERITIES, 'total'):
            payload = report()
            del payload['metadata']['vulnerabilities'][severity]
            with self.subTest(severity=severity), self.assertRaises(ValueError):
                m.audit_counts(json.dumps(payload))

    def test_malformed_counts_are_rejected(self):
        for value in (-1, True, 1.5, '0', None):
            payload = report()
            payload['metadata']['vulnerabilities']['high'] = value
            with self.subTest(value=value), self.assertRaises(ValueError):
                m.audit_counts(json.dumps(payload))

    def test_inconsistent_total_is_rejected(self):
        payload = report(high=1)
        payload['metadata']['vulnerabilities']['total'] = 0
        with self.assertRaises(ValueError):
            m.audit_counts(json.dumps(payload))

    def test_unexpected_severity_needs_review(self):
        payload = report()
        payload['metadata']['vulnerabilities']['new-severity'] = 1
        with self.assertRaises(ValueError):
            m.audit_counts(json.dumps(payload))

    def test_timeout_preserves_failure_and_attempts_other_scope(self):
        summary = self.run_responses([subprocess.TimeoutExpired('npm', 120, output=b'{', stderr=b'timeout'), result()])
        self.assertEqual(len(self.calls), 2)
        self.assertEqual(summary['status'], 'not-passed')
        self.assertIsNone(summary['audits'][0]['exit_code'])
        self.assertEqual((self.root / 'artifacts/dependency-audit.stderr.txt').read_text(), 'timeout')

    def test_missing_executable_is_failure_in_both_scopes(self):
        summary = self.run_responses([FileNotFoundError(), FileNotFoundError()])
        self.assertEqual(len(self.calls), 2)
        self.assertEqual([a['status'] for a in summary['audits']], ['failed', 'failed'])

    def test_previous_success_is_overwritten_on_failure(self):
        artifacts = self.root / 'artifacts'
        artifacts.mkdir()
        for name in ('dependency-audit.json', 'dependency-audit-runtime.json', 'dependency-audit-summary.json'):
            (artifacts / name).write_text('{"status":"passed","old":true}')
        self.run_responses([FileNotFoundError(), FileNotFoundError()])
        summary = json.loads((artifacts / 'dependency-audit-summary.json').read_text())
        self.assertEqual(summary['status'], 'not-passed')
        for name in ('dependency-audit.json', 'dependency-audit-runtime.json'):
            self.assertNotIn('old', (artifacts / name).read_text())

    def test_fixed_non_mutating_commands_and_explicit_threshold(self):
        self.run_responses([result(), result()])
        full, runtime = self.calls
        for command, kwargs in self.calls:
            self.assertEqual(command[:3], ['/fixture/npm', 'audit', '--json'])
            self.assertIn('--audit-level=info', command)
            self.assertNotIn('fix', command)
            self.assertFalse(kwargs['shell'])
            self.assertEqual(kwargs['timeout'], 120)
        self.assertIn('--include=dev', full[0])
        self.assertIn('--omit=dev', runtime[0])
        self.assertEqual((self.root / 'package-lock.json').read_text(), '{}')

    def test_failed_artifact_write_cannot_report_success(self):
        (self.root / 'artifacts').write_text('not a directory')
        with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()), patch.object(m.shutil, 'which', return_value='/fixture/npm'):
            self.assertEqual(m.main(['--root', str(self.root)]), 1)

    def test_cli_preserves_failure_and_success_exit_status(self):
        original_run = m.run_audits
        for code, expected in ((0, 0), (1, 1)):
            self.calls = []
            def invoke(command, **kwargs):
                return result(code=code)
            with self.subTest(code=code), redirect_stdout(io.StringIO()), \
                    patch.object(m.shutil, 'which', return_value='/fixture/npm'), \
                    patch.object(m, 'run_audits', side_effect=lambda root, npm: original_run(root, npm, runner=invoke)):
                self.assertEqual(m.main(['--root', str(self.root)]), expected)


class SecurityConfigurationTests(unittest.TestCase):
    """Assertions for the committed configuration; not a generic YAML validator."""
    def test_required_checks_have_unfiltered_pr_and_merge_group_events(self):
        for name, job in (('docs.yml', 'documentation'), ('react.yml', 'verify')):
            workflow = (ROOT / '.github/workflows' / name).read_text()
            self.assertIn('  pull_request:\n  merge_group:\n', workflow)
            self.assertNotIn('paths:', workflow)
            self.assertNotIn('paths-ignore:', workflow)
            self.assertNotIn('pull_request_target:', workflow)
            self.assertIn(f'  {job}:\n', workflow)
            self.assertIn('permissions:\n  contents: read\n', workflow)
            self.assertNotIn('continue-on-error:', workflow)
            uses = re.findall(r'uses:\s*(\S+)', workflow)
            self.assertTrue(uses)
            for action in uses:
                self.assertRegex(action, r'^[\w-]+/[\w-]+@[a-f0-9]{40}$')

    def test_weekly_react_run_contains_audit_gate(self):
        workflow = (ROOT / '.github/workflows/react.yml').read_text()
        self.assertIn("cron: '17 6 * * 1'", workflow)
        self.assertIn('run: python3 scripts/audit_dependencies.py', workflow)
        self.assertIn('if: ${{ !cancelled() }}', workflow)
        self.assertIn('            artifacts/\n', workflow)

    def test_dependabot_tracks_actions_and_root_npm_graph(self):
        config = (ROOT / '.github/dependabot.yml').read_text()
        self.assertIn('version: 2', config)
        self.assertEqual(re.findall(r'package-ecosystem: "([^"]+)"', config), ['github-actions', 'npm'])
        self.assertEqual(config.count('directory: "/"'), 2)
        self.assertEqual(config.count('interval: "weekly"'), 2)
        self.assertNotIn('ignore:', config)

    def test_codeowners_covers_all_files(self):
        rows = [row for row in (ROOT / '.github/CODEOWNERS').read_text().splitlines() if row and not row.startswith('#')]
        self.assertEqual(rows, ['* @kochrisdev'])

    def test_ruleset_template_requires_exact_checks_from_github_actions(self):
        ruleset = json.loads((ROOT / '.github/rulesets/main-required-checks.json').read_text())
        self.assertEqual(ruleset['conditions']['ref_name'], {'include': ['refs/heads/main'], 'exclude': []})
        self.assertEqual(ruleset['bypass_actors'], [])
        rules = {rule['type']: rule.get('parameters') for rule in ruleset['rules']}
        self.assertIn('deletion', rules)
        self.assertIn('non_fast_forward', rules)
        checks = rules['required_status_checks']
        self.assertEqual(checks['required_status_checks'], [
            {'context': 'documentation', 'integration_id': 15368},
            {'context': 'verify', 'integration_id': 15368}])
        self.assertTrue(checks['strict_required_status_checks_policy'])
        self.assertFalse(checks['do_not_enforce_on_create'])
        self.assertEqual(rules['pull_request']['required_approving_review_count'], 0)
        self.assertFalse(rules['pull_request']['require_code_owner_review'])
        self.assertTrue(rules['pull_request']['required_review_thread_resolution'])


if __name__ == '__main__':
    unittest.main()
