# Rendered demo video draft — 2026-07-18

The local submission-video draft is ready for review and YouTube upload. It was rendered from real StillMeaning screenshots with a system English voice and does not fabricate a live GPT-5.6 response.

## Artifact

- Local file: `.tmp/submission-video/stillmeaning-build-week-demo.mp4`
- Duration: 142.016 seconds (2:22)
- Video: H.264, 1920×1080, 30 fps
- Audio: AAC, 48 kHz, stereo
- Size: 13,033,389 bytes (12.4 MB)
- SHA-256: `6d6b43b92acb01a1eb377d699c71e02220af861181b316d12bc513d38e0e652e`
- Audio level: -18.9 dB mean, -4.6 dB peak
- Automated media checks found no black interval longer than one second and no silence interval longer than two seconds.
- HyperFrames check: zero lint, runtime, layout, and motion issues; 23/23 text checks passed WCAG AA.

The MP4 remains in Git-ignored `.tmp` to avoid adding a binary video to repository history. Upload it as a public YouTube video, then add the YouTube URL to Devpost and this repository's submission documents.

## Narration used in the rendered draft

Web animation often carries meaning. It shows progress, confirms an outcome, and explains where focus moved. But reduced-motion implementations often delete the animation and the information with it.

StillMeaning is a developer tool built around one principle: reduce motion, not meaning.

In this upload example, StillMeaning identifies a continuous shimmer. The semantic role is progress, while the repeated lateral movement creates motion risk. The alternative removes the shimmer but keeps a numeric value, visible status text, and a real progress-bar state. The evidence panel shows exactly which meaning remains available.

The save example combines scale, rotation, and path drawing to communicate success. Simply disabling those effects could make the outcome easier to miss. StillMeaning replaces the compound motion with persistent outcome text, a checkmark, and a polite status announcement, so feedback does not depend on movement or color alone.

The panel example originally travels across most of the viewport to communicate hierarchy. In reduced-motion mode, the safer version uses a short opacity change, keeps the destination named, and moves keyboard focus logically. The hierarchy remains understandable without the large spatial transition.

StillMeaning does not stop at advice. It shows an inspectable before-and-after code diff, generates a replacement implementation, and lets developers copy the result. Generated code stays untrusted text and is never executed inside the workbench.

GPT-5.6 performs the core reasoning: semantic classification, motion-risk analysis, strategy selection, code generation, and structured validation evidence. The server uses strict schema validation, bounded input and output, a thirty-second timeout, store false, and a server-only API key. Provenance always states whether a result came from live GPT-5.6 or the clearly labeled demo fallback shown here.

Codex helped audit the repository, research adjacent tools, shape the architecture, implement the product test-first, debug deployment, review accessibility and security, and prepare the submission. The verified suite includes strict type checking, thirty-four unit and component tests, and eight desktop and mobile browser tests.

StillMeaning. Reduce motion, not meaning.
