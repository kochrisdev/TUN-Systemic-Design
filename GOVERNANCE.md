# Governance

**TUN Systemic Design is a founder-led, single-maintainer project created and maintained by Christopher Tun (`@kochrisdev`), with open contributions.** Its development includes AI-assisted implementation, documentation, and testing. Project stewardship and acceptance of changes remain the maintainer's responsibility.

**Effective:** September 30, 2026.  
[Contributing](CONTRIBUTING.md) · [Roadmap](docs/STATUS-AND-ROADMAP.md) · [Security](SECURITY.md) · [Cite TUN](#attribution-and-citation)

## Who decides

| Role | Responsibility and authority |
|---|---|
| Founder and current sole maintainer — Christopher Tun (`@kochrisdev`) | Sets project direction; decides specification and API changes; accepts or declines contributions; authorizes releases and maintainer access. |
| Contributors | Propose changes, report issues, review work, supply evidence, and challenge decisions. Participation does not itself grant merge, release, or administration privileges. |
| Adopting teams | Own their integration's security, operation, and scoped conformance assessment. Adoption does not make the adopter a project maintainer. |

[CODEOWNERS](.github/CODEOWNERS) records current review ownership. There is no governing foundation, steering committee, voting membership, or independent certification board. The repository's authorship and review records provide contribution history; stars, forks, commit counts, and PR counts are not measures of independent authorship, review, or adoption.

## How changes are decided

Small corrections can go directly to a pull request. For a new principle, normative requirement, public API, dependency, or substantial integration, first open an issue describing the problem, proposed approach, alternatives, compatibility implications, and evidence needed. Link that discussion from the implementing PR.

The maintainer records the decision and its rationale in the issue or PR. Disagreement should address concrete behavior, risks, evidence, or user needs. Contributors can request reconsideration with additional evidence; unresolved design decisions rest with the maintainer under this model, rather than an implied committee vote.

Normative changes identify affected sections and stable requirement IDs, their strength, and their compatibility impact. Update applicable specifications, examples, tests, traceability, and the changelog together. Preserve historical validation records. Breaking changes need explicit migration guidance and a deliberate release decision; a draft document or private package version does not promise a stable public API.

## Review, merging, and releases

Use pull requests and require successful `documentation` and `verify` checks for the proposed revision before merging. Follow [Contributing](CONTRIBUTING.md) for the evidence expected for each kind of change. Workflow titles and test totals do not replace inspection of the actual result and diff. The [security maintenance guide](docs/SECURITY-MAINTENANCE.md) describes how to activate and verify GitHub enforcement; this policy does not change repository settings.

While there is one maintainer, the maintainer may merge their own PR after recording the checks and rationale. That is same-maintainer review, not independent review. AI-generated analysis, automated tests, and delegated GitHub operations do not supply a second human approver. Contributors using AI remain responsible for the submitted change and must identify material AI assistance and the validation actually performed in the PR.

The maintainer explicitly authorizes tags, package publication, deployment changes, and support commitments. A passing PR is not permission for an unrelated release. Security reports follow [SECURITY.md](SECURITY.md), rather than public issue disclosure. Commercial relationships relevant to a decision should be disclosed in that discussion; sponsorship does not purchase acceptance or conformance findings.

## Additional maintainers and continuity

A contributor can request maintainership through an issue after demonstrating sustained, reviewable work and sound handling of the project's safeguards. Appointment requires an explicit maintainer decision and the candidate's acceptance, followed by a PR updating this document and CODEOWNERS. Repository privileges are granted separately and only for the agreed role. Maintainers can step down by recording a handover and transferring outstanding responsibilities.

Until another trusted maintainer accepts responsibility, continuity depends on the current sole maintainer. An announced succession should record who takes over direction, review, security response, and release access; inactivity alone does not transfer authority. Forking remains available under the repository license, but a fork does not silently become this upstream project.

Revisit this governance model when adding maintainers, establishing an external pilot partnership, or making a public package release. Changes to this document use the same public proposal and review process.

## Attribution and citation

Use [CITATION.cff](CITATION.cff) when citing the framework, its specification, or its reference implementation. Cite the exact document and repository revision used, not merely the moving `main` branch. Obtain the full revision with `git rev-parse HEAD` and include an access date. A suitable template is:

```text
Tun, Christopher. TUN Systemic Design [Design framework and reference implementation].
GitHub. Revision <full commit SHA>, <document path or package scope>.
Accessed <YYYY-MM-DD>.
```

GitHub supports generating citations from a root [CITATION.cff file](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-citation-files). The file follows [Citation File Format](https://citation-file-format.github.io/) and identifies the repository as software; its description includes the framework and documentation. No paper, DOI, archived release, or peer-review status is asserted. Release-specific version/date/identifier fields should be added only with a corresponding release record.

Citation authorship credits the framework; it is separate from the maintainer roster and Git commit count. Review meaningful authorship additions with the contributor's consent and retain contribution credit in PR history. Citation is requested for attribution and reproducibility, not added as a restriction to the existing [CC0-1.0 license](LICENSE). Third-party references retain their own attribution and licenses.
