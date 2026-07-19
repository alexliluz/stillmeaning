# Meaning Loss Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a safe counterfactual comparison that shows what meaning becomes lost or ambiguous when motion is merely disabled, then maps each signal to the StillMeaning replacement and bounded validation evidence.

**Architecture:** Extend the shared Zod contract with a cross-validated semantic trace, add an authored `motion-removed` state to each curated React preview, and let the workbench switch the existing right-side comparison between that counterfactual and the StillMeaning result. The inspector renders risk and preservation views from the same trace while pasted code stays text-only and model-generated code remains unexecuted.

**Tech Stack:** Node.js 24+, pnpm 11.9.0, Next.js 16.2.10, React 19.2.7, TypeScript 6.0.3, OpenAI SDK 6.47.0, Zod 4.4.3, Vitest 4.1.10, Testing Library 16.3.2, Playwright 1.61.1, global CSS.

## Global Constraints

- Preserve the default Original → StillMeaning Version comparison and the three curated examples.
- Use the exact UI phrases **Why not just turn motion off?**, **Motion Removed Only**, **Meaning at Risk**, **Restore meaning with StillMeaning**, **Meaning preserved by these checks**, and **Requires developer review**.
- Treat `impact` as exactly `"lost" | "ambiguous" | "retained"`.
- Reject duplicate semantic trace IDs and any `validationCheckId` that does not reference the same analysis object's `validationChecks`.
- Keep `OPENAI_API_KEY` and all OpenAI calls server-only.
- Never execute user or model-generated code.
- Keep GPT-5.6 and deterministic demo provenance visibly distinct.
- Keep pasted-source analysis text-only; do not invent a curated preview fallback for it.
- Use authored React components for all curated preview states.
- Keep every primary action keyboard operable, do not rely on color alone, and respect `prefers-reduced-motion`.
- Do not add dependencies, accounts, URL fetching, persistence, billing, browser extensions, or code execution sandboxes.

---

### Task 1: Strict semantic trace contract

**Files:**
- Modify: `src/domain/analysis.ts`
- Modify: `src/domain/analysis.test.ts`
- Modify: `src/server/analysis/provider.ts`
- Modify: `src/server/analysis/prompt.ts`
- Modify: `src/server/analysis/prompt.test.ts`

**Interfaces:**
- Produces: `SemanticTrace`, `semanticImpactSchema`, `semanticTraceSchema`, `analysisSchema`, and `modelAnalysisSchema` from `src/domain/analysis.ts`.
- `SemanticTrace.validationCheckId` references `ValidationCheck.id` inside the same parsed analysis.
- `OpenAIAnalysisProvider` consumes exported `modelAnalysisSchema` instead of deriving a schema with `.omit()`.

- [ ] **Step 1: Write failing cross-field schema tests**

Add a valid fixture helper and focused failures to `src/domain/analysis.test.ts`:

```ts
function validAnalysis() {
  return {
    animationId: "progress-upload",
    detectedTechnique: "css-keyframes",
    semanticRole: "progress",
    motionRisk: "medium",
    riskReason: "Continuous lateral motion.",
    originalBehavior: "A sweeping bar indicates an active upload.",
    proposedAlternative: "Use static progress with explicit text.",
    preservedMeaning: ["The upload remains active"],
    semanticTrace: [
      {
        id: "activity-state",
        meaning: "The upload is still active",
        originalSignal: "A repeated sweeping highlight",
        removalEffect: "A static bar can look stalled",
        impact: "ambiguous",
        replacementSignal: "Persistent Uploading · 68% text",
        validationCheckId: "activity-state",
      },
    ],
    confidence: 0.9,
    generatedCode: ".progress { width: 68%; }",
    validationChecks: [
      {
        id: "activity-state",
        label: "Activity remains explicit",
        passed: true,
        evidence: "Uploading · 68% remains visible.",
      },
    ],
    source: "demo-fallback",
  };
}

it("accepts a semantic trace linked to validation evidence", () => {
  expect(analysisSchema.safeParse(validAnalysis()).success).toBe(true);
});

it("rejects dangling validation references", () => {
  const input = structuredClone(validAnalysis());
  input.semanticTrace[0].validationCheckId = "missing-check";
  expect(analysisSchema.safeParse(input).success).toBe(false);
});

it("rejects duplicate semantic trace ids", () => {
  const input = structuredClone(validAnalysis());
  input.semanticTrace.push({ ...input.semanticTrace[0] });
  expect(analysisSchema.safeParse(input).success).toBe(false);
});
```

