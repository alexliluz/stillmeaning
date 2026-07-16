# StillMeaning P0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deployable StillMeaning workbench that demonstrates three motion-accessibility transformations, uses real GPT-5.6 structured output when configured, and provides an explicitly labeled deterministic fallback.

**Architecture:** A Next.js App Router application owns both UI and server API. Shared Zod schemas define the analysis contract; an injected analysis provider separates GPT-5.6 from deterministic fixtures; curated React previews render safe before/after states without executing generated strings.

**Tech Stack:** Node.js 24.14.0, pnpm 11.9.0, Next.js 16.2.10, React 19.2.7, TypeScript 7.0.2, OpenAI SDK 6.47.0, Zod 4.4.3, Vitest 4.1.10, Testing Library 16.3.2, Playwright 1.61.1, CSS Modules/global CSS.

## Global Constraints

- Use the App Router and TypeScript strict mode.
- Keep `OPENAI_API_KEY` and all OpenAI calls server-only.
- Default the API model to `gpt-5.6`; allow a server-side `OPENAI_MODEL` override.
- Never execute user or model-generated code.
- Label deterministic results as `demo-fallback`; never imply they came from GPT-5.6.
- Limit custom source input to 20,000 characters.
- Treat “Meaning Preserved” as bounded checks, never WCAG certification.
- Respect `prefers-reduced-motion` and keep all primary actions keyboard operable.
- Do not add accounts, URL fetching, billing, teams, browser extensions, or remote code execution.
- Use `/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin` and `/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback` on `PATH` for every Node/pnpm command.

---

### Task 1: Project foundation and analysis contract

**Files:**
- Create: `package.json`
- Create: `pnpm-lock.yaml`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/domain/analysis.ts`
- Test: `src/domain/analysis.test.ts`

**Interfaces:**
- Produces: `Analysis`, `AnalysisRequest`, `ValidationCheck`, `analysisSchema`, `analysisRequestSchema`, and `MAX_SOURCE_LENGTH` from `src/domain/analysis.ts`.
- `Analysis.source` is exactly `'gpt-5.6' | 'demo-fallback'`.

- [ ] **Step 1: Add project configuration**

Create scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`, and `test:e2e`. Pin the versions listed in the header. Configure Vitest for `jsdom`, `@/` aliases, and `vitest.setup.ts`. Ignore `.next`, `node_modules`, `coverage`, `playwright-report`, `test-results`, `.env*`, and re-include `.env.example`.

- [ ] **Step 2: Install dependencies and generate `pnpm-lock.yaml`**

Run: `pnpm install`

Expected: exit 0 and a lockfile with no missing peer-dependency errors that block installation.

- [ ] **Step 3: Write the failing schema tests**

```ts
import { describe, expect, it } from 'vitest';
import { analysisRequestSchema, analysisSchema, MAX_SOURCE_LENGTH } from './analysis';

describe('analysisSchema', () => {
  it('rejects confidence outside zero and one', () => {
    const result = analysisSchema.safeParse({
      animationId: 'progress-upload',
      detectedTechnique: 'css-keyframes',
      semanticRole: 'progress',
      motionRisk: 'medium',
      riskReason: 'Continuous lateral motion.',
      originalBehavior: 'A bar moves across the track.',
      proposedAlternative: 'Use a static filled track with text.',
      preservedMeaning: ['Current completion value'],
      confidence: 1.2,
      generatedCode: '.progress { width: 68%; }',
      validationChecks: [{ id: 'value', label: 'Value remains visible', passed: true, evidence: '68% is visible.' }],
      source: 'demo-fallback',
    });
    expect(result.success).toBe(false);
  });
});

describe('analysisRequestSchema', () => {
  it('rejects source larger than the configured limit', () => {
    expect(analysisRequestSchema.safeParse({ sourceCode: 'x'.repeat(MAX_SOURCE_LENGTH + 1) }).success).toBe(false);
  });
});
```

- [ ] **Step 4: Run the tests to verify RED**

