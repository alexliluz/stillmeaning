# Submission readiness audit — 2026-07-17

This is a read-only audit of the live Devpost project and the official OpenAI Build Week submission fields. It does not authorize or record a Devpost submission.

## Current live state

- Project ID: `1340200`
- Project: StillMeaning
- State: `submission_draft`
- Hackathon: OpenAI Build Week (`openai`)
- Category to select: **Developer Tools**
- Repository: https://github.com/alexliluz/stillmeaning
- Public hosted demo: not yet available
- Public YouTube video: not yet available
- `/feedback` Session ID: not yet generated

The official deadline returned by Devpost is `2026-07-22T00:00:00Z`, which is July 21 at 5:00 PM Pacific Time and July 22 at 8:00 AM China Standard Time.

## Critical content discrepancy

The existing live Devpost description predates the implementation and currently claims features that the repository does not contain, including runtime browser animation capture, viewport-relative motion measurement, GSAP remediation, screenshot input to GPT-5.6, automatic Codex modification of a target application, and a three-way comparison against a disable-all version.

Those claims must be replaced before submission. The accurate Project Story is in [devpost-project-story.md](devpost-project-story.md). Do not leave the old description live in a final entry.

## Official required fields

| Field | Required | Prepared value/status |
| --- | --- | --- |
| Submitter Type | Yes | Requires entrant confirmation |
| Country of Residence | Yes | Requires entrant confirmation and official-rules eligibility check |
| Category | Yes | Developer Tools |
| Code repository URL | Yes | https://github.com/alexliluz/stillmeaning |
| Judge test URL/instructions | No globally, expected for developer tools | Hosted demo still required for a strong submission |
| `/feedback` Codex Session ID | Yes | Must be generated in this primary session |
| Developer-tool installation/platform/testing instructions | Expected for this track | Draft below |
| Demo video | Yes | Public YouTube, under 3 minutes, spoken explanation of both Codex and GPT-5.6 |

## Developer-tool instructions draft

StillMeaning is a responsive web application supporting current desktop and mobile browsers. Judges can use the hosted demo at `[ADD DEMO URL]` without an account. Select any of the three built-in examples—Upload progress, Save confirmation, or Panel hierarchy—to follow the deterministic golden path. Compare Original and StillMeaning Version, switch Normal/Reduced motion, review the Meaning Preserved evidence, and inspect or copy the generated code.

To run locally: install Node.js 24+ and pnpm 11.9+, clone `https://github.com/alexliluz/stillmeaning.git`, run `pnpm install`, copy `.env.example` to `.env.local`, and run `pnpm dev`. The three curated cases work with a clearly labeled deterministic fallback. Live pasted-source analysis requires a server-side OpenAI Platform API key with GPT-5.6 access. Generated or pasted code is never executed.

## Judging-criteria alignment

| Criterion | Current evidence | Remaining improvement |
| --- | --- | --- |
| Technological Implementation | Structured GPT-5.6 boundary, schema validation, safe fallback, 33 unit/component tests, 8 browser tests, meaningful Git history | Verify a real deployed GPT-5.6 success path and capture it in the demo |
| Design | Coherent workbench, before/after focus, responsive and keyboard-accessible interaction | Deploy a zero-setup judge experience and prepare polished thumbnail/screenshots |
| Potential Impact | Specific developer and accessibility audience, standards-backed problem, three concrete semantic roles | Keep the two-minute narrative focused on lost meaning rather than generic accessibility |
| Quality of the Idea | Motion-semantic-first workflow differs from broad scanners and preference emulators in reviewed official materials | Avoid absolute “no competitors” claims; describe the gap as an evidence-based inference |

## Eligibility check

The official rules limit participation by country or territory and require entrants to be above the legal age of majority in their country of residence. The entrant must personally confirm the correct country of residence and eligibility before final submission. Location cannot be inferred from the development machine’s time zone.

## P0 blockers before final submission

1. Confirm entrant type, country of residence, and eligibility.
2. Deploy a public, judge-ready demo or provide an equivalent zero-rebuild testing path.
3. Verify at least one successful live GPT-5.6 analysis from the deployed environment.
4. Replace the inaccurate live Devpost description with the repository-backed Project Story.
5. Create and upload a 3:2 thumbnail plus selected screenshots.
6. Record and publish the public under-three-minute YouTube video.
7. Run `/feedback` in this primary Codex session and save the real Session ID.
8. Manually review all fields, then perform the final Devpost submission before the deadline.

No automated final submission should be performed without explicit user confirmation.
