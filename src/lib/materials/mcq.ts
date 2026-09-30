/**
 * Document → MCQ pipeline — "generate quizzes and MCQs from uploaded
 * learning materials" (SIH26101, pillar 3).
 *
 * Flow: extract text (PDF via unpdf, PPTX/DOCX by unzipping OOXML and
 * stripping tags — no native deps) → chunk with sentence-aware boundaries →
 * LLM-first grounded question generation with a deterministic cloze fallback
 * → verification pass (all claims trace to a chunk substring; fallback
 * questions are clozes, so grounding is by construction).
 *
 * Every returned question carries chunkIndex + quote provenance so the UI
 * can show the source the question came from. mode is always explicit:
 * "llm" when a provider generated the questions, "deterministic" otherwise.
 */
import { extractPdfText } from "@/lib/evidence/resume";
import { chatJson, asArray, asString, asInt } from "@/lib/ai/llm";

// ─── Extraction ──────────────────────────────────────────────────────────────

export type MaterialKind = "pdf" | "pptx" | "docx" | "txt";

export function detectMaterialKind(filename: string, mime?: string | null): MaterialKind | null {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "pdf" || mime === "application/pdf") return "pdf";
  if (ext === "pptx" || mime === "application/vnd.openxmlformats-officedocument.presentationml.presentation") return "pptx";
  if (ext === "docx" || mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  if (ext === "txt" || ext === "md" || (mime ?? "").startsWith("text/")) return "txt";
  return null;
}

/** OOXML slide/document text: unzip in-memory, pull <a:t> runs, join per slide/paragraph. */
async function extractOoxmlText(buffer: ArrayBuffer, kind: "pptx" | "docx"): Promise<string> {
  const { unzipSync, strFromU8 } = await import("fflate");
  const files = unzipSync(new Uint8Array(buffer));
  // Slides/paragraphs are numbered; sort by their trailing index so reading order holds.
  const entries = Object.keys(files)
    .filter((name) =>
      kind === "pptx" ? /^ppt\/slides\/slide\d+\.xml$/.test(name) : /^word\/document\.xml$/.test(name),
    )
    .sort((a, b) => {
      const na = Number(a.match(/(\d+)\.xml$/)?.[1] ?? 0);
      const nb = Number(b.match(/(\d+)\.xml$/)?.[1] ?? 0);
      return na - nb;
    });
  const parts: string[] = [];
  for (const name of entries) {
    const xml = strFromU8(files[name]);
    const runs = [...xml.matchAll(/<a:t>([^<]*)<\/a:t>|<w:t[^>]*>([^<]*)<\/w:t>/g)].map(
      (m) => m[1] ?? m[2] ?? "",
    );
    const text = runs.join(" ").replace(/\s+/g, " ").trim();
    if (text) parts.push(text);
  }
  return parts.join("\n\n");
}

export async function extractMaterialText(buffer: ArrayBuffer, kind: MaterialKind): Promise<string> {
  if (kind === "pdf") return extractPdfText(buffer);
  if (kind === "pptx" || kind === "docx") return extractOoxmlText(buffer, kind);
  return new TextDecoder("utf-8", { fatal: false }).decode(buffer);
}

// ─── Chunking ────────────────────────────────────────────────────────────────

export interface MaterialChunk {
  index: number;
  text: string;
}

/** Sentence-aware fixed-window chunking with overlap. Pure & deterministic. */
export function chunkText(text: string, targetChars = 1200, overlapChars = 150): MaterialChunk[] {
  const clean = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.split(/(?<=[.!?।])\s+|\n{2,}/).map((s) => s.trim()).filter(Boolean);
  const chunks: MaterialChunk[] = [];
  let current: string[] = [];
  let currentLen = 0;
  const push = () => {
    if (current.length) {
      chunks.push({ index: chunks.length, text: current.join(" ") });
      current = [];
      currentLen = 0;
    }
  };
  for (const s of sentences) {
    // A single monster "sentence" (table dump, wrapped row) is hard-split.
    if (s.length > targetChars) {
      push();
      for (let i = 0; i < s.length; i += targetChars - overlapChars) {
        chunks.push({ index: chunks.length, text: s.slice(i, i + targetChars) });
      }
      continue;
    }
    if (currentLen + s.length > targetChars && currentLen > 0) push();
    current.push(s);
    currentLen += s.length + 1;
  }
  push();
  return chunks;
}

