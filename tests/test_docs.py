"""Regression tests for the offline documentation checker; no third-party packages."""
from pathlib import Path
import importlib.util
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


if __name__ == '__main__':
    unittest.main()
