# Evidence and memory components v0.1

**Status:** Reference implementation; use named PR/commit evidence for validation.  
**Original increment baseline:** `1f4aacc99cf631124e0f7d768b04855c9db935b4`.  
**Package:** @tun-systemic/react 0.1.0, private and unpublished. Identify builds by commit and digest.

[Documentation index](README.md) · [Component catalog](COMPONENTS-v0.1.md) · [Status](STATUS-AND-ROADMAP.md) · [Core API](REACT-COMPONENTS-v0.1.md) · [Supervision and recovery](SUPERVISION-AND-RECOVERY-v0.1.md)

## 1. Scope and imports

This guide describes MemoryIndicator, SourceView, and UncertaintySignal, originally added by the ten-component increment. The library now also contains the four supervision/recovery components, completing all fourteen canonical reference exports. Their distinct contracts are documented in the linked guide; they do not add a memory backend or source-verification service.

```tsx
import {
  MemoryIndicator, SourceView, UncertaintySignal,
  type MemoryRecord, type EvidenceCollection, type UncertaintyAssessment,
} from '@tun-systemic/react';
import '@tun-systemic/react/styles.css';
```

Evidence/memory types, labels and helpers are exported from the **package root**, not the existing contracts subpath. No evidence-contracts package subpath is declared. Existing core/review imports are unchanged. [Public exports](../packages/react/src/index.ts) and [evidence contracts](../packages/react/src/evidence-contracts.ts) are the source of truth.

All three use existing token-based styles. They implement no model, retrieval, fact checking, memory store, retention policy, execution service or permission system.

## 2. Memory Indicator

| Prop | Required | Meaning |
|---|---|---|
| memory | Yes | MemoryRecord: id, version, type, state, scope; optional influence and retentionNotice |
| title | No | Memory use |
| onInspect | No | Navigation callback receiving memoryId and memoryVersion |
| announce | No | false; opt into short polite status announcements |
| className | No | Additional styling class |

Types are M0 No AI memory, M1 Session context, M2 User-controlled persistent memory and M3 Operational memory. State is separately active, inactive or unavailable. These categories describe memory use, not retention of every log, backup or training record.

Active M1–M3 requires nonempty influence. Inactive does not mean deleted; unavailable does not mean absent. M0 claiming active memory is inconsistent and displays Memory unavailable. Missing identity/scope or invalid classification also prevents inspection.

Inspect memory appears only for valid active M1–M3 records with a callback. It opens a host-owned information surface and must not silently edit, delete, save or grant authority. Rendering invokes no callback. The host rechecks access and version and handles navigation failures; no mutation controls are supplied.

Only active inspectable records display influence. **Filtering before rendering is not access control:** remove unauthorized data before sending props to a browser. Scope and record existence can themselves be sensitive. Retention notices are host-supplied policy, not independently verified promises.

## 3. Source View

| Prop | Required | Meaning |
|---|---|---|
| evidence | Yes | EvidenceCollection: id, version, claim, source array |
| title | No | Sources and evidence |
| announce | No | false; opt into meaningful status announcements |
| className | No | Additional styling class |

Each source has id, title, kind, relationship and relationshipExplanation. Relationships are supports, contradicts or background. Availability proves neither a claim nor actual task usage; ContextPanel remains the available-versus-used surface.

Available sources require verification (verified/unverified and detail). Optional excerpt, url and observedAt describe supporting material. Excerpt kind is quote, paraphrase or generated. Only quote uses blockquote markup. Generated interpretation is never source text, even with a supplied verified flag.

Restricted/unavailable variants have a reason and no typed excerpt, URL, timestamp or verification fields. The renderer also suppresses unexpected readable fields on those variants. Hosts must redact unauthorized values **before transmission**, including titles or existence when sensitive.

### Evidence summary rules

