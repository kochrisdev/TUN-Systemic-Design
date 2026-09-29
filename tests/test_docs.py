"""Regression tests for the offline documentation checker; no third-party packages."""
from pathlib import Path
import importlib.util
import subprocess
import sys
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('check_docs', Path(__file__).resolve().parents[1] / 'scripts/check_docs.py')
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class DocumentationChecks(unittest.TestCase):
    def check_files(self, files: dict[str, str]) -> list[str]:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for name, content in files.items():
                target = root / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(content, encoding='utf-8')
            return module.check(root)[0]

    def test_local_heading(self):
        self.assertEqual(self.check_files({'README.md': '[Guide](docs/guide.md#hello-world)', 'docs/guide.md': '# Hello World'}), [])

    def test_missing_file(self):
        self.assertIn('missing local target', self.check_files({'README.md': '[Guide](missing.md)'})[0])

    def test_missing_heading(self):
        self.assertIn('missing Markdown fragment', self.check_files({'README.md': '[Here](#missing)'})[0])

    def test_balanced_fence(self):
        self.assertEqual(self.check_files({'README.md': '```md\n[Ignored](missing.md)\n```'}), [])

    def test_unclosed_backticks(self):
        self.assertIn('unclosed code fence', self.check_files({'README.md': '```sh\necho hello'})[0])

    def test_unclosed_tilde(self):
        self.assertIn('unclosed code fence', self.check_files({'README.md': '~~~sh\necho hello'})[0])

    def test_long_fence_contains_short_fence(self):
        self.assertEqual(self.check_files({'README.md': '````md\n```\n[Ignored](missing.md)\n````'}), [])

    def test_inline_code_ignored(self):
        self.assertEqual(self.check_files({'README.md': '`[Example](missing.md)`'}), [])

    def test_reference_link(self):
        self.assertEqual(self.check_files({'README.md': '[Guide][g]\n[g]: guide.md', 'guide.md': '# Guide'}), [])

    def test_collapsed_reference(self):
        self.assertEqual(self.check_files({'README.md': '[Guide][]\n[Guide]: guide.md', 'guide.md': '# Guide'}), [])

    def test_undefined_reference(self):
        self.assertIn('undefined link reference', self.check_files({'README.md': '[Guide][g]'})[0])

    def test_html_id_and_link(self):
        self.assertEqual(self.check_files({'README.md': '<a id="details"></a>\n<a href="#details">Details</a>'}), [])

    def test_outside_repository(self):
        self.assertIn('escapes repository', self.check_files({'README.md': '[Outside](../outside.md)'})[0])

    def test_duplicate_heading(self):
        self.assertEqual(self.check_files({'README.md': '# Hello\n# Hello\n[Next](#hello-1)'}), [])

    def test_external_not_fetched(self):
        self.assertEqual(self.check_files({'README.md': '[External](https://example.invalid/file#part)'}), [])

    def test_encoded_space_and_title(self):
        self.assertEqual(self.check_files({'README.md': '[Guide](my%20guide.md "Title")', 'my guide.md': '# Guide'}), [])

    def test_comments_ignored(self):
        self.assertEqual(self.check_files({'README.md': '<!-- [Ignored](missing.md) -->'}), [])

    def test_generated_directory_ignored(self):
        self.assertEqual(self.check_files({'README.md': '# Root', 'node_modules/p/README.md': '[Ignored](missing.md)'}), [])


