# Security maintenance

[Report a vulnerability](../SECURITY.md) · [Contributing](../CONTRIBUTING.md) · [Documentation index](README.md)

TUN keeps its security policy, dependency upkeep, review ownership, and CI failure policy in version control. Repository administrators activate the GitHub settings separately.

## Controls and ownership

| Control | Repository implementation | Operational check |
|---|---|---|
| Vulnerability reporting | [SECURITY.md](../SECURITY.md) | Owner enables GitHub private vulnerability reporting and checks notifications. |
| Dependency upkeep | [Dependabot](../.github/dependabot.yml): weekly Actions and root npm workspace updates | Review the first Dependabot update jobs; enable Dependabot alerts/security updates in repository settings. |
| Code ownership | [CODEOWNERS](../.github/CODEOWNERS): `@kochrisdev` owns every file | Add an independent trusted reviewer before requiring owner approval on owner-authored PRs. |
| Audit gate | [audit_dependencies.py](../scripts/audit_dependencies.py) | Both full and runtime audits must succeed with zero reported findings. |
| Required CI | [Main ruleset template](../.github/rulesets/main-required-checks.json) | Owner imports and activates it; a JSON file alone does not configure GitHub. |

## Dependency audit policy

**The policy is to fail on any reported severity or audit failure.** The full graph includes development, optional and peer dependencies; the runtime graph omits development dependencies and includes optional and peer dependencies. Both commands explicitly use `--audit-level=info` so a local npm threshold cannot silently weaken the gate.

```sh
python scripts/audit_dependencies.py
```

The runner attempts both audits even when the first fails, retains each raw JSON report and stderr, and writes `artifacts/dependency-audit-summary.json` with both exit codes and severity counts. A nonzero npm exit, any finding, invalid/incomplete report, registry error, or timeout makes the overall command fail. A new attempt replaces previous outputs. No automatic `npm audit fix`, dependency installation, or lockfile edit is performed.

The earlier workflow already failed on a nonzero `npm audit` exit. Redirecting stdout into an artifact never disabled that behavior. The improvement here is an explicit threshold, both reports on failure, and regression-tested aggregation. npm documents the exit-code and threshold behavior in its [audit reference](https://docs.npmjs.com/cli/v12/commands/npm-audit/).

The React workflow also runs weekly, Monday at 06:17 UTC, to recheck an unchanged dependency graph against new advisories. GitHub may delay scheduled runs. Audit commands use the configured npm registry and send dependency metadata to its audit service. Keep registry credentials out of committed files and artifact/log output.

There is no automatic severity waiver or allowlist. An unavailable registry is a failed check, not a clean result; rerun after service recovery. Address vulnerabilities through reviewed manifest/lockfile updates. Any exception policy needs a separately reviewed change naming the advisory, impact assessment, owner, expiry, and mitigation rather than `continue-on-error` or `|| true`.

## Dependabot upkeep

The two update entries cover GitHub Actions references under `.github/workflows` and the root npm workspace graph. Existing Actions remain pinned to full commit SHAs. Dependabot supports updating commit-pinned Actions references; review the upstream release and resulting SHA rather than replacing pins with floating tags. See [GitHub Actions upkeep](https://docs.github.com/en/actions/reference/security/secure-use) and the [Dependabot options](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference).

Updates are assigned to `@kochrisdev`, with up to five open version-update PRs per ecosystem. Security-update and alert settings are separate from this version-update schedule. There is no auto-merge configuration and no blanket major-version ignore. Review compatibility, preserve action pins, and require the normal checks before merging.

A new npm workspace sharing the root lockfile joins that graph. Separate Go or Python manifests need their own Dependabot ecosystem entry and applicable audit/validation checks when they enter `main`. In particular, the draft runtime-contract PR must reconcile its Go/Python consumers and CI changes with this security baseline before merging. This housekeeping change does not merge that unfinished work.

## Activate private vulnerability reporting

As repository owner, open **Settings → Security and quality → Advanced Security → Private vulnerability reporting → Enable**. GitHub's labels may vary slightly; the feature is named **Private vulnerability reporting**. The [official setup guide](https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/configure-vulnerability-reporting/configure-for-a-repository) describes the setting.

On **Security → Advisories**, verify that an ordinary signed-in reporter can use **Report a vulnerability**. An owner/admin may see the draft-advisory workflow instead. Subscribe to repository **Watch → Custom → Security alerts** and verify notification delivery. Also review the adjacent dependency graph, Dependabot alerts and Dependabot security-update controls.

**Review observation, September 29, 2026:** the current GitHub connection cannot query the private-reporting endpoint or write administration settings. Its activation state is not established by this change. SECURITY.md therefore supplies a safe contact-request fallback without asking anyone to publish vulnerability details.

## Activate required checks on main

At review time, the existing active `TUN-Approve` ruleset (ID `24069585`) targets all branches and restricts creation, deletion and non-fast-forward updates, with configured bypass actors. It contains no required status checks. The classic branch-protection endpoint returned an administration-permission error, so it was not independently inspected. Do not interpret a general `protected: true` branch flag as proof that the two jobs are required.

After this PR's checks pass and its workflow changes reach `main`, import [main-required-checks.json](../.github/rulesets/main-required-checks.json) through **Settings → Rules → Rulesets → New ruleset → Import a ruleset**. Review it and click **Create**, leaving enforcement **Active**. Keep the existing ruleset: this is an additional rule targeting only `refs/heads/main`, not a replacement for existing controls. GitHub documents [ruleset import](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/managing-rulesets-for-a-repository).

The template requires pull requests, resolved review conversations, an up-to-date branch, and the following exact **check-run names**, both from the **GitHub Actions** app (observed integration ID `15368`):

| Workflow | Required check context |
|---|---|
| TUN documentation checks | `documentation` |
| TUN React checks | `verify` |

It also blocks branch deletion and force pushes and has an empty bypass list. Workflow titles are not check-context names; use the job check names above. The [rules API reference](https://docs.github.com/en/rest/repos/rules#create-a-repository-ruleset) documents source-bound status-check parameters.

Both workflows now run for every pull request, including documentation-only and Dependabot changes, and support `merge_group`. The React workflow no longer has path filters: [a skipped required workflow can otherwise remain pending and block merging](https://docs.github.com/en/enterprise-cloud@latest/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks). Neither workflow uses `pull_request_target`; untrusted contributions retain read-only workflow permissions. Push runs are limited to `main` to avoid redundant feature-branch push/PR runs.

The template intentionally sets **zero required approvals** and **code-owner approval off** while there is only one configured code owner. It still requires a PR and both checks. CODEOWNERS routes ownership/review requests; it does not supply an independent reviewer. Once a second trusted maintainer with write access is designated, add that person to CODEOWNERS, require one approval and enable code-owner review. Preserve the no-bypass status-check gate. See [code ownership](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners).

After activation, inspect the live rule's target, checks, source app and bypass settings. Use a small disposable PR to confirm both checks are marked required and merging is blocked while either is pending or failing. Record the active rule ID and observation date. **The committed template has not been applied by this change.**

## Verify maintenance changes

```sh
python -m unittest discover -s tests -p 'test_security.py'
python scripts/check_docs.py
python scripts/check_conformance.py
```

The security suite uses synthetic audit responses to test clean, vulnerable, malformed, timed-out and failed commands, retained artifacts, and failure exit status. It also checks the committed configuration's required events, read-only permissions, SHA pins, dependency-update entries, ownership and ruleset contexts. These are local configuration assertions, not a check of live GitHub settings. The React workflow separately runs the real registry audits.
