# StatSetu — Learning Materials → MCQ Pipeline (Architecture)

**PS pillar:** SIH26101 requirement 3 — *"capable of generating Quizzes and Multiple choice
questions (MCQs) from uploaded learning materials."*

As-built: `src/lib/materials/mcq.ts` (engine) + `POST /api/materials/mcq` (route). Design
contract, same as the iGOT adapter: **LLM-first, deterministic-fallback, never silently
AI-dependent** — every result declares its `mode` ("llm" | "deterministic") and every question
carries verbatim provenance (`chunkIndex` + `quote`).

---

## 1. Pipeline at a glance

```
 upload (multipart, ≤20 MB)
   │  POST /api/materials/mcq
   ▼
┌─────────────── INGESTION ───────────────┐
│ detectMaterialKind(name, mime)          │  pdf | pptx | docx | txt  (else 415)
│   PDF   → extractPdfText (unpdf)        │
│   PPTX  → OOXML unzip → <a:t> runs      │  (fflate, in-memory, zero native deps)
│   DOCX  → OOXML unzip → <w:t> runs      │
│   TXT/MD→ utf-8 decode                  │
│ gate: ≥200 non-space chars (else 422:   │
│  "scanned images only?" hint)           │
└────────────────┬────────────────────────┘
                 ▼
┌─────────────── CHUNKING ────────────────┐
│ chunkText(text, 1200, 150)              │  sentence-aware windows (splits on
│  • sentence boundaries [.!?।] + ¶       │   Devanagari danda too), 150-char
│  • monster-sentence hard-split          │   overlap between consecutive chunks
│    (>1200 chars → fixed windows)        │
└────────────────┬────────────────────────┘
                 ▼
┌────────── GROUNDED GENERATION ───────────┐
│ per chunk, LLM-first:                    │
│  chatJson → 2 MCQs + strict rules:       │
│   • quote = verbatim chunk substring     │
│   • answerable ONLY from the excerpt     │
│   • distractors = real misconceptions    │
│  JSON-shape-validated (prompt, ≥3        │
│  options, correctIndex, quote)           │
│  LLM null/unavailable → deterministic:   │
│   cloze over content words (stoplist +   │
│   rarity pick), distractors from same    │
│   document → grounding BY CONSTRUCTION   │
└────────────────┬────────────────────────┘
                 ▼
┌───────── ANSWER-KEY VERIFICATION ────────┐
│ verifyGrounded(q, chunk):                │
│  • q.chunkIndex === chunk.index          │
│  • normalize(ws, case) ⊆ chunk text      │
│  fail → question DROPPED, never kept     │
│ cap at 10 questions, track groundedChunks│
└────────────────┬────────────────────────┘
                 ▼
   { documentTitle, kind, chunkCount, questions[],
     mode, groundedChunks[], note }        ← note explains the mode in plain language
```

---

## 2. Stage details

### 2.1 Ingestion — PDF/PPT/DOCX without native dependencies

| Kind | Extractor | Why this way |
|---|---|---|
| `pdf` | `extractPdfText` (unpdf, serverless-friendly pdf.js) | serverless deploys can't spawn `pdftotext`/poppler |
| `pptx` | unzip OOXML → `ppt/slides/slideN.xml` → `<a:t>` runs, sorted by slide number | same trick used on the SIH deck; no COM, no LibreOffice |
| `docx` | unzip OOXML → `word/document.xml` → `<w:t>` runs in document order | ditto |
| `txt`/`md` | utf-8 decode | trivially |

Both OOXML paths run fully in-memory (`fflate.unzipSync`), preserve reading order (numeric
slide sort), and join runs with whitespace normalization. Type detection is extension **or**
MIME (`detectMaterialKind`), so a mislabeled upload still routes correctly. Unsupported types
fail with 415 and a human-readable supported-list; empty/scanned PDFs fail with 422 and the
"scanned images only?" hint — never a hang, never a blank quiz.

Reuse note: `extractPdfText` is shared with the evidence engine's résumé parser — one PDF
path, one set of tests, no duplicated parsing code.

### 2.2 Chunking — sentence-aware windows with overlap

`chunkText(text, targetChars = 1200, overlapChars = 150)`:

- Normalizes whitespace, splits on sentence terminators **including the Devanagari danda (।)**
  and paragraph breaks — chunk boundaries respect the document's own structure.
- Accumulates sentences up to ~1200 chars; a single monster "sentence" (table dump, wrapped
  survey row) is hard-split into fixed windows so one bad row can't dominate a chunk.
- 150-char overlap between consecutive chunks means a fact straddling a boundary stays whole
  somewhere — the quote-verification step depends on this.
