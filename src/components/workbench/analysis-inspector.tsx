import type { Analysis } from "../../domain/analysis";
import { summarizeMeaningChecks } from "../../domain/meaning-validation";
import { ShieldCheckIcon } from "../icons";

interface AnalysisInspectorProps {
  analysis: Analysis;
  notice?: string;
}

export function AnalysisInspector({ analysis, notice }: AnalysisInspectorProps) {
  const summary = summarizeMeaningChecks(analysis.validationChecks);

  return (
    <aside aria-label="Animation analysis" className="inspector">
      <div className="inspector__header">
        <div>
          <span className="section-kicker">Analysis</span>
          <h2>What the motion means</h2>
        </div>
        <span className="source-badge" data-source={analysis.source}>
          <span aria-hidden="true" className="source-badge__dot" />
          {analysis.source === "gpt-5.6" ? "Live · GPT-5.6" : "Demo fallback"}
        </span>
      </div>

      {notice ? <p className="provider-notice" role="status">{notice}</p> : null}

      <dl className="signal-grid">
        <div>
          <dt>Technique</dt>
          <dd>{analysis.detectedTechnique}</dd>
        </div>
        <div>
          <dt>Semantic role</dt>
          <dd>{analysis.semanticRole}</dd>
        </div>
        <div>
          <dt>Motion risk</dt>
          <dd><span className="risk-pill" data-risk={analysis.motionRisk}>{analysis.motionRisk}</span></dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>{Math.round(analysis.confidence * 100)}%</dd>
        </div>
      </dl>

      <section className="inspector__section">
        <h3>Evidence & reasoning</h3>
        <p>{analysis.riskReason}</p>
      </section>
      <section className="inspector__section">
        <h3>Recommended transformation</h3>
        <p>{analysis.proposedAlternative}</p>
      </section>

      <section className="meaning-card" data-summary={summary}>
        <div className="meaning-card__title">
          <ShieldCheckIcon />
          <div>
            <span className="section-kicker">Validation evidence</span>
            <h3>{summary === "preserved" ? "Meaning Preserved" : "Needs Review"}</h3>
          </div>
        </div>
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
      </section>
    </aside>
  );
}
