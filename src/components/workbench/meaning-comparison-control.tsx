export type ComparisonTarget = "motion-removed" | "stillmeaning";

interface MeaningComparisonControlProps {
  onTargetChange: (target: ComparisonTarget) => void;
  target: ComparisonTarget;
}

const controlCopy = {
  stillmeaning: {
    action: "Why not just turn motion off?",
    detail: "Reveal the information risk behind blanket animation removal.",
    next: "motion-removed",
  },
  "motion-removed": {
    action: "Restore meaning with StillMeaning",
    detail: "Replace the risky motion with explicit semantic cues.",
    next: "stillmeaning",
  },
} as const;

export function MeaningComparisonControl({
  onTargetChange,
  target,
}: MeaningComparisonControlProps) {
  const copy = controlCopy[target];

  return (
    <section
      aria-label="Meaning loss comparison"
      className="meaning-comparison-control"
      data-target={target}
    >
      <div>
        <span className="section-kicker">Animation is information</span>
        <p>{copy.detail}</p>
      </div>
      <button onClick={() => onTargetChange(copy.next)} type="button">
        {copy.action}
      </button>
    </section>
  );
}
