# Scope and non-claims

**Applies to:** TUN v0.1 reference system. **Updated:** September 29, 2026.

[Introduction](INTRODUCTION.md) · [Documentation index](README.md) · [Implementation status](STATUS-AND-ROADMAP.md) · [Integration checklist](INTEGRATION-CHECKLIST.md)

TUN provides the design language and interface building blocks for understandable, controllable AI actions. This page collects project-wide boundaries, validation coverage, and release terminology in one place. The [Specification](SPECIFICATION-v0.1.md) remains the source of behavioral requirements; this page adds no normative rules.

## What the project provides

The repository includes fourteen reference React components, typed interaction contracts, visual tokens and light/dark themes, a behavioral specification, a public showcase, a technical component lab, and validation tooling. The [implementation matrix](STATUS-AND-ROADMAP.md#canonical-component-matrix) links each component to its source; the [documentation index](README.md) links API guides and validation records.

The [conformance layer](../conformance/README.md) connects mandatory specification statements to stable IDs, selected executable tests, and remaining assessment procedures. Its [generated matrix](../conformance/TRACEABILITY.md) shows current coverage and specific gaps.

Figma, Tailwind and native adapters, complete runtime input schemas, and a design linter are future work. The documentation checker validates Markdown links, fences and component inventory; it is not a design linter. The specification's conceptual YAML is an illustration, not a supported runtime configuration format.

## Where the application takes over

TUN components display application-supplied information and emit user requests. Your application owns authentication, permissions, canonical proposal versions, expiry and revocation checks, durable duplicate-effect prevention, execution, verification, and audit records. It also supplies model and agent runtimes, memory storage, source retrieval and verification, worker cancellation, and recovery services.

An approval button captures a decision; the service authorizes and executes it. An override captures an intervention request; worker observations establish whether it succeeded. These distinctions belong in the [API guides](REACT-COMPONENTS-v0.1.md) and [architecture](ARCHITECTURE.md), alongside the controls they govern.

TypeScript contracts and display checks do not validate arbitrary untrusted JSON or authenticate supplied evidence. Local submission guards do not provide durable idempotency across remounts, retries, and multiple tabs. Memory labels describe context reuse, not logging, backup, deletion, or training policy. Production integrations must implement these responsibilities for their own data, users, and services; the [integration checklist](INTEGRATION-CHECKLIST.md) is the starting worksheet.

## Demo behavior and data

The showcase and technical lab use synthetic, in-memory simulations. They do not call an AI model, connect accounts, publish messages, stop real workers, or maintain persistent AI memory. The component explorer offers two representative read-only specimens per component; the guided and trust labs provide interactive simulations.

Visited showcase views retain task state during navigation. Refreshing clears the page session rather than undoing an external action. Opening the separate technical lab creates another page session. A hosting provider may maintain access or operational logs under its own policies; the demo's memory labels do not describe those records.

## What validation establishes

Validation records identify a source revision, environment, commands, results, and remaining coverage. An implemented component has source and exports. A validated claim additionally needs a successful named check. Historical reports retain the component counts and results of their original snapshots.

The conformance runner collects fresh, exact file/title test results and joins them to requirement IDs. Passing mapped checks provide the evidence described by each mapping; product and service procedures remain separately assessable under those same IDs. Use the [assessment workflow](../conformance/README.md#complete-a-scoped-product-assessment) to record full rule outcomes, reviewers and justified non-applicability. Initial traceability covers mandatory specification sentences; recommendation and component-catalog coverage remain planned expansion.

The isolated consumer test checks installation and lockfile-based reinstall outside the workspace, installed declarations, static rendering, and package/CSS resolution for each [React compatibility profile](REACT-COMPATIBILITY.md). The matrix selects React 18.3.0, React 18.3.1 and the locked React 19 graph with matching type majors. Separate jsdom tests exercise hydration of the exported specimens, stable IDs and StrictMode decision safeguards. These samples do not establish every framework, server-component boundary, streaming scenario or CSS-bundler integration. Chromium interaction tests, selected accessibility checks, screenshots, and declared token contrast pairs cover their tested cases rather than every browser, assistive technology, layout, or state. A dependency audit reports known advisories at its run time, not a security guarantee.

Source merge, deployment completion, and live-site testing are separate observations. Deployment access, response headers, production assets, performance, and social previews need checks on the deployed address. See [showcase validation](SHOWCASE-VALIDATION-v0.1.md) and the other records in the [documentation index](README.md#evidence-and-historical-records).

## Release status and conformance

The component package is repository-local, private, and unpublished to npm at version 0.1.0. Use a source commit and archive digest to distinguish builds sharing that version. A hosted demonstration, a document version, a Git commit, a registry release, and an application's production-readiness decision are different milestones. CI artifact retention is temporary.

TUN is a project design framework and draft specification, not an independently adopted industry standard. Its use of RFC-style requirement language does not make it an IETF standard. No independent TUN certification program, security certification, accessibility certification, or universal interoperability claim is provided.

TUN-Inspired, TUN-Aligned, and TUN-Conformant have the scoped meanings defined in [Specification section 31](SPECIFICATION-v0.1.md#31-tun-conformance). Full product conformance requires evidence against every applicable requirement; component tests, tokens, or a TUN logo alone do not establish it. Applicable accessibility standards and other obligations remain part of the adopting product's review.

## Keeping the documentation useful

Keep general project caveats on this page and link here from entry-point documents. Keep action-specific consequences, permissions, evidence requirements, and recovery limits beside the behavior they govern. This separation lets readers discover TUN's value quickly while giving implementers a precise account of its responsibilities and coverage.