| Summary | Rule and limit |
|---|---|
| Evidence unavailable | No available source, including an empty collection |
| Conflicting evidence | Some source is available and a declared relationship contradicts; inaccessible contrary metadata remains visible |
| Partial evidence | Incomplete/invalid metadata, background-only evidence, inaccessible sources, missing excerpts/check details or generated interpretation |
| Evidence checked — application reported | Supporting source exists; all are available with non-generated excerpts and described checks; no metadata issue or declared contradiction |

These rules summarize supplied metadata, **not independent truth or calibrated confidence**. A false but complete-looking host record can mislead. The host owns verification and attribution. Generated-only evidence cannot produce a checked summary.

Links are optional. The limited URL helper omits unsafe values but does not enforce allowed origins or safe query parameters. Invalid timestamps display Time unavailable. The component does not calculate freshness; the host must explain or downgrade stale evidence. The task demo marks its stale fixture unverified.

## 4. Uncertainty Signal

| Prop | Required | Meaning |
|---|---|---|
| assessment | Yes | scope, level, explanation; optional basis and nextStep |
| title | No | Uncertainty |
| announce | No | false; opt into a short polite status label |
| className | No | Additional styling class |

Levels are U0 Confirmed within stated scope, U1 High confidence within stated scope, U2 Inferred and U3 Unknown. They are qualitative, not percentages. U0–U2 requires a supporting basis. Invalid classification, missing scope/explanation or missing required basis falls back to U3 with a correction notice. U3 may honestly lack a basis.

The component never derives confidence from source counts, colors, personas, model self-ratings or successful retrieval. A supplied basis is displayed, not authenticated. nextStep is explanatory text, not an action. Evidence and uncertainty are independent records whose scope and meaning the host must keep consistent; a checked source does not establish certainty about a larger decision.

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

The example creates no memory store, fake evidence, callback or external effect.

## 6. Component lab

Follow [Getting Started](GETTING-STARTED.md). The seven-component approval flow is preserved. Evidence for the current task reads its context snapshot. Before Prepare plan, the note is not used and evidence is partial. After preparation, the application can report that the fixture contains the quoted statement. Restricting/removing notes removes readable evidence and inspection. Production suitability remains Unknown.

Explore evidence and memory states uses separate synthetic fixtures. Supported/conflicting/unavailable/generated examples and M0–M3/unavailable memory modes do not change the task, approval or stored data. They are not real citations or persistent memories.

Evidence inspection is read-only. Material evidence changes affecting a real action require new canonical context/proposal revisions and fresh review. A badge never grants authority. The supervision/recovery fixture is also explicitly separate; its stop controls do not operate this review workflow.

## 7. Accessibility and validation

Readable labels replace color-only meaning. Generated IDs associate regions/headings. Native controls support inspection; announcements are opt-in and limited to short states. Hosts decide which changes to announce and manage focus when opening inspection.

Reference guidance includes [React useId](https://react.dev/reference/react/useId), [W3C status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) and [W3C use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html). These references do not certify TUN.

Tests cover classifications, incomplete metadata, source relationships, quoted/generated content, restricted fields, unsafe URLs, invalid dates, confidence fallback, callbacks and IDs. Browser samples cover connected changes, keyboard inspection, fixture separation, both themes and narrow layouts. The current package fixture covers all fourteen static renders and seven negative declaration cases; the original [evidence validation record](EVIDENCE-VALIDATION-v0.1.md) preserves ten-component results.

The existing installer, workflow permissions, dependencies, lockfile, core approval logic and generated tokens remain unchanged. Current acceptance is tracked in [PR 6](https://github.com/kochrisdev/TUN-Systemic-Design/pull/6); older reports retain their named source and test counts.

## 8. Boundaries

Typed unions and metadata checks are not complete hostile-JSON schemas. Validate null/malformed nested data before rendering. No source retrieval/authenticity verification, trained confidence calibration, persistent storage, retention enforcement, production authorization, registry publication or independent certification is supplied.

Framework hydration, CSS bundlers, independent peer matrices, other browsers, localization and manual assistive-technology review remain adoption work. All fourteen canonical reference components now exist, but real host services and full design conformance remain separate responsibilities.