- Pure and deterministic: identical document → identical chunks → identical fallback quizzes.

### 2.3 Grounded generation — LLM-first, cloze fallback

**LLM path** (`generateGroundedLlm`): per chunk, the model is prompted as "a rigorous assessor
of official-statistics training material" with **strict grounding rules**: each question must
return a `quote` that is a verbatim substring of the excerpt, must be answerable *only* from
the excerpt (no outside knowledge), and distractors must encode real misconceptions. Output is
schema-validated (prompt non-empty, 3–5 options, `correctIndex` in range, quote non-empty);
invalid drafts are filtered before verification, not patched.

**Deterministic fallback** (`generateGroundedDeterministic`): when no LLM is configured or the
provider fails, the chunk is not dropped — cloze questions are generated from it: content words
(`≥4 chars`, stoplisted, rarity-picked from the middle of the candidate list) are masked in
statement sentences, distractors are drawn from *the same document* (so they're plausible),
and the answer is by construction present in the cited sentence. The demo therefore works with
zero API keys, and the answer key is correct without trusting any model.

**Why both:** MoSPI reviewers can (a) see mode-labelled output, (b) run the demo offline, and
(c) audit the fallback's correctness by reading 30 lines of pure code.

### 2.4 Answer-key verification — the honesty gate

`verifyGrounded(q, chunk)` — a question survives only if:

1. its `chunkIndex` equals the chunk it claims to come from, and
2. its `quote` (whitespace/case-normalized) is a substring of that chunk's normalized text.

Failures are **dropped, never silently kept**. This is the answer-key guarantee: whatever the
LLM claims, the shipped key cites text that demonstrably exists in the uploaded material. The
LLM picks *where* and *how* to ask; the document remains the source of truth.

Deterministic questions pass trivially (the quote *is* the sentence the cloze came from).

### 2.5 Capping & provenance coverage

Generation walks chunks in order, stops at `maxQuestions` (default 10, hard max 10 for the
free-tier route), and records `groundedChunks` — the UI can show "questions drawn from chunks
2, 3, 5 of 17", an honest coverage measure rather than a fake "full coverage" claim.

---

## 3. API contract

`POST /api/materials/mcq` — `multipart/form-data`: `file` (required),
`maxQuestions` (optional, default 10).

| Response | Meaning |
|---|---|
| `200 { documentTitle, kind, chunkCount, mode, groundedChunks, questionCount, questions[], note }` | `note` states provenance in plain language (LLM-grounded vs deterministic cloze) |
| `400` | not multipart / missing `file` |
| `413` | > 20 MB |
| `415` | unsupported type (with supported list) |
| `422` | extraction produced too little text (scanned PDF hint) |
| `500` | generation failed with the engine's error message |

Question shape (shipped to UI): `{ prompt, options[3–5], correctIndex, explanation,
chunkIndex, quote }` — `chunkIndex + quote` render as the "show source" affordance.

---

## 4. Failure modes & honesty rules

| Failure | Behaviour |
|---|---|
| Unsupported file | 415 + supported list — no guessing |
| Scanned/image-only PDF | 422 with actionable hint — no empty quiz |
| LLM down / no key | deterministic cloze path; `mode: "deterministic"` declared in response |
| LLM returns malformed JSON | drafts filtered; chunk falls back to deterministic |
| Hallucinated/paraphrased quote | question dropped by `verifyGrounded` — count it in what's *not* returned |
| Document with no valid questions | explicit 500 error, never an empty success |

Every response is `mode`-labelled; the note text ships in the payload so even a cURL demo is
honest. No silent AI dependence anywhere in the pipeline.

---

## 5. Wiring into the rest of StatSetu

- **Calibration loop** (`src/lib/calibration/quiz.ts`): material-generated MCQs can serve as
  per-skill calibration quizzes — a *pass* upgrades `claimed → verified`, a *fail* drops the
  evidenced level and flags remediation. Same `QuizQuestionDraft` shape family, same engine.
- **Evidence tiers:** document-grounded assessments are stronger evidence than self-claims but
  weaker than proctored/proven work — consistent with the `proven > verified > claimed >
  inferred` ladder.
- **Path planner:** a failed material quiz on skill *S* injects *S*'s prerequisite chain back
  into the recommended path (Kahn-ordered), closing gap → train → assess → re-plan.
- **Roadmap:** store attempts per (learner, material, chunk) for spaced repetition; hierarchy
  grounding from iGOT course syllabi (see `IGOT_INTEGRATION.md` §9); difficulty scoring from
  distractor plausibility; multilingual delivery via Bhashini (the danda-aware chunker is
  already Hindi-friendly).
