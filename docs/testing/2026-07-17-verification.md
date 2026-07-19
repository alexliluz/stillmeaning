# Verification record — 2026-07-17

Environment:

- macOS development host
- Node.js 24.14.0
- pnpm 11.9.0
- Next.js 16.2.10
- React 19.2.7

## Automated checks

The full local quality suite was rerun on 2026-07-19 after the Meaning Loss Reveal feature was implemented.

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

This record does **not** claim a successful live GPT-5.6 response. The remaining blocker is separate OpenAI Platform API balance or quota for the configured key; Build Week Codex credits do not cover runtime GPT-5.6 API calls. After quota is available, rerun the manual `Deployed GPT smoke` workflow and require a passing result before final competition submission.

## Cloudflare deployment status

- Worker: `stillmeaning`
- Current deployment URL: https://stillmeaning.alexliluz.workers.dev
- On 2026-07-18, the account-level `workers.dev` subdomain was renamed to `alexliluz`; Cloudflare API readback confirmed the new subdomain and that the existing `stillmeaning` Worker route remains enabled. The Worker identity and deployment were not recreated.
- A 2026-07-18 terminal HTTPS check of the new hostname from the development network timed out after 15 seconds with HTTP status `000`. Follow-up DNS-over-HTTPS checks were also reset or returned no A records from the shell environment.
- A separate Codex in-app browser successfully navigated to the public URL and read the page title `StillMeaning — Reduce motion, not meaning`, confirming that the deployed hostname serves the application. Its DOM-control channel timed out before an analysis button could be triggered, so this does not establish a live GPT-5.6 success response.
- The safe provider-failure classification release was deployed successfully on 2026-07-18 as Cloudflare Worker version `3adaef8c-c991-4ba1-bfe4-919ef4896678`.
- Worker startup time reported for that deployment: 31 ms
- `OPENAI_API_KEY` was confirmed again on 2026-07-18 as an existing Cloudflare `secret_text` binding and was reused; the value was never printed or committed.
- The deployed Secret Change version is receiving 100% of Worker traffic according to Wrangler.
- Three known-example API requests returned the expected labeled fallback in a local Workers preview; arbitrary source without a key returned the expected 503.
- The shell environment could not connect to the shared `workers.dev` domain, but the in-app browser observed the deployed homepage and GitHub Actions reached both the homepage and API. The API path is verified; the only observed live-model blocker is `insufficient_quota`.

## Git and secret checks

- `.env.local` is ignored by `.gitignore`.
- A pnpm workspace override pins the Next.js PostCSS transitive dependency to patched version 8.5.19.
- Repository scans found only the placeholder `OPENAI_API_KEY=` in `.env.example`.
- No generated Session ID, user metric, performance metric, or live-model result has been fabricated.
