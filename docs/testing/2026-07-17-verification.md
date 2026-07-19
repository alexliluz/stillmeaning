# Verification record — 2026-07-17

Environment:

- macOS development host
- Node.js 24.14.0
- pnpm 11.9.0
- Next.js 16.2.10
- React 19.2.7

## Automated checks

The full local quality suite was rerun on 2026-07-19 after the Meaning Loss Reveal feature was implemented.

The same core suite was rerun again on 2026-07-19 against final submission-material commit `d8e83a8`. Lint, 45 Vitest tests, the production build, the production dependency audit, and all 8 Playwright journeys passed. An initial standalone `pnpm typecheck` was mistakenly started concurrently with `next build` and observed `.next/types` while the build was replacing it; the build's own TypeScript stage passed, and a clean sequential `pnpm typecheck` immediately passed. No product defect was found and the worktree remained clean.

The browser suite was rerun while final submission materials were being audited. The first fully parallel run used five browser workers and exceeded Playwright's default 30-second timeout for the complete three-example golden path on both viewports, although the same desktop path passed in 5.3 seconds with one worker. This was test-runner contention against Next.js development compilation, not a failed product assertion. The configured worker cap was reduced to two without changing any test assertion; two subsequent full runs passed all eight journeys in 6.9 seconds and 7.1 seconds.

| Check | Result |
| --- | --- |
| `pnpm lint` | Pass |
| `pnpm typecheck` | Pass |
| `pnpm test` | Pass — 12 files, 45 tests |
| `pnpm build` | Pass — `/` static and `/api/analyze` dynamic |
| `pnpm test:e2e` | Pass — 8 tests across desktop and mobile Chromium |
| `pnpm audit --prod` | Pass — no known vulnerabilities |
| `pnpm build:cloudflare` | Pass — Next.js 16.2.10 converted with OpenNext 1.20.1 |
| `wrangler deploy --dry-run` | Pass — 1092.04 KiB gzip, below the 3 MiB Workers Free limit |
| Cloudflare `workerd` browser suite | Pass — the same 8 desktop/mobile tests |

The browser suite covers:

- the Original → Motion Removed Only → StillMeaning flow for all three curated transformations;
- Meaning at Risk and cue-by-cue semantic receipts;
- visible `Demo fallback` provenance;
- normal/reduced comparison controls;
- hierarchy destination focus;
- code copying and source-input bounds;
- system `prefers-reduced-motion` behavior;
- primary-control keyboard order;
- desktop and mobile layouts.

## Manual browser checks

- Desktop workbench inspected in the Codex in-app browser.
- 390×844 responsive view inspected; the slogan, example controls, counterfactual comparison, and code workflow remain reachable with no document-level horizontal overflow.
- Default and Meaning at Risk states were inspected visually; state remains explicit through labels and symbols rather than color alone.
- The browser console contained no warnings or errors during the final local inspection.
- Copy feedback was verified after adding a timeout-safe clipboard path.
- Focus styles are visible and state is not conveyed by color alone.

## Live GPT-5.6 status

The server integration is implemented and covered by mocked provider tests. A server-only Platform API key is present locally and is ignored by Git. The same key is configured as a Cloudflare Secret.

A live success response could not be verified from this development host because outbound connectivity to `api.openai.com` was unavailable. An unauthenticated `curl` connectivity check timed out after 12 seconds with HTTP status `000`, zero connect time, and no TLS connection. The application request consequently reached its hard timeout and returned the correctly labeled deterministic fallback for a known example.

After reproducing that a structurally valid response arriving at 15 seconds would be discarded by the original 12-second default, the service timeout was increased test-first to 30 seconds. An explicit short timeout test still verifies abort and labeled fallback behavior. This improves tolerance for normal model latency but does not change the unverified live-response status above.

