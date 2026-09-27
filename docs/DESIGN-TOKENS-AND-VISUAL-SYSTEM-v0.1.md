# TUN Design Tokens + Visual System v0.1

**Status:** Draft implementation profile.  
**Token package:** 0.1.0; documentation revision September 27, 2026.

[Documentation index](README.md) · [Token source](../tokens/tokens.json) · [React implementation](REACT-COMPONENTS-v0.1.md)

> Simplicity with Boldness. Consistency with Conciseness. Clarity with Confidence.

## 1. Purpose and boundary

This profile translates the [Specification](SPECIFICATION-v0.1.md) and [Components](COMPONENTS-v0.1.md) into concrete visual choices: neutral surfaces, strong typography, one blue action accent, restrained status colors, and clear human control. It does not replace behavioral requirements.

The visual foundation is implemented, and a separate four-component React reference package now consumes it. The other ten components, Figma/Tailwind/native adapters, production authority services, and certification remain outside the delivered scope. These are TUN project decisions, not an established external industry standard.

## 2. Package and source of truth

| File | Responsibility |
|---|---|
| [tokens/tokens.json](../tokens/tokens.json) | Canonical editable values and aliases |
| [styles/tun.css](../styles/tun.css) | Generated CSS variables |
| [scripts/tokens.py](../scripts/tokens.py) | Dependency-free build and validation |
| [examples/visual-system.html](../examples/visual-system.html) | HTML specimen; local simulated interaction |
| [Token validation](TOKEN-VALIDATION-v0.1.md) | Generated structural/contrast report |
| [React package](../packages/react) | Component implementation consuming this visual system |

