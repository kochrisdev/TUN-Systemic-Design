# Badge accessibility: meaning without color

**Every rendered `.tun-badge` carries descriptive text. Color reinforces the meaning; it does not supply it.**

[Documentation index](README.md) · [Visual system](DESIGN-TOKENS-AND-VISUAL-SYSTEM-v0.1.md) · [Specification](SPECIFICATION-v0.1.md#22-visual-language)

## Component review

The source review found descriptive text in every existing badge. No component or token change was needed. Intent Composer is the one canonical component without a badge; its visible input label, scope and notices convey meaning directly. Human Override and Recovery Control share the internal ControlAction badge implementation.

| Component | Non-color meaning in the badge |
|---|---|
| Intent Composer | No badge. Visible input label, scope and notices are reviewed separately. |
| Agent Card | Named operational state, such as Planning or Blocked. |
| Context Panel | Active, partial, missing or restricted context. |
| Plan View | Proposed approach, Blocked, or the applicable review/completion state. |
| Proposal Card | Named proposal state or an explanatory blocking reason. |
| Approval Gate | Consequence code **and description**, such as C4 · High consequence. |
| Action Receipt | Known outcome or Pending verification. |
| Memory Indicator | Memory mode/use, or Memory unavailable. |
| Source View | Evidence checked, Partial evidence, Conflicting evidence or Evidence unavailable. |
| Uncertainty Signal | Level **and description**, such as U2 · Inferred or U3 · Unknown. |
| Tool Activity | Named observed state, or Outcome not verified / Observation time unavailable. |
| Agent Activity | Named observed state, or Outcome not verified / Observation time unavailable. |
| Human Override | Explicit request/acknowledgement/confirmed-outcome state. |
| Recovery Control | Explicit request/result state; compensation remains labeled as not undo. |

## Executable regression contract

[badge-text.ts](../tests/browser/badge-text.ts) provides `inspectBadgeText` and `expectBadgeText`. It inspects text nodes in every rendered badge in the supplied page or component, including badges below the fold. It excludes icon/SVG text, CSS-generated content, hidden/aria-hidden content, transparent or zero-size text, common screen-reader-only clipping, and text positioned outside the badge. An accessible-name attribute alone cannot satisfy the visible-text requirement. Empty, whitespace-only, symbol-only and bare C/U/M state-code labels fail.

The generic check detects the presence of descriptive text, not arbitrary semantic correctness. Independent expected-label fixtures verify the meaning of known component states. Labels need not be English: visible non-Latin text is supported and tested. An `inert` container alone does not hide a badge; visible inert badges are still checked. A badge in an inactive hidden view or closed disclosure is checked when that view is shown; specimen tests independently assert badge counts so an absent expected badge cannot pass vacuously.

The browser coverage has three parts:

| Suite | Coverage |
|---|---|
| [Component specimens and guard regressions](../tests/browser/badge-text.spec.ts) | Both explorer states of every canonical component, plus deliberately bad/good markup and live review/evidence/supervision transitions. [Visibility regression](../tests/browser/badge-visibility.spec.ts) keeps visible inert badges in scope. |
| [Consequence and state matrix](../tests/browser/badge-states.spec.ts) | C0–C4; U0–U3 and unsupported-confidence fallback; every declared Agent Card/activity status; unverified terminal activity and invalid observation time. Uses the built React components with actual component/token CSS in an isolated browser document. |
| [Public showcase](../tests/browser/showcase.spec.ts) | The helper runs at existing axe checkpoints, each explorer specimen, and after each public-showcase browser test. Existing axe checks remain enabled. |

Explorer, state-matrix and live-transition checks run in light, dark and Chromium forced-colors modes at 320 pixels. The isolated matrix checks static rendered labels; the explorer and workflow checks exercise hydrated components and actual state changes.

```sh
npm ci
npm run build:library
npx playwright install chromium
npx playwright test tests/browser/badge-
```

Run `npm run test:browser` for the complete browser suite after building the library. The existing React CI job already runs that suite, so these tests need no additional workflow or dependency.

## Requirement and evidence links

These checks add browser evidence for [SPEC-22-001](../conformance/TRACEABILITY.md#SPEC-22-001) and [SPEC-24-003](../conformance/TRACEABILITY.md#SPEC-24-003). They also sample the textual state communication in [SPEC-24-002](../conformance/TRACEABILITY.md#SPEC-24-002). The current conformance collector maps Vitest results only; it does not ingest the new Playwright tests. Retain the browser CI run/HTML report and its `badge-state-labels` attachments as separate evidence, rather than counting them as new mapped-test passes.

W3C [Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color) explains why information conveyed with color needs an additional visual means. A screen-reader-only name is not a substitute for a visible cue for sighted users who cannot distinguish colors. TUN chooses descriptive text for its badge convention.

The text guard complements contrast/axe checks. It does not prove sufficient contrast, correct announcements, every CSS clipping or occlusion case, every browser/assistive technology, or the correctness of host-supplied status. See [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing) for the role of automated and manual checks. Review long/localized labels and consequential states in the adopting application's actual layout.

## Maintaining the rule

New badge-bearing components and state variants need independent expected labels and browser assertions. Keep state text visible when changing icons, CSS, themes or forced-colors behavior. Preserve the guard's negative fixtures: they prove that color-only, icon-only and hidden-text substitutions are rejected. A full component without a badge is valid; an expected status badge silently removed or emptied is not.
