"use client";

import { useState, type FormEvent } from "react";

import { MAX_SOURCE_LENGTH } from "../../domain/analysis";

interface SourceInputProps {
  onAnalyze: (source: string) => Promise<void> | void;
  pending: boolean;
  error?: string;
}

export function SourceInput({ onAnalyze, pending, error }: SourceInputProps) {
  const [source, setSource] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = source.trim();
    if (!normalized || pending) return;
    await onAnalyze(normalized);
  }

  return (
    <form className="source-input" onSubmit={submit}>
      <div className="source-input__heading">
        <div>
          <label htmlFor="animation-source">Animation source code</label>
          <p>HTML, CSS, JavaScript, or React. Treated as untrusted text.</p>
        </div>
        <output htmlFor="animation-source">
          {source.length} / {MAX_SOURCE_LENGTH}
        </output>
      </div>
      <textarea
        aria-describedby="source-safety-note"
        disabled={pending}
        id="animation-source"
        maxLength={MAX_SOURCE_LENGTH}
        onChange={(event) => setSource(event.target.value.slice(0, MAX_SOURCE_LENGTH))}
        placeholder="Paste an animation component or CSS transition…"
        rows={8}
        spellCheck={false}
        value={source}
      />
      <div className="source-input__footer">
        <p id="source-safety-note">
          Source is analyzed server-side. StillMeaning never executes pasted or generated code.
        </p>
        <button disabled={!source.trim() || pending} type="submit">
          {pending ? "Analyzing…" : "Analyze pasted code"}
        </button>
      </div>
      {pending ? <p className="source-input__status" role="status">Analyzing pasted code with GPT-5.6…</p> : null}
      {error ? <p className="source-input__error" role="alert">{error}</p> : null}
    </form>
  );
}