The token JSON follows a deliberately limited subset of [DTCG Format Module 2025.10](https://www.designtokens.org/tr/2025.10/format/) and its [Color Module](https://www.designtokens.org/tr/2025.10/color/): typed values, inherited group types, and whole-token aliases. This community specification is not a W3C Recommendation. TUN does not implement the whole DTCG format or resolver module.

`theme.light` and `theme.dark` are TUN group conventions, not a DTCG `$modes` claim. No Figma import compatibility is established. Supported exporter types are `color`, `dimension`, `fontFamily`, `fontWeight`, `number`, `duration`, and `cubicBezier`. The exporter handles opaque sRGB, nonnegative dimensions, and numeric weights. Composite typography, shadows, gradients, transparency, wide-gamut colors, cross-file aliases, and nested theme islands are outside this implementation.

## 3. Token architecture and naming

| Layer | Example | Meaning |
|---|---|---|
| Primitive | `color.blue.700` | Reusable raw value |
| Semantic | `theme.light.action.primary.bg` | Visual purpose |
| AI state alias | `theme.light.state.agent.acting` | Presentation for a known operational state |

Components SHOULD consume semantic tokens. A palette value does not establish authority, verification, or confidence.

```text
theme.light.action.primary.bg   → --tun-action-primary-bg
theme.dark.action.primary.bg    → --tun-action-primary-bg
theme.light.state.consequence.C4 → --tun-state-consequence-c4
space.4                        → --tun-space-4
```

Aliases such as `{color.blue.700}` resolve to concrete CSS values. JSON paths are case-sensitive; preserve `C4`, `U2`, and `M1` in the source. CSS names are lowercased with theme prefixes removed. Unresolved/cyclic aliases, unsupported values, theme mismatches, and name collisions fail the supported checks. Tokens MUST NOT be treated as authorization checks or probability scores.

## 4. Color and surfaces

| Role | Light | Dark |
|---|---|---|
| Canvas | `#F7F8FA` | `#0F131A` |
| Panel | `#FFFFFF` | `#171C24` |
| Subtle surface | `#EEF0F3` | `#252B35` |
| Primary text | `#0F131A` | `#F7F8FA` |
| Secondary text | `#4B5563` | `#D9DDE3` |
| Muted text | `#5F6B7D` | `#9AA4B2` |
| Primary action background | `#1D4ED8` | `#93C5FD` |
| Primary action foreground | `#FFFFFF` | `#0F131A` |
| Focus ring | `#1D4ED8` | `#93C5FD` |

Use canvas for the page, panels for work, and subtle surfaces for passive grouping. Muted text must not hide a consequential effect. `border.subtle` is decorative; it MUST NOT be the only boundary identifying an input or important state. Use `border.control` for meaningful boundaries.

Five tones provide paired foreground/background/border tokens: neutral, info, success, warning, danger. Use declared pairings; overlays, opacity, gradients, or brand substitutions require new testing. Do not reduce whole-control opacity and assume the original contrast result remains valid.

Blue is an action accent, not a universal AI identity. Green is not proof a claim is true. Red is not an agent personality. Critical information MUST remain understandable without color.

## 5. Typography

The sans stack prefers Inter only when already available, then system fonts. No font is bundled, remotely loaded, or required. Monospace is for code, identifiers, and technical metadata. Test script and locale coverage independently.

| Role | Token | At a 16px root | Weight | Line height |
|---|---|---:|---:|---:|
| Display | `font.size.display` | 48px | 700 | 1.2 |
| Page title | `font.size.2xl` | 32px | 700 | 1.2 |
| Section heading | `font.size.xl` | 24px | 600 | 1.2 |
| Lead | `font.size.lg` | 18px | 400 | 1.5 |
| Body | `font.size.md` | 16px | 400 | 1.5 |
| Label | `font.size.sm` | 14px | 600 | 1.5 |
| Metadata | `font.size.xs` | 12px | 400 | 1.5 |

Sizes use rem; preserve the user's root-size preference and allow natural content height. Material legal effects, irreversible consequences, and required decisions MUST NOT be relegated to tiny metadata or truncated. Test zoom, wrapping, and longer localized copy.

## 6. Space, layout, and density

The scale is `0, 4, 8, 12, 16, 20, 24, 32, 48, 64px` at a 16px root, using `space.0/1/2/3/4/5/6/8/12/16`. Use 8–12px within small groups, 16–24px in cards, and 32–48px between major sections as starting choices.

`layout.page-max` is 75rem; `layout.reading-max` is 44rem; gutter is 1.5rem. They are maxima or defaults, not fixed viewport widths. Breakpoints are 48rem and 75rem. Emit media-query literals through adapters rather than putting ordinary custom properties in media-query conditions.

Default controls use 2.75rem in both dimensions, or 44px at a 16px root. Compact 2rem controls require appropriate modality, spacing, and usability review. These are TUN choices, not a claim that WCAG AA universally requires 44px. See [WCAG target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) for its baseline and exceptions.

On small screens, preserve the target, effect, rejection path, and state. High-consequence review must not require horizontal scrolling to discover material information. Test [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), including content that genuinely needs two dimensions.

## 7. Shape, borders, icons, and layers

Use 4px radius for small elements, 8px for controls/standard cards, and 12px for larger containers. Pill radius suits short labels, not every button. Borders are 1px by default and 2px for emphasis. No decorative shadow tokens are included.

Icons use a 1.25rem box by default. Consequential states need text, and icon-only controls need accessible names. Initials or a simple symbol can identify an agent without suggesting authority through an elaborate persona.

Layer values are base 0, sticky 100, popover 400, modal 800, urgent 900. These coordinate an application's stacking contexts; they cannot guarantee order across all contexts or the browser top layer. Sticky surfaces must not cover focus, rejection, or override controls.

## 8. AI state semantics

State tokens are foreground colors. Use the associated `status.<tone>.bg` and `.border` where a filled badge is desired. Full textual labels are required because distinct states intentionally share colors.

| Family | Mapping |
|---|---|
| Agent | idle → neutral; listening/thinking/planning/acting/verifying → info; waiting/blocked/escalated → warning; completed → success; failed → danger |
| Approval | awaiting/expired → warning; approved → info; rejected/superseded → neutral |
| Consequence | C0/C1 → neutral; C2 → info; C3 → warning; C4 → danger |
| Uncertainty | U0/U1 → neutral; U2/U3 → warning |
| Memory | M0/M1 → neutral; M2/M3 → info |
| Tool | idle → neutral; active → info; waiting → warning; completed → success; failed → danger |

Completed, C3 External consequential, and U2 Inferred can coexist. Completion does not establish truth or safety; approval is not completion; rejection is not necessarily failure. U0/U1 require a stated evidentiary basis and are not numeric probabilities. Autonomy remains a separate 0–4 label. Memory tokens do not establish retention or deletion guarantees.

## 9. Canonical component recipes

| Pattern | Visual/content treatment |
|---|---|
| Intent Composer | Panel, explicit label, control border, body text, scope, and start action |
| Agent Card | Identity and purpose first, textual state, separate authority/capability |
| Context Panel | Source/scope categories, persistence distinction, authorized disclosure |
| Plan View | Ordered major steps, approval points, explicit changes, no internal-reasoning transcript |
| Proposal Card | Proposed label, visible effects, no completed-success treatment |
| Approval Gate | Material effects/recovery beside specific approve/reject controls |
| Action Receipt | Actual outcome, actor, target, time, verification, and recovery limits |
| Memory Indicator | M0–M3 plus understandable scope and supported controls |
| Source View | Identity/date, quotation versus synthesis, access/freshness limits |
| Uncertainty Signal | U0–U3, basis, limitations, useful next step |
| Tool Activity | Meaningful observed tool/action/target state without payload dumping |
| Agent Activity | Task and measured progress, not invented percentages |
| Human Override | Persistent where needed; distinguish requested from confirmed stop |
| Recovery Control | Supported restore, compensation, reconciliation, or retry |

These recipes cover all fourteen patterns. Only four are currently React implementations. CSS cannot authorize, execute, verify, delete memory, stop a task, or undo an external effect.

## 10. Motion and accessible interaction

Durations are 0, 120, 180, and 240ms with `cubic-bezier(0.2,0,0,1)`. Motion SHOULD explain state changes rather than simulate thought. Reduced-motion media preferences set duration tokens to 0ms; components must also suppress independent animation or auto-scrolling. Completion logic MUST NOT depend on transition-end events.

Focus uses a 2px ring with a 3px offset against a tested surface. Preserve visible focus, semantic names, reading order, keyboard interaction, and an operable rejection path. Announce useful state changes rather than every token or progress tick.

Declared ordinary-text pairs use 4.5:1 and meaningful boundary/indicator pairs use 3:1, with scope and exceptions described by [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). Decorative separators are not claimed to meet an input-boundary threshold. The [generated report](TOKEN-VALIDATION-v0.1.md) records only declared pairs, not every combination.

Test rendered keyboard behavior, assistive technologies, text enlargement, forced colors, localization, and real task comprehension. Token checks and automated browser samples are not full accessibility certification.

## 11. Using the package

From the repository root, Python 3.10+ can build and preview the token-only specimen:

```sh
python scripts/tokens.py build
python scripts/tokens.py check
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/examples/visual-system.html`. The local file also needs the relative repository stylesheet. It is a simulation and does not publish anything.

```html
<link rel="stylesheet" href="styles/tun.css">
```

Set `data-tun-theme="light"` or `"dark"` on the document's `<html>` element. Remove the attribute for system preference. Nested theme islands are unsupported.

```css
.tun-card {
  background: var(--tun-surface-panel);
  color: var(--tun-text-primary);
  padding: var(--tun-space-6);
  border: var(--tun-border-thin) solid var(--tun-border-subtle);
  border-radius: var(--tun-radius-lg);
}
```

React consumers should import `@tun-systemic/react/styles.css`, which includes the token CSS, instead of assuming these variables alone provide component styling. The [React guide](REACT-COMPONENTS-v0.1.md) and [Getting Started](GETTING-STARTED.md) cover the existing package. Tailwind, Figma, native, and agent-builder adapters remain planned, with no interoperability claim.

## 12. Validation, change control, and next boundary

Edit tokens, build, then check. Commit source, generated CSS, report, and relevant docs together. `check` detects generated-file drift. Revalidate declared contrast pairings after changes; new states need coordinated source, validator, copy, and mapping updates.

Preserve semantic names where possible. Record meaning/type/removal changes and altered contrast contracts as compatibility changes. The draft makes no stable-public-API or certification promise. See [Contributing](../CONTRIBUTING.md) for review requirements and [Status and Roadmap](STATUS-AND-ROADMAP.md) for implemented versus future work.

**Human Intent. Machine Intelligence. Systemic Design.**
