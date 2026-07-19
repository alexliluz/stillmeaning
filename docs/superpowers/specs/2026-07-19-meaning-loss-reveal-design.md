# Meaning Loss Reveal Design

**Date:** 2026-07-19
**Status:** Approved for implementation
**Primary objective:** Make StillMeaning's unique value understandable to a Build Week judge in under two minutes.

## Product thesis

StillMeaning's strongest claim is not that it can disable animation or generate reduced-motion CSS. It is that animation can carry information, and removing motion without first identifying that information can make an interface less understandable.

The product will make that claim visible through one counterfactual question:

> **What disappears when motion is simply removed?**

The supporting message is:

> **Animation is information.** See what disappears when motion is simply removed—then preserve it without the risky movement.

The existing principle remains the primary brand line:

> **Reduce motion, not meaning.**

## Success criteria

A judge using any curated example can complete this story in approximately 30 seconds:

1. See the original animation and the StillMeaning alternative.
2. Select **Why not just turn motion off?**
3. See a controlled **Motion Removed Only** counterfactual and a **Meaning at Risk** explanation.
4. Select **Restore meaning with StillMeaning**.
5. See the same semantic signals mapped to replacement cues and bounded validation checks.
6. Inspect the generated code diff.

The interaction must work with a keyboard, remain understandable without color, respect `prefers-reduced-motion`, and never execute model-generated code.

## Interaction design

The current Original → StillMeaning Version comparison remains the default and the main visual hierarchy. The feature does not add a permanent third preview column.

A diagnostic control labeled **Why not just turn motion off?** changes the right preview from **StillMeaning Version** to **Motion Removed Only**. The accompanying analysis changes from **Meaning Preserved** to **Meaning at Risk** and explains each semantic signal affected by blanket motion removal.

In the counterfactual state, the primary action becomes **Restore meaning with StillMeaning**. Activating it restores the StillMeaning preview and renders a compact semantic receipt. Example receipt items include:

- Motion removed
- Progress still explicit
- Status announced
- Hierarchy preserved

Switching curated examples resets the comparison target to StillMeaning so state from the previous example cannot create a misleading pairing. Normal-motion and reduced-motion controls continue to operate independently from the comparison target.

The UI uses the phrases **Meaning at Risk**, **Meaning preserved by these checks**, and **Requires developer review**. It must not claim that model reasoning or a bounded code check proves complete accessibility.

## Structured analysis model

The strict `Analysis` schema gains a required `semanticTrace` array. Each item maps one meaning from its original motion carrier through the counterfactual and into the replacement:

```ts
interface SemanticTrace {
  id: string;
  meaning: string;
  originalSignal: string;
  removalEffect: string;
  impact: "lost" | "ambiguous" | "retained";
  replacementSignal: string;
  validationCheckId: string;
}
```

All strings use the same bounded, non-empty validation approach as the existing analysis fields. IDs use the existing lowercase kebab-case convention. `semanticTrace` contains between one and eight items.

Every `validationCheckId` must reference an ID in the same analysis object's `validationChecks` array. A schema-level cross-field refinement rejects dangling references and duplicate semantic trace IDs. Invalid provider output follows the existing validated fallback path; it is never partially rendered.

Existing fields remain because they serve distinct responsibilities:

- `semanticRole` classifies the animation's overall role.
- `motionRisk` and `riskReason` describe movement risk.
- `semanticTrace` explains information loss and replacement cue by cue.
- `generatedCode` contains the proposed implementation.
- `validationChecks` report bounded facts about that implementation.
- `source` distinguishes GPT-5.6 analysis from labeled demo data.

`preservedMeaning` remains for compatibility and summary copy during this deadline-focused change. It may be derived from `semanticTrace` in a future cleanup, but that refactor is out of scope.

## Preview architecture and safety boundary

`PreviewVersion` expands from `original | stillmeaning` to `original | motion-removed | stillmeaning`. Each curated preview component owns a deterministic representation of all three versions. These previews are authored React components, not rendered source strings.

Each `MotionExample` gains `motionRemovedCode`, representing the common blanket-reduction approach shown by the counterfactual. This code is reviewable in the UI but is not dynamically executed.

For curated examples, the data flow is:

```text
Selected example
  → authored Original preview
  → authored Motion Removed Only preview
  → authored StillMeaning preview
  → strict analysis data drives risk/preservation explanations
```

For pasted source, the existing safety boundary remains:

```text
Pasted source
  → server-side GPT-5.6 request
  → strict structured validation
  → textual semantic trace and code diff
  → no generated-code preview or execution
```

The API key remains server-only. Requests retain the existing timeout, failure classification, quota handling, and clearly labeled demo fallback behavior. A custom-source request has no fabricated curated fallback and remains unavailable when validated live analysis cannot be produced.

