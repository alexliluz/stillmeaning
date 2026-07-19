import { CheckIcon } from "../icons";
import type { MotionMode, PreviewVersion } from "./preview-stage";

interface SuccessPreviewProps {
  motionMode: MotionMode;
  version: PreviewVersion;
}

export function SuccessPreview({ motionMode, version }: SuccessPreviewProps) {
  const stillMeaning = version === "stillmeaning";
  const original = version === "original";

  return (
    <div className="success-demo" data-mode={motionMode} data-version={version}>
      {stillMeaning ? (
        <div aria-live="polite" className="success-message" role="status">
          <span className="success-message__icon">
            <CheckIcon />
          </span>
          <div className="success-message__copy">
            <strong>Changes saved</strong>
            <span>Draft synced at 10:42</span>
          </div>
        </div>
      ) : (
        <div aria-hidden="true" className="success-message success-message--icon-only">
          <span className="success-message__icon">
            <CheckIcon />
          </span>
        </div>
      )}
      <p className="preview-caption">
        {stillMeaning
          ? "Persistent text + polite status"
          : original
            ? "Scale, rotation, and drawn check"
            : "Static unlabeled icon"}
      </p>
    </div>
  );
}
