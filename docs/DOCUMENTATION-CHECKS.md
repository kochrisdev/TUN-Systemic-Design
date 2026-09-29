# Documentation checks

[Documentation index](README.md) · [Contributing](../CONTRIBUTING.md) · [Implementation matrix](STATUS-AND-ROADMAP.md#canonical-component-matrix)

## Check links and current implementation facts

Run from the repository root with Python 3.10+:

```sh
python scripts/check_docs.py
python -m unittest discover -s tests -p 'test_docs.py'
```

The checker validates Markdown links, heading fragments and code fences, then derives the public component inventory from [index.ts](../packages/react/src/index.ts). The existing documentation workflow runs these checks on pushes and pull requests, including changes to the component exports. Checking is read-only and exits unsuccessfully on drift.

The four current implementation declarations are:

| Document | Checked statement |
|---|---|
| [Repository README](../README.md) | The bold React component count in the value paragraph |
| [Specification](SPECIFICATION-v0.1.md) | The Implementation line |
| [Roadmap](STATUS-AND-ROADMAP.md) | The Current milestone component count |
| [Scope](SCOPE.md) | The reference component count under What the project provides |

The roadmap matrix is also checked against every public component name, display label and source-file link. A renamed component with an unchanged total still fails the matrix check. Duplicate rows and stale source links fail too. Intentional row order is preserved when the inventory already matches.

## Synchronize after an export change

```sh
python scripts/check_docs.py --sync-components
git diff -- README.md docs/SPECIFICATION-v0.1.md docs/STATUS-AND-ROADMAP.md docs/SCOPE.md
python scripts/check_docs.py
```

This explicitly regenerates the four count tokens and, when needed, the roadmap table from the current exports. It keeps surrounding prose intact, preserves existing numeral/word casing up to twenty, and uses numerals for larger counts. A changed table is generated in index export order. Repeating synchronization on matching documentation changes nothing.

All source and declaration locations are validated before any writes are attempted. A missing declaration, ambiguous table, missing source file, empty inventory or unsupported export syntax must be repaired first. A removed declaration cannot silently disable its check. Link/fence errors elsewhere are still reported by the normal documentation pass.

## Source convention

The [checker](../scripts/check_docs.py) reads explicit named PascalCase value re-exports from local TSX component modules. Multiline declarations, comments, inline type specifiers, type-only re-exports and named aliases are supported. It excludes unexported internal files, type-only symbols and the explicitly listed contract/helper modules. It verifies that each referenced source exists.

This is a narrow parser for this repository's entry-point convention. Component wildcard exports, unreviewed helper barrels and unrecognized entry-point syntax fail with actionable errors instead of being silently omitted. Review the parser and regression tests when introducing a new entry-point form. TypeScript and package tests continue to check the actual API; the documentation check does not execute TypeScript.

`COMPONENT_CLAIMS` identifies the exact current-status phrases and `MATRIX` identifies the roadmap table. When restructuring those phrases or that table, update the checker and its fixtures in the same change. The expected component count is always calculated from source, never hardcoded to fourteen.

## Preserve historical evidence

Synchronization touches only the declared implementation sites. It leaves historical validation reports, changelog entries, examples, test totals and normative design-pattern counts unchanged. A previous four-component test report remains a four-component report. Adding an export updates implementation inventory; it does not automatically change the design specification's canonical pattern set.

The [regression suite](../tests/test_docs.py) exercises additions, removals, same-count renames, malformed exports, stale counts and paths, duplicate/missing declarations, read-only checking, explicit synchronization, CLI exit codes, and preservation of historical text. Prose outside the declared sites continues to receive editorial review.