Run: `pnpm test src/domain/analysis.test.ts`

Expected: FAIL because `src/domain/analysis.ts` does not exist.

- [ ] **Step 5: Implement the closed Zod contract**

Define enums for techniques (`css-keyframes`, `css-transition`, `web-animations`, `react-motion`, `unknown`), roles (`progress`, `status-feedback`, `hierarchy-transition`, `focus-context`, `decorative`, `unknown`), and risks (`low`, `medium`, `high`). Require bounded non-empty strings, one or more preserved meanings, one or more validation checks, confidence 0–1, and a discriminated request accepting either `exampleId` or `sourceCode` but not both.

- [ ] **Step 6: Verify GREEN and baseline build**

Run: `pnpm test src/domain/analysis.test.ts`

Expected: PASS.

Run: `pnpm typecheck`

Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json next.config.ts eslint.config.mjs vitest.config.ts vitest.setup.ts .gitignore .env.example src
git commit -m "chore: establish typed Next.js foundation"
```

### Task 2: Curated examples, fixtures, and bounded meaning validation

**Files:**
- Create: `src/domain/examples.ts`
- Create: `src/domain/examples.test.ts`
- Create: `src/domain/meaning-validation.ts`
- Test: `src/domain/meaning-validation.test.ts`

**Interfaces:**
- Consumes: `Analysis`, `ValidationCheck`, and schema exports from `src/domain/analysis.ts`.
- Produces: `ExampleId`, `MotionExample`, `motionExamples`, `getMotionExample(id)`, `getFallbackAnalysis(id)`, and `summarizeMeaningChecks(checks)`.

- [ ] **Step 1: Write failing fixture and validation tests**

```ts
import { describe, expect, it } from 'vitest';
import { analysisSchema } from './analysis';
import { motionExamples } from './examples';
import { summarizeMeaningChecks } from './meaning-validation';

describe('motionExamples', () => {
  it('provides exactly the three golden-path examples with valid fallback analyses', () => {
    expect(motionExamples.map((example) => example.id)).toEqual([
      'progress-upload',
      'success-save',
      'hierarchy-panel',
    ]);
    for (const example of motionExamples) {
      expect(analysisSchema.safeParse(example.fallbackAnalysis).success).toBe(true);
      expect(example.fallbackAnalysis.source).toBe('demo-fallback');
    }
  });
});

