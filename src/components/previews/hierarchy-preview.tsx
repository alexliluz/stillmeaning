import { useEffect, useRef, useState } from "react";

import type { MotionMode, PreviewVersion } from "./preview-stage";

interface HierarchyPreviewProps {
  motionMode: MotionMode;
  version: PreviewVersion;
}

export function HierarchyPreview({ motionMode, version }: HierarchyPreviewProps) {
  const [open, setOpen] = useState(false);
  const destinationRef = useRef<HTMLHeadingElement>(null);
  const stillMeaning = version === "stillmeaning";

  useEffect(() => {
    if (open && stillMeaning) destinationRef.current?.focus();
  }, [open, stillMeaning]);

  return (
    <div className="hierarchy-demo" data-mode={motionMode} data-version={version}>
      {stillMeaning ? (
        <div className="hierarchy-demo__crumbs" aria-label="Current location">
          <span>Projects</span>
          <span aria-hidden="true">/</span>
          <strong>{open ? "Project details" : "Overview"}</strong>
        </div>
      ) : null}
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
            {stillMeaning ? (
              <span className="project-panel__context">Deeper level</span>
            ) : null}
            <h3 ref={destinationRef} tabIndex={stillMeaning ? -1 : undefined}>
              Project details
            </h3>
            <p>Settings and accessibility checks for StillMeaning.</p>
          </section>
        )}
      </div>
      <p className="preview-caption">
        {stillMeaning
          ? "Context label + logical focus"
          : version === "original"
            ? "Large slide implies depth"
            : "Instant swap · depth unclear"}
      </p>
    </div>
  );
}
