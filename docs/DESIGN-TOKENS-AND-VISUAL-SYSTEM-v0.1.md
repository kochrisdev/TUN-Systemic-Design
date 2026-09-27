# TUN Design Tokens + Visual System v0.1

**Status:** Draft implementation profile  
**Token package:** 0.1.0  
**Date:** September 2026

> Simplicity with Boldness. Consistency with Conciseness. Clarity with Confidence.

## 1. Purpose and boundary

This profile translates the [Specification](SPECIFICATION-v0.1.md) and [Components](COMPONENTS-v0.1.md) into a shared visual language. It adds executable tokens, a generated CSS export, a reproducible validator, and a browser specimen. It does not replace the existing behavioral requirements.

The visual direction is **calm, structured, and explicit**: neutral surfaces, strong typography, one blue action accent, and restrained semantic status colors. Meaning comes from labels, hierarchy, evidence, and controls—not from an appearance of intelligence.

These are proposed TUN v0.1 design decisions, not an established industry standard. This package is not a finished React library, Figma library, authorization engine, or accessibility certification.

## 2. Package and source of truth

| File | Role |
|---|---|
| `tokens/tokens.json` | Canonical editable tokens |
| `styles/tun.css` | Generated CSS custom properties |
| `scripts/tokens.py` | Dependency-free build and validation tool |
| `examples/visual-system.html` | Local light/dark specimen and simulated approval flow |
| `docs/TOKEN-VALIDATION-v0.1.md` | Generated contrast and structural test summary |