- [ ] **Step 2: Run the schema tests to verify RED**

Run: `pnpm test src/domain/analysis.test.ts`

Expected: FAIL because `semanticTrace` is not part of the strict schema.

- [ ] **Step 3: Implement the shared model and API schemas**

In `src/domain/analysis.ts`, define one shared shape and apply the same refinement to model and API results:

```ts
export const semanticImpactSchema = z.enum(["lost", "ambiguous", "retained"]);

export const semanticTraceSchema = z.object({
  id: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/),
  meaning: z.string().trim().min(1).max(240),
  originalSignal: conciseText,
  removalEffect: conciseText,
  impact: semanticImpactSchema,
  replacementSignal: conciseText,
  validationCheckId: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/),
}).strict();

const analysisShape = {
  animationId: z.string().trim().min(1).max(120),
  detectedTechnique: detectedTechniqueSchema,
  semanticRole: semanticRoleSchema,
  motionRisk: motionRiskSchema,
  riskReason: conciseText,
  originalBehavior: conciseText,
  proposedAlternative: conciseText,
  preservedMeaning: z.array(z.string().trim().min(1).max(240)).min(1).max(8),
  semanticTrace: z.array(semanticTraceSchema).min(1).max(8),
  confidence: z.number().min(0).max(1),
  generatedCode: z.string().trim().min(1).max(50_000),
  validationChecks: z.array(validationCheckSchema).min(1).max(12),
};

function validateSemanticReferences(
  value: { semanticTrace: Array<{ id: string; validationCheckId: string }>; validationChecks: Array<{ id: string }> },
  context: z.RefinementCtx,
) {
  const checkIds = new Set(value.validationChecks.map((check) => check.id));
  const traceIds = new Set<string>();
  value.semanticTrace.forEach((trace, index) => {
    if (traceIds.has(trace.id)) {
      context.addIssue({ code: "custom", path: ["semanticTrace", index, "id"], message: "Semantic trace ids must be unique." });
    }
    traceIds.add(trace.id);
    if (!checkIds.has(trace.validationCheckId)) {
      context.addIssue({ code: "custom", path: ["semanticTrace", index, "validationCheckId"], message: "Semantic trace must reference an existing validation check." });
    }
  });
}

export const modelAnalysisSchema = z.object(analysisShape).strict().superRefine(validateSemanticReferences);
export const analysisSchema = z.object({ ...analysisShape, source: analysisSourceSchema }).strict().superRefine(validateSemanticReferences);
export type SemanticTrace = z.infer<typeof semanticTraceSchema>;
```

Update `src/server/analysis/provider.ts` to import `modelAnalysisSchema` and remove the local `.omit({ source: true })` definition.

- [ ] **Step 4: Make the prompt require the counterfactual mapping**

Add explicit instructions to `buildAnalysisPrompt`:

```text
For every meaning carried by motion, provide one semanticTrace item. Explain the original signal, what becomes lost or ambiguous if motion is only disabled, the non-motion replacement, and the validation check that supports that replacement. Use retained only when the meaning remains explicit without adding a replacement. Never claim that these checks prove complete accessibility.
```

Extend `prompt.test.ts` to require `semanticTrace`, `lost or ambiguous`, `validationCheckId`, and `Never claim` in the prompt.

- [ ] **Step 5: Verify the contract and provider tests**

Run: `pnpm test src/domain/analysis.test.ts src/server/analysis/prompt.test.ts src/server/analysis/provider.test.ts src/server/analysis/service.test.ts`