class ComponentDocumentationChecks(unittest.TestCase):
    def make_repository(self, names=('AgentCard', 'ApprovalGate')):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        root = Path(directory.name)
        count = len(names)
        word = module.format_number(count, 'two')
        for name in names:
            self.write(root, f'packages/react/src/{name}.tsx', f'export function {name}() {{ return null; }}\n')
        self.write(root, 'packages/react/src/contracts.ts', 'export const parseTimestamp = () => 0;\n')
        self.write(root, 'packages/react/src/index.ts', "'use client';\n" + ''.join(
            f"export {{ {name}, type {name}Props }} from './{name}.js';\n" for name in names
        ) + "export * from './contracts.js';\n")
        self.write(root, 'README.md', f'# TUN\n\nOne value paragraph with **{count} React components**.\n')
        self.write(root, 'docs/SPECIFICATION-v0.1.md', f'# Specification\n\n**Implementation:** {word.title()} reference React components.\n')
        self.write(root, 'docs/SCOPE.md', f'# Scope\n\nThe repository includes {word} reference React components.\n')
        rows = '\n'.join(module.component_row(name, f'packages/react/src/{name}.tsx') for name in names)
        self.write(root, 'docs/STATUS-AND-ROADMAP.md', '# Roadmap\n\n' +
            f'**Current milestone:** {word.title()}-component foundation.\n\n## Canonical component matrix\n\n' +
            '| Design component | React symbol | Source |\n|---|---|---|\n' + rows + '\n\n## Other deliverables\n')
        return root

    def write(self, root, path, text):
        dest = root / path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(text, encoding='utf-8')

    def replace(self, root, path, before, after):
        dest = root / path
        text = dest.read_text(encoding='utf-8')
        self.assertIn(before, text)
        dest.write_text(text.replace(before, after), encoding='utf-8')

    def append_export(self, root, name='ContextPanel'):
        self.write(root, f'packages/react/src/{name}.tsx', f'export function {name}() {{ return null; }}\n')
        index = root / module.COMPONENT_INDEX
        index.write_text(index.read_text() + f"export {{ {name} }} from './{name}.js';\n")

    def test_count_is_derived_not_fixed_at_fourteen(self):
        root = self.make_repository()
        self.assertEqual(module.check_components(root), ([], 2, 0))

    def test_added_export_requires_counts_and_matrix_update(self):
        root = self.make_repository()
        self.append_export(root)
        errors, count, written = module.check_components(root)
        self.assertEqual((count, written, len(errors)), (3, 0, 5))

    def test_each_current_count_declaration_is_checked(self):
        for path in module.COMPONENT_CLAIMS:
            with self.subTest(path=path):
                root = self.make_repository()
                text = (root / path).read_text()
                match = module.COMPONENT_CLAIMS[path].search(text)
                self.write(root, path, text[:match.start('count')] + 'Four' + text[match.end('count'):])
                errors, _, _ = module.check_components(root)
                self.assertTrue(any(path + ':' in error and "'Four'" in error for error in errors))

    def test_original_four_components_wording_is_rejected(self):
        root = self.make_repository()
        self.replace(root, 'docs/SPECIFICATION-v0.1.md', 'Two reference React components', 'Four React components')
        self.assertIn("component count 'Four'; index.ts exports 2", module.check_components(root)[0][0])

    def test_removed_export_is_detected(self):
        root = self.make_repository()
        self.replace(root, str(module.COMPONENT_INDEX), "export { AgentCard, type AgentCardProps } from './AgentCard.js';\n", '')
        self.assertEqual(module.check_components(root)[1], 1)
        self.assertEqual(len(module.check_components(root)[0]), 5)

    def test_same_count_rename_is_detected_in_matrix(self):
        root = self.make_repository()
        self.replace(root, str(module.COMPONENT_INDEX), 'AgentCard, type', 'AgentCard as ProfileCard, type')
        errors, count, _ = module.check_components(root)
        self.assertEqual((count, len(errors)), (2, 1))
        self.assertIn('matrix differs', errors[0])

    def test_matrix_source_links_are_checked(self):
        root = self.make_repository()
        self.replace(root, 'docs/STATUS-AND-ROADMAP.md', '../packages/react/src/AgentCard.tsx', '../packages/react/src/ApprovalGate.tsx')
        self.assertIn('source paths', module.check_components(root)[0][0])

    def test_duplicate_matrix_row_is_detected(self):
        root = self.make_repository()
        row = module.component_row('AgentCard', 'packages/react/src/AgentCard.tsx')
        self.replace(root, 'docs/STATUS-AND-ROADMAP.md', row, row + '\n' + row)
        self.assertIn('matrix differs', module.check_components(root)[0][0])

    def test_matrix_presentation_order_is_preserved(self):
        root = self.make_repository()
        path = root / 'docs/STATUS-AND-ROADMAP.md'
        text = path.read_text()
        rows = module.MATRIX.search(text)['rows']
        self.write(root, str(path.relative_to(root)), text.replace(rows, '\n'.join(reversed(rows.splitlines())) + '\n'))
        before = path.read_bytes()
        self.assertEqual(module.check_components(root, sync=True), ([], 2, 0))
        self.assertEqual(path.read_bytes(), before)

    def test_comments_multiline_exports_and_types_are_supported(self):
        root = self.make_repository()
        self.write(root, str(module.COMPONENT_INDEX), '''// export { FakeCard } from './FakeCard.js';
'use client';
/* A commented export { OtherCard } from './OtherCard.js'; */
export {
  AgentCard, /* ignored type */ type AgentCardProps,
} from "./AgentCard.js";
export { ApprovalGate } from './ApprovalGate.js';
export type { AgentCardProps as CardType } from './AgentCard.js';
export type * from './AgentCard.js';
export * from './contracts.js';
export { parseTimestamp, type Something } from './contracts.js';
''')
        self.assertEqual(module.check_components(root), ([], 2, 0))

    def test_internal_tsx_files_are_not_counted(self):
        root = self.make_repository()
        self.write(root, 'packages/react/src/ControlAction.tsx', 'export function ControlAction() { return null; }')
        self.assertEqual(module.check_components(root), ([], 2, 0))

    def test_default_alias_is_a_named_component_export(self):
        root = self.make_repository()
        self.replace(root, str(module.COMPONENT_INDEX), 'AgentCard, type', 'default as AgentCard, type')
        self.assertEqual(module.check_components(root), ([], 2, 0))

    def test_duplicate_public_export_fails(self):
        root = self.make_repository()
        self.replace(root, str(module.COMPONENT_INDEX), 'ApprovalGate, type', 'ApprovalGate as AgentCard, type')
        self.assertIn('duplicate component export', module.check_components(root)[0][0])

    def test_wildcard_component_export_fails(self):
        root = self.make_repository()
        self.replace(root, str(module.COMPONENT_INDEX), '{ AgentCard, type AgentCardProps }', '*')
        self.assertIn('wildcard component export', module.check_components(root)[0][0])

    def test_unreviewed_helper_barrel_fails(self):
        root = self.make_repository()
        self.write(root, 'packages/react/src/extra.ts', "export { AgentCard } from './AgentCard.js';")
        index = root / module.COMPONENT_INDEX
        index.write_text(index.read_text() + "export * from './extra.js';\n")
        self.assertIn('unreviewed helper/barrel', module.check_components(root)[0][0])

    def test_unsupported_entry_syntax_fails(self):
        root = self.make_repository()
        index = root / module.COMPONENT_INDEX
        index.write_text(index.read_text() + 'export const ExtraCard = () => null;\n')
        self.assertIn('unsupported entry-point syntax', module.check_components(root)[0][0])

    def test_unterminated_comment_fails(self):
        root = self.make_repository()
        index = root / module.COMPONENT_INDEX
        index.write_text(index.read_text() + '/* unfinished')
        self.assertIn('unsupported entry-point syntax', module.check_components(root)[0][0])

    def test_missing_source_fails(self):
        root = self.make_repository()
        (root / 'packages/react/src/AgentCard.tsx').unlink()
        self.assertIn('expected one TS/TSX source', module.check_components(root)[0][0])

    def test_ambiguous_source_fails(self):
        root = self.make_repository()
        self.write(root, 'packages/react/src/AgentCard.ts', 'export const AgentCard = 1;')
        self.assertIn('expected one TS/TSX source', module.check_components(root)[0][0])

    def test_missing_index_fails(self):
        root = self.make_repository()
        (root / module.COMPONENT_INDEX).unlink()
        self.assertTrue(module.check_components(root)[0])

    def test_empty_inventory_fails(self):
        root = self.make_repository()
        self.write(root, str(module.COMPONENT_INDEX), "export * from './contracts.js';\n")
        self.assertIn('no public components', module.check_components(root)[0][0])

    def test_missing_or_duplicated_declaration_fails(self):
        for text in ['# No declaration\n', '**Implementation:** Two React components\n' * 2]:
            with self.subTest(text=text):
                root = self.make_repository()
                self.write(root, 'docs/SPECIFICATION-v0.1.md', text)
                self.assertIn('exactly one', module.check_components(root)[0][0])

    def test_declaration_inside_comment_or_fence_does_not_count(self):
        for wrapper in ['<!--\n{}\n-->\n', '```md\n{}\n```\n', '`{}`\n']:
            with self.subTest(wrapper=wrapper):
                root = self.make_repository()
                self.write(root, 'README.md', wrapper.format('**2 React components**'))
                self.assertIn('exactly one', module.check_components(root)[0][0])

    def test_missing_matrix_fails(self):
        root = self.make_repository()
        self.replace(root, 'docs/STATUS-AND-ROADMAP.md', '| Design component | React symbol | Source |', '| Broken header |')
        self.assertIn('exactly one canonical component matrix', module.check_components(root)[0][0])

    def test_sync_updates_all_counts_and_matrix(self):
        root = self.make_repository()
        self.append_export(root)
        self.assertEqual(module.check_components(root, sync=True), ([], 3, 4))
        self.assertEqual(module.check_components(root), ([], 3, 0))
        self.assertEqual(module.check_components(root, sync=True), ([], 3, 0))
        self.assertIn('**3 React components**', (root / 'README.md').read_text())
        self.assertIn('Three reference', (root / 'docs/SPECIFICATION-v0.1.md').read_text())
        self.assertIn('ContextPanel.tsx', (root / 'docs/STATUS-AND-ROADMAP.md').read_text())

    def test_normal_check_never_writes(self):
        root = self.make_repository()
        self.append_export(root)
        before = {p: p.read_bytes() for p in root.rglob('*') if p.is_file()}
        self.assertTrue(module.check_components(root)[0])
        self.assertEqual(before, {p: p.read_bytes() for p in root.rglob('*') if p.is_file()})

    def test_sync_preserves_history_and_unrelated_prose(self):
        root = self.make_repository()
        history = '# Earlier snapshot\nImplementation: Four React components\n14 test cases passed.\n'
        self.write(root, 'docs/REACT-VALIDATION-v0.1.md', history)
        self.write(root, 'docs/INTRODUCTION.md', '# Introduction\nThe original design has fourteen canonical patterns.\n')
        spec_path = root / 'docs/SPECIFICATION-v0.1.md'
        spec_path.write_text(spec_path.read_text() + '\nA product MUST verify results. 14 design patterns.\n')
        self.append_export(root)
        self.assertEqual(module.check_components(root, sync=True)[0], [])
        self.assertEqual((root / 'docs/REACT-VALIDATION-v0.1.md').read_text(), history)
        self.assertIn('fourteen canonical patterns', (root / 'docs/INTRODUCTION.md').read_text())
        self.assertIn('MUST verify results. 14 design patterns.', spec_path.read_text())

    def test_sync_validates_all_sites_before_writing(self):
        root = self.make_repository()
        self.append_export(root)
        (root / 'docs/SCOPE.md').unlink()
        before = {p: p.read_bytes() for p in root.rglob('*') if p.is_file()}
        self.assertTrue(module.check_components(root, sync=True)[0])
        self.assertEqual(before, {p: p.read_bytes() for p in root.rglob('*') if p.is_file()})

    def test_new_matrix_rows_use_export_names_and_paths(self):
        root = self.make_repository()
        self.replace(root, str(module.COMPONENT_INDEX), 'AgentCard, type', 'AgentCard as ProfileCard, type')
        self.assertEqual(module.check_components(root, sync=True), ([], 2, 1))
        self.assertIn('| Profile Card | ProfileCard | [Implemented](../packages/react/src/AgentCard.tsx) |',
                      (root / 'docs/STATUS-AND-ROADMAP.md').read_text())

    def test_cli_fails_on_drift_and_sync_repairs_it(self):
        root = self.make_repository()
        self.append_export(root)
        command = [sys.executable, module.__file__, '--root', str(root)]
        failure = subprocess.run(command, capture_output=True, text=True, timeout=10)
        self.assertEqual(failure.returncode, 1)
        self.assertIn('--sync-components', failure.stderr)
        repaired = subprocess.run([*command, '--sync-components'], capture_output=True, text=True, timeout=10)
        self.assertEqual(repaired.returncode, 0, repaired.stderr)
        self.assertIn('4 file(s) updated from 3 public exports', repaired.stdout)
        success = subprocess.run(command, capture_output=True, text=True, timeout=10)
        self.assertEqual(success.returncode, 0, success.stderr)
        self.assertIn('3 component exports; 0 errors', success.stdout)

    def test_missing_source_cannot_be_hidden_by_sync(self):
        root = self.make_repository()
        (root / module.COMPONENT_INDEX).unlink()
        result = subprocess.run([sys.executable, module.__file__, '--root', str(root), '--sync-components'],
                                capture_output=True, text=True, timeout=10)
        self.assertEqual(result.returncode, 1)

    def test_number_styles_and_acronyms(self):
        self.assertEqual(module.format_number(14, 'Four'), 'Fourteen')
        self.assertEqual(module.format_number(14, 'four'), 'fourteen')
        self.assertEqual(module.format_number(14, '4'), '14')
        self.assertEqual(module.format_number(21, 'fourteen'), '21')
        self.assertEqual(module.component_label('HTTPStatusCard'), 'HTTP Status Card')


if __name__ == '__main__':
    unittest.main()
