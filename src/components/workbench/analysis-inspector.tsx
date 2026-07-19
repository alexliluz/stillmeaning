import type { Analysis } from "../../domain/analysis";
import type { ComparisonTarget } from "./meaning-comparison-control";
import { SemanticTrace } from "./semantic-trace";

interface AnalysisInspectorProps {
  analysis: Analysis;
  comparisonTarget: ComparisonTarget;
  notice?: string;
}

export function AnalysisInspector({
  analysis,
  comparisonTarget,
  notice,
}: AnalysisInspectorProps) {
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

      <SemanticTrace analysis={analysis} target={comparisonTarget} />
    </aside>
  );
}