Expected: PASS with no network calls.

- [ ] **Step 6: Commit the contract**

```bash
git add src/domain/analysis.ts src/domain/analysis.test.ts src/server/analysis/provider.ts src/server/analysis/prompt.ts src/server/analysis/prompt.test.ts
git commit -m "feat: model semantic meaning loss"
```

### Task 2: Curated counterfactual data

**Files:**
- Modify: `src/domain/examples.ts`
- Modify: `src/domain/examples.test.ts`
- Modify: `src/server/analysis/service.test.ts`
- Modify: `src/app/api/analyze/route.test.ts`

**Interfaces:**
- Consumes: the required `Analysis.semanticTrace` contract from Task 1.
- Produces: `MotionExample.motionRemovedCode: string` and three valid fallback analyses whose semantic traces reference real validation checks.

- [ ] **Step 1: Write failing fixture integrity tests**

Add these assertions inside the existing loop in `examples.test.ts`:

```ts
expect(example.motionRemovedCode.trim().length).toBeGreaterThan(0);
expect(example.motionRemovedCode).not.toBe(example.originalCode);
expect(example.motionRemovedCode).not.toBe(example.reducedCode);
expect(example.fallbackAnalysis.semanticTrace.length).toBeGreaterThan(0);

const checkIds = new Set(example.fallbackAnalysis.validationChecks.map((check) => check.id));
for (const trace of example.fallbackAnalysis.semanticTrace) {
  expect(checkIds.has(trace.validationCheckId)).toBe(true);
}
```

Add exact impact expectations:

```ts
expect(getMotionExample("progress-upload")?.fallbackAnalysis.semanticTrace.map((trace) => trace.impact)).toContain("ambiguous");
expect(getMotionExample("success-save")?.fallbackAnalysis.semanticTrace.map((trace) => trace.impact)).toContain("lost");
expect(getMotionExample("hierarchy-panel")?.fallbackAnalysis.semanticTrace.map((trace) => trace.impact)).toContain("ambiguous");
```

- [ ] **Step 2: Run fixture and service tests to verify RED**

Run: `pnpm test src/domain/examples.test.ts src/server/analysis/service.test.ts src/app/api/analyze/route.test.ts`

Expected: FAIL because `motionRemovedCode` and required semantic traces are missing.

- [ ] **Step 3: Add `motionRemovedCode` and semantic traces**

Extend `MotionExample`:

```ts
export interface MotionExample {
  id: ExampleId;
  title: string;
  description: string;
  category: string;
  originalCode: string;
  motionRemovedCode: string;
  reducedCode: string;
  preview: PreviewMetadata;
  fallbackAnalysis: Analysis;
}
```

Use controlled counterfactual code for each example:

```css
@media (prefers-reduced-motion: reduce) {
  .upload-progress::after,
  .save-result,
  .save-result path,
  .panel[data-state="open"] {
    animation: none;
    transition: none;
  }
}
```

The three fixture traces must state:

- Progress: activity can look stalled and exact completion is not explicit; replacements are persistent text and progressbar values.
- Success: icon-only confirmation is lost to nonvisual users and ambiguous when the visual change is missed; replacements are persistent text and a polite status announcement.
- Hierarchy: instant content replacement makes depth and focus destination ambiguous; replacements are breadcrumb/context text and logical heading focus.

Where one existing validation check cannot support a trace, add a focused check with a unique kebab-case ID rather than pointing multiple meanings at unrelated evidence.

- [ ] **Step 4: Update schema-shaped test fixtures**

Add valid `semanticTrace` arrays to provider, service, and route test payloads that construct complete analyses. Every reference must match a validation check in that payload.

- [ ] **Step 5: Verify curated data GREEN**

Run: `pnpm test src/domain/examples.test.ts src/server/analysis/service.test.ts src/app/api/analyze/route.test.ts`

Expected: PASS for all curated fallback and API cases.

- [ ] **Step 6: Commit curated data**

