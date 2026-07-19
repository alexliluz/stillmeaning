"use client";

import { useEffect, useRef, useState } from "react";

import type { Analysis } from "../../domain/analysis";
import {
  getMotionExample,
  motionExamples,
  type ExampleId,
} from "../../domain/examples";
import { BrandMark, SparklesIcon } from "../icons";
import { CodeDiff } from "../code/code-diff";
import { SourceInput } from "../code/source-input";
import {
  PreviewStage,
  type MotionMode,
} from "../previews/preview-stage";
import { AnalysisInspector } from "./analysis-inspector";
import { ExampleList } from "./example-list";
import {
  MeaningComparisonControl,
  type ComparisonTarget,
} from "./meaning-comparison-control";

interface WorkbenchProps {
  initialAnalysis: Analysis;
}

export function Workbench({ initialAnalysis }: WorkbenchProps) {
  const initialId = motionExamples.some(
    (example) => example.id === initialAnalysis.animationId,
  )
    ? (initialAnalysis.animationId as ExampleId)
    : motionExamples[0].id;
  const [selectedId, setSelectedId] = useState<ExampleId>(initialId);
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [notice, setNotice] = useState<string | undefined>(
    initialAnalysis.source === "demo-fallback"
      ? "Deterministic fixture — not a live GPT-5.6 response."
      : undefined,
  );
  const [pending, setPending] = useState(false);
  const [motionMode, setMotionMode] = useState<MotionMode>("normal");
  const [comparisonTarget, setComparisonTarget] =
    useState<ComparisonTarget>("stillmeaning");
  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceError, setSourceError] = useState<string | undefined>();
  const [customSource, setCustomSource] = useState<string | undefined>();
  const shellRef = useRef<HTMLDivElement>(null);
  const selected = getMotionExample(selectedId) ?? motionExamples[0];

  useEffect(() => {
    shellRef.current?.setAttribute("data-ready", "true");
  }, []);

  function selectExample(id: ExampleId) {
    const example = getMotionExample(id);
    if (!example) return;
    setSelectedId(id);
    setAnalysis(example.fallbackAnalysis);
    setNotice("Deterministic fixture — not a live GPT-5.6 response.");
    setCustomSource(undefined);
    setSourceError(undefined);
    setComparisonTarget("stillmeaning");
  }

  async function analyzeSelected() {
    setPending(true);
    setNotice("Analyzing with GPT-5.6…");
    setCustomSource(undefined);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ exampleId: selectedId }),
      });
      const result = (await response.json()) as {
        analysis?: Analysis;
        notice?: string;
        error?: string;
      };
      if (!response.ok || !result.analysis) {
        throw new Error(result.error ?? "Analysis could not be completed.");
      }
      setAnalysis(result.analysis);
      setNotice(result.notice);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Analysis could not be completed. The last valid result is still shown.",
      );
    } finally {
      setPending(false);
    }
  }

  async function analyzeCustomSource(source: string) {
    setPending(true);
    setSourceError(undefined);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sourceCode: source }),
      });
      const result = (await response.json()) as {
        analysis?: Analysis;
        notice?: string;
        error?: string;
      };
      if (!response.ok || !result.analysis) {
        throw new Error(result.error ?? "Custom analysis could not be completed.");
      }
      setAnalysis(result.analysis);
      setNotice(result.notice);
      setCustomSource(source);
      setComparisonTarget("stillmeaning");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Custom analysis could not be completed.";
      setSourceError(`${message} The last valid result is still shown.`);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="app-shell" data-ready="false" data-testid="workbench" ref={shellRef}>
      <header className="app-header">
        <a className="brand" href="#workspace" aria-label="StillMeaning home">
          <BrandMark />
          <span>StillMeaning</span>
          <span className="brand__tag">motion accessibility workbench</span>
        </a>
        <div className="app-header__actions">
          <span className="principle">Reduce motion, not meaning.</span>
          <button
            className="analyze-button"
            disabled={pending}
            onClick={analyzeSelected}
            type="button"
          >
            <SparklesIcon />
            {pending ? "Analyzing…" : "Analyze with GPT-5.6"}
          </button>
        </div>
      </header>

      <main className="workspace" id="workspace">
        <ExampleList
          examples={motionExamples}
          onSelect={selectExample}
          selectedId={selectedId}
        />
        <section className="comparison-shell" aria-labelledby="comparison-title">
          <div className="comparison-shell__header">
            <div>
              <span className="section-kicker">
                {customSource ? "Custom source · safe text analysis" : selected.category}
              </span>
              <h1 id="comparison-title">
                {customSource ? "Pasted animation" : selected.title}
              </h1>
              <p>
                {customSource
                  ? "Generated code is available in the diff below and is never executed in this preview."
                  : selected.description}
              </p>
            </div>
            <div className="comparison-shell__tools">
              <span className="comparison-shell__id">
                {customSource ? analysis.animationId : selected.id}
              </span>
              <div aria-label="Preview motion mode" className="mode-switch" role="group">
                <button
                  aria-pressed={motionMode === "normal"}
                  onClick={() => setMotionMode("normal")}
                  type="button"
                >
                  Normal motion
                </button>
                <button
                  aria-pressed={motionMode === "reduced"}
                  onClick={() => setMotionMode("reduced")}
                  type="button"
                >
                  Reduced motion
                </button>
              </div>
              <button
                aria-expanded={sourceOpen}
                className="source-toggle"
                onClick={() => setSourceOpen((open) => !open)}
                type="button"
              >
                {sourceOpen ? "Close source input" : "Paste your code"}
              </button>
            </div>
          </div>
          {sourceOpen ? (
            <SourceInput
              error={sourceError}
              onAnalyze={analyzeCustomSource}
              pending={pending}
            />
          ) : null}
          {!customSource ? (
            <MeaningComparisonControl
              onTargetChange={setComparisonTarget}
              target={comparisonTarget}
            />
          ) : null}
          {customSource ? (
            <div className="safe-preview-message">
              <strong>Preview intentionally disabled for generated code</strong>
              <p>
                StillMeaning renders model output as reviewable text only. Use the curated examples for the live before/after demonstration.
              </p>
            </div>
          ) : (
            <div className="comparison-grid">
              <PreviewStage
                exampleId={selectedId}
                key={`${selectedId}-original`}
                motionMode={motionMode}
                version="original"
              />
              <div className="comparison-grid__divider" aria-hidden="true">→</div>
              <PreviewStage
                exampleId={selectedId}
                key={`${selectedId}-${comparisonTarget}`}
                motionMode={motionMode}
                version={comparisonTarget}
              />
            </div>
          )}
          <CodeDiff
            original={customSource ?? selected.originalCode}
            revised={analysis.generatedCode}
            title="StillMeaning generated code"
          />
        </section>
        <AnalysisInspector
          analysis={analysis}
          comparisonTarget={customSource ? "stillmeaning" : comparisonTarget}
          notice={notice}
        />
      </main>
    </div>
  );
}
