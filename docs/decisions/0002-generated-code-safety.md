# 0002 — Generated code is display-only

- Status: Accepted
- Date: 2026-07-17

## Context

StillMeaning accepts untrusted frontend source and asks a model to generate replacement code. Executing either string in the application would create script injection, data exfiltration, network, dependency, and sandbox-escape risk. A permissive live preview would also make the competition demo dependent on arbitrary runtime behavior.

## Decision

The application never evaluates, imports, injects, or renders pasted or generated code. Curated before/after previews are hand-authored React components keyed by known example IDs. Custom analysis displays generated code as escaped React text in a diff and intentionally disables the live preview.

The server prompt calls source untrusted data, forbids execution and instruction-following inside the source block, and disables response storage. Request and response strings are bounded and validated. URL fetching is excluded from the MVP.

## Alternatives considered

- **Unsandboxed iframe or `dangerouslySetInnerHTML`:** rejected because it executes attacker/model content in the product origin.
- **Client-side Babel/eval sandbox:** rejected because it adds a large and fragile security boundary for limited demo value.
- **Remote container preview:** potentially viable later with process, filesystem, network, time, and resource isolation; too large for this MVP.

## Consequences

- The curated demo remains deterministic and safe.
- Custom source still demonstrates semantic analysis and code transformation.
- Reviewers must copy generated code into their own controlled environment to run it.
- A future execution feature requires a separately reviewed sandbox architecture.
