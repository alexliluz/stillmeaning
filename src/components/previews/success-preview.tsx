import { CheckIcon } from "../icons";
import type { MotionMode, PreviewVersion } from "./preview-stage";

interface SuccessPreviewProps {
  motionMode: MotionMode;
  version: PreviewVersion;
}

export function SuccessPreview({ motionMode, version }: SuccessPreviewProps) {
  const revised = version === "stillmeaning";

  return (
    <div className="success-demo" data-mode={motionMode} data-version={version}>
      <div aria-live="polite" className="success-message" role="status">
        <span className="success-message__icon">
          <CheckIcon />
        </span>
        <div className="success-message__copy">
          <strong>Changes saved</strong>
          {revised ? <span>Draft synced at 10:42</span> : <span>Draft updated</span>}
        </div>
      </div>
      <p className="preview-caption">
        {revised
          ? "Persistent text + polite status"
          : "Scale, rotation, and drawn check"}
      </p>
    </div>
  );
}
