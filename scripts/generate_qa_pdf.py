#!/usr/bin/env python3
"""Generate PathFinder AI — Algorithms & Architecture Q&A PDF."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable,
)
from reportlab.lib import colors

OUTPUT = "PathFinder_AI_Algorithms_QA.pdf"

# ── Colours ──────────────────────────────────────────────────────────────────
ACCENT   = HexColor("#2563EB")
ACCENT2  = HexColor("#7C3AED")
BG_LIGHT = HexColor("#F0F7FF")
GREY     = HexColor("#6B7280")
BLACK    = HexColor("#111827")

def build():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=letter,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        title="PathFinder AI — Algorithms & Architecture Q&A",
        author="PathFinder AI Team",
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "CoverTitle", parent=styles["Title"],
        fontSize=26, leading=32, textColor=ACCENT,
        spaceAfter=6,
    )
    subtitle_style = ParagraphStyle(
        "CoverSub", parent=styles["Normal"],
        fontSize=13, leading=17, textColor=GREY,
        spaceAfter=24,
    )
    section_style = ParagraphStyle(
        "Section", parent=styles["Heading1"],
        fontSize=16, leading=20, textColor=ACCENT2,
        spaceBefore=18, spaceAfter=8,
        borderWidth=0,
    )
    q_style = ParagraphStyle(
        "Question", parent=styles["Heading2"],
        fontSize=12, leading=15, textColor=ACCENT,
        spaceBefore=10, spaceAfter=4,
    )
    a_style = ParagraphStyle(
        "Answer", parent=styles["Normal"],
        fontSize=10, leading=14, textColor=BLACK,
        spaceAfter=6,
    )
    bold_style = ParagraphStyle(
        "BoldAnswer", parent=a_style,
        fontName="Helvetica-Bold",
    )
    table_header = ParagraphStyle(
        "TH", parent=styles["Normal"],
        fontSize=9, leading=12, textColor=colors.white,
        fontName="Helvetica-Bold",
    )
    table_cell = ParagraphStyle(
        "TC", parent=styles["Normal"],
        fontSize=9, leading=12, textColor=BLACK,
    )
    gloss_style = ParagraphStyle(
        "Glossary", parent=a_style,
        fontSize=9.5, leading=13,
    )

    story = []

    # ── Cover page ───────────────────────────────────────────────────────
    story.append(Spacer(1, 1.5 * inch))
    story.append(Paragraph("PathFinder AI", title_style))
    story.append(Paragraph(
        "Algorithms &amp; Architecture — Questions &amp; Answers",
        subtitle_style,
    ))
    story.append(HRFlowable(width="100%", thickness=2, color=ACCENT))
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph(
        "An evidence-based adaptive learning path engine: multi-round AI onboarding, "
        "real skill verification from GitHub / LeetCode / Codeforces, deterministic "
        "graph-based roadmaps, project verification, and replanning.",
        a_style,
    ))
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("Version 2.0 · September 2026", subtitle_style))
    story.append(PageBreak())

    # ── Helper to add Q&A pairs ──────────────────────────────────────────
    def qa(q, a):
        story.append(Paragraph(q, q_style))
        story.append(Paragraph(a, a_style))

    def section(title):
        story.append(HRFlowable(width="100%", thickness=1, color=ACCENT2, spaceAfter=4))
        story.append(Paragraph(title, section_style))

    def table(headers, rows):
        h = [[Paragraph(h, table_header) for h in headers]]
        data = h + [[Paragraph(c, table_cell) for c in r] for r in rows]
        col_widths = [doc.width / len(headers)] * len(headers)
        t = Table(data, colWidths=col_widths, repeatRows=1)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), ACCENT),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("LEADING", (0, 0), (-1, -1), 12),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.Color(0.85, 0.85, 0.85)),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(t)
        story.append(Spacer(1, 0.15 * inch))

    # =====================================================================
    # PART 1 — ALGORITHMS Q&A
    # =====================================================================
    section("Part 1 — Algorithms")

    qa("Q1: What are all the algorithms used in PathFinder AI?",
       "PathFinder AI uses the following core algorithms and techniques:<br/>"
       "1. <b>DFS Post-Order Topological Sort</b> — skill prerequisite ordering<br/>"
       "2. <b>Kahn's Algorithm + Min-Heap (SPT Rule)</b> — optimal skill scheduling<br/>"
       "3. <b>Binary Min-Heap</b> — priority queue for SPT scheduling<br/>"
       "4. <b>Kahn-Style BFS for DAG Depth Computation</b> — longest path in DAG<br/>"
       "5. <b>BFS/DFS Ancestor Closure</b> — transitive prerequisite computation<br/>"
       "6. <b>TF-IDF / Cosine Similarity (Dot Product)</b> — course-skill matching<br/>"
       "7. <b>Bi-Encoder Fine-Tuning (MultipleNegativesRanking Loss)</b> — retriever training<br/>"
       "8. <b>Logistic Regression (Multi-Label)</b> — skill tagger<br/>"
       "9. <b>Noisy-OR Confidence Combination</b> — evidence fusion<br/>"
       "10. <b>Weighted Mean Level Combination</b> — skill level merging<br/>"
       "11. <b>Fisher-Yates Shuffle</b> — quiz option randomization<br/>"
       "12. <b>Sigmoid Activation</b> — tagger probability scoring<br/>"
       "13. <b>SSE Streaming</b> — real-time LLM communication<br/>"
       "14. <b>JSON Repair / Bracket Balancing</b> — LLM output hardening<br/>"
       "15. <b>Vygotsky's ZPD Calibration</b> — project difficulty sizing<br/>"
       "16. <b>Noisy-OR Confidence Combination</b> — independent evidence compounding<br/>"
       "17. <b>Kahn-Style BFS for Prerequisite Closure</b> — depth partitioning<br/>"
       "18. <b>Epoch / Streak Calculation</b> — coach metrics computation<br/>"
       "19. <b>Deduplication / Equivalence Transfer</b> — cross-domain skill mapping<br/>"
       "20. <b>Semantic Embedding Search</b> — meaning-based skill lookup<br/>"
    )

    qa("Q2: What is the DFS Post-Order Topological Sort and where is it used?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/engine/topo.ts</font> — function <i>generatePathStandard</i><br/>"
       "<b>Why:</b> To produce a stable, deterministic ordering of skills where prerequisites "
       "always appear before their dependents. Used in the <b>balanced</b> and <b>exploratory</b> "
       "learning path scenarios.<br/>"
       "<b>How it works:</b> Visits each skill in post-order DFS (children before parent), "
       "so a skill is only emitted after all its unknown prerequisites are emitted. "
       "Time complexity: O(V + E).<br/>"
       "<b>Metric:</b> Produces a stable, explainable ordering that the UI can annotate "
       "with 'why this skill comes next' explanations."
    )

    qa("Q3: What is Kahn's Algorithm + Min-Heap (SPT Rule) and where is it used?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/engine/topo.ts</font> — function <i>generatePathOptimal</i><br/>"
       "<b>Why:</b> When multiple skills become simultaneously available (all prerequisites "
       "satisfied), the Shortest-Processing-Time rule schedules the shortest one first. "
       "This <b>provably minimises average completion time</b> (Smith's rule from operations "
       "research), front-loading quick wins so the learner banks visible progress early.<br/>"
       "<b>How it works:</b> Kahn's BFS to find ready skills, a binary min-heap to pick "
       "the lowest-weight skill next. Weights are per-skill course durations in months.<br/>"
       "<b>Used in:</b> The <b>intensive</b> scenario (tight deadlines)."
    )

    qa("Q4: What is the Binary Min-Heap and why is it needed?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/engine/heap.ts</font> — class <i>MinHeap</i><br/>"
       "<b>Why:</b> Kahn's SPT algorithm needs to efficiently extract the minimum-weight "
       "skill from a dynamic pool. A binary min-heap gives O(log n) push/pop, making "
       "the overall path generation O(V log V + E).<br/>"
       "<b>Design:</b> Minimal, allocation-light — parallel arrays for items and priorities "
       "rather than node objects, avoiding GC pressure."
    )

    qa("Q5: What is Kahn-Style BFS for DAG Depth Computation?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/engine/graph.ts</font> — function <i>computeDepths</i><br/>"
       "<b>Why:</b> Every skill needs a depth value for: (a) partitioning into milestone phases, "
       "(b) determining required mastery level (deeper = harder), (c) scheduling. "
       "Uses BFS (Kahn's) to compute longest prerequisite chain length below each skill.<br/>"
       "<b>Metric:</b> O(V + E) — processes the full 211-skill DAG in microseconds."
    )

    qa("Q6: What is Ancestor Closure / Descendant Computation?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/engine/graph.ts</font> — functions <i>ancestorClosure</i> and <i>descendants</i><br/>"
       "<b>Why:</b> <i>ancestorClosure</i> collects all transitive prerequisites (inclusive) "
       "of a skill — used to build prerequisite closures for path generation and to "
       "determine which skills are 'inside' a goal's dependency chain. <i>descendants</i> "
       "finds all downstream skills — used in explanations to quantify what skipping "
       "a skill would affect.<br/>"
       "<b>How:</b> Iterative DFS using an explicit stack (no recursion, stack-safe for "
       "deep graphs)."
    )

    qa("Q7: What is TF-IDF / Cosine Similarity for course matching?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/engine/courses.ts</font> + <font color='#7C3AED'>data/course_skill_mapping.json</font><br/>"
       "<b>Why:</b> Maps each of the 211 skills to the 2,118 real Coursera courses. "
       "The mapping is precomputed using TF-IDF character n-gram cosine similarity "
       "(offline); at runtime, courses are ranked by rating desc then viewer count "
       "desc, with a level-affinity bonus nudging toward the learner's evidenced band.<br/>"
       "<b>Metrics:</b> 2,118 courses mapped; runtime ranking is O(n log n) per skill "
       "with n = avg 10 courses per skill."
    )

    qa("Q8: What is the Bi-Encoder Fine-Tuning with MNR Loss?",
       "<b>Where:</b> <font color='#7C3AED'>ml/pipeline/train_retriever.py</font><br/>"
       "<b>Why:</b> The base model (BAAI/bge-small-en-v1.5) doesn't know PathFinder's "
       "211 skills or 2,118 courses. Fine-tuning creates a shared embedding space "
       "where course text and skill text are close when they match.<br/>"
       "<b>How:</b> MultipleNegativesRanking (MNR) loss with same-domain hard negatives, "
       "2.9k course→skill pairs. Bi-encoder encodes both sides independently; at inference, "
       "a single dot-product (cosine) scores every pair.<br/>"
       "<b>Metrics (held-out):</b> Recall@1 = 0.72, Recall@5 = 0.89, MRR = 0.79, "
       "course→skill F1 peaks at 0.54 cosine threshold."
    )

    qa("Q9: What is the Multi-Label Logistic Regression Tagger?",
       "<b>Where:</b> <font color='#7C3AED'>ml/pipeline/train_tagger.py</font> (training) + "
       "<font color='#7C3AED'>src/lib/ml/tagger.ts</font> (inference)<br/>"
       "<b>Why:</b> When no LLM is available, resumes, GitHub READMEs, and repo descriptions "
       "must still be mapped to skill IDs. One logistic head per skill (211 × 384 weights + bias) "
       "sits on the retriever embedding.<br/>"
       "<b>Metrics:</b> Micro-F1 = 0.78 on held-out courses (vs 0.62 for plain cosine); "
       "0.69 on job-posting text; 0.67 on resume-style text."
    )

    qa("Q10: What is Noisy-OR Confidence Combination?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/evidence/fuse.ts</font> — function <i>fuseEvidence</i><br/>"
       "<b>Why:</b> When evidence arrives from independent sources (GitHub, LeetCode, quizzes, "
       "projects), their confidences compound. Noisy-OR computes: combined = 1 - ∏(1 - ci), "
       "so each independent source raises confidence without any single source needing to be "
       "certain. Contradictory evidence doesn't silently cancel.<br/>"
       "<b>Metric:</b> Confidence is capped at 0.97 (never absolute certainty)."
    )

    qa("Q11: What is Weighted Mean Level Combination?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/evidence/fuse.ts</font><br/>"
       "<b>Why:</b> When a new evidence source claims level X and an existing assessment "
       "holds level Y, the combined level is a weighted blend: 0.7 × new + 0.3 × existing "
       "(when new is higher) or 0.75 × existing + 0.25 × new (when new is lower). "
       "The stronger source dominates but weaker corroboration nudges upward.<br/>"
       "<b>Self-report guard:</b> Interview/resume claims never touch the evidenced level — "
       "they only set the claimed level."
    )

    qa("Q12: What is the Vygotsky's ZPD Calibration Algorithm?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/engine/zpd.ts</font> — function <i>calibrateZpd</i><br/>"
       "<b>Why:</b> Projects must be sized just beyond the learner's current ability — "
       "hard enough to force growth, close enough to reach without a guide. "
       "The stretch multiplier is 1.5–3.0× the evidenced level, adjusted by weekly "
       "capacity bands.<br/>"
       "<b>Tiers:</b> gentle-stretch (≤1.5×), solid-stretch (≤2.25×), strong-stretch (≤3×).<br/>"
       "<b>Metric:</b> Below 1.5× = busywork; above 3× = frustration/abandonment."
    )

    qa("Q13: What is Fisher-Yates Shuffle used for?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/calibration/quiz.ts</font> — function <i>shuffleQuestionDraft</i><br/>"
       "<b>Why:</b> Randomizes the order of multiple-choice options for each quiz question "
       "to prevent position bias. The correct answer index is tracked through the shuffle.<br/>"
       "<b>How:</b> Standard Fisher-Yates: iterate from end, swap with random earlier position. "
       "O(n) time."
    )

    qa("Q14: What is the Sigmoid Activation in the Tagger?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/ml/tagger.ts</font> — function <i>sigmoid</i><br/>"
       "<b>Why:</b> Converts the logistic regression logit (z = W·x + b) to a calibrated "
       "probability [0,1]. The probability is compared against the model's optimal threshold "
       "(swept during training) to decide if a skill is present in the text."
    )

    qa("Q15: What is the Semantic Embedding Search?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/ml/search.ts</font> + <font color='#7C3AED'>src/lib/ml/encoder.ts</font><br/>"
       "<b>Why:</b> Substring matching fails for queries like 'LLM', 'vector search', or "
       "'prompting' that don't appear in skill names. The ONNX query encoder embeds the "
       "query, then a single dot-product pass over all 211 skill vectors ranks them by "
       "meaning, not spelling.<br/>"
       "<b>Metrics:</b> Real queries score 0.65–0.77 for best hit; min threshold = 0.45; "
       "nonsense tops out at 0.31."
    )

    qa("Q16: What is JSON Repair / Bracket Balancing for LLM output?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/ai/llm.ts</font> — function <i>repairJson</i><br/>"
       "<b>Why:</b> LLMs frequently produce malformed JSON: <think> blocks, markdown fences, "
       "leading prose, trailing commas, smart quotes, truncated output. This function strips "
       "these artifacts, finds the first brace, repairs trailing commas, and balances "
       "unclosed brackets as a last resort.<br/>"
       "<b>Impact:</b> Allows graceful degradation — even when an LLM returns garbled output, "
       "the parser recovers structured data ~85% of the time."
    )

    qa("Q17: What is Evidence Fusion with Equivalent-Skill Transfer?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/evidence/fuse.ts</font> — functions <i>fuseEvidence</i> "
       "and <i>transferAcrossEquivalents</i><br/>"
       "<b>Why:</b> The skill graph duplicates skills across domains (e.g. <i>ds_python</i> "
       "and <i>ml_python</i> are both 'Python Programming'). Without transfer, a learner "
       "must prove the same skill twice. The equivalence map (derived from embedding similarity "
       "+ exact name matching) carries evidence across twins — level and tier transfer unchanged, "
       "confidence discounted by 0.9×.<br/>"
       "<b>Guard:</b> Nothing is ever lowered; one hop only; mirrored rows never re-trigger."
    )

    qa("Q18: What is the Multi-Round Streaming Agent State Machine?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/onboarding/agent.ts</font><br/>"
       "<b>Why:</b> The onboarding interview progresses through 7 phases: intro → goal → "
       "background → time → style → wrap_up → done. The agent is a pausable state machine "
       "persisted server-side; each turn streams SSE deltas. Phase transitions happen when "
       "the LLM signals [PHASE_COMPLETE], the user skips, or 2+ rounds occur in a phase "
       "(PF-03 stall prevention).<br/>"
       "<b>Extract:</b> Heuristic extraction (regex for hours, domain keywords) runs alongside "
       "LLM extraction and merges — the profile is never blank."
    )

    qa("Q19: What is the Adaptive Replanning with Path Diffing?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/path/replan.ts</font><br/>"
       "<b>Why:</b> Learning paths must react to quiz failures, pace feedback, and goal "
       "changes. Every replan produces a new path version with a machine-readable diff "
       "(added/removed/moved phases with reasons) shown to the learner — no silent reshuffles.<br/>"
       "<b>Triggers:</b> quiz_failed → remediation milestone; too_hard → consolidation phase; "
       "too_easy → stretch content; goal_changed → full regeneration; drift → pacing rebalance.<br/>"
       "<b>Guard:</b> Completed milestones are always preserved across replans."
    )

    qa("Q20: What is the Multi-Provider LLM Gateway with Round-Robin Failover?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/ai/llm.ts</font><br/>"
       "<b>Why:</b> The system must work even when one LLM provider is down. The gateway "
       "tries providers in order (Groq → NVIDIA → OpenAI-compat → Z.AI SDK), retrying "
       "transient errors (429, 500+) before moving to the next. A Groq key pool provides "
       "automatic rate-limit failover.<br/>"
       "<b>Design principle:</b> 'AI-augmented, not AI-dependent' — every LLM call has a "
       "deterministic fallback."
    )

    # =====================================================================
    # PART 2 — ALGORITHM SUMMARY TABLE
    # =====================================================================
    story.append(PageBreak())
    section("Part 2 — Algorithm Summary Table")

    table(
        ["#", "Algorithm", "Location", "Purpose", "Complexity"],
        [
            ["1", "DFS Post-Order Topo Sort", "engine/topo.ts", "Deterministic skill ordering", "O(V+E)"],
            ["2", "Kahn's + Min-Heap (SPT)", "engine/topo.ts + heap.ts", "Optimal fast-win scheduling", "O(V log V + E)"],
            ["3", "Kahn-Style BFS Depths", "engine/graph.ts", "DAG depth computation", "O(V+E)"],
            ["4", "Ancestor/Descendant DFS", "engine/graph.ts", "Transitive closure", "O(V+E)"],
            ["5", "TF-IDF Cosine Matching", "engine/courses.ts", "Course-skill mapping", "O(n log n)"],
            ["6", "Bi-Encoder + MNR Loss", "ml/train_retriever.py", "Shared embedding space", "Fine-tune ~7 min"],
            ["7", "Logistic Regression", "ml/train_tagger.py", "Multi-label skill tagging", "211 heads × 384d"],
            ["8", "Noisy-OR Confidence", "evidence/fuse.ts", "Independent evidence compounding", "O(k) per skill"],
            ["9", "Weighted Mean Level", "evidence/fuse.ts", "Level blending across sources", "O(1) per merge"],
            ["10", "ZPD Calibration", "engine/zpd.ts", "Project difficulty sizing", "O(1)"],
            ["11", "Semantic Embedding Search", "ml/search.ts + encoder.ts", "Meaning-based skill lookup", "O(D × 211)"],
            ["12", "Sigmoid + Threshold Sweep", "ml/tagger.ts", "Probability scoring", "O(1) per skill"],
            ["13", "Fisher-Yates Shuffle", "calibration/quiz.ts", "Quiz option randomization", "O(n)"],
            ["14", "JSON Repair + Bracket Balance", "ai/llm.ts", "LLM output hardening", "O(n)"],
            ["15", "Streaming Agent FSM", "onboarding/agent.ts", "Multi-round interview", "Phase-based"],
            ["16", "Adaptive Replanning + Diff", "path/replan.ts", "Path revision with transparency", "O(m²) diff"],
            ["17", "Multi-Provider Failover", "ai/llm.ts", "LLM provider resilience", "O(p) providers"],
            ["18", "Equivalence Transfer", "evidence/fuse.ts", "Cross-domain skill mirroring", "O(k × hops)"],
        ],
    )

    # =====================================================================
    # PART 3 — ML TRAINING PIPELINE
    # =====================================================================
    section("Part 3 — ML Training Pipeline")

    qa("Q21: What does the ML training pipeline produce?",
       "<b>Where:</b> <font color='#7C3AED'>ml/pipeline/</font> (5 stages)<br/>"
       "The pipeline trains on an RTX 5070 in ~7.4 minutes and produces:<br/>"
       "• <b>Retriever</b> — fine-tuned BAAI/bge-small-en-v1.5 bi-encoder (MNR loss, 2.9k pairs)<br/>"
       "• <b>Tagger</b> — 211 logistic heads on retriever embeddings (0.78 micro-F1)<br/>"
       "• <b>Artifacts</b> — JSON files consumed by the Next.js app:<br/>"
       "&nbsp;&nbsp;- course_skill_mapping.v2.json (superset mapping)<br/>"
       "&nbsp;&nbsp;- skill_course_scores.v2.json (ranked per-skill courses)<br/>"
       "&nbsp;&nbsp;- skill_neighbors.json (top-8 similar skills)<br/>"
       "&nbsp;&nbsp;- course_neighbors.json (top-5 similar courses)<br/>"
       "&nbsp;&nbsp;- equivalent_skills.json (cross-domain duplicates)<br/>"
       "&nbsp;&nbsp;- search_index.json (211 skill vectors for semantic search)<br/>"
       "&nbsp;&nbsp;- suggested_edges.json (candidate prerequisite edges for human review)"
    )

    qa("Q22: What are the ML training metrics?",
       "<b>Retriever metrics (held-out):</b><br/>"
       "• Course→Skill: Recall@1 = 0.72, Recall@5 = 0.89, MRR = 0.79<br/>"
       "• Skill→Course: Precision@5 = 0.65, Recall@10 = 0.82<br/>"
       "• Cosine tagging threshold: 0.54 (maximises F1)<br/>"
       "• Base model coverage: 166/211 skills → Fine-tuned: 211/211 skills (100%)<br/><br/>"
       "<b>Tagger metrics (held-out):</b><br/>"
       "• Logistic F1: 0.78 (micro), precision 0.81, recall 0.75<br/>"
       "• Cosine baseline F1: 0.62<br/>"
       "• Hybrid (OR) F1: 0.82<br/>"
       "• Job-posting text F1: 0.69<br/>"
       "• Resume-style text F1: 0.67"
    )

    # =====================================================================
    # PART 4 — SYSTEM ARCHITECTURE
    # =====================================================================
    story.append(PageBreak())
    section("Part 4 — System Architecture & Metrics")

    qa("Q23: What is the Evidence Tier System?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/evidence/fuse.ts</font><br/>"
       "Four tiers from strongest to weakest:<br/>"
       "• <b>Proven</b> — real artefacts (GitHub repos, contest records, PASSED project evaluations)<br/>"
       "• <b>Verified</b> — calibration/gate quiz independently confirmed the level<br/>"
       "• <b>Claimed</b> — self-reported only (interview or resume mention)<br/>"
       "• <b>Inferred</b> — weak signals (single repo language, incidental mention)<br/><br/>"
       "<b>Source confidence weights:</b> project = 0.95, LeetCode = 0.90, Codeforces = 0.90, "
       "GitHub = 0.85, quiz = 0.80, resume = 0.50, interview = 0.35."
    )

    qa("Q24: What is the Prerequisite DAG structure?",
       "• <b>211 skills</b> across <b>11 domains</b> with prerequisite edges<br/>"
       "• AND-semantics: every prerequisite is mandatory<br/>"
       "• Cross-domain edges (e.g., Python in Data Science feeds ML)<br/>"
       "• Depth range: 0 (foundations) to 6+ (specialist mastery)<br/>"
       "• Required level grows with depth: 3 + depth/2, capped at 5"
    )

    qa("Q25: What are the three learning path scenarios?",
       "<b>Balanced</b> (default): DFS topological ordering + project every other phase "
       "+ gate quiz at every phase end.<br/>"
       "<b>Intensive</b>: Kahn/SPT ordering (quick wins first) + compressed schedule + "
       "projects at midpoint and finale only.<br/>"
       "<b>Exploratory</b>: DFS ordering + adjacent-skills phase (sibling skills in domain) "
       "+ portfolio-grade capstone project."
    )

    qa("Q26: What is the time estimation model?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/engine/time.ts</font><br/>"
       "• Converts Coursera duration (months × hours/week) to work-hour estimates<br/>"
       "• Hours = clamp(months × 14, 6, 120) + depth bonuses<br/>"
       "• Projects: +8 hours; quizzes: +1 hour<br/>"
       "• Weekly budget drives deterministic milestone scheduling<br/>"
       "• One rest day between milestones; all dates are deterministic given same inputs"
    )

    qa("Q27: What is the Skill Radar?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/engine/radar.ts</font><br/>"
       "Three-series comparison for every skill in the target closure:<br/>"
       "• <b>Claimed</b> — what the learner says they know (self-report)<br/>"
       "• <b>Evidenced</b> — what external proof supports<br/>"
       "• <b>Required</b> — what the goal demands (depth-derived: 3 + depth/2)<br/>"
       "• Overclaim = claimed − evidenced (Dunning-Kruger surface)<br/>"
       "• Gap = required − evidenced (actual learning load)<br/>"
       "• Aggregated into 6 summary axes by depth band for chart readability."
    )

    qa("Q28: What is the Course Recommendation scoring?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/engine/courses.ts</font><br/>"
       "Deterministic ranking: rating desc → viewer count desc → course ID for tie-breaking.<br/>"
       "Level-affinity bonus: +0.3 if course level matches learner's evidenced band, "
       "−0.1 if mismatch, −0.4 if advanced course for beginner. Max bonus = 0.3, "
       "which never overrides a 0.1 rating difference."
    )

    qa("Q29: What is the Project Evaluation pipeline?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/projects/evaluate.ts</font><br/>"
       "Two-stage verification:<br/>"
       "1. <b>Evidence fetch</b> — GitHub API (or web scraping fallback) retrieves metadata, "
       "languages, README, file tree, up to 5 source files, dependency manifests.<br/>"
       "2. <b>Evaluation</b> — LLM path: rubric-grounded structured scoring with per-criterion "
       "scores, strengths, gaps, actionable feedback. Heuristic path: structural checks "
       "(stack match, README presence, code substance) when no LLM is reachable.<br/>"
       "Verdict: 'passed' (≥0.65, no criterion <0.4) → skills stamped PROVEN; "
       "'needs_work' → feedback + retry."
    )

    qa("Q30: What is the Explainability Engine?",
       "<b>Where:</b> <font color='#7C3AED'>src/lib/explain.ts</font><br/>"
       "Every recommendation answers 'why?' with three grounds:<br/>"
       "1. <b>Evidence</b> — what in the learner's actual data motivates this<br/>"
       "2. <b>Graph</b> — the prerequisite structure that forces the ordering<br/>"
       "3. <b>Goal</b> — how this serves the stated objective (+ counterfactual)<br/>"
       "Structured grounds are assembled deterministically; LLM polishes into prose. "
       "Explanations cite evidence rows that actually exist."
    )

    # =====================================================================
    # PART 5 — TECH STACK & ABBREVIATIONS
    # =====================================================================
    story.append(PageBreak())
    section("Part 5 — Tech Stack")

    table(
        ["Layer", "Technology", "Purpose"],
        [
            ["Framework", "Next.js 16 (App Router) + TypeScript 5", "Full-stack web app"],
            ["UI", "Tailwind CSS 4, shadcn/ui, Lucide, Framer Motion", "Component library + animations"],
            ["Database", "Prisma ORM + PostgreSQL (Supabase)", "Learner state persistence"],
            ["Visualisation", "React Flow (@xyflow/react), Recharts", "Skill DAG + radar charts"],
            ["AI", "Multi-provider gateway: Groq, OpenAI-compat, Z.AI", "LLM fallback chain"],
            ["PDF", "unpdf (serverless PDF.js)", "Resume PDF text extraction"],
            ["ML Training", "PyTorch + sentence-transformers + ONNX", "Retriever + tagger training"],
            ["ML Runtime", "@huggingface/transformers.js (ONNX int8)", "In-process query encoder"],
            ["State", "React 19 + useSyncExternalStore", "Learner identity persistence"],
            ["Testing", "Vitest (unit) + Playwright (e2e)", "Test infrastructure"],
            ["Deployment", "Vercel (Next.js) + Supabase (PostgreSQL)", "Hosting + database"],
        ],
    )

    # =====================================================================
    # PART 6 — GLOSSARY
    # =====================================================================
    section("Part 6 — Glossary & Abbreviations")

    glossary = [
        ("AND-semantics", "Prerequisite graph rule where ALL listed prerequisites must be satisfied before a skill can be attempted."),
        ("Bi-Encoder", "Neural architecture that encodes two texts independently into vectors; similarity is computed as a dot product. Used for efficient retrieval."),
        ("BFS", "Breadth-First Search — graph traversal visiting all neighbors at current depth before moving deeper."),
        ("CLS Pooling", "Using the [CLS] token's embedding from a Transformer as the sentence representation (vs mean-pooling)."),
        ("DAG", "Directed Acyclic Graph — a graph with directed edges and no cycles. The skill prerequisite structure is a DAG."),
        ("DFS", "Depth-First Search — graph traversal exploring as far as possible along each branch before backtracking."),
        ("DFS-Topological", "A topological sort produced by post-order DFS; prerequisites always appear before dependents."),
        ("Evidence Fusion", "Combining skill assessments from multiple independent sources into a single tiered assessment."),
        ("F1 Score", "Harmonic mean of precision and recall: F1 = 2 × (precision × recall) / (precision + recall)."),
        ("Fisher-Yates Shuffle", "Algorithm to randomly permute an array in O(n) time by swapping each element with a randomly chosen earlier element."),
        ("Gate Quiz", "A milestone-end assessment covering all skills in a phase, pitched at the required level (3/5 = independent use)."),
        ("Golden Path", "The ideal learning trajectory through the prerequisite DAG from foundational skills to the goal skill."),
        ("Grounding", "Providing explanations that cite concrete data rows (evidence items, graph edges, learner goals) rather than generic text."),
        ("Hard Negative", "A training example that is similar but incorrect — forces the model to learn fine distinctions."),
        ("Inference", "Using a trained model to make predictions on new data (vs. training)."),
        ("Iterative DFS", "DFS using an explicit stack instead of recursion, avoiding stack overflow on deep graphs."),
        ("Kahn's Algorithm", "Topological sort using BFS: repeatedly remove nodes with in-degree 0, decrementing neighbors' in-degrees."),
        ("KNN", "K-Nearest Neighbors — finding the k closest items in a vector space (used conceptually in semantic search)."),
        ("LoRA", "Low-Rank Adaptation — parameter-efficient fine-tuning that adds low-rank matrices to frozen weights."),
        ("MNR Loss", "MultipleNegativesRanking Loss — contrastive loss that pushes positive pairs closer and negative pairs apart in embedding space."),
        ("MRR", "Mean Reciprocal Rank — average of 1/rank for the first relevant result across queries."),
        ("Noisy-OR", "Probability combination model: P(at least one true) = 1 − ∏(1 − Pi), used for independent evidence sources."),
        ("O(n)", "Big-O notation for linear time complexity — the operation scales proportionally with input size."),
        ("O(V + E)", "Linear in the number of vertices plus edges — standard for graph traversals."),
        ("ONNX", "Open Neural Network Exchange — a format for exporting trained models to run on different runtimes."),
        ("QLORA", "Quantized Low-Rank Adaptation — LoRA applied to a quantized (4-bit) base model, reducing VRAM."),
        ("Recursive DFS", "DFS using the call stack (function calls). Simpler but limited by stack depth."),
        ("SPT Rule", "Shortest-Processing-Time scheduling rule: schedule the shortest available job first to minimize average completion time."),
        ("SSE", "Server-Sent Events — one-way streaming from server to client over HTTP, used for real-time LLM output."),
        ("Streak", "Consecutive days with at least one logged activity (milestone, quiz, evidence)."),
        ("TF-IDF", "Term Frequency–Inverse Document Frequency — a numerical statistic reflecting how important a word is to a document in a collection."),
        ("Vygotsky's ZPD", "Zone of Proximal Development — the range between what a learner can do independently and what they can do with guidance."),
        ("Weighted Score", "A score computed as a weighted sum of component scores, with weights reflecting relative importance."),
    ]

    for term, definition in glossary:
        story.append(Paragraph(f"<b>{term}</b> — {definition}", gloss_style))

    # ── Abbreviations table ──────────────────────────────────────────────
    story.append(Spacer(1, 0.3 * inch))
    section("Abbreviations Quick Reference")

    table(
        ["Abbreviation", "Full Form"],
        [
            ["AI", "Artificial Intelligence"],
            ["BERT", "Bidirectional Encoder Representations from Transformers"],
            ["CF", "Codeforces"],
            ["CLS", "Classification (token) — used in Transformer pooling"],
            ["DAG", "Directed Acyclic Graph"],
            ["DFS", "Depth-First Search"],
            ["BFS", "Breadth-First Search"],
            ["ETL", "Extract, Transform, Load"],
            ["F1", "F1 Score (harmonic mean of precision and recall)"],
            ["GPU", "Graphics Processing Unit"],
            ["LC", "LeetCode"],
            ["LLM", "Large Language Model"],
            ["LoRA", "Low-Rank Adaptation"],
            ["MNR", "MultipleNegativesRanking (loss function)"],
            ["MRR", "Mean Reciprocal Rank"],
            ["ONNX", "Open Neural Network Exchange"],
            ["SSE", "Server-Sent Events"],
            ["SPT", "Shortest-Processing-Time (scheduling rule)"],
            ["TF-IDF", "Term Frequency–Inverse Document Frequency"],
            ["ZPD", "Zone of Proximal Development"],
        ],
    )

    # ── Footer ───────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.5 * inch))
    story.append(HRFlowable(width="100%", thickness=1, color=GREY))
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph(
        "Generated by PathFinder AI · September 2026 · MIT License",
        ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8, textColor=GREY, alignment=1),
    ))

    # ── Build ────────────────────────────────────────────────────────────
    doc.build(story)
    print(f"PDF generated: {OUTPUT}")

if __name__ == "__main__":
    build()
