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

## Git and secret checks

- `.env.local` is ignored by `.gitignore`.
- A pnpm workspace override pins the Next.js PostCSS transitive dependency to patched version 8.5.19.
- Repository scans found only the placeholder `OPENAI_API_KEY=` in `.env.example`.
- No generated Session ID, user metric, performance metric, or live-model result has been fabricated.
