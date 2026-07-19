import type { Analysis } from "../../domain/analysis";
import { summarizeMeaningChecks } from "../../domain/meaning-validation";
import { ShieldCheckIcon } from "../icons";
import type { ComparisonTarget } from "./meaning-comparison-control";

interface SemanticTraceProps {
  analysis: Analysis;
  target: ComparisonTarget;
}

const impactLabel = {
  lost: "! Lost",
  ambiguous: "? Ambiguous",
  retained: "✓ Retained",
} as const;

export function SemanticTrace({ analysis, target }: SemanticTraceProps) {
  const summary = summarizeMeaningChecks(analysis.validationChecks);
  const checks = new Map(
    analysis.validationChecks.map((check) => [check.id, check]),
  );
  const atRisk = target === "motion-removed";

  return (
    <section
      className="meaning-card semantic-trace"
      data-summary={atRisk ? "at-risk" : summary}
      data-target={target}
    >
      <div className="meaning-card__title">
        <ShieldCheckIcon />
        <div>
          <span className="section-kicker">
            {atRisk ? "Counterfactual evidence" : "Semantic receipt"}
          </span>
          <h3>
            {atRisk
              ? "Meaning at Risk"
              : "Meaning preserved by these checks"}
          </h3>
        </div>
      </div>

      <p className="semantic-trace__intro">
        {atRisk
          ? "Removing animation alone does not replace the information it carried."
          : "StillMeaning maps each motion signal to an explicit replacement cue."}
      </p>

      <ol className="semantic-trace__list">
        {analysis.semanticTrace.map((trace) => {
          const check = checks.get(trace.validationCheckId);

          return (
            <li data-impact={trace.impact} key={trace.id}>
              <div className="semantic-trace__item-header">
                <strong>{trace.meaning}</strong>
                <span>{atRisk ? impactLabel[trace.impact] : check?.passed ? "✓ Preserved" : "! Review"}</span>
              </div>
              {atRisk ? (
                <dl>
                  <div>
                    <dt>Motion carried it</dt>
                    <dd>{trace.originalSignal}</dd>
                  </div>
                  <div>
                    <dt>When motion is removed</dt>
                    <dd>{trace.removalEffect}</dd>
                  </div>
                </dl>
              ) : (
                <dl>
                  <div>
                    <dt>Replacement cue</dt>
                    <dd>{trace.replacementSignal}</dd>
                  </div>
                  <div>
                    <dt>Bounded evidence</dt>
                    <dd>{check?.evidence ?? "Validation link unavailable."}</dd>
                  </div>
                </dl>
              )}
            </li>
          );
        })}
      </ol>

      {!atRisk ? (
        <div className="semantic-trace__checks">
          <h4>Implementation checks</h4>
          <ul>
            {analysis.validationChecks.map((check) => (
              <li key={check.id}>
                <span aria-hidden="true">{check.passed ? "✓" : "!"}</span>
                <div>
                  <strong>{check.label}</strong>
                  <p>{check.evidence}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="semantic-trace__review">
        <strong>Requires developer review</strong>
        <span>These checks are evidence, not an accessibility certification.</span>
      </p>
    </section>
  );
}
