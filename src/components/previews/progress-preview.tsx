import type { MotionMode, PreviewVersion } from "./preview-stage";

interface ProgressPreviewProps {
  motionMode: MotionMode;
  version: PreviewVersion;
}

export function ProgressPreview({ motionMode, version }: ProgressPreviewProps) {
  const stillMeaning = version === "stillmeaning";
  const original = version === "original";

  return (
    <div className="progress-demo" data-mode={motionMode} data-version={version}>
      <div className="file-chip">
        <span aria-hidden="true" className="file-chip__icon">PDF</span>
        <div>
          <strong>quarterly-report.pdf</strong>
          <span>18.4 MB</span>
        </div>
      </div>
      <div
        {...(stillMeaning
          ? {
              "aria-label": "Uploading quarterly-report.pdf",
              "aria-valuemax": 100,
              "aria-valuemin": 0,
              "aria-valuenow": 68,
              role: "progressbar",
            }
          : { "aria-hidden": true })}
        className="progress-track"
      >
        <span className="progress-track__fill" />
        {original ? <span aria-hidden="true" className="progress-track__sweep" /> : null}
      </div>
      {stillMeaning ? (
        <div className="progress-demo__meta">
          <span>Uploading · 68%</span>
          <strong>68%</strong>
        </div>
      ) : null}
      <p className="preview-caption">
        {stillMeaning
          ? "Static fill + numeric state"
          : original
            ? "Repeated sweep signals activity"
            : "Static bar · activity unclear"}
      </p>
    </div>
  );
}
