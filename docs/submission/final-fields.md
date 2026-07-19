# Devpost final fields — prepared 2026-07-19

This is the repository-backed field sheet for the OpenAI Build Week submission. It records prepared answers only; it does not authorize or record final submission.

Official requirements were re-read from Devpost at `2026-07-19T11:54:17Z`. Submissions close at `2026-07-22T00:00:00Z` (July 21, 5:00 PM Pacific; July 22, 8:00 AM China Standard Time).

## Project fields

- **Project:** StillMeaning
- **Tagline:** Animation is information. StillMeaning reveals what blanket motion removal erases, then uses GPT-5.6 to generate safer code that preserves meaning.
- **Project Story:** live Devpost draft version 7; repository source is [devpost-project-story.md](devpost-project-story.md)
- **Built with:** GPT-5.6, OpenAI Responses API, Codex, Next.js, React, TypeScript, Zod, Vitest, Playwright, pnpm
- **Repository:** https://github.com/alexliluz/stillmeaning
- **Demo:** https://stillmeaning.alexliluz.workers.dev
- **Video:** `[ADD PUBLIC YOUTUBE URL]`

The GitHub repository is public and carries an MIT License. The README contains setup instructions, sample/demo behavior, supported platforms, testing commands, Codex contribution evidence, GPT-5.6 integration details, and fallback disclosure.

## Custom submission answers

### 27945 — Submitter Type

`[CONFIRM BEFORE SUBMISSION: Individual]`

The project currently has one authenticated author and has been described as a personal, non-commercial project. Confirm this selection immediately before submission rather than inferring legal status.

### 27946 — Country of Residence

`United States`

Confirmed by the entrant. The official field accepts this value.

### 27947 — Category

`Developer Tools`

### 27948 — Code repository URL

`https://github.com/alexliluz/stillmeaning`

### 27949 — Judge test URL and instructions

```text
Open https://stillmeaning.alexliluz.workers.dev in a current desktop or mobile browser; no account or credentials are required.

Choose Upload progress, Save confirmation, or Panel hierarchy. Compare Original with StillMeaning Version, then select “Why not just turn motion off?” to reveal the Motion Removed Only counterfactual and Meaning at Risk evidence. Select “Restore meaning with StillMeaning” to inspect the semantic receipt, switch normal/reduced-motion modes, review the exact code diff, and copy the generated implementation.

The three curated examples remain stable through a visibly labeled deterministic Demo fallback if the OpenAI Platform API is unavailable. Arbitrary pasted source is never given fabricated fallback analysis. Generated and pasted code is displayed as untrusted text and is not executed.

If the shared workers.dev hostname is unavailable on the judge’s network, use the public repository’s local setup instructions.
```

### 27950 — Primary Codex Session ID

`[RUN /feedback IN THIS PRIMARY CODEX SESSION AND PASTE THE REAL ID]`

### 27951 — Developer-tool installation, platforms, and testing

```text
Supported platforms: current desktop and mobile web browsers. The hosted demo requires no installation, account, or test credentials.

Local setup: install Node.js 24+ and pnpm 11.9+, then run:
git clone https://github.com/alexliluz/stillmeaning.git
cd stillmeaning
pnpm install
cp .env.example .env.local
pnpm dev

Open http://localhost:3000. The three curated cases work with clearly labeled deterministic Demo fallback data. Live pasted-source analysis additionally requires a server-side OpenAI Platform API key with GPT-5.6 access. Build Week Codex credits do not fund runtime Platform API requests.

Verification commands: pnpm lint, pnpm typecheck, pnpm test, pnpm build, and pnpm test:e2e. The recorded release passes 45 unit/component tests and 8 desktop/mobile Chromium journeys. Generated or pasted code is never executed inside the workbench.
```

## Required media

- Final video: `.tmp/submission-video/stillmeaning-build-week-demo.mp4`, 2:22, 1920×1080, English narration, verified locally
- YouTube title, description, chapters, settings, and upload checks: [youtube-upload.md](youtube-upload.md)
- English captions: [stillmeaning-build-week-demo.en.srt](stillmeaning-build-week-demo.en.srt), parsed successfully and manually previewed against the final MP4
- Thumbnail: [assets/stillmeaning-thumbnail-3x2.jpg](assets/stillmeaning-thumbnail-3x2.jpg), 1440×960
- Gallery image 1: [assets/stillmeaning-save-confirmation.jpg](assets/stillmeaning-save-confirmation.jpg), 1440×960
- Gallery image 2: [assets/stillmeaning-panel-hierarchy.jpg](assets/stillmeaning-panel-hierarchy.jpg), 1440×960

## Final human confirmations

Before any final Submit action:

1. confirm **Individual** submitter type, legal age of majority, and all eligibility conditions;
2. add the public YouTube URL and confirm the video is publicly viewable;
3. confirm the refreshed thumbnail and both gallery images render correctly on Devpost;
4. add separate OpenAI Platform quota and require a passing live `Deployed GPT smoke` result;
5. run `/feedback` in this primary Codex session and paste the real Session ID; and
6. manually review every field, then explicitly authorize final Devpost submission.
