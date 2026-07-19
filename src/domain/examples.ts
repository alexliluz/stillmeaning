import type { Analysis } from "./analysis";

export type ExampleId =
  | "progress-upload"
  | "success-save"
  | "hierarchy-panel";

export type PreviewMetadata =
  | {
      kind: "progress";
      label: string;
      value: number;
      stateLabel: string;
    }
  | {
      kind: "success";
      label: string;
      detail: string;
    }
  | {
      kind: "hierarchy";
      originLabel: string;
      destinationLabel: string;
      focusTarget: string;
    };

export interface MotionExample {
  id: ExampleId;
  title: string;
  description: string;
  category: string;
  originalCode: string;
  motionRemovedCode: string;
  reducedCode: string;
  preview: PreviewMetadata;
  fallbackAnalysis: Analysis;
}

const progressMotionRemovedCode = `<div class="upload-progress" aria-label="Uploading">
  <span class="upload-progress__fill"></span>
</div>

<style>
  .upload-progress__fill { width: 68%; }

  @media (prefers-reduced-motion: reduce) {
    .upload-progress::after {
      animation: none;
      content: none;
    }

    .upload-progress__fill { transition: none; }
  }
</style>`;

const successMotionRemovedCode = `<div class="save-result">
  <svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 7" /></svg>
</div>

<style>
  @media (prefers-reduced-motion: reduce) {
    .save-result,
    .save-result path {
      animation: none;
      transition: none;
    }
  }
</style>`;

const hierarchyMotionRemovedCode = `<button type="button" id="open-project">Open project details</button>
<section id="project-panel" class="panel" hidden>
  <h2>Project details</h2>
</section>

<style>
  @media (prefers-reduced-motion: reduce) {
    .panel[data-state="open"] {
      animation: none;
      transition: none;
    }
  }
</style>

<script>
  openProject.addEventListener('click', () => {
    projectPanel.hidden = false;
    projectPanel.dataset.state = 'open';
  });
</script>`;

const progressReducedCode = `<div
  class="upload-progress"
  role="progressbar"
  aria-label="Uploading quarterly-report.pdf"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow="68"
>
  <span class="upload-progress__fill"></span>
  <span class="upload-progress__label">Uploading · 68%</span>
</div>

<style>
  .upload-progress__fill { width: 68%; }

  @media (prefers-reduced-motion: reduce) {
    .upload-progress::after {
      animation: none;
      content: none;
    }

    .upload-progress__fill {
      transition: none;
    }
  }
</style>`;

const successReducedCode = `<div class="save-result" role="status" aria-live="polite">
  <svg class="save-result__icon" aria-hidden="true" viewBox="0 0 24 24">
    <path d="m5 12 4 4L19 7" />
  </svg>
  <div>
    <strong>Changes saved</strong>
    <span>Draft synced at 10:42</span>
  </div>
</div>

<style>
  @media (prefers-reduced-motion: reduce) {
    .save-result,
    .save-result__icon path {
      animation: none;
      transition: none;
    }

    .save-result { opacity: 1; }
    .save-result__icon path { stroke-dashoffset: 0; }
  }
</style>`;

const hierarchyReducedCode = `<main id="workspace-shell">
  <button type="button" aria-controls="project-panel">Open project details</button>
  <nav aria-label="Current location">
    <span>Projects</span> / <strong>Project details</strong>
  </nav>
  <section id="project-panel" aria-labelledby="project-panel-title" hidden>
    <span>Deeper level</span>
    <h2 id="project-panel-title" tabindex="-1">Project details</h2>
    <p>Settings for StillMeaning.</p>
  </section>
</main>

<style>
  @media (prefers-reduced-motion: reduce) {
    #project-panel[data-state="open"] {
      animation: panel-fade-in 120ms ease-out;
    }

    @keyframes panel-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  }
</style>

<script>
  const trigger = document.querySelector('[aria-controls="project-panel"]');
  const panel = document.querySelector('#project-panel');
  const heading = document.querySelector('#project-panel-title');

  trigger.addEventListener('click', () => {
    panel.hidden = false;
    panel.dataset.state = 'open';
    heading.focus();
  });
</script>`;

