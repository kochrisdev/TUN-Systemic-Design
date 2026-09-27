# TUN Systemic Design

**A design system for AI-native products.**

> Human Intent. Machine Intelligence. Systemic Design.

TUN Systemic Design is an open design framework for building intelligent products around the complete relationship between humans, AI, agents, data, tools, decisions, actions, and learning.

Traditional design systems primarily standardize interfaces. TUN goes further by defining how intelligent systems should behave, communicate, request authority, expose agency, handle uncertainty, and remain understandable to humans.

## Core Model

```text
HUMAN → INTENT → AI → REASON → ACT → OBSERVE → LEARN → HUMAN
```

## Interaction Model

```text
ASK → THINK → PROPOSE → ACT → LEARN
```

For consequential actions:

```text
ASK → THINK → PROPOSE → APPROVE → ACT → VERIFY → LEARN
```

## Principles

TUN systems should be:

- Transparent
- User Sovereign
- Natural
- Systemic
- Adaptive
- Reversible
- Composable
- Calm

## Documentation

- [Concept Note](docs/CONCEPT-NOTE.md)
- [Manifesto v0.1](docs/MANIFESTO-v0.1.md)
- [Specification v0.1](docs/SPECIFICATION-v0.1.md)
- [Components v0.1](docs/COMPONENTS-v0.1.md)
- [Design Tokens + Visual System v0.1](docs/DESIGN-TOKENS-AND-VISUAL-SYSTEM-v0.1.md)
- [Token Validation v0.1](docs/TOKEN-VALIDATION-v0.1.md)
- [React Components v0.1](docs/REACT-COMPONENTS-v0.1.md)
- [React Validation v0.1](docs/REACT-VALIDATION-v0.1.md)

## Specification Highlights

TUN v0.1 defines normative `MUST / SHOULD / MAY` rules, autonomy and consequence levels, approval gates, agent anatomy, memory, uncertainty, action receipts, human override, recovery patterns, and initial conformance requirements.

## Visual System v0.1

The initial implementation includes a machine-readable [token source](tokens/tokens.json), generated [CSS variables](styles/tun.css), and an interactive [browser specimen](examples/visual-system.html).

It covers typography, spacing, layout, controls, borders, radius, motion, light/dark themes, and semantic AI states. Consequence, uncertainty, authority, and completion remain separate concepts. Tokens describe presentation; application services must enforce permissions and verify real actions.

### Build, validate, and preview

Python 3.10+ is required for the build tool. No third-party Python packages or external fonts are required.

```sh
python scripts/tokens.py build
python scripts/tokens.py check
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/examples/visual-system.html` in your browser. The GitHub file viewer shows HTML source, not the running preview.

The specimen's publishing flow is explicitly simulated. It does not call an AI model, publish content, or save persistent preferences. The token checks are not a full accessibility audit or certification. Tailwind and Figma adapters are not included yet.

## React Components v0.1

The [repository-local React package](packages/react) implements **Intent Composer, Agent Card, Approval Gate, and Action Receipt** with TypeScript contracts, the existing TUN themes, keyboard controls, and application-controlled action state.

Use Node **22.23.2** (`.nvmrc`) and npm **12.1.0** for the pinned development toolchain. From the repository root:

```sh
# Switch/install Node 22.23.2 with your preferred Node version manager first.
npm install --global npm@12.1.0
npm ci
npm run check
npm run dev
```

The component lab runs at `http://127.0.0.1:4173`. It is a local simulation, not a connected AI product. Browser tests use `npx playwright install chromium` followed by `npm run test:browser`.

The committed `package-lock.json` fixes the dependency graph. CI uses `npm ci`, audits dependencies, checks the existing tokens, compiles TypeScript, runs contract and React tests, builds the demo, validates a local package archive, and runs browser/accessibility samples. See the [validation report](docs/REACT-VALIDATION-v0.1.md) for dated results and their limits.

`npm run check` writes a local package archive and its inventory report under `artifacts/`. `npm run pack:react` is also available. Neither command publishes to npm. No hosted deployment or accessibility certification is claimed.

The Approval Gate emits a version-bound decision request; it does not authorize or execute backend actions. The Action Receipt renders application-supplied verification records, not a success message inferred from clicking Approve.

## Direction

Planned areas include:

- TUN Foundations
- TUN Intelligence
- TUN Interaction
- TUN Agents
- Remaining TUN React components and reference patterns
- TUN Safety & Trust
- Additional TUN Tokens and theme adapters
- TUN SDK

## Philosophy

**Simplicity with Boldness.**  
**Consistency with Conciseness.**  
**Clarity with Confidence.**

TUN Systemic Design exists to help define how humans and increasingly capable intelligent systems work together.
