# Verification record — 2026-07-17

Environment:

- macOS development host
- Node.js 24.14.0
- pnpm 11.9.0
- Next.js 16.2.10
- React 19.2.7

## Automated checks

| Check | Result |
| --- | --- |
| `pnpm lint` | Pass |
| `pnpm typecheck` | Pass |
| `pnpm test` | Pass — 12 files, 33 tests |
| `pnpm build` | Pass — `/` static and `/api/analyze` dynamic |
| `pnpm test:e2e` | Pass — 8 tests across desktop and mobile Chromium |
| `pnpm audit --prod` | Pass — no known vulnerabilities |
| `pnpm build:cloudflare` | Pass — Next.js 16.2.10 converted with OpenNext 1.20.1 |
| `wrangler deploy --dry-run` | Pass — 1087.86 KiB gzip, below the 3 MiB Workers Free limit |
| Cloudflare `workerd` browser suite | Pass — the same 8 desktop/mobile tests |

The browser suite covers:

- all three curated transformations;
- visible `Demo fallback` provenance;
- normal/reduced comparison controls;
- hierarchy destination focus;
- code copying and source-input bounds;
- system `prefers-reduced-motion` behavior;
- primary-control keyboard order;
- desktop and mobile layouts.

## Manual browser checks

- Desktop workbench inspected in the Codex in-app browser.
- 390×844 responsive view inspected; the slogan, example controls, current comparison, and code workflow remain reachable.
- Copy feedback was verified after adding a timeout-safe clipboard path.
- Focus styles are visible and state is not conveyed by color alone.

## Live GPT-5.6 status

The server integration is implemented and covered by mocked provider tests. A server-only Platform API key is present locally and is ignored by Git.

A live success response could not be verified from this development host because outbound connectivity to `api.openai.com` was unavailable. An unauthenticated `curl` connectivity check timed out after 12 seconds with HTTP status `000`, zero connect time, and no TLS connection. The application request consequently reached its hard timeout and returned the correctly labeled deterministic fallback for a known example.

This record does **not** claim a successful live GPT-5.6 response. Live verification remains required from a deployment or network that can reach the OpenAI API before the final competition submission.

## Cloudflare deployment status

- Worker: `stillmeaning`
- Current deployment URL: https://stillmeaning.alexliluz.workers.dev
- On 2026-07-18, the account-level `workers.dev` subdomain was renamed to `alexliluz`; Cloudflare API readback confirmed the new subdomain and that the existing `stillmeaning` Worker route remains enabled. The Worker identity and deployment were not recreated.
- A 2026-07-18 HTTPS check of the new hostname from the same development network still timed out after 15 seconds with HTTP status `000`, so this record does not claim an externally rendered page from that network.
- Worker startup time reported at deployment: 30 ms
- `OPENAI_API_KEY` is present as a Cloudflare `secret_text` binding; the value was never printed or committed.
- The deployed Secret Change version is receiving 100% of Worker traffic according to Wrangler.
- Three known-example API requests returned the expected labeled fallback in a local Workers preview; arbitrary source without a key returned the expected 503.
- The development network could not connect to the shared `workers.dev` domain. DNS resolved it to an unrelated address and HTTPS timed out, so this record does not claim an externally observed homepage or live GPT-5.6 result from the public URL.

## Git and secret checks

- `.env.local` is ignored by `.gitignore`.
- A pnpm workspace override pins the Next.js PostCSS transitive dependency to patched version 8.5.19.
- Repository scans found only the placeholder `OPENAI_API_KEY=` in `.env.example`.
- No generated Session ID, user metric, performance metric, or live-model result has been fabricated.
