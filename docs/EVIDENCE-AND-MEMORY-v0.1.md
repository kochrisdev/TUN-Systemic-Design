# Evidence and memory components v0.1

**Status:** Reference implementation; use the PR/commit evidence before claiming validation or merge.  
**Baseline:** `1f4aacc99cf631124e0f7d768b04855c9db935b4`.  
**Package:** `@tun-systemic/react` 0.1.0, private and unpublished. Identify builds by commit and digest.

[Documentation index](README.md) · [Component catalog](COMPONENTS-v0.1.md) · [Status](STATUS-AND-ROADMAP.md) · [Core API](REACT-COMPONENTS-v0.1.md)

## 1. Scope and imports

This increment adds **MemoryIndicator**, **SourceView**, and **UncertaintySignal**. The library now implements ten of fourteen canonical patterns. The four remaining patterns are Tool Activity, Agent Activity, Human Override, and Recovery Control.

```tsx
import {
  MemoryIndicator, SourceView, UncertaintySignal,
  type MemoryRecord, type EvidenceCollection, type UncertaintyAssessment,
} from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';
```

New evidence/memory types, labels, and helpers are exported from the **package root**. They are not exported from the existing `@tun-systemic/react/contracts` subpath, and no `evidence-contracts` package subpath is declared. Existing core/review imports remain unchanged. [Public exports](../packages/react/src/index.ts) and [evidence contracts](../packages/react/src/evidence-contracts.ts) are the API source of truth.

All three use existing token-based component styles. No model, source retrieval, fact checking, memory store, retention policy, execution service, or permission system is implemented.

## 2. Memory Indicator

| Prop | Required | Meaning |
|---|---|---|
| `memory` | Yes | MemoryRecord: id, version, type, state, scope; optional influence and retentionNotice |
| `title` | No | Default: Memory use |
| `onInspect` | No | Navigation callback receiving memoryId and memoryVersion |
| `announce` | No | false; opt into a polite status label for meaningful changes |
| `className` | No | Additional styling class |

Memory types use the specification's **M0 No AI memory**, **M1 Session context**, **M2 User-controlled persistent memory**, and **M3 Operational memory**. State is separately active, inactive, or unavailable. These classifications describe memory use, not how long every log, backup, or training record exists.

Active M1–M3 requires a nonempty influence explanation. Inactive memory does not mean deleted memory. Unavailable memory does not mean absent memory. An M0 record claiming active memory is inconsistent and displays Memory unavailable. Missing identity/scope or invalid classification also prevents inspection.

Inspect memory is offered only for valid active M1–M3 records with a callback. The callback opens a host-owned information surface; it must not silently edit, delete, save, or grant authority. Rendering invokes no callback. Host navigation must recheck access and the supplied record version. There are no memory mutation controls in this increment.

Only active inspectable records display influence. **Filtering before rendering is not access control:** remove unauthorized content and metadata before sending props to a browser. Scope and a record's existence can themselves be sensitive. The retentionNotice is supplied by the host; the component cannot verify that policy.

## 3. Source View

| Prop | Required | Meaning |
|---|---|---|
| `evidence` | Yes | EvidenceCollection: id, version, claim, source array |
| `title` | No | Default: Sources and evidence |
| `announce` | No | false; opt into status announcements for meaningful evidence changes |
| `className` | No | Additional styling class |

Each source has id, title, kind, relationship, and relationshipExplanation. Relationship is supports, contradicts, or background. **A source being available is not proof of the claim, nor proof it was used.** ContextPanel remains the surface for available-versus-used context.

Available sources require a verification record with state verified/unverified and a detail string. Optional fields are excerpt, url, and observedAt. An excerpt's kind must explicitly be quote, paraphrase, or generated. Only quote uses blockquote markup. Paraphrases are labeled as such. Generated interpretation is explicitly not source text, including when a caller supplies a verified flag.

Restricted/unavailable sources have a reason and no typed excerpt, URL, timestamp, or verification fields. The renderer also suppresses unexpected content/link fields on those variants. Hosts must still filter unauthorized values **before transmission**, including sensitive source titles. A restricted source may be listed only when its existence may be disclosed.

### Evidence summary rules

| Result | Rule and limit |
|---|---|
| Evidence unavailable | No source is available, including an empty collection |
| Conflicting evidence | At least one source is available and any declared source relationship contradicts; inaccessible contrary metadata remains visible |
| Partial evidence | Other incomplete cases: invalid metadata, background-only evidence, inaccessible sources, missing excerpts/check details, or generated interpretation |
| Evidence checked — application reported | At least one supporting source; all sources available with non-generated excerpts and described application checks; no detected metadata issue or declared contradiction |

