"use client";

import { diffLines } from "diff";
import { useMemo, useState } from "react";

interface CodeDiffProps {
  original: string;
  revised: string;
}

export function CodeDiff({ original, revised }: CodeDiffProps) {
  const [copyStatus, setCopyStatus] = useState("");
  const changes = useMemo(() => diffLines(original, revised), [original, revised]);

  async function copyGeneratedCode() {
    setCopyStatus("Copying generated code…");
    try {
      const write = navigator.clipboard?.writeText(revised);
      if (!write) throw new Error("Clipboard unavailable");
      await Promise.race([
        write,
        new Promise<never>((_resolve, reject) => {
          setTimeout(() => reject(new Error("Clipboard timed out")), 1_500);
        }),
      ]);
      setCopyStatus("Generated code copied.");
    } catch {
      setCopyStatus("Copy failed. Select the generated code manually.");
    }
  }

  return (
    <section className="code-diff" aria-labelledby="code-diff-title">
      <header className="code-diff__header">
        <div>
          <span className="section-kicker">Inspectable transformation</span>
          <h2 id="code-diff-title">Generated code diff</h2>
        </div>
        <div className="code-diff__actions">
          <span className="diff-legend"><i data-change="removed" /> Removed</span>
          <span className="diff-legend"><i data-change="added" /> Added</span>
          <button onClick={copyGeneratedCode} type="button">
            Copy generated code
          </button>
        </div>
      </header>
      <pre aria-label="Code changes" className="code-diff__content" tabIndex={0}>
        <code>
          {changes.map((change, index) => (
            <span
              data-change={change.added ? "added" : change.removed ? "removed" : "context"}
              key={`${index}-${change.value.slice(0, 20)}`}
            >
              {change.added ? "+" : change.removed ? "-" : " "}
              {change.value}
            </span>
          ))}
        </code>
      </pre>
      <p className="sr-status" role="status" aria-live="polite">{copyStatus}</p>
    </section>
  );
}
