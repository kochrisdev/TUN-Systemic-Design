"""Synthetic, offline tests for additive conformance relations; never run an agent."""
from contextlib import redirect_stdout, redirect_stderr
from copy import deepcopy
import importlib.util
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / 'scripts'
sys.path.insert(0, str(SCRIPTS))
spec = importlib.util.spec_from_file_location('conformance_relations', SCRIPTS / 'conformance.py')
assert spec and spec.loader
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class ConformanceRelations(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.write(m.core.SPEC, '# 8. Gate\n\nApproval MUST bind the version.\n\nThe host MUST check authority.\n')
        self.write('tests/fixture.test.ts', "it('binds the version', () => {});\n")
        self.manifest = {'schema_version': 1, 'profile': 'reference-ui-v0.1', 'specification': m.core.SPEC,
            'scope': 'Synthetic fixture', 'rules': [
                {'id': 'SPEC-8-003', 'section': '8', 'text': 'Approval MUST bind the version.', 'strength': ['MUST'], 'owner': 'shared', 'coverage': 'partial', 'automated': [{'test_id': 'tests/fixture.test.ts::binds the version', 'proves': 'Checks the version.'}], 'review': {'procedure': 'Review host binding.', 'evidence': 'Host record.'}},
                {'id': 'SPEC-8-004', 'section': '8', 'text': 'The host MUST check authority.', 'strength': ['MUST'], 'owner': 'host', 'coverage': 'gap', 'automated': [], 'review': {'procedure': 'Review permission enforcement.', 'evidence': 'Integration results.'}},
            ]}
        self.write('packages/react/src/index.ts', "export { ApprovalGate } from './ApprovalGate.js';\nexport { ActionReceipt } from './ActionReceipt.js';\n")
        for name in ['ApprovalGate', 'ActionReceipt']:
            self.write(f'packages/react/src/{name}.tsx', f'export function {name}() {{ return null; }}\n')
        self.write('docs/THREAT-MODEL.md', '# Threat model\n\n## 4. STRIDE threat register\n\n| ID | Meaning |\n|---|---|\n| <a id="TM-02"></a>**TM-02 · T** | Changed version |\n| <a id="TM-M-7"></a>**TM-M-7** | Duplicate action |\n')
        self.relations = {'schema_version': 1, 'source': m.core.MANIFEST, 'rules': [
            {'id': 'SPEC-8-003', 'components': ['ApprovalGate'], 'threats': ['TM-02', 'TM-M-7'], 'note': 'Shared obligations.'},
            {'id': 'SPEC-8-004', 'components': [], 'threats': [], 'note': 'Host enforcement.'},
        ]}
        self.save()
        self.write(m.TARGET, m.render(*m.load(self.root)))

    def write(self, name, content):
        p = self.root / name; p.parent.mkdir(parents=True, exist_ok=True); p.write_text(content, encoding='utf-8')

    def save(self):
        self.write(m.core.MANIFEST, json.dumps(self.manifest))
        self.write(m.core.MATRIX, m.core.render_matrix(self.manifest, self.root))
        self.write(m.RELATIONS, json.dumps(self.relations))

    def invoke(self, command='check'):
        with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
            return m.main([command, '--root', str(self.root)])

    def reject(self, pattern):
        self.save()
        with self.assertRaisesRegex(m.core.Invalid, pattern): m.load(self.root)

    def test_valid_view_and_shared_owner(self):
        self.assertEqual(self.invoke(), 0)
        output = (self.root / m.TARGET).read_text()
        self.assertIn('P/H / partial', output)
        self.assertIn('tests/fixture.test.ts::binds the version', output)
        self.assertIn('2 canonical mandatory statements', output)

    def test_optional_association_notes_are_not_required(self):
        for row in self.relations['rules']: del row['note']
        self.save()
        self.assertEqual(len(m.load(self.root)[1]['rules']), 2)

    def test_missing_relation(self):
        self.relations['rules'].pop(); self.reject('Missing relations')

    def test_duplicate_relation(self):
        self.relations['rules'].append(deepcopy(self.relations['rules'][0])); self.reject('duplicate')

    def test_unknown_legacy_id(self):
        self.relations['rules'][1]['id'] = 'SPEC-8-006'; self.reject('unknown')

    def test_source_text_is_not_copied_into_relations(self):
        self.relations['rules'][0]['text'] = 'A different rule'; self.reject('expected keys')

    def test_coverage_or_result_cannot_be_overridden(self):
        for key in ('owner', 'status', 'coverage', 'tests', 'passed'):
            with self.subTest(key=key):
                self.relations['rules'][0][key] = 'passed'
                self.reject('expected keys')
                del self.relations['rules'][0][key]

    def test_unknown_component(self):
        self.relations['rules'][0]['components'] = ['InventedGate']; self.reject('unknown public component')

    def test_removed_export_invalidates_association(self):
        self.write('packages/react/src/index.ts', "export { ActionReceipt } from './ActionReceipt.js';\n")
        self.reject('unknown public component')

    def test_wildcard_stands_alone(self):
        self.relations['rules'][0]['components'] = ['*', 'ApprovalGate']; self.reject('wildcard')

    def test_library_wide_reverse_lookup(self):
        self.relations['rules'][0]['components'] = ['*']; self.save()
        out = m.render(*m.load(self.root)).split('## 4. Component-first lookup')[1]
        self.assertIn('ActionReceipt', out)
        self.assertEqual(out.count('[SPEC-8-003]'), 2)

    def test_duplicate_associations(self):
        for key in ('components', 'threats'):
            with self.subTest(key=key):
                old = self.relations['rules'][0][key][:]
                self.relations['rules'][0][key] *= 2
                self.reject('duplicate values')
                self.relations['rules'][0][key] = old

    def test_malformed_association_lists(self):
        for value in (None, 'ApprovalGate', [None], [1], [True], ['']):
            with self.subTest(value=value):
                self.relations['rules'][0]['components'] = value
                self.reject('array of nonempty strings')

    def test_empty_scope_note(self):
        self.relations['rules'][0]['note'] = ' '; self.reject('nonempty text')

    def test_unknown_threat(self):
        self.relations['rules'][0]['threats'] = ['TM-T-1']; self.reject('unknown threat')

    def test_prose_comment_and_fenced_mentions_do_not_define_threats(self):
        self.write('docs/THREAT-MODEL.md', (self.root/'docs/THREAT-MODEL.md').read_text() + '\nMention TM-99.\n<!-- | **TM-99** | ignored | -->\n```text\n| **TM-99** | ignored |\n```\n')
        self.relations['rules'][0]['threats'] = ['TM-99']; self.reject('unknown threat')

    def test_duplicate_threat_definition(self):
        self.write('docs/THREAT-MODEL.md', (self.root/'docs/THREAT-MODEL.md').read_text() + '| **TM-02 · T** | Again |\n')
        self.reject('duplicate threat definition')

    def test_threat_must_have_its_actual_target(self):
        self.write('docs/THREAT-MODEL.md', (self.root/'docs/THREAT-MODEL.md').read_text().replace('<a id="TM-M-7"></a>', ''))
        self.reject('missing explicit threat anchor')

    def test_wrong_explicit_anchor(self):
        self.write('docs/THREAT-MODEL.md', (self.root/'docs/THREAT-MODEL.md').read_text().replace('<a id="TM-M-7"></a>', '<a id="TM-M-1"></a>'))
        self.reject('mismatched threat anchor')

    def test_canonical_source_drift_still_fails(self):
        self.write(m.core.SPEC, '# 8. Gate\n\nApproval MUST NOT bind the version.\n\nThe host MUST check authority.\n')
        self.assertEqual(self.invoke('build'), 1)

    def test_canonical_matrix_drift_still_fails(self):
        self.write(m.core.MATRIX, 'Stale matrix\n')
        self.assertEqual(self.invoke('build'), 1)
        self.assertEqual((self.root / m.core.MATRIX).read_text(), 'Stale matrix\n')

    def test_new_must_cannot_hide_from_view(self):
        self.write(m.core.SPEC, (self.root / m.core.SPEC).read_text() + '\nThe host MUST record a receipt.\n')
        self.assertEqual(self.invoke(), 1)

    def test_wrong_file_or_commented_test_does_not_satisfy_mapping(self):
        self.write('tests/other.test.ts', "it('binds the version', () => {});\n")
        self.write('tests/fixture.test.ts', "// it('binds the version', () => {});\n")
        self.assertEqual(self.invoke(), 1)

    def test_matrix_drift_is_detected_and_build_repairs_only_view(self):
        before = {p: (self.root / p).read_bytes() for p in (m.core.SPEC, m.core.MANIFEST, m.core.MATRIX, m.RELATIONS)}
        self.write(m.TARGET, 'A stale view\n')
        self.assertEqual(self.invoke(), 1)
        self.assertEqual((self.root / m.TARGET).read_text(), 'A stale view\n')
        self.assertEqual(self.invoke('build'), 0)
        self.assertEqual(self.invoke(), 0)
        for p, data in before.items(): self.assertEqual((self.root / p).read_bytes(), data)

    def test_build_is_idempotent(self):
        before = (self.root / m.TARGET).read_bytes()
        self.assertEqual(self.invoke('build'), 0)
        self.assertEqual((self.root / m.TARGET).read_bytes(), before)

    def test_invalid_input_does_not_overwrite_view(self):
        before = (self.root / m.TARGET).read_bytes()
        self.relations['rules'][0]['components'] = ['Unknown']; self.save()
        self.assertEqual(self.invoke('build'), 1)
        self.assertEqual((self.root / m.TARGET).read_bytes(), before)

    def test_duplicate_json_keys_fail(self):
        self.write(m.RELATIONS, '{"schema_version":1,"schema_version":1}')
        self.assertEqual(self.invoke(), 1)

    def test_malformed_json_and_schema_fail_cleanly(self):
        for value in ('{', '[]', 'null', '{"schema_version":true}', '{"schema_version":2}'):
            self.write(m.RELATIONS, value)
            self.assertEqual(self.invoke(), 1)

    def test_alternative_manifest_cannot_be_selected(self):
        self.relations['source'] = '../requirements.json'; self.reject('canonical manifest')

    def test_newlines_and_markup_cannot_break_generated_table(self):
        self.relations['rules'][0]['note'] = '<script>bad</script>|`text`\nsecond'
        self.save(); result = m.render(*m.load(self.root))
        self.assertNotIn('<script>', result)
        self.assertIn('&lt;script&gt;bad&lt;/script&gt;&#124;&#96;text&#96;<br>second', result)

    def test_product_review_is_not_automatically_not_applicable(self):
        self.manifest['rules'][1]['owner'] = 'product-review'; self.manifest['rules'][1]['coverage'] = 'manual'
        self.save(); out = m.render(*m.load(self.root))
        self.assertIn('D / manual', out)
        self.assertIn('The host MUST check authority.', out)

    def test_output_symlink_cannot_overwrite_canonical_manifest(self):
        target = self.root / m.TARGET; target.unlink(); target.symlink_to(self.root / m.core.MANIFEST)
        before = (self.root / m.core.MANIFEST).read_bytes()
        self.assertEqual(self.invoke('build'), 1)
        self.assertEqual((self.root / m.core.MANIFEST).read_bytes(), before)

    def test_missing_output_is_not_a_pass(self):
        (self.root / m.TARGET).unlink()
        self.assertEqual(self.invoke(), 1)
        self.assertEqual(self.invoke('build'), 0)


    def test_single_register_resolves_both_id_families(self):
        self.assertEqual(m.threat_targets(self.root), {
            'TM-02': 'docs/THREAT-MODEL.md#TM-02',
            'TM-M-7': 'docs/THREAT-MODEL.md#TM-M-7',
        })
        self.assertFalse((self.root/'docs/MISREPRESENTATION-THREATS.md').exists())
        self.assertEqual(self.invoke(), 0)

    def test_legacy_companion_cannot_supply_a_missing_row(self):
        row = '| <a id="TM-M-7"></a>**TM-M-7** | Duplicate action |\n'
        path = self.root/'docs/THREAT-MODEL.md'
        path.write_text(path.read_text().replace(row, ''), encoding='utf-8')
        self.write('docs/MISREPRESENTATION-THREATS.md', '# Legacy\n\n' + row)
        self.reject('unknown threat definition')

    def test_duplicate_misrepresentation_definition(self):
        path = self.root/'docs/THREAT-MODEL.md'
        path.write_text(path.read_text() + '| <a id="TM-M-7"></a>**TM-M-7** | Again |\n', encoding='utf-8')
        self.reject('duplicate threat definition')

    def test_standard_threat_requires_a_direct_anchor(self):
        path = self.root/'docs/THREAT-MODEL.md'
        path.write_text(path.read_text().replace('<a id="TM-02"></a>', ''), encoding='utf-8')
        self.reject('missing explicit threat anchor')

    def test_register_heading_is_still_required(self):
        path = self.root/'docs/THREAT-MODEL.md'
        path.write_text(path.read_text().replace('## 4. STRIDE threat register', '## Unrelated table'), encoding='utf-8')
        self.reject('missing threat-register heading')

    def test_all_seven_misrepresentation_ids_link_to_the_main_model(self):
        path = self.root/'docs/THREAT-MODEL.md'
        extra = ''.join(f'| <a id="TM-M-{n}"></a>**TM-M-{n}** | Synthetic scenario |\n' for n in range(1, 7))
        path.write_text(path.read_text() + extra, encoding='utf-8')
        self.relations['rules'][0]['threats'] = ['TM-02'] + [f'TM-M-{n}' for n in range(1, 8)]
        self.save()
        output = m.render(*m.load(self.root))
        for n in range(1, 8):
            self.assertIn(f'[TM-M-{n}](THREAT-MODEL.md#TM-M-{n})', output)
        self.assertNotIn('MISREPRESENTATION-THREATS.md', output)
        self.assertNotIn('ATTACHMENT-RECONCILIATION.md', output)
        self.assertNotIn('decisions/', output)

if __name__ == '__main__':
    unittest.main()
