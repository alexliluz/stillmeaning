# Demo video script — target 2:40

The public video must be no longer than three minutes. Record at 1440×1000 or another 16:9-friendly desktop size, keep browser zoom at 100%, and close unrelated tabs and notifications.

## 0:00–0:18 — Problem and promise

**Screen:** StillMeaning header and three examples.

**Voiceover:**

> Web animation often carries meaning. It shows progress, confirms an outcome, or explains where focus moved. But reduced-motion implementations often delete the animation—and the information with it. StillMeaning is a developer tool built around one principle: reduce motion, not meaning.

## 0:18–0:48 — Upload progress

**Screen:** Select Upload progress. Show Original in normal mode, then switch to reduced motion and compare the StillMeaning Version.

**Voiceover:**

> In this upload example, StillMeaning detects a continuous shimmer. Its semantic role is progress, and the persistent lateral movement creates risk. The alternative removes the shimmer but keeps a numeric value, visible status text, and a real progressbar state. The right panel explains the risk and the evidence we preserve.

## 0:48–1:15 — Success feedback

**Screen:** Select Save confirmation. Show the two versions and Meaning Preserved checks.

**Voiceover:**

> Here, scale, rotation, and path drawing communicate success. Turning them off without a replacement would make the result easier to miss. StillMeaning replaces that movement with persistent outcome text and a status announcement, preserving feedback without relying on motion or color alone.

## 1:15–1:42 — Hierarchy and focus

**Screen:** Select Panel hierarchy. Activate the panel in both versions; show the named destination and focus evidence.

**Voiceover:**

> This panel originally slides across most of the viewport to communicate hierarchy. The safer version uses only a short opacity change, names the destination, and moves keyboard focus logically. The hierarchy remains understandable even when the travel is removed.

## 1:42–2:08 — Code transformation

**Screen:** Scroll to the code section. Toggle the diff, highlight removed and added lines, then use Copy generated code.

**Voiceover:**

> StillMeaning does not stop at advice. It generates an inspectable implementation, shows the exact before-and-after diff, explains the transformation, and lets a developer copy the result. Generated code is displayed as untrusted text and is never executed inside the workbench.

## 2:08–2:31 — GPT-5.6 and safety

**Screen:** Show provenance badge and, if live access is working, paste a short custom animation and run analysis. Otherwise keep the curated demo and do not imply a live call.

**Voiceover:**

> GPT-5.6 performs the core reasoning: semantic classification, motion-risk analysis, strategy selection, code generation, and structured validation evidence. The server uses strict schema validation, bounded input, a timeout, and a server-only API key. Provenance always says whether a result is live GPT-5.6 or the clearly labeled demo fallback.

## 2:31–2:40 — Codex and close

**Screen:** Return to the full workbench or briefly show the GitHub history.

**Voiceover:**

> Codex helped audit, design, implement, test, debug, and document the project in one primary development session. StillMeaning: reduce motion, not meaning.

## Recording truthfulness checks

- Do not say a response is live unless the UI visibly shows `Live · GPT-5.6` during that take.
- Do not claim WCAG certification; say “review evidence” or “meaning-preservation checks.”
- Do not claim user metrics, performance gains, or production adoption.
- Keep the fallback badge visible when using curated fixture data.
- Show the public demo URL and repository URL in the video description.
- Mention Codex and GPT-5.6 verbally, not only in captions.

## Suggested video description

StillMeaning is an AI-assisted motion accessibility workbench built for OpenAI Build Week 2026. It uses GPT-5.6 to analyze the meaning carried by web animation, assess motion risk, generate safer alternatives, and return structured meaning-preservation evidence.

Demo: https://stillmeaning.stack-labs-dev.workers.dev

Source: https://github.com/alexliluz/stillmeaning