The manual GitHub Actions workflow then reached the public deployment from an independent runner. Its homepage check passed and its known-example request reached `/api/analyze`, but the OpenAI request returned `insufficient_quota`. StillMeaning safely classified that response as unavailable Platform API quota and returned the visibly labeled deterministic fallback. The workflow failed as designed because provenance was `demo-fallback`, not `gpt-5.6`: [Actions run 29607701319](https://github.com/alexliluz/stillmeaning/actions/runs/29607701319).

The failed job was rerun independently on 2026-07-19 at 11:52 UTC after the final submission assets were prepared. The homepage passed again. Job `88190057010` then received `source: demo-fallback`, `semanticRole: progress`, four validation checks, and the explicit notice `GPT-5.6 Platform API quota is unavailable`. This proves the blocker remained quota at that time; it was not reclassified as a transport, authentication, model-access, or ordinary rate-limit failure.

After the user approved continuing the submission workflow, the failed job was rerun once more on 2026-07-19 at 12:23 UTC. The deployed homepage passed, while job `88192624622` again returned `source: demo-fallback`, `semanticRole: progress`, four validation checks, and the same explicit Platform quota notice. The repeated result confirms that the deployment is reachable and the remaining live-model blocker is still runtime Platform quota.

This record does **not** claim a successful live GPT-5.6 response. The remaining blocker is separate OpenAI Platform API balance or quota for the configured key; Build Week Codex credits do not cover runtime GPT-5.6 API calls. After quota is available, rerun the manual `Deployed GPT smoke` workflow and require a passing result before final competition submission.

## Cloudflare deployment status

- Worker: `stillmeaning`
- Current deployment URL: https://stillmeaning.alexliluz.workers.dev
- On 2026-07-18, the account-level `workers.dev` subdomain was renamed to `alexliluz`; Cloudflare API readback confirmed the new subdomain and that the existing `stillmeaning` Worker route remains enabled. The Worker identity and deployment were not recreated.
- A 2026-07-18 terminal HTTPS check of the new hostname from the development network timed out after 15 seconds with HTTP status `000`. Follow-up DNS-over-HTTPS checks were also reset or returned no A records from the shell environment.
- A separate Codex in-app browser successfully navigated to the public URL and read the page title `StillMeaning — Reduce motion, not meaning`, confirming that the deployed hostname serves the application. Its DOM-control channel timed out before an analysis button could be triggered, so this does not establish a live GPT-5.6 success response.
- The Meaning Loss Reveal release was deployed successfully on 2026-07-19 as Cloudflare Worker version `24ef0b28-6e5f-467d-a32f-966f4977abb5`, replacing the earlier provider-failure classification release without recreating the Worker.
- Worker startup time reported for the Meaning Loss Reveal deployment: 27 ms.
- The deployment uploaded only three changed static assets, retained the existing `workers.dev` route, and did not configure a custom domain.
- `OPENAI_API_KEY` was confirmed again on 2026-07-19 as an existing Cloudflare `secret_text` binding and was preserved with `--keep-vars`; the value was never printed or committed.
- `wrangler versions list` confirmed the new version in Cloudflare's version history. A follow-up deployment-status request encountered the development network's intermittent Cloudflare connectivity failure, so this record does not claim a separate traffic-percentage readback for the new version.
- Three known-example API requests returned the expected labeled fallback in a local Workers preview; arbitrary source without a key returned the expected 503.
- The shell environment could not connect to the shared `workers.dev` domain, but the in-app browser observed the deployed homepage and GitHub Actions reached both the homepage and API. The API path is verified; the only observed live-model blocker is `insufficient_quota`.

## Git and secret checks

- `.env.local` is ignored by `.gitignore`.
- A pnpm workspace override pins the Next.js PostCSS transitive dependency to patched version 8.5.19.
- Repository scans found only the placeholder `OPENAI_API_KEY=` in `.env.example`.
- No generated Session ID, user metric, performance metric, or live-model result has been fabricated.

## Submission asset verification — 2026-07-19

- Captured a new 1440×960 3:2 thumbnail and two 1440×960 gallery images from the real local Meaning Loss Reveal workbench.
- All three images retain visible `Demo fallback` provenance and were manually inspected after export.
- Rendered the final English demo video from real product screenshots at 1920×1080, 30 fps, with a 142.016-second runtime.
- HyperFrames reported zero lint, runtime, layout, and motion issues; all 20 detected text checks passed WCAG AA contrast.
- FFmpeg found no black interval longer than one second and no silence interval longer than two seconds at -45 dB.
- Final audio measured -19.0 dB mean and -4.7 dB peak; five representative frames were manually reviewed.
- Re-rendered the final video with the locally available Eddy English voice and a shorter, more conversational narration script. The 142.016-second 1080p MP4 passed HyperFrames lint (0 errors, 0 warnings), 15-sample layout inspection (0 issues), audio checks (-19.6 dB mean, -1.6 dB peak, no silence over two seconds), and five key-frame reviews.
- Current final local MP4: `.tmp/submission-video-eddy/stillmeaning-build-week-demo-eddy-final.mp4`; SHA-256: `884cf64ac4c654f561643baa1e5a79d4b920724519810aeb8d62f136040d0741`.
- Published the re-rendered Eddy demo publicly on YouTube: `https://www.youtube.com/watch?v=Nfj_JkcTDVc`. The English SRT is prepared locally; its Studio upload remains to be confirmed.
