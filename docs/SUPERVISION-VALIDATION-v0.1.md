# Supervision and recovery validation v0.1

**Date:** September 28, 2026.  
**Scope:** Fourteen canonical reference components and the separately stepped local supervision fixture.  
**Baseline:** `c3762ac3f7bdcb8925bf6a552d70c353e58abbf1`.  
**Acceptance:** [PR 6](https://github.com/kochrisdev/TUN-Systemic-Design/pull/6) records final-head CI and merge status.

[Supervision API](SUPERVISION-AND-RECOVERY-v0.1.md) · [Implementation matrix](STATUS-AND-ROADMAP.md) · [Getting Started](GETTING-STARTED.md)

## First observed implementation run

Implementation commit **`3fcc3895ddbc021e131821f0df46fb23a11ff736`** passed [React run 36406042389](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36406042389) and [documentation run 36406042545](https://github.com/kochrisdev/TUN-Systemic-Design/actions/runs/36406042545).

GitHub checked synthetic merge **`df8425c0c2d9c8a2d2fe9dd4441493f3b9be8908`**, combining that head with the unchanged baseline. The React verify job was **108874897249**. The initial implementation run passed without disabling tests or weakening accessibility assertions.

| Application group | Observed passes |
|---|---:|
| Existing Node contracts | 90 |
| Evidence metadata | 34 |
| Supervision metadata | 66 |
| React components | 112 |
| Review/supervision models | 35 |
| Chromium browser | 31 |
| **Initial total** | **368** |

Vitest ran 247 of these cases (metadata, React and models); Node ran 90 and Chromium 31 separately. Consumer static renders and negative declarations are additional acceptance checks, not extra browser tests or double-counted application tests.

Full TypeScript, library/demo builds, 45-file package inventory and fourteen canonical exports passed. The existing isolated consumer test passed fresh external-directory installation, its own-lockfile reinstall, declarations, fourteen static renders, seven negative type cases, package resolution and CSS/token paths. Internal ControlAction is packaged but not a public export.

The unchanged 212 typed tokens and 142 declared contrast pairings passed. Full and runtime audit reports in the inspected artifact reported zero known vulnerabilities at validation time. These results do not establish application security or complete accessibility.

## Environment and package identity

The observed CI used Node 22.23.2, npm 12.1.0, React/React DOM 19.3.0 and the committed dependency graph. The local coding container could not resolve GitHub/npm; it did not run a substitute full locked installation. Actual build and browser evidence came from the existing GitHub workflows.

Initial implementation artifact **10962437499** was downloaded and verified:

| Item | SHA-256 |
|---|---|
| Artifact ZIP | `6f796c2730c284a3b85059e3d941a91e73927e16b490dfa55c72c340f5cba306` |
| TUN package archive | `657f347c0a6f47c17fe9a247986580f3ffe2e7a0242f0f6d73a17cc2f23a1aaa` |
| Repository lockfile | `d311ee4a51ccb75b6f36c2f119a1e5d08044ed0b6053a96c2a3a8d164e296ef1` |

These archive hashes identify the first implementation, not every later README or package build. Package version remains private 0.1.0; final PR metadata records the current source and artifact digest. Artifact retention is temporary.

## Review findings and subsequent correction

Representative light and dark 320px screenshots showed readable material details and full-width controls. Review found a semantic fixture defect despite green CI: the recovery factory inherited the stop operation's scope wording. It now describes compensation or inspection of the existing stop record, with two regression cases ensuring the distinct scope and immutable acknowledged snapshot.

Documentation is synchronized to fourteen reference exports, without rewriting historical validation records as current counts. The API guide distinguishes observations, requests, acknowledgements, terminal evidence, effectful recovery, read-only reconciliation, and host responsibilities.

The two additional scope regressions and later documentation changes require a fresh final-head run. **The 368 figure above belongs to the named first run.** Do not infer final success or count from authored tests. PR 6 records observed final-head results after that rerun, avoiding a self-referential evidence commit loop.

## Behavioral scope

Tests cover valid and invalid activity states, observation dates, bounded progress, unknown outcomes, exact run/control revisions, material fingerprints, expiry, local duplicate latches, promise acknowledgement versus completion, bound terminal evidence, inspection callbacks, compensation versus undo, and lost-acknowledgement reconciliation. The original approval, evidence and review-model tests remain intact.

The local fixture uses explicit worker steps. Its history is in memory; it is not trusted storage or a real worker. The override and recovery controls govern that fixture only, not the publication-review lab. A future product must connect real authorization, cancellation, monitoring and recovery services and keep human controls reachable during autonomous work.

## Reproduce and interpret

Use the pinned toolchain, committed graph and the commands in [Verification](GETTING-STARTED.md#verification). Run browser, token, documentation and audits separately from npm run check. The consumer harness remains offline with lifecycle scripts disabled and no workspace links; there is no new network fallback, install permission or dependency upgrade.

Typed metadata checks are not complete hostile-input schemas. Authenticity, policy, durable idempotency, concurrency across tabs/remounts, current run ownership, service cancellation, reconciliation and real recovery are host responsibilities. The review is assistant-performed, not an independent audit. Fourteen exports do not establish full normative conformance, broad framework/hydration support, localization, every browser, manual assistive-technology coverage, publication, deployment or certification.
