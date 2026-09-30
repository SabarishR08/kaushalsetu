import { describe, it, expect } from "vitest";
import { chunkText, generateGroundedDeterministic, verifyGrounded, generateMcqsFromMaterial, detectMaterialKind } from "./mcq";

const SAMPLE = `Survey design begins with the objectives. A sampling frame is the list from which units are selected.
Stratification improves precision when strata differ. The design weight is the inverse of the inclusion probability.
Non-response adjustment corrects for units that cannot be contacted. Imputation fills missing values with plausible ones.
Quality assurance reviews every stage of the survey lifecycle. Documentation accompanies every release.
`.repeat(6);

describe("mcq pipeline — material kind detection", () => {
  it("detects pdf, pptx, docx and txt", () => {
    expect(detectMaterialKind("manual.pdf")).toBe("pdf");
    expect(detectMaterialKind("slides.pptx")).toBe("pptx");
    expect(detectMaterialKind("sop.docx")).toBe("docx");
    expect(detectMaterialKind("notes.txt")).toBe("txt");
    expect(detectMaterialKind("scan.exe")).toBeNull();
  });
});

describe("mcq pipeline — chunking", () => {
  it("produces deterministic, non-empty chunks with sentence boundaries", () => {
    const a = chunkText(SAMPLE);
    const b = chunkText(SAMPLE);
    expect(a.length).toBeGreaterThan(1);
    expect(a.map((c) => c.text)).toEqual(b.map((c) => c.text));
    for (const c of a) expect(c.text.length).toBeLessThanOrEqual(1400);
  });

  it("hard-splits monster sentences instead of dropping them", () => {
    const monster = "x".repeat(3000) + ". short tail.";
    const chunks = chunkText(monster, 1200, 150);
    expect(chunks.length).toBeGreaterThanOrEqual(3);
    expect(chunks.at(-1)?.text).toContain("short tail");
  });

  it("returns empty for whitespace-only text", () => {
    expect(chunkText("   \n  ")).toHaveLength(0);
  });
});

describe("mcq pipeline — deterministic grounded generation", () => {
  it("generates cloze questions whose answers appear verbatim in the chunk", () => {
    const chunk = chunkText(SAMPLE)[0];
    const qs = generateGroundedDeterministic(chunk, 2);
    expect(qs.length).toBeGreaterThan(0);
    for (const q of qs) {
      expect(q.options).toHaveLength(4);
      expect(q.options[q.correctIndex]).toBeTruthy();
      expect(verifyGrounded(q, chunk)).toBe(true);
    }
  });
});

describe("mcq pipeline — grounding verification", () => {
  it("rejects questions whose quote is not in the chunk", () => {
    const chunk = chunkText(SAMPLE)[0];
    const fake = { prompt: "p", options: ["a", "b", "c", "d"], correctIndex: 0, explanation: "e", chunkIndex: chunk.index, quote: "this sentence is nowhere in the document" };
    expect(verifyGrounded(fake, chunk)).toBe(false);
  });

  it("rejects questions pointed at the wrong chunk", () => {
    const chunks = chunkText(SAMPLE);
    const chunk = chunkText(SAMPLE)[0];
    const q = generateGroundedDeterministic(chunk, 1)[0];
    const other = chunks[1];
    expect(verifyGrounded(q, other)).toBe(false);
  });
});

describe("mcq pipeline — end-to-end from a text buffer", () => {
  it("extracts, chunks, generates and verifies without any LLM", async () => {
    const buffer = new TextEncoder().encode(SAMPLE).buffer as ArrayBuffer;
    const result = await generateMcqsFromMaterial(buffer, "field-manual.txt", "text/plain", { maxQuestions: 6 });
    expect(result.mode).toBe("deterministic");
    expect(result.questions.length).toBeGreaterThan(0);
    expect(result.questions.length).toBeLessThanOrEqual(6);
    expect(result.chunkCount).toBeGreaterThan(0);
    expect(result.groundedChunks.length).toBeGreaterThan(0);
    for (const q of result.questions) {
      expect(q.quote.length).toBeGreaterThan(10);
      expect(q.chunkIndex).toBeGreaterThanOrEqual(0);
      expect(q.options[q.correctIndex]).toBeTruthy();
    }
  });

  it("throws a helpful error on an empty document", async () => {
    const buffer = new TextEncoder().encode("").buffer as ArrayBuffer;
    await expect(generateMcqsFromMaterial(buffer, "empty.txt", "text/plain")).rejects.toThrow(/enough text|readable/);
  });
});