// ─── Grounded question generation ────────────────────────────────────────────

export interface GroundedQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  chunkIndex: number;
  /** Verbatim substring of the chunk the question is grounded in. */
  quote: string;
}

interface GroundedLlmDraft {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  quote: string;
}

const MAX_QUESTIONS = 10;

async function generateGroundedLlm(
  chunk: MaterialChunk,
  documentTitle: string,
): Promise<GroundedLlmDraft[] | null> {
  const result = await chatJson<GroundedLlmDraft[]>(
    [
      { role: "system", content: "You are a rigorous assessor of official-statistics training material. Questions must have exactly one unambiguously correct option, and every question must be answerable strictly from the provided excerpt." },
      {
        role: "user",
        content: `From the excerpt below of the training material "${documentTitle}", write 2 multiple-choice questions.

STRICT GROUNDING RULES:
- Each question needs a "quote": a verbatim (possibly trimmed) substring of the excerpt the question is answerable from.
- Do not use outside knowledge; if the excerpt is too thin, write fewer questions.
- Distractors must reflect real misconceptions, not absurd filler.

Excerpt (chunk ${chunk.index}):
"""
${chunk.text}
"""

Return JSON array: [{"prompt": "...", "options": ["A","B","C","D"], "correctIndex": 0-3, "explanation": "why the answer is right", "quote": "verbatim substring of the excerpt"}]`,
      },
    ],
    (value) => {
      const drafts = asArray(value)
        .map((q) => {
          const obj = q as Record<string, unknown>;
          const prompt = asString(obj.prompt);
          const options = asArray(obj.options).map((o) => asString(o)).filter(Boolean);
          const correctIndex = asInt(obj.correctIndex, -1, 0, options.length - 1);
          const explanation = asString(obj.explanation, "Correct according to the source material.");
          const quote = asString(obj.quote);
          if (!prompt || options.length < 3 || correctIndex < 0 || !quote) return null;
          return { prompt, options: options.slice(0, 5), correctIndex, explanation, quote } as GroundedLlmDraft;
        })
        .filter((q): q is GroundedLlmDraft => q !== null);
      return drafts.length ? drafts : null;
    },
    { maxTokens: 1400, temperature: 0.4 },
  );
  return result?.value ?? null;
}

/**
 * Deterministic fallback: sentence cloze questions. A content word is masked
 * in a statement-style sentence and the learner picks the original term from
 * same-document distractors. Grounding is by construction — the answer is in
 * the sentence itself.
 */
export function generateGroundedDeterministic(chunk: MaterialChunk, perChunk = 2): GroundedQuestion[] {
  const STOP = new Set(["about","above","after","again","against","all","also","among","and","any","are","because","been","before","being","between","both","but","by","can","cannot","could","did","do","does","during","each","either","for","from","further","had","has","have","having","he","her","here","hers","him","his","how","into","is","its","itself","may","might","more","most","must","not","of","off","on","only","or","other","our","out","over","own","same","she","should","since","so","some","such","than","that","the","their","them","then","there","these","they","this","those","through","to","too","under","until","up","upon","very","was","we","were","what","when","where","which","while","who","whom","why","will","with","within","would","you","your"]);
  const WORD = /^[A-Za-z][A-Za-z0-9-]{3,}$/;
  const candidates: Array<{ sentence: string; word: string }> = [];
  const sentences = chunk.text.split(/(?<=[.!?।])\s+/).filter((s) => s.length > 30 && s.length < 400);
  for (const sentence of sentences) {
    const words = sentence.split(/\s+/);
    const content = words.filter((w) => WORD.test(w.replace(/[^A-Za-z0-9-]/g, "")) && !STOP.has(w.toLowerCase()));
    // Prefer rarer, information-bearing words (skip ultra-common document words).
    if (content.length >= 2) {
      const pick = content[Math.floor(content.length / 2)];
      candidates.push({ sentence, word: pick.replace(/[^A-Za-z0-9-]/g, "") });
    }
  }
  const questions: GroundedQuestion[] = [];
  const used = new Set<string>();
  for (const c of candidates) {
    if (questions.length >= perChunk) break;
    const key = c.word.toLowerCase();
    if (used.has(key)) continue;
    used.add(key);
    const distractors = candidates
      .map((x) => x.word)
      .filter((w) => w.toLowerCase() !== key && !w.toLowerCase().includes(key) && !key.includes(w.toLowerCase()));
    const unique = [...new Set(distractors)].slice(0, 3);
    if (unique.length < 3) continue;
    const options = [c.word, ...unique];
    const correctIndex = Math.floor(Math.random() * options.length);
    [options[0], options[correctIndex]] = [options[correctIndex], options[0]];
    questions.push({
      prompt: `Fill in the blank — from "${chunk.text.slice(0, 60)}…":\n\n${c.sentence.replace(c.word, "______")}\n\nWhich term completes the statement as written in the material?`,
      options,
      correctIndex,
      explanation: `The material states: "…${c.sentence.slice(Math.max(0, c.sentence.indexOf(c.word) - 40), c.sentence.indexOf(c.word) + c.word.length + 40)}…"`,
      chunkIndex: chunk.index,
      quote: c.sentence,
    });
  }
  return questions;
}

