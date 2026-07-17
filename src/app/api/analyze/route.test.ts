import { afterEach, describe, expect, it, vi } from "vitest";

import { MAX_SOURCE_LENGTH } from "../../../domain/analysis";
import { POST } from "./route";

function requestWith(body: string): Request {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/analyze", () => {
  it("returns 400 for malformed JSON", async () => {
    const response = await POST(requestWith("{"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid JSON body." });
  });

  it("returns 400 for input outside the request schema", async () => {
    const response = await POST(requestWith(JSON.stringify({})));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid analysis request." });
  });

  it("rejects oversized pasted source before analysis", async () => {
    const response = await POST(
      requestWith(JSON.stringify({ sourceCode: "x".repeat(MAX_SOURCE_LENGTH + 1) })),
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({ error: "Source code is too large." });
  });

  it("returns a known example as clearly labeled demo data without a key", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const response = await POST(
      requestWith(JSON.stringify({ exampleId: "progress-upload" })),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body.analysis.source).toBe("demo-fallback");
    expect(body.notice).toMatch(/Demo data/i);
  });
});
