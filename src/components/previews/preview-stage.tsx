import type { ExampleId } from "../../domain/examples";
import { HierarchyPreview } from "./hierarchy-preview";
import { ProgressPreview } from "./progress-preview";
import { SuccessPreview } from "./success-preview";

export type PreviewVersion = "original" | "motion-removed" | "stillmeaning";
export type MotionMode = "normal" | "reduced";

const previewLabels = {
  original: {
    ariaLabel: "Original preview",
    eyebrow: "Before",
    title: "Original",
  },
  "motion-removed": {
    ariaLabel: "Motion Removed Only preview",
    eyebrow: "Counterfactual",
    title: "Motion Removed Only",
  },
  stillmeaning: {
    ariaLabel: "StillMeaning preview",
    eyebrow: "After",
    title: "StillMeaning Version",
  },
} as const;

interface PreviewStageProps {
  exampleId: ExampleId;
  version: PreviewVersion;
  motionMode: MotionMode;
}

export function PreviewStage({
  exampleId,
  version,
  motionMode,
}: PreviewStageProps) {
  const label = previewLabels[version];

  return (
    <article
      aria-label={label.ariaLabel}
      className="preview-stage"
      data-motion-mode={motionMode}
      data-version={version}
    >
      <header className="preview-stage__header">
        <div>
          <span className="preview-stage__eyebrow">
            {label.eyebrow}
          </span>
          <h2>{label.title}</h2>
        </div>
        <span className="preview-stage__mode">
          {motionMode === "normal" ? "Normal motion" : "Reduced motion"}
        </span>
      </header>
      <div className="preview-stage__canvas">
        {exampleId === "progress-upload" ? (
          <ProgressPreview motionMode={motionMode} version={version} />
        ) : null}
        {exampleId === "success-save" ? (
          <SuccessPreview motionMode={motionMode} version={version} />
        ) : null}
        {exampleId === "hierarchy-panel" ? (
          <HierarchyPreview motionMode={motionMode} version={version} />
        ) : null}
      </div>
    </article>
  );
}
