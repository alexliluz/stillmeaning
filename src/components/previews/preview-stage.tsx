import type { ExampleId } from "../../domain/examples";
import { HierarchyPreview } from "./hierarchy-preview";
import { ProgressPreview } from "./progress-preview";
import { SuccessPreview } from "./success-preview";

export type PreviewVersion = "original" | "stillmeaning";
export type MotionMode = "normal" | "reduced";

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
  return (
    <article
      aria-label={version === "original" ? "Original preview" : "StillMeaning preview"}
      className="preview-stage"
      data-motion-mode={motionMode}
      data-version={version}
    >
      <header className="preview-stage__header">
        <div>
          <span className="preview-stage__eyebrow">
            {version === "original" ? "Before" : "After"}
          </span>
          <h2>{version === "original" ? "Original" : "StillMeaning version"}</h2>
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