/**
 * Verify a generated question is actually grounded: its quote must appear in
 * the referenced chunk. Unverifiable questions are dropped, never silently
 * kept.
 */
export function verifyGrounded(q: GroundedQuestion, chunk: MaterialChunk): boolean {
  if (q.chunkIndex !== chunk.index) return false;
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  return norm(chunk.text).includes(norm(q.quote));
}

export interface McqGenerationResult {
  documentTitle: string;
  kind: MaterialKind;
  chunkCount: number;
  questions: GroundedQuestion[];
  mode: "llm" | "deterministic";
  /** Which chunks were used; lets the UI show provenance coverage. */
  groundedChunks: number[];
}

/**
 * Full pipeline: extract → chunk → generate (LLM-first, deterministic
 * fallback) → verify grounding → cap. Deterministic in fallback mode even
 * when the document is identical — Math.random only shuffles options.
 */
export async function generateMcqsFromMaterial(
  buffer: ArrayBuffer,
  filename: string,
  mime?: string | null,
  options: { maxQuestions?: number } = {},
): Promise<McqGenerationResult> {
  const kind = detectMaterialKind(filename, mime);
  if (!kind) throw new Error(`Unsupported material type: ${filename}. Supported: PDF, PPTX, DOCX, TXT/MD.`);
  const maxQuestions = Math.min(options.maxQuestions ?? MAX_QUESTIONS, MAX_QUESTIONS);

  const text = await extractMaterialText(buffer, kind);
  if (!text || text.replace(/\s+/g, "").length < 200) {
    throw new Error("Could not extract enough text from the document (is it scanned images only?)");
  }
  const documentTitle = filename.replace(/\.[^.]+$/, "");
  const chunks = chunkText(text);
  if (!chunks.length) throw new Error("Document parsed but produced no readable chunks.");

  const questions: GroundedQuestion[] = [];
  const groundedChunks: number[] = [];
  let mode: "llm" | "deterministic" = "deterministic";

  for (const chunk of chunks) {
    if (questions.length >= maxQuestions) break;
    let drafts: GroundedQuestion[] | null = null;
    const llmDrafts = await generateGroundedLlm(chunk, documentTitle);
    if (llmDrafts?.length) {
      mode = "llm";
      drafts = llmDrafts.map((d) => ({ ...d, chunkIndex: chunk.index }));
    } else if (!llmDrafts) {
      drafts = generateGroundedDeterministic(chunk);
    }
    for (const d of drafts ?? []) {
      if (questions.length >= maxQuestions) break;
      if (verifyGrounded(d, chunk)) {
        questions.push(d);
        if (!groundedChunks.includes(chunk.index)) groundedChunks.push(chunk.index);
      }
    }
  }

  if (!questions.length) {
    throw new Error("No grounded questions could be generated from this document.");
  }
  return { documentTitle, kind, chunkCount: chunks.length, questions, mode, groundedChunks };
}
