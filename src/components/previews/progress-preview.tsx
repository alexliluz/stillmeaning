import type { MotionMode, PreviewVersion } from "./preview-stage";

interface ProgressPreviewProps {
  motionMode: MotionMode;
  version: PreviewVersion;
}

export function ProgressPreview({ motionMode, version }: ProgressPreviewProps) {
  const revised = version === "stillmeaning";

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
        aria-label="Uploading quarterly-report.pdf"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={68}
        className="progress-track"
        role="progressbar"
      >
        <span className="progress-track__fill" />
        {!revised ? <span aria-hidden="true" className="progress-track__sweep" /> : null}
      </div>
      <div className="progress-demo__meta">
        <span>{revised ? "Uploading · 68%" : "Uploading"}</span>
        <strong>{revised ? "68%" : "Active"}</strong>
      </div>
      <p className="preview-caption">
        {revised
          ? "Static fill + numeric state"
          : "Repeated sweep signals activity"}
      </p>
    </div>
  );
}