This ordering summarizes supplied records. **It does not independently establish truth or calibrated confidence.** A complete-looking but false host record can mislead; the host owns verification and claim-to-source attribution. Generated-only evidence cannot produce a checked summary. Links are optional; supplied unsafe links are omitted using the existing limited URL helper. That helper does not enforce allowed origins or protect sensitive query parameters. Invalid timestamps show Time unavailable.

The implementation does not determine freshness. A host must downgrade or explain stale evidence; the connected task demo explicitly marks its stale fixture unverified.

## 4. Uncertainty Signal

| Prop | Required | Meaning |
|---|---|---|
| `assessment` | Yes | scope, level, explanation; optional basis and nextStep |
| `title` | No | Default: Uncertainty |
| `announce` | No | false; opt into a polite status label |
| `className` | No | Additional styling class |

Levels are **U0 Confirmed within stated scope**, **U1 High confidence within stated scope**, **U2 Inferred**, and **U3 Unknown**. They are qualitative labels, not percentages or calibrated probabilities. U0–U2 needs a supporting basis. Missing scope/explanation, invalid classification, or an unsupported U0–U2 is displayed as U3 Unknown with a correction notice. U3 may honestly lack a basis.

The component does not infer confidence from source counts, colors, an agent persona, model self-rating, or successful tool retrieval. A supplied basis is displayed, not authenticated. A nextStep is explanatory text, not an executable action. Evidence and uncertainty remain separate records with different scopes; the host must keep their meanings consistent rather than automatically equating a checked source with certainty about a larger decision.

## 5. Minimal local-only example

```tsx
import { MemoryIndicator, SourceView, UncertaintySignal } from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';

export function EvidenceSummary() {
  return <>
    <MemoryIndicator memory={{ id: 'session', version: '1', type: 'M1', state: 'active',
      scope: 'This draft only', influence: 'Supplied session notes shaped the draft.' }} />
    <SourceView evidence={{ id: 'draft-evidence', version: '1', claim: 'The draft is ready for production.', sources: [] }} />
    <UncertaintySignal assessment={{ level: 'U3', scope: 'Production readiness',
      explanation: 'No production validation was supplied.', nextStep: 'Test the intended host integration.' }} />
  </>;
}
```

This example creates no memory store, fake evidence, callback, or external effect.

## 6. Component lab

Follow [Getting Started](GETTING-STARTED.md). The existing seven-component approval flow is preserved. A new **Evidence for the current task** section reads its context snapshot. Before Prepare plan, the note has not been used and evidence is partial. After preparation, the application can report that the fixture contains the quoted simulation statement. Restricting or removing the notes removes readable evidence and inspection. Production suitability remains explicitly Unknown.

The **Explore evidence and memory states** disclosure uses a separate synthetic fixture set. Its supported, conflicting, unavailable, and generated examples and M0–M3/unavailable memory modes do not modify the task, approval, or stored data. These examples are not real citations or persistent memories. Their separation is visible in the interface.

Evidence inspection is read-only. This increment deliberately does not add new material inputs to ActionProposal. Real evidence changes affecting an action require a new canonical context/proposal revision and fresh review; the host must bind those revisions and enforce authorization. A display badge never changes that contract.

## 7. Accessibility and validation

Components use readable labels and explanations rather than color-only states. Generated IDs associate headings and regions. Native buttons/links support inspection. Announcements are opt-in and limited to the short status label, not an entire list of excerpts. Hosts must choose which changes need announcements and manage focus when opening inspection surfaces.

Reference guidance reviewed for these choices: [React useId](https://react.dev/reference/react/useId), [W3C status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), and [W3C use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html). These references do not certify TUN.

New Vitest contract and React tests cover classifications, incomplete records, source relationships, quoted/generated text, inaccessible payload suppression, unsafe URLs, invalid dates, unsupported confidence, callbacks, and unique IDs. Chromium tests cover connected state updates, keyboard inspection/disclosures, fixture separation, both themes, accessibility samples, and narrow reflow. Archive and isolated-consumer checks now exercise ten components and four negative declaration cases.

The new tests are picked up by existing test globs; the installer, workflow permissions, dependencies, lockfile, core approval logic, and generated tokens are unchanged. Use actual CI logs for passing counts. Historical [workflow](REVIEW-VALIDATION-v0.1.md) and [consumer](CONSUMER-VALIDATION-v0.1.md) reports remain evidence for their named earlier snapshots, not blanket claims about this increment.

## 8. Boundaries

TypeScript unions and typed-metadata checks are not complete runtime schemas for hostile JSON. Null or malformed nested payloads still require host-side validation. No source retrieval, source authenticity verification, trained-model confidence calibration, persistent storage, deletion/training policy enforcement, production authorization, registry publication, or independent accessibility/security certification is supplied.

Framework hydration, CSS-bundler integration, independent peer matrices, other browsers, localization, and manual assistive-technology review remain adoption work. Four further canonical components remain unimplemented.
