# Feasibility, significance, and competitive landscape

Research date: 2026-07-17

## Conclusion

StillMeaning is feasible as a focused developer-tool MVP and addresses a real gap between motion preference detection and semantic transformation. The adjacent market is active, including AI-assisted accessibility products, but the reviewed tools primarily scan for broad violations, emulate preferences, or provide general remediation. None of the reviewed official product pages centers its workflow on identifying the meaning carried by animation and generating a reduced-motion alternative that preserves that meaning.

That last statement is an inference from the reviewed official materials, not a claim that no similar project exists anywhere.

## Why the problem matters

[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions) recognizes that interaction-triggered motion can cause distraction, nausea, dizziness, and headaches, and requires that it can be disabled unless it is essential to functionality or information.

Apple’s [Reduced Motion evaluation criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria) explicitly says not to remove animation entirely when it conveys meaning such as an item moving to a cart or a transition into a hierarchical subview. This supports StillMeaning’s central thesis: a safe transformation must first identify what the motion communicates.

The developer problem is therefore not only “does this site respect `prefers-reduced-motion`?” It is also:

1. What semantic cue does this animation carry?
2. What part of the movement creates risk?
3. Which non-motion or lower-motion signals can preserve the cue?
4. Does the replacement keep the necessary text, ARIA state, focus behavior, and context?

## Adjacent products

| Product | Officially described strength | Relationship to StillMeaning |
| --- | --- | --- |
| [axe DevTools](https://www.deque.com/Axe/devtools/) | Web/mobile accessibility testing across IDE, browser, CI, AI assistance, and code-level fixes | Strong general accessibility platform; StillMeaning is narrower and motion-semantic-first |
| [BrowserStack AI-powered Accessibility Testing](https://www.browserstack.com/docs/accessibility/automated-tests/ai-powered-testing) | AI issue detection and context-aware remediation layered on rules | Closest AI-remediation adjacency, but official material is broad accessibility rather than motion meaning transformation |
| [Storybook Accessibility addon](https://storybook.js.org/docs/writing-tests/accessibility-testing) | axe-core checks for component stories and CI integration | Excellent component-level rule testing; it does not generate semantic reduced-motion variants |
| [Chrome DevTools motion emulation](https://developer.chrome.com/docs/devtools/rendering/emulate-css) | Emulates `prefers-reduced-motion: reduce` | Helps developers observe behavior; it does not explain or transform the animation |

## Product differentiation

StillMeaning’s strongest differentiation is the sequence, not any single feature:

1. classify animation technique and semantic role;
2. explain motion risk with evidence;
3. generate a concrete reduced-motion implementation;
4. compare original and replacement side by side;
5. validate bounded meaning-preservation checks;
6. expose the exact code diff and provenance.

The tool should stay focused on that sequence. Competing with full accessibility platforms on scanning breadth, reporting, organization management, or compliance coverage would weaken the MVP.

## Technical feasibility

The current implementation reduces the highest risks:

- exactly three high-quality curated examples keep the demo deterministic;
- a strict Zod schema bounds every model field;
- the request accepts a known example or at most 20,000 characters of source;
- server-only OpenAI calls protect the API key;
- timeouts and labeled fallbacks keep known examples usable;
- arbitrary custom source never receives fabricated fallback output;
- generated code is display-only and cannot execute in the product.

The remaining feasibility risks are model latency/availability, variance in code quality, and the difficulty of proving semantics from source alone. The MVP mitigates rather than eliminates them. A production version would benefit from AST extraction, browser instrumentation in a hardened sandbox, repository context, design-system metadata, and human review workflows.

## Strategic value

The initial wedge is a focused review and transformation tool for frontend teams. A longer-term defensible asset could be a corpus connecting animation patterns to semantic roles, motion risk, safer alternatives, and validation checks across frameworks and design systems. That corpus could support IDE review, pull-request checks, Storybook integration, and design-system governance without turning StillMeaning into another generic accessibility scanner.