The JSON uses a deliberately limited subset of the [DTCG Format Module 2025.10](https://www.designtokens.org/tr/2025.10/format/): typed values, group type inheritance, and whole-token aliases. Colors use the [DTCG Color Module](https://www.designtokens.org/tr/2025.10/color/). DTCG is a community specification, not a W3C Recommendation. This package does not implement the entire DTCG format or resolver module.

`theme.light` and `theme.dark` are **TUN group conventions**, not a claim that DTCG defines a `$modes` property. A design-tool adapter must map these groups to that tool's modes. No Figma import compatibility has been tested.

The supported types are `color`, `dimension`, `fontFamily`, `fontWeight`, `number`, `duration`, and `cubicBezier`. The exporter supports opaque sRGB colors, nonnegative dimensions, and numeric font weights. Composite typography, shadows, gradients, transparency, wide-gamut colors, and cross-file aliases are outside this first exporter's scope.

## 3. Token architecture and naming

Three layers keep raw values separate from intent:

| Layer | Example | Responsibility |
|---|---|---|
| Primitive | `color.blue.700` | A reusable raw value |
| Semantic | `theme.light.action.primary.bg` | The purpose of a value |
| AI state alias | `theme.light.state.agent.acting` | A presentation role for a known runtime state |

Components SHOULD consume semantic tokens instead of raw palette entries. A raw blue value says nothing about permission, verification, or consequence.

An alias such as `{color.blue.700}` references a typed token. The build resolves aliases to concrete CSS values. Theme prefixes are removed and names are lowercased in the CSS export:

```text
theme.light.action.primary.bg  → --tun-action-primary-bg
theme.dark.action.primary.bg   → --tun-action-primary-bg
theme.light.state.consequence.C4 → --tun-state-consequence-c4
space.4                       → --tun-space-4
```

Token paths are case-sensitive in JSON. Do not rename `C4` to `c4` there. CSS name collisions, unresolved aliases, cycles, and mismatched types fail validation. Values are visual configuration only; they MUST NOT be used as permission checks or model confidence scores.

## 4. Color and surfaces

| Role | Light | Dark | Use |
|---|---|---|---|
| Canvas | `#F7F8FA` | `#0F131A` | Application background |
| Panel | `#FFFFFF` | `#171C24` | Work surfaces and cards |
| Subtle surface | `#EEF0F3` | `#252B35` | Nested context or passive grouping |
| Primary text | `#0F131A` | `#F7F8FA` | Outcomes, headings, main content |
| Secondary text | `#4B5563` | `#D9DDE3` | Explanations and labels |
| Muted text | `#5F6B7D` | `#9AA4B2` | Supporting metadata, never hidden consequences |
| Primary action background | `#1D4ED8` | `#93C5FD` | The principal available action |
| Primary action foreground | `#FFFFFF` | `#0F131A` | Text on the primary action |
| Focus ring | `#1D4ED8` | `#93C5FD` | Keyboard location |

`border.subtle` is decorative separation. It MUST NOT be the only visual boundary that identifies an input or important state. Use `border.control` for that purpose. Do not apply opacity to whole controls: it changes the tested color pairings. Disabled controls still need readable explanations and actual disabled behavior.

Five semantic tones provide paired `fg`, `bg`, and `border` tokens: `neutral`, `info`, `success`, `warning`, and `danger`. Use each foreground with its declared background. Arbitrary cross-pairings, overlays, gradients, or brand substitutions require new testing.

Blue is not a universal AI color. Green is not proof that a claim is true. Red identifies an exceptional or high-consequence condition, not an agent's personality. Information MUST remain understandable without color.

## 5. Typography

The sans stack prefers **Inter when already available**, then system fonts. No font is bundled, downloaded, or required. The monospace stack is for identifiers, timestamps, code, and technical inspection—not for ordinary explanations. Locale-specific font coverage must be tested independently.

| Role | Token | Size at a 16px root | Weight | Line height |
|---|---|---:|---:|---:|
| Display | `font.size.display` | 48px | 700 | 1.2 |
| Page title | `font.size.2xl` | 32px | 700 | 1.2 |
| Section heading | `font.size.xl` | 24px | 600 | 1.2 |
| Lead | `font.size.lg` | 18px | 400 | 1.5 |
| Body | `font.size.md` | 16px | 400 | 1.5 |
| Label | `font.size.sm` | 14px | 600 | 1.5 |
| Metadata | `font.size.xs` | 12px | 400 | 1.5 |

Sizes are in `rem`; leave the browser root size at the user's default. Use natural-height content, not fixed-height text containers. Legal effects, irreversible consequences, and required decisions MUST NOT be relegated to small metadata. Text must wrap and remain available at zoom; do not truncate critical approval details.

## 6. Space, layout, and density

The spacing scale is `0, 4, 8, 12, 16, 20, 24, 32, 48, 64px` at a 16px root, exposed as `space.0/1/2/3/4/5/6/8/12/16`. Use 8–12px within small groups, 16–24px within cards, and 32–48px between major sections.

`layout.page-max` is 75rem; `layout.reading-max` is 44rem; the default gutter is 1.5rem. These are maximums, not fixed widths. Layout must shrink to the available viewport. Breakpoint tokens are 48rem and 75rem; adapters must emit media-query literals at build time rather than placing ordinary CSS custom properties inside media-query conditions.

Default interactive targets use `control.min-size = 2.75rem` in **both dimensions**: 44px at a 16px root. Compact controls use 2rem only when input modality, spacing, and usability justify them. These are TUN choices, not a claim that WCAG AA always requires 44px. [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) specifies a 24 by 24 CSS pixel baseline with defined exceptions.

Small screens must preserve the action, consequence, rejection path, and current status. Do not hide them in a horizontally scrolling approval card. Review layouts against [WCAG reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html); tables and other genuinely two-dimensional content require separate treatment.

## 7. Shape, borders, icons, and layers

Use 4px radius for small elements, 8px for controls and standard cards, and 12px for larger containers. Pill radius is reserved for short labels, not every button. Borders are 1px by default and 2px for emphasis. Flat surfaces and borders are preferred; this release intentionally has no decorative shadow tokens.

Icons use a 1.25rem box by default and accompany text for consequential states. An icon-only control needs an accessible name. Agent identity SHOULD use initials or a simple symbol before adding an avatar. An avatar is not evidence of capability or authority.

Layer values are `base:0`, `sticky:100`, `popover:400`, `modal:800`, and `urgent:900`. They are coordination conventions within an application's stacking context, not guarantees across independent stacking contexts or the browser top layer. Never let sticky elements cover focus, rejection, or override controls.

## 8. AI state semantics

State tokens are **foreground colors**. The table identifies the associated paired `status.<tone>.bg` and `status.<tone>.border`. A full label is always required; several different states intentionally share a tone.

| State family | Mapping |
|---|---|
| Agent | idle → neutral; listening/thinking/planning/acting/verifying → info; waiting/blocked/escalated → warning; completed → success; failed → danger |
| Approval | awaiting/expired → warning; approved → info; rejected/superseded → neutral |
| Consequence | C0/C1 → neutral; C2 → info; C3 → warning; C4 → danger |
| Uncertainty | U0/U1 → neutral; U2/U3 → warning |
| Memory | M0/M1 → neutral; M2/M3 → info |
| Tool | idle → neutral; active → info; waiting → warning; completed → success; failed → danger |

Show distinct facts independently: **“Completed”**, **“C3 · External consequential”**, and **“U2 · Inferred”** can coexist. Completion describes execution, not truth or safety. Approval is authorization, not completion. A rejected proposal is not necessarily a system failure.

U0 and U1 retain their definitions in the specification. Their neutral visual treatment avoids implying truth through a green badge. A claimed U0 state still needs appropriate evidence; U1 must not be manufactured from an uncalibrated model statement. This release introduces no numeric confidence meter.

Autonomy remains a separate textual label: Level 0–4 as defined by the specification. Do not infer it from an agent's color. Memory labels communicate use of context, not data-retention guarantees beyond the application's documented behavior.

## 9. Canonical component recipes

| Component | Visual and content contract |
|---|---|
| Intent Composer | Panel surface; visible label; control border; body text; explicit scope and start action |
| Agent Card | Name and role first; textual state; authority summary; optional identity symbol |
| Context Panel | Subtle surface; source categories; temporary/persistent distinction; private details collapsed appropriately |
| Plan View | Ordered major steps; approval points; changed steps labeled; not an internal reasoning transcript |
| Proposal Card | “Proposed” heading; optionally dashed border; target and consequences visible; no success treatment |
| Approval Gate | Material effect and reversibility beside specific approve/reject actions; never a preselected approval |
| Action Receipt | “Executed”, “Partial”, or “Failed” with actual evidence; actor, target, time, and available recovery |
| Memory Indicator | M0–M3 label plus understandable scope; inspect/manage when supported |
| Source View | Source identity and date where available; quotation distinguished from synthesis |
| Uncertainty Signal | U0–U3 label, material limitation, and useful next step; no decorative certainty |
| Tool Activity | Tool/action/target at meaningful granularity; live progress only when observed |
| Agent Activity | Task and operational status; numerical progress only when measured |
| Human Override | Persistent, plainly labeled control when applicable; distinguish stop requested from stopped |
| Recovery Control | Actual supported recovery; distinguish rollback, compensation, retry, and reset |

Visual styles cannot enforce these behaviors. Permission validation, approval binding, freshness checks, and action verification belong in the application/service layer. Never report an external action as completed because a button was clicked. Never label a local reset as reversal of a real external side effect.

## 10. Motion and accessible interaction

Durations are 0, 120, 180, and 240ms with `cubic-bezier(0.2,0,0,1)`. Motion SHOULD explain a state change, not simulate thinking. No glowing brain, perpetual shimmer, or artificial progress percentage is prescribed.

The CSS export changes all motion-duration tokens to 0ms under `prefers-reduced-motion: reduce`. Components must consume those tokens and suppress any independent animation or auto-scrolling. Application completion logic MUST NOT depend on a transition-end event firing.

Focus uses a 2px ring with a 3px offset. Preserve the offset so the ring sits against a tested surface rather than blending into an action fill. Do not remove focus outlines. Use semantic controls, visible labels, appropriate live-region announcements, logical reading order, and an operable rejection path. Do not announce every streamed token or progress tick.

The declared ordinary-text pairings are tested against 4.5:1, following [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Important control boundaries and focus/state indicators are tested against 3:1 where applicable, following [WCAG non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). Subtle decorative separators are not claimed to meet that threshold.

These tests do not establish full accessibility. Test rendered components with keyboard input, assistive technologies, text enlargement, narrow viewports, forced colors, localization, and real users. The preview includes a forced-colors fallback but is not a substitute for that audit.

## 11. Using the package

No JavaScript package installation or external font service is required for the preview. From the repository root:

```sh
python scripts/tokens.py build
python scripts/tokens.py check
python -m http.server 8000 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8000/examples/visual-system.html`. Python 3.10 or later is required for the builder. The page also works as a local file. Its approval actions are explicitly simulated; it does not connect to an AI model or publish anything.

To consume the CSS:

```html
<!doctype html>
<html lang="en" data-tun-theme="dark">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TUN product</title>
    <link rel="stylesheet" href="styles/tun.css">
  </head>
  <body><!-- Product components go here. --></body>
</html>
```

Place the theme attribute on the document's `html` element. Use `light` or `dark` for an explicit choice. Remove the attribute to follow the operating system. This exporter supports document-level themes, not nested theme islands.

```css
.tun-card {
  background: var(--tun-surface-panel);
  color: var(--tun-text-primary);
  padding: var(--tun-space-6);
  border: var(--tun-border-thin) solid var(--tun-border-subtle);
  border-radius: var(--tun-radius-lg);
}
.tun-control:focus-visible {
  outline: var(--tun-focus-width) solid var(--tun-focus-ring);
  outline-offset: var(--tun-focus-offset);
}
```

Tailwind, React, Figma, native, and agent-builder adapters may consume this source, but no specific adapter or interoperability claim is included in v0.1. Native adapters must translate `rem` intentionally. Coding agents SHOULD read the behavioral specification as well as the tokens.

## 12. Validation, change control, and next boundary

Edit the JSON, run `build`, then run `check`. Commit the source, generated CSS, report, and relevant documentation together. `check` fails when generated files drift. Color changes require rerunning all declared pairings. New states require updating the token groups, validator state map, component copy, and this mapping table together.

Preserve semantic names wherever possible. Record changes to token meaning, type, removal, or contrast contracts as breaking changes even when a color change looks minor. This draft does not promise a stable public API or independent TUN certification.

The next implementation boundary is a tested component library with behavioral state machines, application-enforced permissions, integration tests, and design-tool assets. This package supplies its visual foundation; it does not pretend those later layers already exist.

---

**Human Intent. Machine Intelligence. Systemic Design.**
