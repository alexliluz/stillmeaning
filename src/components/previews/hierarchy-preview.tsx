import { useEffect, useRef, useState } from "react";

import type { MotionMode, PreviewVersion } from "./preview-stage";

interface HierarchyPreviewProps {
  motionMode: MotionMode;
  version: PreviewVersion;
}

export function HierarchyPreview({ motionMode, version }: HierarchyPreviewProps) {
  const [open, setOpen] = useState(false);
  const destinationRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (open) destinationRef.current?.focus();
  }, [open]);

  return (
    <div className="hierarchy-demo" data-mode={motionMode} data-version={version}>
      <div className="hierarchy-demo__crumbs" aria-label="Current location">
        <span>Projects</span>
        <span aria-hidden="true">/</span>
        <strong>{open ? "Project details" : "Overview"}</strong>
      </div>
      <div className="hierarchy-demo__viewport">
        {!open ? (
          <div className="project-summary">
            <span className="project-summary__mark" aria-hidden="true">SM</span>
            <div>
              <strong>StillMeaning</strong>
              <span>Developer Tools</span>
            </div>
            <button
              aria-controls={`project-panel-${version}`}
              onClick={() => setOpen(true)}
              type="button"
            >
              Open project details
            </button>
          </div>
        ) : (
          <section
            className="project-panel"
            data-state="open"
            id={`project-panel-${version}`}
          >
            <span className="project-panel__context">Deeper level</span>
            <h3 ref={destinationRef} tabIndex={-1}>Project details</h3>
            <p>Settings and accessibility checks for StillMeaning.</p>
          </section>
        )}
      </div>
      <p className="preview-caption">
        {version === "stillmeaning"
          ? "Context label + logical focus"
          : "Large slide implies depth"}
      </p>
    </div>
  );
}
