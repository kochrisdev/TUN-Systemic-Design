# Security policy

## Report a vulnerability privately

Open the repository's [Security advisories](https://github.com/kochrisdev/TUN-Systemic-Design/security/advisories) and select **Report a vulnerability** when that control is available. Use the private form for a sanitized reproduction, affected commit or package archive, expected behavior, actual behavior, and potential impact.

If private reporting is unavailable, contact **@kochrisdev** through an existing private channel, or open an issue titled **“Request private security contact”** with no vulnerability details. Wait for a private reporting route before sending a reproduction. Do not post exploits, credentials, personal data, or customer material in public issues or pull requests.

## Review scope

Adopting organizations should start with the [TUN threat model](docs/THREAT-MODEL.md): trust boundaries, STRIDE scenarios, presentation safeguards, required host controls, and evidence for a scoped security review.

Security fixes are developed against the current `main` branch. Include the exact commit or archive digest when reporting a repository-local build. Earlier snapshots are useful reproduction evidence; there is no separate backport maintenance branch.

Reports may concern component behavior, contract handling, authorization-related examples, dependency/build configuration, or the public demonstration. Test with synthetic data and accounts you control. Do not disrupt the hosted site, probe other users' accounts, or access third-party systems.

## Coordinated handling

The maintainer will review reproducibility and impact, coordinate a fix and regression test, and agree on public disclosure with the reporter where possible. This project does not currently offer a bug bounty or guaranteed response deadline. Reporters should retain a private channel for follow-up.

Repository controls, dependency-audit policy, and owner activation instructions are maintained in [Security maintenance](docs/SECURITY-MAINTENANCE.md).
