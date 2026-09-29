"""Conformance metadata/runner regression tests; stdlib, synthetic fixtures only."""
from contextlib import redirect_stderr, redirect_stdout
from copy import deepcopy
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('check_conformance', Path(__file__).resolve().parents[1] / 'scripts/check_conformance.py')
assert spec and spec.loader
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
TEST = 'tests/example.test.ts::blocks changed content'


class ConformanceChecks(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.write(m.SPEC, '# 2. Normative Language\n\nMUST is requirement vocabulary.\n\n# 8. Approval Gates\n\nApproval MUST bind the proposal version.\n\nThe host MUST enforce authority.\n')
        self.write('tests/example.test.ts', "import { it } from 'vitest';\nit('blocks changed content', () => {});\n")
        self.manifest = {'schema_version': 1, 'profile': 'reference-ui-v0.1', 'specification': m.SPEC, 'scope': 'Reference UI fixture', 'rules': [
            {'id': 'SPEC-8-001', 'section': '8', 'text': 'Approval MUST bind the proposal version.', 'strength': ['MUST'],
             'owner': 'shared', 'coverage': 'partial', 'automated': [{'test_id': TEST, 'proves': 'Rejects changed content.'}],
             'review': {'procedure': 'Check server canonical versions.', 'evidence': 'Integration test run.'}},
            {'id': 'SPEC-8-002', 'section': '8', 'text': 'The host MUST enforce authority.', 'strength': ['MUST'],
             'owner': 'host', 'coverage': 'gap', 'automated': [],
             'review': {'procedure': 'Test server grants.', 'evidence': 'Rejected request record.'}},
        ]}
        self.save()

    def write(self, name, content):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding='utf-8')

    def save(self):
        self.write(m.MANIFEST, json.dumps(self.manifest))
        self.write(m.MATRIX, m.render_matrix(self.manifest, self.root))

    def check(self):
        return m.load_manifest(self.root)

    def rejected(self, message=None):
        with self.assertRaisesRegex(m.Invalid, message or '.'):
            self.check()

    def report(self, status='passed', **extra):
        return {'success': True, 'testResults': [{'name': str(self.root / 'tests/example.test.ts'), 'assertionResults': [
            {'title': 'blocks changed content', 'status': status}]}], **extra}

    def main(self, *args):
        with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
            return m.main(['--root', str(self.root), *args])

    def test_valid_partial_and_gap_inventory(self):
        self.assertEqual(len(self.check()['rules']), 2)
        self.assertEqual(self.main(), 0)

    def test_count_not_hardcoded(self):
        self.assertEqual(len(m.extract_requirements((self.root / m.SPEC).read_text())), 2)

    def test_missing_rule_is_a_failure(self):
        self.manifest['rules'].pop(); self.save(); self.rejected('uncatalogued')

    def test_new_must_cannot_silently_escape_catalog(self):
        path = self.root / m.SPEC
        path.write_text(path.read_text() + '\nThe system MUST log an effect.\n')
        self.rejected('uncatalogued')

    def test_deleted_requirement_is_stale(self):
        path = self.root / m.SPEC
        path.write_text(path.read_text().replace('The host MUST enforce authority.', ''))
        self.rejected('stale')

    def test_changed_text_fails(self):
        self.manifest['rules'][0]['text'] = 'Approval MUST bind something else.'
        self.write(m.MANIFEST, json.dumps(self.manifest)); self.rejected('stale')

    def test_strength_change_fails(self):
        self.manifest['rules'][0]['strength'] = ['MUST NOT']
        self.save(); self.rejected('strength')

    def test_whitespace_in_source_does_not_renumber(self):
        path = self.root / m.SPEC
        path.write_text(path.read_text().replace('bind the proposal', 'bind\nthe  proposal'))
        self.assertEqual(self.check()['rules'][0]['id'], 'SPEC-8-001')

    def test_ids_remain_valid_after_sentence_reordering(self):
        self.write(m.SPEC, '# 8. Approval Gates\n\nThe host MUST enforce authority. Approval MUST bind the proposal version.\n')
        self.assertEqual(self.check()['rules'][0]['id'], 'SPEC-8-001')

    def test_duplicate_id_fails(self):
        self.manifest['rules'][1]['id'] = 'SPEC-8-001'; self.save(); self.rejected('duplicate')

    def test_section_id_mismatch_fails(self):
        self.manifest['rules'][0]['id'] = 'SPEC-9-001'; self.save(); self.rejected('section')

    def test_duplicate_source_fails(self):
        r = deepcopy(self.manifest['rules'][0]); r['id'] = 'SPEC-8-003'; self.manifest['rules'].append(r)
        self.save(); self.rejected('duplicate')

    def test_glossary_comments_and_code_are_excluded(self):
        md = '# 2. Normative Language\nMUST MUST NOT\n\n# 4.3 PROPOSE\n\n<!-- hidden MUST -->\n```txt\nexample MUST\n```\n\nThe UI MUST separate states.\n'
        rules = m.extract_requirements(md)
        self.assertEqual([(r['section'], r['text']) for r in rules], [('4.3', 'The UI MUST separate states.')])

    def test_known_terminology_mentions_are_not_new_obligations(self):
        md = '# 31. TUN Conformance\n\n' + ' '.join(t for _, t in sorted(m.MENTIONS)) + '\n\nThe declaration MUST identify scope.'
        self.assertEqual(len(m.extract_requirements(md)), 1)

    def test_unknown_must_sentence_is_catalogued(self):
        self.assertEqual(len(m.extract_requirements('# 31. TUN Conformance\n\nAn assessment MUST have evidence.')), 1)

    def test_empty_specification_fails(self):
        with self.assertRaises(m.Invalid): m.extract_requirements('# No requirements')

    def test_unclosed_fence_fails(self):
        with self.assertRaisesRegex(m.Invalid, 'fence'): m.extract_requirements('# 8. Gate\n\nThe gate MUST work.\n```')

    def test_duplicate_normative_sentence_fails(self):
        with self.assertRaisesRegex(m.Invalid, 'Duplicate'): m.extract_requirements('# 8. Gate\n\nThe gate MUST work. The gate MUST work.')

    def test_compound_musts_keep_the_complete_sentence(self):
        r = m.extract_requirements('# 8. Gate\n\nThe UI MUST show scope and MUST NOT hide risk.')[0]
        self.assertEqual(r['strength'], ['MUST', 'MUST NOT'])

    def test_unknown_schema_keys_fail(self):
        self.manifest['claim'] = 'conformant'; self.save(); self.rejected('keys')

    def test_duplicate_json_keys_fail(self):
        self.write(m.MANIFEST, '{"schema_version": 1, "schema_version": 1}')
        self.rejected('Duplicate JSON')

    def test_empty_catalog_fails(self):
        self.manifest['rules'] = []; self.save(); self.rejected('Nonempty')

    def test_empty_manual_evidence_fails(self):
        self.manifest['rules'][1]['review']['evidence'] = ''; self.save(); self.rejected('evidence')

    def test_partial_requires_a_mapping(self):
        self.manifest['rules'][1]['coverage'] = 'partial'; self.save(); self.rejected('requires')

    def test_unmapped_rule_cannot_claim_automated_pass(self):
        self.manifest['rules'][1]['coverage'] = 'passed'; self.save(); self.rejected('coverage')

    def test_missing_test_title_fails(self):
        self.write('tests/example.test.ts', "it('renamed check', () => {});")
        self.rejected('found 0')

    def test_ambiguous_test_title_fails(self):
        self.write('tests/example.test.ts', "it('blocks changed content', () => {});\nit('blocks changed content', () => {});")
        self.rejected('found 2')

    def test_duplicate_mapping_fails(self):
        self.manifest['rules'][0]['automated'] *= 2; self.save(); self.rejected('duplicate')

    def test_comments_and_strings_are_not_declarations(self):
        source = "// it('fake', () => {});\nconst text = `it('fake', () => {});`;\n/* it('fake', () => {}); */\nit('real', () => {});"
        self.assertEqual(dict(m.literal_titles(source)), {'real': 1})

    def test_parameterized_templates_are_not_assumed_resolved(self):
        self.assertEqual(dict(m.literal_titles("it(`generated ${state}`, () => {});")), {})

    def test_focused_or_skipped_declarations_fail(self):
        for mode in ('only', 'skip', 'todo'):
            with self.subTest(mode=mode), self.assertRaises(m.Invalid):
                m.literal_titles(f"describe.{mode}('suite', () => {{ it('check', () => {{}}); }});")

    def test_test_path_traversal_fails(self):
        self.manifest['rules'][0]['automated'][0]['test_id'] = '../outside.test.ts::bad'
        self.save(); self.rejected('supports Vitest')

    def test_symlink_escape_fails(self):
        outside = tempfile.TemporaryDirectory(); self.addCleanup(outside.cleanup)
        path = self.root / 'tests/example.test.ts'; path.unlink()
        target = Path(outside.name) / 'outside.ts'; target.write_text("it('blocks changed content', () => {});")
        path.symlink_to(target); self.rejected('escapes repository')

    def test_static_check_is_read_only(self):
        before = {str(p): p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        self.assertEqual(self.main(), 0)
        self.assertEqual(before, {str(p): p.read_bytes() for p in self.root.rglob('*') if p.is_file()})

    def test_matrix_drift_and_explicit_regeneration(self):
        self.write(m.MATRIX, '# Wrong matrix')
        self.assertEqual(self.main(), 1)
        self.assertEqual(self.main('--write-matrix'), 0)
        before = (self.root / m.MATRIX).read_bytes()
        self.assertEqual(self.main('--write-matrix'), 0)
        self.assertEqual(before, (self.root / m.MATRIX).read_bytes())

    def test_passed_test_is_not_full_rule_conformance(self):
        report, errors = m.collect_results(self.manifest, self.report())
        self.assertEqual(errors, [])
        self.assertEqual(report['tests'][TEST], 'passed')
        self.assertEqual(report['rules'][0]['conformance'], 'unassessed')
        self.assertEqual(report['rules'][1]['automated_checks'], 'unassessed')

    def test_missing_skipped_failed_and_unknown_results_fail(self):
        for status in ('failed', 'skipped', 'pending', 'todo', 'not-a-status'):
            with self.subTest(status=status):
                self.assertTrue(m.collect_results(self.manifest, self.report(status))[1])
        self.assertTrue(m.collect_results(self.manifest, {'success': True, 'testResults': []})[1])

    def test_result_title_is_exact_not_a_substring(self):
        raw = self.report(); raw['testResults'][0]['assertionResults'][0]['title'] += ' elsewhere'
        self.assertTrue(m.collect_results(self.manifest, raw)[1])

    def test_duplicate_runtime_result_fails(self):
        raw = self.report(); raw['testResults'][0]['assertionResults'] *= 2
        result, errors = m.collect_results(self.manifest, raw)
        self.assertEqual(result['tests'][TEST], 'ambiguous'); self.assertTrue(errors)

    def test_wrong_file_cannot_supply_passing_evidence(self):
        raw = self.report(); raw['testResults'][0]['name'] = '/elsewhere/tests/other.test.ts'
        self.assertTrue(m.collect_results(self.manifest, raw)[1])

    def test_unsuccessful_suite_fails_even_with_passing_mapping(self):
        self.assertTrue(m.collect_results(self.manifest, self.report(success=False))[1])

    def test_malformed_runtime_report_fails(self):
        for report in ({}, {'testResults': 'wrong'}, {'testResults': [{}]}):
            with self.subTest(report=report), self.assertRaises(m.Invalid):
                m.collect_results(self.manifest, report)

    def test_live_runner_uses_fresh_file_and_fixed_commands(self):
        self.write('node_modules/vitest/vitest.mjs', '// fixture')
        self.write('node_modules/vitest/package.json', '{"version":"test-fixture"}')
        calls = []
        def invoke(command, **kwargs):
            calls.append(command)
            if '--version' in command:
                return subprocess.CompletedProcess(command, 0, 'v22.fixture\n', '')
            out = next(x.split('=', 1)[1] for x in command if x.startswith('--outputFile='))
            self.assertFalse(Path(out).exists())
            Path(out).write_text(json.dumps(self.report()))
            return subprocess.CompletedProcess(command, 0, '', '')
        with patch.object(m.shutil, 'which', side_effect=lambda name: '/node' if name == 'node' else None), patch.object(m.subprocess, 'run', side_effect=invoke):
            report, errors = m.run_evidence(self.root, self.manifest)
        self.assertEqual(errors, [])
        self.assertEqual(report['mapped_tests_passed'], 1)
        self.assertEqual(report['product_conformance'], 'unassessed')
        self.assertIn('--reporter=json', calls[0]); self.assertIn('tests/example.test.ts', calls[0])
        self.assertIn(m.SPEC, report['input_sha256'])

    def test_no_report_cannot_reuse_old_artifact(self):
        self.write('node_modules/vitest/vitest.mjs', '// fixture')
        self.write(m.REPORT, '{"evidence_status":"passed"}')
        with patch.object(m.shutil, 'which', return_value='/node'), patch.object(m.subprocess, 'run', return_value=subprocess.CompletedProcess([], 1, '', '')):
            self.assertEqual(self.main('--run'), 1)
        self.assertEqual(json.loads((self.root / m.REPORT).read_text())['evidence_status'], 'not-passed')

    def test_changed_source_during_run_invalidates_evidence(self):
        self.write('node_modules/vitest/vitest.mjs', '// fixture')
        self.write('node_modules/vitest/package.json', '{"version":"test-fixture"}')
        def invoke(command, **kwargs):
            if '--version' in command: return subprocess.CompletedProcess(command, 0, 'v22.fixture', '')
            Path(next(x.split('=',1)[1] for x in command if x.startswith('--outputFile='))).write_text(json.dumps(self.report()))
            self.write('tests/example.test.ts', "it('blocks changed content', () => { throw Error(); });")
            return subprocess.CompletedProcess(command, 0, '', '')
        with patch.object(m.shutil, 'which', side_effect=lambda name: '/node' if name == 'node' else None), patch.object(m.subprocess, 'run', side_effect=invoke):
            report, errors = m.run_evidence(self.root, self.manifest)
        self.assertTrue(errors); self.assertEqual(report['evidence_status'], 'not-passed')

    def test_cli_nonzero_for_drift(self):
        self.write(m.MATRIX, '# Stale')
        completed = subprocess.run([sys.executable, m.__file__, '--root', str(self.root)], capture_output=True, text=True, timeout=10)
        self.assertEqual(completed.returncode, 1)
        self.assertIn('--write-matrix', completed.stderr)


if __name__ == '__main__':
    unittest.main()
