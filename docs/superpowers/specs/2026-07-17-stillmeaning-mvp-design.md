# StillMeaning MVP Design

## Product promise

StillMeaning helps frontend developers reduce motion without deleting the information that animation communicates. The MVP analyzes an animation, identifies its semantic role and motion risk, proposes a safer alternative, generates code, and verifies a bounded set of meaning-preservation checks.

The primary demonstration must make this claim visible in under two minutes:

> Reduce motion, not meaning.

## Scope

### P0

- Three stable built-in examples: progress/loading, success feedback, and hierarchy/focus transition.
- A single-page developer workbench with example selection, original/reduced previews, analysis, validation, and code diff.
- Normal-motion and reduced-motion preview controls.
- Server-only GPT-5.6 Responses API integration.
- Strict schema validation for model output.
- A deterministic fallback clearly labeled as demo data when no API key is configured or the model request fails.
- Timeout, refusal, malformed-output, and rate/error handling.
- Generated code is displayed and copied, never executed as arbitrary model output.
- Keyboard operation, visible focus, non-color status indicators, responsive layout, and native `prefers-reduced-motion` support.
- Tests, build verification, setup documentation, and deployment-ready configuration.

### P1

- Paste HTML/CSS/JavaScript/React snippets for analysis.
- User correction of inferred semantic role.
- Recording-friendly presentation state and submission screenshots.
- Stronger accessibility regression coverage.

### Excluded from the competition MVP

- URL crawling or remote page fetching.
- Accounts, billing, teams, or project history.
- Executing arbitrary user or model-generated code.
- Browser extensions, IDE extensions, or automatic pull-request mutation.
- Claims of WCAG certification or complete accessibility conformance.

## Architecture

The project is a TypeScript Next.js application using the App Router. The browser renders the workbench and curated previews. A server route owns all OpenAI access and returns a validated analysis object. Shared Zod schemas define the contract between the route, fallback fixtures, and UI.

Key boundaries:

1. `domain`: animation-analysis schema, meaning checks, risk vocabulary, and example definitions.
2. `analysis`: prompt construction, GPT provider, timeout/error normalization, and deterministic demo provider.
3. `workbench`: client-side selection, mode controls, comparison, analysis presentation, diff, and copy behavior.
4. `previews`: hand-authored safe components for the three demonstration cases. They do not evaluate generated strings.

## Analysis contract

Each analysis contains:

- `animationId`
- `detectedTechnique`
- `semanticRole`
- `motionRisk`
- `riskReason`
- `originalBehavior`
- `proposedAlternative`
- `preservedMeaning`
- `confidence`
- `generatedCode`
- `validationChecks`
- `source`, either `gpt-5.6` or `demo-fallback`

The schema uses closed enums where practical, bounded strings, numeric confidence from 0 to 1, and at least one validation check. The application validates both model output and fallback fixtures.

## Meaning Preserved validation

“Meaning Preserved” is a bounded product assertion, not an accessibility certification. Each example declares explicit observable checks:

- Progress: a textual/numeric value remains visible and progress state remains programmatically available.
- Success/failure: outcome text and an icon or semantic status remain after motion is reduced.
- Hierarchy/focus: destination context is named and focus moves to a logical target without relying on large spatial movement.

The UI shows each check and its evidence. A result is “Meaning Preserved” only when every declared check passes. Unknown or unverified checks remain visibly unresolved.

## GPT-5.6 flow

1. The client sends a known example ID or bounded source snippet to the server.
2. The server rejects oversized or invalid input.
3. The provider sends the source, semantic taxonomy, safety constraints, and JSON schema to the Responses API using `gpt-5.6`.
4. The request is aborted after a short timeout.
5. The response is parsed with the OpenAI SDK structured-output helper and validated again with Zod.
6. Refusals and provider errors are normalized into safe application errors.
7. When no key exists, or the real request fails during the demo, the route returns a matching deterministic fixture with `source: demo-fallback` and a visible explanation. It never labels fallback content as model output.

API credentials remain server-only and `.env*` files containing secrets are ignored by Git.

## Interface design

The primary screen is a restrained developer workbench rather than a marketing landing page.

- Header: StillMeaning wordmark, one-sentence promise, and provider status.
- Left rail: three example choices and a source-code tab.
- Center: the dominant Original / StillMeaning Version comparison with an explicit normal/reduced toggle.
- Right inspector: technique, semantic role, risk, reasoning, recommendation, confidence, and Meaning Preserved checks.
- Lower panel: accessible code diff and copy action.

The visual system uses a dark neutral workspace, high-contrast text, cool cyan for analysis, and warm amber for risk. Status always includes text or iconography, never color alone. Motion is limited to short opacity and color transitions and removed under `prefers-reduced-motion`.

## Error handling and safety

- Invalid request: field-level 400 response.
- Missing key: deterministic fallback with an explicit banner.
- Provider timeout/rate/error/refusal: non-sensitive normalized message plus fallback option.
- Invalid structured output: reject it; never partially trust or execute it.
- Copy failure: visible text notification.
- Generated code: plain text only; no `eval`, dynamic script injection, or unsandboxed preview.
- User source: size limited and treated as untrusted input.

## Testing

- Unit tests for schemas, fixtures, meaning validation, request limits, timeout/error mapping, and prompt constraints.
- Component tests for example selection, mode switching, fallback disclosure, validation display, diff, copy, and keyboard behavior.
- Route tests with an injected provider; no live API calls in automated tests.
- Browser tests for the three-case golden path, desktop/mobile layout, reduced-motion behavior, and obvious accessibility violations.
- Required final checks: lint, typecheck, unit/component tests, production build, and browser walkthrough.

## Success criteria

- A judge can select any built-in example and understand the original meaning, risk, transformation, preserved meaning, and concrete code change without setup knowledge.
- All three cases work without network access through clearly labeled demo data.
- With a configured Platform API key, the same contract is populated by a real GPT-5.6 request.
- No secret reaches client bundles or Git.
- Model-generated text is schema-validated and never directly executed.
- The application itself respects reduced-motion preferences and remains keyboard operable.

## GitHub and evidence

The repository will use `main`, the MIT License, and the remote `alexliluz/stillmeaning`. Commits will represent meaningful milestones. The README and decision records will describe where Codex contributed, how GPT-5.6 is used, what was tested, and the distinction between Codex credits and Platform API credits. Before final Devpost submission, the user must run `/feedback` in this primary Codex session and save the resulting Session ID.