## Curated cases

### Upload progress

- **Original signal:** Progress-bar growth plus a repeated sweeping highlight indicates ongoing upload activity.
- **Motion Removed Only:** The bar becomes static without adding an explicit numeric or persistent activity cue.
- **Impact:** `ambiguous`; the interface no longer clearly distinguishes active work from a stalled state, and the precise completion value is not exposed.
- **StillMeaning replacement:** Static 68% fill, visible `Uploading · 68%`, and complete `progressbar` semantics.

### Save confirmation

- **Original signal:** A scaling, rotating, drawn checkmark is the primary success cue.
- **Motion Removed Only:** A static, unlabeled icon remains without persistent outcome text or a status announcement.
- **Impact:** `lost` for users who cannot perceive the icon and `ambiguous` for users who miss the visual state change. Separate trace items express those distinct outcomes.
- **StillMeaning replacement:** Persistent `Changes saved` text, synchronization detail, `role="status"`, and `aria-live="polite"`.

### Panel hierarchy

- **Original signal:** A large right-to-left slide communicates movement into a deeper interface level.
- **Motion Removed Only:** Content changes immediately without adding location context or moving keyboard focus.
- **Impact:** `ambiguous`; the destination level and post-action focus target are not explicit.
- **StillMeaning replacement:** Updated breadcrumb, visible `Deeper level` context, logical heading focus, and a short opacity fade in reduced-motion mode.

The authored Original previews must match the corresponding original source. They must not silently include replacement semantics such as status announcements, breadcrumbs, or focus management that are absent from that source.

## Components and responsibilities

- `Workbench` owns the comparison target, resets it when the example changes, and supplies the selected state to previews and the inspector.
- `PreviewStage` labels and renders `original`, `motion-removed`, or `stillmeaning` without knowing case-specific semantics.
- The three case preview components render safe, authored representations of each version.
- A focused comparison control component presents the reveal/restore action and state explanation.
- `AnalysisInspector` renders either Meaning at Risk or Meaning Preserved from the same `semanticTrace` and `validationChecks` data.
- Domain schemas enforce individual field constraints and cross-field reference integrity.
- Curated example data supplies deterministic code and fallback analysis for recording reliability.

No new account system, persistence layer, external URL analysis, browser extension, Storybook integration, or automatic execution sandbox is part of this feature.

## Error handling and accessibility

- Invalid or internally inconsistent model output is rejected as a whole.
- Curated requests use the existing, visibly labeled demo fallback after timeout, authentication, quota, model-access, request, network, or validation failure.
- Pasted source never falls back to an unrelated curated example.
- Comparison controls use native buttons with `aria-pressed` or `aria-expanded` as appropriate and a visible focus state.
- Meaning status includes icons and text; color is supplementary.
- No state change depends on animation completion.
- No reveal starts automatically, flashes, or introduces continuous motion.
- CSS under `prefers-reduced-motion: reduce` removes nonessential interface transitions as it does elsewhere in the workbench.
- Preview headings and accessible names accurately identify the active comparison target.

## Verification

### Domain tests

- Accept a complete analysis with a valid semantic trace.
- Reject invalid impact values, duplicate trace IDs, and dangling validation-check references.
- Validate every curated fallback analysis and `motionRemovedCode` value.

### Component tests

- Default to Original versus StillMeaning.
- Reveal Motion Removed Only with the expected accessible label and Meaning at Risk content.
- Restore StillMeaning and show the matching semantic receipt.
- Reset the comparison target after selecting another example.
- Keep pasted-source output text-only.
- Verify the corrected Original previews do not include semantics absent from their source.

### End-to-end tests

- Complete the reveal → explain → restore → inspect-diff golden path with a keyboard.
- Exercise all three curated examples.
- Verify the public workbench remains usable at desktop and narrow viewport sizes.
- Verify reduced-motion emulation does not create continuous or large interface motion.

### Release checks

Run lint, typecheck, the complete unit/component suite, the complete Playwright suite, and a production build. Inspect the final workbench locally before deployment. Deployment, pushing, and Devpost submission remain separate authorized actions.

## Promotional application

The demo video and Devpost story should lead with the counterfactual, not with generic AI language:

1. Animation carries progress, status, hierarchy, focus, and feedback.
2. Blanket motion removal can erase or weaken those signals.
3. StillMeaning uses GPT-5.6 to map each signal to a safer replacement.
4. The developer sees the reasoning, bounded checks, and exact code diff.

This is a focused developer-tool claim. StillMeaning does not position itself as a general accessibility scanner, a complete compliance guarantee, or a tool that merely adds `prefers-reduced-motion`.