```bash
git add src/domain/examples.ts src/domain/examples.test.ts src/server/analysis/service.test.ts src/app/api/analyze/route.test.ts
git commit -m "feat: add motion removal counterfactuals"
```

### Task 3: Authored three-state previews

**Files:**
- Modify: `src/components/previews/preview-stage.tsx`
- Modify: `src/components/previews/preview-stage.test.tsx`
- Modify: `src/components/previews/progress-preview.tsx`
- Modify: `src/components/previews/success-preview.tsx`
- Modify: `src/components/previews/hierarchy-preview.tsx`

**Interfaces:**
- Produces: `PreviewVersion = "original" | "motion-removed" | "stillmeaning"`.
- `PreviewStage` exposes accessible names `Original preview`, `Motion Removed Only preview`, and `StillMeaning preview`.
- Original previews contain only semantics present in `originalCode`; motion-removed previews add no replacement semantics; StillMeaning previews retain the replacement semantics.

- [ ] **Step 1: Write failing fidelity and counterfactual preview tests**

Replace the assertion that original progress already has full progressbar semantics, then add:

```tsx
it("renders a motion-removed progress state without invented numeric semantics", () => {
  render(<PreviewStage exampleId="progress-upload" motionMode="reduced" version="motion-removed" />);
  expect(screen.getByRole("article", { name: "Motion Removed Only preview" })).toBeVisible();
  expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  expect(screen.queryByText("Uploading · 68%")).not.toBeInTheDocument();
});

it("does not invent status semantics in the original save preview", () => {
  render(<PreviewStage exampleId="success-save" motionMode="normal" version="original" />);
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.queryByText("Changes saved")).not.toBeInTheDocument();
});

it("does not move focus in the motion-removed hierarchy preview", async () => {
  const user = userEvent.setup();
  render(<PreviewStage exampleId="hierarchy-panel" motionMode="reduced" version="motion-removed" />);
  const trigger = screen.getByRole("button", { name: "Open project details" });
  await user.click(trigger);
  expect(screen.getByRole("heading", { name: "Project details" })).not.toHaveFocus();
  expect(screen.queryByText("Deeper level")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run preview tests to verify RED**

Run: `pnpm test src/components/previews/preview-stage.test.tsx`

Expected: FAIL because `motion-removed` is not a valid preview version and original previews currently include replacement semantics.

- [ ] **Step 3: Implement three accurate preview variants**

Expand `PreviewVersion` and use a label map in `PreviewStage`:

```ts
const previewLabels = {
  original: { eyebrow: "Before", title: "Original", ariaLabel: "Original preview" },
  "motion-removed": { eyebrow: "Counterfactual", title: "Motion Removed Only", ariaLabel: "Motion Removed Only preview" },
  stillmeaning: { eyebrow: "After", title: "StillMeaning Version", ariaLabel: "StillMeaning preview" },
} as const;
```

Implement the case states as follows:

- Progress Original and Motion Removed Only use a presentational track without `role="progressbar"`, numeric text, or `aria-valuenow`; only Original renders the sweep. StillMeaning supplies the semantic role, value, `Uploading · 68%`, and static fill.
- Save Original and Motion Removed Only render the check icon without `role="status"` or outcome copy; only Original applies the compound animation. StillMeaning renders persistent copy inside the polite status region.
- Hierarchy Original moves the panel with no breadcrumb update or focus transfer. Motion Removed Only swaps the content immediately with the same missing context. StillMeaning updates the breadcrumb, renders `Deeper level`, and focuses the destination heading.

- [ ] **Step 4: Verify preview tests GREEN**

Run: `pnpm test src/components/previews/preview-stage.test.tsx`

Expected: PASS with all three authored states covered.

- [ ] **Step 5: Commit previews**

```bash
git add src/components/previews
git commit -m "feat: render motion removed previews"
```

### Task 4: Meaning Loss Reveal interaction and semantic receipt

**Files:**
- Create: `src/components/workbench/meaning-comparison-control.tsx`
- Create: `src/components/workbench/semantic-trace.tsx`
- Modify: `src/components/workbench/workbench.tsx`
- Modify: `src/components/workbench/analysis-inspector.tsx`
- Modify: `src/components/workbench/workbench.test.tsx`

**Interfaces:**
- Produces: `ComparisonTarget = "motion-removed" | "stillmeaning"`.
- `MeaningComparisonControl` consumes `target` and `onTargetChange(nextTarget)`.
- `SemanticTrace` consumes `analysis`, `target`, and renders either risk evidence or replacement/validation evidence.
- `AnalysisInspector` gains `comparisonTarget: ComparisonTarget`.

- [ ] **Step 1: Write failing workbench interaction tests**

Add these tests to `workbench.test.tsx`:

```tsx
it("reveals meaning loss and restores the StillMeaning result", async () => {
  const user = userEvent.setup();
  render(<Workbench initialAnalysis={motionExamples[0].fallbackAnalysis} />);

  await user.click(screen.getByRole("button", { name: "Why not just turn motion off?" }));
  expect(screen.getByRole("article", { name: "Motion Removed Only preview" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Meaning at Risk" })).toBeVisible();
  expect(screen.getByText("A static bar can look stalled")).toBeVisible();

  await user.click(screen.getByRole("button", { name: "Restore meaning with StillMeaning" }));
  expect(screen.getByRole("article", { name: "StillMeaning preview" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Meaning preserved by these checks" })).toBeVisible();
  expect(screen.getByText("Requires developer review")).toBeVisible();
});

it("resets the counterfactual when another example is selected", async () => {
  const user = userEvent.setup();
  render(<Workbench initialAnalysis={motionExamples[0].fallbackAnalysis} />);
  await user.click(screen.getByRole("button", { name: "Why not just turn motion off?" }));
  await user.click(screen.getByRole("button", { name: /save confirmation/i }));
  expect(screen.getByRole("article", { name: "StillMeaning preview" })).toBeVisible();
});
```

- [ ] **Step 2: Run workbench tests to verify RED**

Run: `pnpm test src/components/workbench/workbench.test.tsx`

Expected: FAIL because the reveal controls and counterfactual rendering do not exist.

- [ ] **Step 3: Implement focused control and trace components**

`meaning-comparison-control.tsx` renders one contextual button and a short explanation. Its state mapping is:

```ts
export type ComparisonTarget = "motion-removed" | "stillmeaning";

const controlCopy = {
  stillmeaning: {
    action: "Why not just turn motion off?",
    detail: "Reveal the information risk behind blanket animation removal.",
    next: "motion-removed",
  },
  "motion-removed": {
    action: "Restore meaning with StillMeaning",
    detail: "Replace the risky motion with explicit semantic cues.",
    next: "stillmeaning",
  },
} as const;
```

`semantic-trace.tsx` maps each trace item to:

- Counterfactual: meaning, original signal, removal effect, and textual impact badge.
- StillMeaning: meaning, replacement signal, the linked validation label/evidence, and pass/review status.

Always render the footer **Requires developer review**. Use `!`, `?`, or `✓` plus text so status does not depend on color.

- [ ] **Step 4: Wire state through the workbench**

Add:

```ts
const [comparisonTarget, setComparisonTarget] = useState<ComparisonTarget>("stillmeaning");
```

Reset it in `selectExample`, render `MeaningComparisonControl` only for curated examples, pass `comparisonTarget` to `PreviewStage.version` and `AnalysisInspector`, and leave the generated-code diff pointing to the StillMeaning result even while the counterfactual preview is visible. Label that diff **StillMeaning generated code** so the relationship is explicit.

- [ ] **Step 5: Verify workbench and code-diff tests GREEN**

Run: `pnpm test src/components/workbench/workbench.test.tsx src/components/code/code-diff.test.tsx`

Expected: PASS, including reveal, restore, reset, and existing copy behavior.

- [ ] **Step 6: Commit the interaction**

```bash
git add src/components/workbench src/components/code
git commit -m "feat: reveal meaning loss before restoration"
```

### Task 5: Visual treatment, end-to-end proof, and submission narrative

**Files:**
- Modify: `src/app/globals.css`
- Modify: `e2e/golden-path.spec.ts`
- Modify: `README.md`
- Modify: `docs/submission/devpost-project-story.md`
- Modify: `docs/submission/demo-video-script.md`
- Modify: `docs/testing/2026-07-17-verification.md`

**Interfaces:**
- Consumes: stable accessible names and comparison states from Tasks 3–4.
- Produces: responsive Meaning at Risk/Preserved visuals, a keyboard-tested golden path, and messaging aligned with the implemented feature.

- [ ] **Step 1: Extend the Playwright golden path before styling**

For every curated example, verify the counterfactual and restoration:

```ts
for (const name of ["Upload progress", "Save confirmation", "Panel hierarchy"]) {
  await examples.getByRole("button").filter({ hasText: name }).click();
  await page.getByRole("button", { name: "Why not just turn motion off?" }).click();
  await expect(page.getByRole("article", { name: "Motion Removed Only preview" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Meaning at Risk" })).toBeVisible();
  await page.getByRole("button", { name: "Restore meaning with StillMeaning" }).click();
  await expect(page.getByRole("article", { name: "StillMeaning preview" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Meaning preserved by these checks" })).toBeVisible();
}
```

Add the reveal control to the keyboard-order test between **Paste your code** and **Copy generated code** according to its final DOM position. Under reduced-motion emulation, assert that the counterfactual preview has no running animation and the control remains usable.

- [ ] **Step 2: Run E2E to expose missing behavior or layout failures**

Run: `pnpm test:e2e`

Expected: PASS for the complete functional reveal/restore flow with no server or hydration errors.

- [ ] **Step 3: Style the counterfactual without adding risky motion**

Add focused styles for:

- `.meaning-comparison-control` with a clear question/action hierarchy and visible `:focus-visible` ring.
- `.preview-stage[data-version="motion-removed"]` with neutral/amber border and a text label, not color alone.
- `.semantic-trace` cards with compact original → removal/replacement relationships.
- `.meaning-card[data-summary="at-risk"]` and the preserved state with icon plus text.
- Narrow layouts where controls and trace content stack without horizontal scrolling.

Do not add autoplay, flashing, parallax, large interface translation, or continuous animation. Add all new transition/animation selectors to the existing reduced-motion override.

- [ ] **Step 4: Update truthful project messaging**

Lead README, Devpost story, and video script with:

```text
Animation is information. StillMeaning reveals what becomes lost or ambiguous when motion is simply removed, then uses GPT-5.6 to generate a safer implementation that preserves progress, status, hierarchy, focus, and feedback.
```

Describe the implemented flow as Original → Motion Removed Only → StillMeaning, retain the explicit GPT-5.6/demo fallback distinction, and avoid compliance guarantees. Update test counts only after the final test run supplies the real number.

- [ ] **Step 5: Run complete verification**

Run, in order:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm build:cloudflare
```

Expected: every command exits 0. Record exact test totals and build results in `docs/testing/2026-07-17-verification.md`; do not estimate them.

- [ ] **Step 6: Inspect the running application**

Run: `pnpm dev`

Inspect desktop and narrow viewport versions of all three reveal/restore flows. Confirm no overflow, clipped focus ring, misleading label, unintentional animation under reduced-motion preference, or generated-code execution.

- [ ] **Step 7: Commit the verified feature**

```bash
git add src/app/globals.css e2e/golden-path.spec.ts README.md docs/submission docs/testing/2026-07-17-verification.md
git commit -m "docs: lead with animation as information"
```

The verified commits may then be pushed to `alexliluz/stillmeaning` and deployed to the existing `stillmeaning.alexliluz.workers.dev` Worker only under the repository's established user authorization. Do not attach a custom domain or modify any Stack Labs Worker.