export const motionExamples: readonly MotionExample[] = [
  {
    id: "progress-upload",
    title: "Upload progress",
    description: "A sweeping highlight communicates an active file upload.",
    category: "Progress & loading",
    originalCode: `<div class="upload-progress" aria-label="Uploading">
  <span class="upload-progress__fill"></span>
</div>

<style>
  .upload-progress__fill { width: 68%; transition: width 600ms ease; }
  .upload-progress::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, white, transparent);
    animation: sweep 900ms linear infinite;
  }
  @keyframes sweep {
    from { transform: translateX(-100%); }
    to { transform: translateX(100%); }
  }
</style>`,
    motionRemovedCode: progressMotionRemovedCode,
    reducedCode: progressReducedCode,
    preview: {
      kind: "progress",
      label: "quarterly-report.pdf",
      value: 68,
      stateLabel: "Uploading",
    },
    fallbackAnalysis: {
      animationId: "progress-upload",
      detectedTechnique: "css-keyframes",
      semanticRole: "progress",
      motionRisk: "high",
      riskReason:
        "A high-contrast highlight repeatedly traverses the full progress track, creating continuous lateral motion that is not required to understand completion.",
      originalBehavior:
        "A bar grows to 68% while an infinite shimmer indicates that the upload is still active.",
      proposedAlternative:
        "Remove the repeated sweep, keep a static 68% fill, expose the numeric value to assistive technology, and show a persistent Uploading label.",
      preservedMeaning: [
        "The upload is still in progress",
        "The current completion value is 68%",
        "The progress belongs to quarterly-report.pdf",
      ],
      semanticTrace: [
        {
          id: "activity-state",
          meaning: "The upload is still active",
          originalSignal: "A repeated sweeping highlight crosses the progress track.",
          removalEffect: "A static bar can look stalled.",
          impact: "ambiguous",
          replacementSignal: "Persistent Uploading · 68% text states that work is continuing.",
          validationCheckId: "activity-state",
        },
        {
          id: "completion-value",
          meaning: "The upload is 68% complete",
          originalSignal: "The changing visual width suggests partial completion.",
          removalEffect: "The precise completion value is not exposed as text or a progressbar value.",
          impact: "ambiguous",
          replacementSignal: "Visible 68% text matches aria-valuenow=68.",
          validationCheckId: "progress-value",
        },
        {
          id: "file-association",
          meaning: "The progress belongs to quarterly-report.pdf",
          originalSignal: "The moving track appears beside the file being uploaded.",
          removalEffect: "The unlabeled visual track does not programmatically identify its file.",
          impact: "lost",
          replacementSignal: "The progressbar accessible label names quarterly-report.pdf.",
          validationCheckId: "file-association",
        },
      ],
      confidence: 0.97,
      generatedCode: progressReducedCode,
      validationChecks: [
        {
          id: "progress-value",
          label: "Numeric progress remains available",
          passed: true,
          evidence: "Visible 68% text matches aria-valuenow=68.",
        },
        {
          id: "progress-semantics",
          label: "Progress semantics remain available",
          passed: true,
          evidence: "The replacement retains role=progressbar and its 0–100 range.",
        },
        {
          id: "activity-state",
          label: "Active state remains explicit",
          passed: true,
          evidence: "The persistent Uploading label replaces the infinite shimmer cue.",
        },
        {
          id: "file-association",
          label: "Progress remains associated with its file",
          passed: true,
          evidence: "The progressbar aria-label names quarterly-report.pdf.",
        },
      ],
      source: "demo-fallback",
    },
  },
  {
    id: "success-save",
    title: "Save confirmation",
    description: "A bouncing checkmark confirms that a draft was saved.",
    category: "Success & failure feedback",
    originalCode: `<div class="save-result">
  <svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 7" /></svg>
</div>

<style>
  .save-result { animation: pop-in 500ms cubic-bezier(.2, 1.7, .5, 1); }
  .save-result path { animation: draw-check 700ms ease 200ms both; }
  @keyframes pop-in {
    from { transform: scale(.2) rotate(-12deg); }
    to { transform: scale(1) rotate(0); }
  }
  @keyframes draw-check {
    from { stroke-dashoffset: 30; }
    to { stroke-dashoffset: 0; }
  }
</style>`,
    motionRemovedCode: successMotionRemovedCode,
    reducedCode: successReducedCode,
    preview: {
      kind: "success",
      label: "Changes saved",
      detail: "Draft synced at 10:42",
    },
    fallbackAnalysis: {
      animationId: "success-save",
      detectedTechnique: "css-keyframes",
      semanticRole: "status-feedback",
      motionRisk: "medium",
      riskReason:
        "The rapid scale change, rotation, overshoot, and delayed path drawing combine several motion cues for a simple outcome.",
      originalBehavior:
        "A checkmark scales and rotates into view, then draws its path to signal a successful save.",
      proposedAlternative:
        "Render the checkmark immediately with persistent Changes saved text and announce the outcome through a polite status region.",
      preservedMeaning: [
        "The save completed successfully",
        "The confirmation belongs to the current draft",
        "The latest synchronization time remains visible",
      ],
      semanticTrace: [
        {
          id: "save-outcome",
          meaning: "The draft was saved successfully",
          originalSignal: "A checkmark scales, rotates, and draws itself into view.",
          removalEffect: "An unlabeled static icon does not express the outcome to users who cannot perceive it.",
          impact: "lost",
          replacementSignal: "Persistent Changes saved text expresses the result without relying on motion or color.",
          validationCheckId: "outcome-text",
        },
        {
          id: "status-announcement",
          meaning: "The result is announced when the save completes",
          originalSignal: "The animated entrance attracts visual attention at the moment of completion.",
          removalEffect: "Removing the entrance adds no programmatic announcement for users whose attention is elsewhere.",
          impact: "lost",
          replacementSignal: "A polite status region announces the completed save.",
          validationCheckId: "status-announcement",
        },
        {
          id: "sync-context",
          meaning: "The confirmation belongs to the latest draft synchronization",
          originalSignal: "The transient animated check appears immediately after the action.",
          removalEffect: "A timeless icon can be mistaken for an old or generic success state.",
          impact: "ambiguous",
          replacementSignal: "Draft synced at 10:42 provides persistent context.",
          validationCheckId: "sync-detail",
        },
      ],
      confidence: 0.95,
      generatedCode: successReducedCode,
      validationChecks: [
        {
          id: "outcome-text",
          label: "Outcome is expressed in text",
          passed: true,
          evidence: "Changes saved remains visible and does not rely on the checkmark color.",
        },
        {
          id: "status-announcement",
          label: "Outcome is announced",
          passed: true,
          evidence: "role=status with aria-live=polite announces the completed save.",
        },
        {
          id: "motion-removed",
          label: "Compound motion is removed",
          passed: true,
          evidence: "Reduced motion disables the scale, rotation, and path animation.",
        },
        {
          id: "sync-detail",
          label: "Synchronization context remains visible",
          passed: true,
          evidence: "Draft synced at 10:42 identifies the result as the latest synchronization.",
        },
      ],
      source: "demo-fallback",
    },
  },
  {
    id: "hierarchy-panel",
    title: "Panel hierarchy",
    description: "A large sliding panel communicates navigation into a deeper level.",
    category: "Hierarchy & focus",
    originalCode: `<button type="button" id="open-project">Open project details</button>
<section id="project-panel" class="panel" hidden>
  <h2>Project details</h2>
</section>

<style>
  .panel[data-state="open"] { animation: slide-in 450ms ease-out; }
  @keyframes slide-in {
    from { transform: translateX(80vw); }
    to { transform: translateX(0); }
  }
</style>

<script>
  openProject.addEventListener('click', () => {
    projectPanel.hidden = false;
    projectPanel.dataset.state = 'open';
  });
</script>`,
    motionRemovedCode: hierarchyMotionRemovedCode,
    reducedCode: hierarchyReducedCode,
    preview: {
      kind: "hierarchy",
      originLabel: "Projects",
      destinationLabel: "Project details",
      focusTarget: "Project details heading",
    },
    fallbackAnalysis: {
      animationId: "hierarchy-panel",
      detectedTechnique: "css-keyframes",
      semanticRole: "hierarchy-transition",
      motionRisk: "high",
      riskReason:
        "The panel crosses most of the viewport, producing a large spatial displacement that may trigger vestibular discomfort.",
      originalBehavior:
        "A detail panel travels from the far right to show movement from the project list into a deeper information level.",
      proposedAlternative:
        "Swap the panel in place with a short opacity transition, keep the Project details heading, and move programmatic focus to that heading.",
      preservedMeaning: [
        "The interface moved from Projects to Project details",
        "Project details is the new active context",
        "Keyboard and screen-reader focus follows the context change",
      ],
      semanticTrace: [
        {
          id: "depth-context",
          meaning: "Project details is a deeper level inside Projects",
          originalSignal: "The panel travels from right to left across most of the viewport.",
          removalEffect: "An immediate content swap does not explain the destination's relationship to Projects.",
          impact: "ambiguous",
          replacementSignal: "The Projects / Project details breadcrumb and Deeper level label make the hierarchy explicit.",
          validationCheckId: "hierarchy-context",
        },
        {
          id: "focus-destination",
          meaning: "Interaction continues in the newly opened Project details context",
          originalSignal: "The moving panel visually pulls attention toward the destination.",
          removalEffect: "Keyboard focus remains on the old trigger after the content changes.",
          impact: "ambiguous",
          replacementSignal: "Programmatic focus moves to the Project details heading.",
          validationCheckId: "focus-target",
        },
      ],
      confidence: 0.96,
      generatedCode: hierarchyReducedCode,
      validationChecks: [
        {
          id: "destination-label",
          label: "Destination remains named",
          passed: true,
          evidence: "The visible h2 and aria-labelledby both identify Project details.",
        },
        {
          id: "focus-target",
          label: "Focus follows the context change",
          passed: true,
          evidence: "The destination heading receives focus after the panel opens.",
        },
        {
          id: "spatial-motion",
          label: "Large spatial motion is removed",
          passed: true,
          evidence: "Reduced motion uses a 120ms opacity change instead of an 80vw translation.",
        },
        {
          id: "hierarchy-context",
          label: "Destination hierarchy remains explicit",
          passed: true,
          evidence: "The breadcrumb reads Projects / Project details and the destination is labeled Deeper level.",
        },
      ],
      source: "demo-fallback",
    },
  },
] as const;

export function getMotionExample(id: string): MotionExample | undefined {
  return motionExamples.find((example) => example.id === id);
}

export function getFallbackAnalysis(id: string): Analysis | undefined {
  return getMotionExample(id)?.fallbackAnalysis;
}