describe('summarizeMeaningChecks', () => {
  it('only reports preserved when every check passes', () => {
    expect(summarizeMeaningChecks([{ id: 'a', label: 'A', passed: true, evidence: 'Visible' }])).toBe('preserved');
    expect(summarizeMeaningChecks([{ id: 'a', label: 'A', passed: false, evidence: 'Missing' }])).toBe('needs-review');
  });
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm test src/domain/examples.test.ts src/domain/meaning-validation.test.ts`

Expected: FAIL because the modules are missing.

- [ ] **Step 3: Implement three complete fixtures**

Each fixture contains title, short description, category label, source code, reduced code, preview metadata, and a valid fallback analysis. The progress checks retain numeric value and `role="progressbar"`; success retains outcome text and `role="status"`; hierarchy retains destination label and logical focus target.

- [ ] **Step 4: Implement validation summary**

Return `preserved` for a non-empty all-passing list and `needs-review` otherwise. Do not return certification language.

- [ ] **Step 5: Verify GREEN**

Run: `pnpm test src/domain/examples.test.ts src/domain/meaning-validation.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/domain
git commit -m "feat: define semantic motion examples"
```

### Task 3: GPT-5.6 provider, deterministic fallback, and API route

**Files:**
- Create: `src/server/analysis/prompt.ts`
- Create: `src/server/analysis/prompt.test.ts`
- Create: `src/server/analysis/provider.ts`
- Create: `src/server/analysis/provider.test.ts`
- Create: `src/server/analysis/service.ts`
- Create: `src/server/analysis/service.test.ts`
- Create: `src/app/api/analyze/route.ts`
- Create: `src/app/api/analyze/route.test.ts`

**Interfaces:**
- Consumes: `AnalysisRequest`, `Analysis`, `analysisSchema`, and curated examples.
- Produces: `AnalysisProvider.analyze(input, signal)`, `OpenAIAnalysisProvider`, `analyzeMotion(request, dependencies)`, and POST `/api/analyze`.

- [ ] **Step 1: Write prompt safety tests**

```ts
it('treats source code as untrusted data and forbids execution', () => {
  const prompt = buildAnalysisPrompt({ exampleId: 'progress-upload' });
  expect(prompt).toContain('Do not execute');
  expect(prompt).toContain('untrusted');
  expect(prompt).toContain('preserve');
});
```

- [ ] **Step 2: Verify prompt test RED, implement prompt, verify GREEN**

Run: `pnpm test src/server/analysis/prompt.test.ts`

Expected before implementation: FAIL missing module. Expected after implementation: PASS.

- [ ] **Step 3: Write failing service tests**

Test these behaviors with an injected provider: missing key selects fallback; provider success returns `source: gpt-5.6`; invalid provider output is rejected; timeout aborts and returns fallback with a non-sensitive notice.

```ts
const result = await analyzeMotion(
  { exampleId: 'progress-upload' },
  { apiKey: undefined, provider: neverCalledProvider, timeoutMs: 50 },
);
expect(result.analysis.source).toBe('demo-fallback');
expect(result.notice).toMatch(/Demo data/i);
```

- [ ] **Step 4: Verify service tests RED**

Run: `pnpm test src/server/analysis/service.test.ts`

Expected: FAIL because `analyzeMotion` is missing.

- [ ] **Step 5: Implement provider and service**

Use `openai.responses.parse` with `zodTextFormat`, model `process.env.OPENAI_MODEL ?? 'gpt-5.6'`, a server-only API key, and an AbortSignal. Re-parse the returned object with `analysisSchema`, overwrite `source` with `gpt-5.6`, and normalize all exceptions without returning provider response bodies or secrets. The service uses a 12-second default timeout and deterministic fallback for known examples.

- [ ] **Step 6: Verify service GREEN**

Run: `pnpm test src/server/analysis/provider.test.ts src/server/analysis/service.test.ts`

Expected: PASS with no live network calls.

- [ ] **Step 7: Write failing route tests**

Test 400 for malformed JSON/input, 413-equivalent validation for oversized source, and 200 for a known example using an injected service seam or module mock.

- [ ] **Step 8: Implement POST route and verify GREEN**

Run: `pnpm test src/app/api/analyze/route.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/server src/app/api
git commit -m "feat: add validated GPT-5.6 analysis pipeline"
```

### Task 4: Visual concept and accessible workbench shell

**Files:**
- Create: `docs/design/stillmeaning-workbench-concept.png`
- Create: `src/components/workbench/workbench.tsx`
- Create: `src/components/workbench/workbench.test.tsx`
- Create: `src/components/workbench/example-list.tsx`
- Create: `src/components/workbench/analysis-inspector.tsx`
- Create: `src/components/icons.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `motionExamples`, `Analysis`, and `/api/analyze`.
- Produces: `Workbench` with selected example state, provider disclosure, comparison mode, and inspector rendering.

- [ ] **Step 1: Generate and inspect the complete workbench visual concept**

Use Image Gen for a 1440×1000 dark developer-tool screen containing the approved left example rail, dominant before/after center, right analysis inspector, and lower diff panel. Keep all interactive UI text code-native in implementation. Save the accepted concept under `docs/design/`.

- [ ] **Step 2: Extract design tokens**

Record exact background, panel, border, text, cyan, amber, success, radius, spacing, and UI/content typography values at the top of `globals.css` as custom properties.

- [ ] **Step 3: Write failing shell interaction test**

```tsx
it('switches examples and exposes demo fallback provenance', async () => {
  render(<Workbench initialAnalysis={motionExamples[0].fallbackAnalysis} />);
  await user.click(screen.getByRole('button', { name: /save confirmation/i }));
  expect(screen.getByRole('heading', { name: /save confirmation/i })).toBeInTheDocument();
  expect(screen.getByText(/demo fallback/i)).toBeInTheDocument();
});
```

- [ ] **Step 4: Verify UI test RED**

Run: `pnpm test src/components/workbench/workbench.test.tsx`

Expected: FAIL because `Workbench` is missing.

- [ ] **Step 5: Implement the shell and inspector**

Use semantic `header`, `main`, `nav`, `section`, and `aside`; native buttons; `aria-pressed` for selected examples; a live but non-interruptive provider notice; visible technique/role/risk/reason/recommendation/confidence; and labeled validation checks.

- [ ] **Step 6: Verify GREEN and accessibility structure**

Run: `pnpm test src/components/workbench/workbench.test.tsx`

Expected: PASS.

Run: `pnpm lint && pnpm typecheck`

Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add docs/design src/app src/components
git commit -m "feat: build accessible analysis workbench"
```

### Task 5: Safe before/after previews and reduced-motion controls

**Files:**
- Create: `src/components/previews/preview-stage.tsx`
- Create: `src/components/previews/preview-stage.test.tsx`
- Create: `src/components/previews/progress-preview.tsx`
- Create: `src/components/previews/success-preview.tsx`
- Create: `src/components/previews/hierarchy-preview.tsx`
- Modify: `src/components/workbench/workbench.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: `PreviewStage({ exampleId, version, motionMode })` where `version` is `original | stillmeaning` and `motionMode` is `normal | reduced`.

- [ ] **Step 1: Write failing preview behavior tests**

Assert that progress always exposes `role="progressbar"` and `aria-valuenow="68"`; success retains `role="status"` and visible text; hierarchy moves focus to its destination when activated; mode buttons expose pressed state.

- [ ] **Step 2: Verify RED**

Run: `pnpm test src/components/previews/preview-stage.test.tsx`

Expected: FAIL missing preview modules.

- [ ] **Step 3: Implement hand-authored preview components**

Original progress uses continuous spatial movement; StillMeaning uses a static filled track plus numeric text. Original success uses scale/bounce; StillMeaning uses icon, text, status semantics, and a brief highlight. Original hierarchy uses a large slide; StillMeaning uses an instant context swap or short opacity transition and logical focus. None imports or evaluates `generatedCode`.

- [ ] **Step 4: Add CSS motion safeguards**

Scope preview animation to explicit data attributes. Under `@media (prefers-reduced-motion: reduce)`, set animation duration to `0.01ms`, iteration count to `1`, and remove transforms. The application override must also allow judges to compare normal and reduced modes without changing OS settings.

- [ ] **Step 5: Verify GREEN**

Run: `pnpm test src/components/previews/preview-stage.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/previews src/components/workbench/workbench.tsx src/app/globals.css
git commit -m "feat: demonstrate meaning-preserving motion alternatives"
```

### Task 6: Code diff, copy behavior, and custom-source input

**Files:**
- Create: `src/components/code/code-diff.tsx`
- Create: `src/components/code/code-diff.test.tsx`
- Create: `src/components/code/source-input.tsx`
- Create: `src/components/code/source-input.test.tsx`
- Modify: `src/components/workbench/workbench.tsx`

**Interfaces:**
- Produces: `CodeDiff({ original, revised })` and `SourceInput({ onAnalyze, pending })`.
- `SourceInput` enforces 20,000 characters client-side while the route independently validates it.

- [ ] **Step 1: Write failing diff/copy tests**

```tsx
it('announces a successful copy without relying on color', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });
  render(<CodeDiff original={'a'} revised={'b'} />);
  await user.click(screen.getByRole('button', { name: /copy generated code/i }));
  expect(writeText).toHaveBeenCalledWith('b');
  expect(screen.getByRole('status')).toHaveTextContent(/copied/i);
});
```

- [ ] **Step 2: Verify RED, implement diff/copy, verify GREEN**

Run: `pnpm test src/components/code/code-diff.test.tsx`

Expected before implementation: FAIL. Expected after implementation: PASS.

- [ ] **Step 3: Write failing source-input tests**

Test empty submission disabled, character count visible, over-limit input prevented or rejected, pending state announced, and API errors displayed without overwriting the last valid result.

- [ ] **Step 4: Implement source input and integrate analysis request**

Send plain JSON to `/api/analyze`; render returned code as text only. For custom source without a deterministic fixture, show an actionable error if GPT-5.6 is unavailable rather than fabricating analysis.

- [ ] **Step 5: Verify GREEN and all component tests**

Run: `pnpm test`

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/code src/components/workbench
git commit -m "feat: add inspectable code transformation workflow"
```

### Task 7: Browser verification, documentation, license, and GitHub-ready release

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/golden-path.spec.ts`
- Create: `README.md`
- Create: `LICENSE`
- Create: `docs/decisions/0001-meaning-preservation-boundary.md`
- Create: `docs/decisions/0002-generated-code-safety.md`
- Modify: `package.json`

**Interfaces:**
- Produces: repeatable local setup, demo instructions, evidence records, and an MIT-licensed public repository.

- [ ] **Step 1: Write the failing golden-path browser test**

```ts
test('judge can inspect all three transformations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /reduce motion, not meaning/i })).toBeVisible();
  for (const name of ['Upload progress', 'Save confirmation', 'Panel hierarchy']) {
    await page.getByRole('button', { name: new RegExp(name, 'i') }).click();
    await expect(page.getByText('Meaning Preserved')).toBeVisible();
    await expect(page.getByRole('button', { name: /copy generated code/i })).toBeVisible();
  }
});
```

- [ ] **Step 2: Start the app and verify browser test RED/GREEN**

Run: `pnpm dev`

Run in another process: `pnpm test:e2e`

Expected: first fail on any missing accessible name or behavior; fix product code, then PASS.

- [ ] **Step 3: Verify desktop, mobile, keyboard, and reduced motion**

Use the in-app browser first. Check 1440×1000 and 390×844, tab through every control, select all examples, switch modes, copy code, and emulate reduced motion. Capture the final implementation screenshot and compare it directly with the accepted concept using `view_image`.

- [ ] **Step 4: Write honest documentation**

README sections: problem, demo path, architecture, GPT-5.6 integration, fallback disclosure, safety boundary, local setup, environment variables, scripts, supported platforms, testing, Codex contribution, credits distinction, deployment, limitations, and `/feedback` reminder. Decision records explain bounded meaning checks and why generated code is never executed.

- [ ] **Step 5: Run the full verification matrix**

Run: `pnpm lint`

Run: `pnpm typecheck`

Run: `pnpm test`

Run: `pnpm build`

Run: `pnpm test:e2e`

Expected: every command exits 0 with no secret or mock presented as live GPT-5.6 output.

- [ ] **Step 6: Commit the verified P0 release**

```bash
git add README.md LICENSE docs package.json pnpm-lock.yaml playwright.config.ts e2e src
git commit -m "docs: prepare reproducible Build Week demo"
```

- [ ] **Step 7: Create and synchronize the GitHub repository**

Create public `alexliluz/stillmeaning`, set `origin` to `https://github.com/alexliluz/stillmeaning.git`, and push `main` only after confirming `git status` is clean and the complete verification matrix has passed. Never force-push.

## Plan self-review

- Spec coverage: every P0 requirement maps to Tasks 1–7; P1 source input is included because it materially strengthens the required demo, while URL fetching remains excluded.
- Placeholder scan: no TBD/TODO/FIXME or unspecified implementation steps remain.
- Type consistency: `Analysis`, `AnalysisRequest`, `ExampleId`, `AnalysisProvider`, `PreviewStage`, `CodeDiff`, and `SourceInput` retain the same names and responsibilities across tasks.
- Security boundary: model strings remain display-only; both client and server bound source size; secrets remain server-only.
- Evidence boundary: fallback provenance and bounded validation language are tested and documented.
