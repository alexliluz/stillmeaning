# Rendered demo video — 2026-07-19

The final local submission video is ready for a public YouTube upload. It uses real StillMeaning screenshots, an English system voice, and the current Meaning Loss Reveal experience. It does not fabricate a live GPT-5.6 response; the recorded workbench visibly retains `Demo fallback` provenance.

## Artifact

- Local file: `.tmp/submission-video/stillmeaning-build-week-demo.mp4`
- Duration: 142.016 seconds (2:22)
- Video: H.264, 1920×1080, 30 fps
- Audio: AAC, 48 kHz, stereo
- Size: 15,442,869 bytes (14.7 MiB)
- SHA-256: `e3f21bd23ff3378476924de9315af09ed65f6bdae85b33e15f6db9d24b4c1a82`
- Audio level: -19.0 dB mean, -4.7 dB peak
- FFmpeg `blackdetect` found no black interval longer than one second.
- FFmpeg `silencedetect` found no silence interval longer than two seconds at -45 dB.
- HyperFrames check: zero lint, runtime, layout, and motion issues; 20/20 text checks passed WCAG AA contrast.
- Final frames at 5, 40, 85, 125, and 137 seconds were manually inspected for composition, legibility, accurate fallback provenance, and scene continuity.

The MP4 remains in Git-ignored `.tmp` to avoid adding a binary video to repository history. Upload it as a public YouTube video, then add the YouTube URL to Devpost and this repository's submission documents.

## Narration used in the final render

Animation is information. It shows progress, confirms an outcome, or explains where focus moved. But reduced-motion implementations often delete the animation, and the information with it. StillMeaning asks one question: what disappears when motion disappears? Then it reduces the motion, not the meaning.

This continuous shimmer says the upload is still active. If we merely turn it off, the bar becomes static. Is it progressing or stalled, and what is the exact value? StillMeaning traces that ambiguity, then replaces the moving cue with visible status text, a numeric value, and real progress-bar semantics.

Here, scale, rotation, and path drawing are the success message. Turning them off leaves only an unlabeled icon. StillMeaning makes the result persistent and explicit with Changes saved text, synchronization detail, and a polite status announcement, without relying on motion or color alone.

This large slide communicates movement into a deeper level. Removing it without a replacement creates an unexplained content swap and leaves keyboard focus behind. StillMeaning adds explicit hierarchy, names the destination, and moves focus logically while replacing the travel with only a short fade.

StillMeaning does not stop at advice. It generates an inspectable implementation, shows the exact before-and-after diff, explains the transformation, and lets a developer copy the result. Generated code is displayed as untrusted text and is never executed inside the workbench.

GPT-5.6 performs the core reasoning. It identifies each motion-carried signal, predicts what becomes lost or ambiguous, selects replacement cues, generates code, and links each cue to structured validation evidence. The server uses strict schema validation, bounded input, a timeout, and a server-only key. Provenance always distinguishes live GPT-5.6 from the clearly labeled demo fallback shown here.

Codex helped audit, design, implement, test, debug, deploy, and document the project in one primary development session. StillMeaning: reduce motion, not meaning.
