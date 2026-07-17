# 0001 — Meaning preservation is evidence, not certification

- Status: Accepted
- Date: 2026-07-17

## Context

Animation can communicate progress, status, hierarchy, focus, feedback, and cause. Removing motion may reduce vestibular risk while also removing one of those cues. StillMeaning needs a concise result that developers and judges can understand, but an AI-generated replacement cannot establish full WCAG conformance or prove usability for every person.

## Decision

Every analysis names the semantic role, describes the original behavior, proposes an alternative, lists the meaning that should remain, and supplies one or more evidence checks. The UI summarizes a non-empty all-passing list as **Meaning Preserved** and otherwise shows **Needs Review**.

The summary is bounded to the analyzed transformation. It is never described as certification, full compliance, or a substitute for expert and user testing. Each check must include concrete evidence that a reviewer can compare with the generated code.

## Consequences

- The demo makes the product thesis visible and testable.
- Deterministic fixtures and GPT output use the same schema.
- Model confidence is displayed but does not override failed checks.
- A developer can disagree with or revise an individual check.
- Future versions should add AST-based checks, runtime assertions in an isolated environment, and testing with people who use reduced motion.
