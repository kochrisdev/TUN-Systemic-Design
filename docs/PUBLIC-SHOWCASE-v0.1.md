# TUN Public Showcase v0.1

**Scope:** A public-facing presentation of the existing fourteen-component reference library. This increment changes the example site, not the canonical component API or the underlying review/authorization model. PR history records exact validation and merge state.

[Documentation index](README.md) · [Getting started](GETTING-STARTED.md) · [Architecture](ARCHITECTURE.md) · [Component catalog](COMPONENTS-v0.1.md)

## 1. Visitor experiences

The default page is an overview headed **Design intelligence around humanity.** It offers a starting action before the detailed technical content. The site has four hash-addressed views:

| Address | Experience |
|---|---|
| `/#overview` or `/` | Overview, purpose, principles, and entry points |
| `/#demo` | Guided task with six sequential stages |
| `/#components` | Searchable fourteen-component explorer |
| `/#trust` | Evidence/memory and supervision/recovery examples |
| `/?lab=1` | Preserved full technical component lab in a separate page session |

The production address supplied by the project owner is [tun-systemic-design-demo.vercel.app](https://tun-systemic-design-demo.vercel.app/). A configured address is not proof that a particular Git commit is already deployed. Check the Vercel deployment source SHA and its actual result.

Hash navigation requires no additional server rewrite. Browser Back/Forward changes views. The legacy `#supervision` address opens Trust & Control; unknown hashes fall back to Overview. URLs contain view names, never task content or authorization state.

## 2. Guided task

The example request prepares an update from one synthetic project note. It calls no AI model or external publication service.

| Stage | Visitor action | Boundary |
|---|---|---|
| Intent | Keep the example or type an outcome; select Inspect context | Intent is not authority |
| Context | Inspect available sources; select Prepare plan | Availability is separate from actual use |
| Plan | Review the approach; optionally revise; create a proposal | Approach review is not action approval |
| Proposal | Inspect exact content, target, effects, and limits; open review | Inspection and navigation are not consent |
| Approval | Explicitly Simulate publish or Reject action | A decision is separate from execution and verification |
| Receipt | Inspect the supplied verified local result or rejection | Rejection creates no new receipt; earlier records remain |

The guide reuses [review-model.ts](../examples/react/review-model.ts) unchanged. It does not replace the model's scope, version, expiry, and unknown-outcome checks with a presentation-only stage counter. The current stage is not evidence that work was authorized or completed.

In Context, **Change the source scenario** demonstrates missing, restricted, and stale notes. Those changes invalidate earlier reviews. Restore available notes and prepare a fresh plan before continuing. In Approval, **Test an unconfirmed outcome** demonstrates a local write whose acknowledgement is lost. **Check simulated action record** reads rather than repeats the write. Task-changing controls remain disabled while execution is pending or its outcome unknown.

Material proposal details remain visible at approval. Longer agent, evidence/memory, and record-history explanations use native disclosures. Opening them never grants authority. Production-suitability uncertainty is still explicit in the contextual evidence example.

## 3. State lifetime and navigation

The shell mounts a view when first visited and then hides rather than unmounts it during navigation. The guided controller and Trust & Control simulation therefore retain their own task state and submission latches. Leaving a view does not stop work, clear an unknown result, renew permission, or erase receipts. If pending guided work finishes while another view is open, it does not move focus out of that view.

Guided-demo records and the separate supervision fixture are intentionally independent. A stop request in Trust & Control does not cancel publication in Guided Demo. The full technical lab opens in a new tab from Trust & Control and has a different page session. It does not control either existing session.

Returning to Intent does not clear prior receipts. Editing intent or context invalidates the applicable review through the existing model. Refreshing the browser clears these non-durable simulations; it is not real-world undo. No storage, multi-tab coordination, backend idempotency, or cross-session persistence is supplied.

## 4. Component explorer

The explorer contains exactly the fourteen canonical public exports. Visitors can filter by name/export/question or by four groups: intent/identity, review/accountability, evidence/memory, and supervision/recovery.

Each component has two representative synthetic states, a human question, purpose, explicit boundary, import example, and links to its API and source. These are real component renders, not screenshots. The import example is not a complete integration; required records and callbacks are documented in the linked API guide.

Specimens are read-only. Action-request controls are disabled, and source/plan/proposal specimens do not execute workflows. Inspection disclosures and the explorer's state selector remain usable. To try actual simulated decisions or control requests, use Guided Demo or Trust & Control. A synthetic receipt is clearly a specimen, not evidence that the visitor performed an action.

The two states are not exhaustive design coverage, a full state matrix, or a conformance claim. Search returns an honest empty state when no component matches. The explorer does not fabricate additional exports.

## 5. Trust & Control Lab

Evidence and memory examples preserve the existing distinction between source material, interpretation, access, memory use, and uncertainty. The separate supervision lab preserves stop acknowledgement versus confirmed stoppage, unknown-outcome reconciliation, partial effects, and compensation rather than undo.

Scenario links and inspection controls provide navigation only. The unchanged simulation models own their local records. Real cancellation, permission revocation, source verification, retention, durable audit, and recovery remain host-service responsibilities.

## 6. Accessibility and visual behavior

The site uses the existing TUN tokens, document-level light/dark/system themes, native controls, readable state labels, and visible focus. Theme selection changes presentation only and is not stored between page sessions. The mobile Menu is a disclosure, not an ARIA application menu or modal. Escape closes it and returns focus to its button.

The overview should leave initial focus alone so the first Tab reaches Skip to content. Actual view changes focus the new heading; guided stage changes focus the stage heading. Keeping inactive views hidden removes them from normal keyboard/accessibility navigation while preserving their local state. Reduced-motion and forced-colors rules are included.

Tests target above-fold starting controls at specified viewport sizes, narrow reflow, keyboard navigation, inactive-view focus isolation, and automated accessibility samples. These do not establish every device, browser, screen reader, magnification setting, locale, or full accessibility conformance. Reference guidance: [W3C disclosure navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) and [React useId](https://react.dev/reference/react/useId).

## 7. Metadata and assets

[The HTML entry](../examples/react/index.html) contains the static title, description, canonical address, Open Graph/Twitter sharing metadata, favicon reference, and a useful no-JavaScript fallback. Individual interactive view titles update in the browser; there are no independently server-rendered pages for each hash route.

[public/social-card.png](../examples/react/public/social-card.png) is a 1200 by 630 geometric TUN wordmark. [The SVG source](../examples/react/public/social-card.svg) is editable. No font files or remote font service are required. [favicon.svg](../examples/react/public/favicon.svg) provides the browser icon. The build copies public assets as described in the [Vite asset guide](https://vite.dev/guide/assets.html#the-public-directory).

Canonical and social-image URLs deliberately use the owner's production domain, including in preview builds. Forks and custom-domain deployments must update those URLs. Social networks may cache previews; correct local metadata does not prove a particular network has refreshed its card. The interactive site is JavaScript-rendered; this is not a full SEO or crawler-rendering implementation.

## 8. Vercel deployment

The new root [vercel.json](../vercel.json) records the previously working workspace deployment settings. Import the repository and keep **Root Directory at the repository root**, not examples/react. Build the library before the demo.

| Setting | Value |
|---|---|
| Framework | Vite |
| Install | `npx --yes npm@12.1.0 ci --include=dev --no-audit --no-fund` |
| Build | `npx --yes npm@12.1.0 run build` |
| Output | `examples/react/dist` |
| Production branch | Configure main in the project dashboard |
| Application secrets | None required for this simulation |

No Node version, project access policy, environment variable, domain, or deployment-protection setting is changed by this file. The repository's engine range still applies. Vercel manages supported Node patch versions; inspect the deployment log rather than claiming the local/CI patch version is identical. Configuration references: [Vercel project configuration](https://vercel.com/docs/project-configuration) and [build settings](https://vercel.com/docs/builds/configure-a-build).

GitHub checks remain separate from the Vercel build. A successful static build is not a passing test suite. Merge reviewed, green changes; then verify the linked deployment's commit, landing page, generated assets, and guided journey. A GitHub push or merge does not itself prove production deployment succeeded.

## 9. Development and checks

Run the existing root setup and commands from [Getting Started](GETTING-STARTED.md#verification). No new dependencies, lockfile changes, package exports, model calls, analytics, or workflow permissions are needed.

[showcase-catalog.test.ts](../tests/showcase-catalog.test.ts), [showcase-specimens.test.tsx](../tests/showcase-specimens.test.tsx), and [showcase-focus.test.tsx](../tests/showcase-focus.test.tsx) cover routing, catalog behavior, read-only specimens, and initial-focus regressions. [showcase.spec.ts](../tests/browser/showcase.spec.ts) covers the public workflow, responsive layouts, navigation persistence, accessibility samples, and asset presence. Existing browser suites use `/?lab=1` with their assertions retained.

The first candidate exposed an initial-focus bug under StrictMode effect replay and a missing PNG asset. The focus handler now reacts to a real view transition, not a one-time mount flag. Failed results remain in PR history; tests were not disabled. [PR 7](https://github.com/kochrisdev/TUN-Systemic-Design/pull/7) records final-head acceptance and any later corrections.
