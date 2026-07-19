# Rendered demo video — 2026-07-19

The final local submission video has been published publicly on YouTube. It uses real StillMeaning screenshots, the locally rendered Eddy English voice, and the current Meaning Loss Reveal experience. It does not fabricate a live GPT-5.6 response; the recorded workbench visibly retains `Demo fallback` provenance.

## Artifact

- Public YouTube video: https://www.youtube.com/watch?v=Nfj_JkcTDVc
- Local file: `.tmp/submission-video-eddy/stillmeaning-build-week-demo-eddy-final.mp4`
- Duration: 142.016 seconds (2:22)
- Video: H.264, 1920×1080, 30 fps
- Audio: AAC, 48 kHz, stereo
- Size: 15,113,531 bytes (14.4 MiB)
- SHA-256: `884cf64ac4c654f561643baa1e5a79d4b920724519810aeb8d62f136040d0741`
- Audio level: -19.6 dB mean, -1.6 dB peak
- FFmpeg `blackdetect` found no black interval longer than one second.
- FFmpeg `silencedetect` found no silence interval longer than two seconds at -45 dB.
- HyperFrames check: zero lint, runtime, layout, and motion issues; 20/20 text checks passed WCAG AA contrast.
- Final frames at 5, 40, 85, 125, and 137 seconds were manually inspected for composition, legibility, accurate fallback provenance, and scene continuity.

The MP4 remains in Git-ignored `.tmp` to avoid adding a binary video to repository history. Upload it as a public YouTube video, then add the YouTube URL to Devpost and this repository's submission documents.

## Narration used in the final render

Animation carries information. It shows progress, confirms an outcome, and explains where focus moved. But reduced-motion implementations often remove the animation—and the meaning with it. StillMeaning asks: what disappears when motion disappears? Then it reduces motion, not meaning.

This continuous shimmer says an upload is active. Turn it off and the bar becomes static: is it moving, stalled, or complete? StillMeaning exposes that ambiguity, then replaces the moving cue with status text, an exact value, and real progress-bar semantics.

Here, scale, rotation, and path drawing communicate success. Removing them leaves an unlabeled icon. StillMeaning makes the result persistent: Changes saved, synchronization detail, and a polite status announcement—without relying on motion or color alone.

This slide communicates movement into a deeper level. Remove it and the content swaps without explanation—and keyboard focus remains behind. StillMeaning names the destination, preserves hierarchy, moves focus logically, and replaces travel with a short fade.

StillMeaning does more than give advice. It generates an inspectable implementation, shows the before-and-after diff, explains the transformation, and lets developers copy it. Generated code remains untrusted text; the workbench never executes it.

GPT-5.6 does the core reasoning. It identifies each motion-carried signal, predicts what becomes lost or ambiguous, selects replacement cues, generates code, and links every cue to structured validation evidence. The server adds strict schema validation, bounded input, a timeout, and a server-only key. Provenance always distinguishes live GPT-5.6 from the demo fallback shown here.

Codex helped audit, design, implement, test, debug, deploy, and document the project in one primary development session. StillMeaning: reduce motion, not meaning.
