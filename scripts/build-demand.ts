/**
 * Build the demand side for SIH26134: read job postings, tag skills, write
 * `data/demand.json`.
 *
 * Sources (first one wins):
 *   1. `data/jobs/raw/*.csv`  — any public jobs corpus (Kaggle-style: title,
 *      description columns). Drop a real corpus here to re-run on real data.
 *   2. `data/jobs/maharashtra_seed.json` — the labeled seed corpus shipped
 *      with the repo.
 *
 * Usage: npm run sih:demand
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import { tagPostings, keywordMatches } from "../src/lib/skills/keyword-tagger";

interface Posting {
  id: string;
  title: string;
  org?: string;
  sector: string;
  city?: string;
  text: string;
}

interface DemandSkill {
  skillId: string;
  demand: number;          // postings mentioning the skill
  share: number;           // demand / postings, 0-1
  avgStrength: number;     // mean tagger strength across mentioning postings
  examplePostingIds: string[];
}

interface DemandSector {
  sector: string;
  postings: number;
  topSkills: DemandSkill[];
  uncoveredSkills: DemandSkill[]; // filled by build-alignment.ts later
}

interface DemandFile {
  meta: {
    builtAt: string;
    source: string;
    tagger: "trained" | "keyword";
    postings: number;
    sectors: number;
  };
  overall: DemandSkill[];
  sectors: DemandSector[];
  audit: Record<string, string[]>; // postingId -> matched aliases
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

/** Heuristic column finder for Kaggle-style jobs CSVs. */
function pickCol(headers: string[], candidates: string[]): number {
  const lower = headers.map((h) => h.toLowerCase());
  for (const c of candidates) {
    const idx = lower.findIndex((h) => h === c);
    if (idx >= 0) return idx;
  }
  for (const c of candidates) {
    const idx = lower.findIndex((h) => h.includes(c));
    if (idx >= 0) return idx;
  }
  return -1;
}

async function loadSeed(): Promise<Posting[]> {
  const p = path.join(process.cwd(), "data", "jobs", "maharashtra_seed.json");
  const raw = JSON.parse(await fs.readFile(p, "utf8")) as { postings: Posting[] };
  return raw.postings;
}

async function loadRawCsv(): Promise<Posting[]> {
  const dir = path.join(process.cwd(), "data", "jobs", "raw");
  const files = (await fs.readdir(dir)).filter((f) => f.toLowerCase().endsWith(".csv"));
  const postings: Posting[] = [];
  for (const f of files) {
    const text = await fs.readFile(path.join(dir, f), "utf8");
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (!lines.length) continue;
    const headers = parseCsvLine(lines[0]);
    const tIdx = pickCol(headers, ["title", "job_title", "jobtitle", "position", "job name"]);
    const dIdx = pickCol(headers, ["description", "job_description", "jobdescription", "job detail", "details"]);
    const sIdx = pickCol(headers, ["sector", "industry", "category", "functional area", "jobfunction"]);
    const cIdx = pickCol(headers, ["city", "location", "job_location", "place"]);
    const oIdx = pickCol(headers, ["organization", "company", "employer", "company_name"]);
    if (tIdx < 0 || dIdx < 0) {
      console.warn(`[demand] ${f}: no title/description columns found, skipping`);
      continue;
    }
    for (let i = 1; i < lines.length && postings.length < 5000; i++) {
      const cells = parseCsvLine(lines[i]);
      const title = (cells[tIdx] ?? "").trim();
      const desc = (cells[dIdx] ?? "").trim();
      if (!title && !desc) continue;
      postings.push({
        id: `${path.basename(f, ".csv").slice(0, 12)}-${i}`,
        title,
        org: oIdx >= 0 ? (cells[oIdx] ?? "").trim() : undefined,
        sector: sIdx >= 0 ? (cells[sIdx] ?? "").trim() || "Unclassified" : "Unclassified",
        city: cIdx >= 0 ? (cells[cIdx] ?? "").trim() : undefined,
        text: `${title}. ${desc}`.slice(0, 4000),
      });
    }
  }
  return postings;
}

function summarize(postings: Posting[], tags: { skillId: string; strength: number }[][]): { overall: DemandSkill[]; perSector: Map<string, DemandSkill[]> } {
  const n = postings.length || 1;
  const accumulate = (subset: number[]): DemandSkill[] => {
    const m = new Map<string, { count: number; strSum: number; examples: string[] }>();
    for (const i of subset) {
      for (const t of tags[i]) {
        const e = m.get(t.skillId) ?? { count: 0, strSum: 0, examples: [] };
        e.count += 1;
        e.strSum += t.strength;
        if (e.examples.length < 3) e.examples.push(postings[i].id);
        m.set(t.skillId, e);
      }
    }
    return [...m.entries()]
      .map(([skillId, e]) => ({
        skillId,
        demand: e.count,
        share: Math.round((e.count / Math.max(1, subset.length)) * 1000) / 1000,
        avgStrength: Math.round((e.strSum / e.count) * 100) / 100,
        examplePostingIds: e.examples,
      }))
      .sort((a, b) => b.demand - a.demand || a.skillId.localeCompare(b.skillId));
  };

  const all = accumulate(postings.map((_, i) => i));
  const sectors = [...new Set(postings.map((p) => p.sector))].sort();
  const perSector = new Map<string, DemandSkill[]>();
  for (const s of sectors) {
    const idxs = postings.map((p, i) => (p.sector === s ? i : -1)).filter((i) => i >= 0);
    perSector.set(s, accumulate(idxs));
  }
  return { overall: all, perSector };
}

async function main(): Promise<void> {
  const rawDir = path.join(process.cwd(), "data", "jobs", "raw");
  let postings: Posting[] = [];
  let source = "maharashtra_seed_v1";
  try {
    postings = await loadRawCsv();
    if (postings.length) source = "data/jobs/raw CSV corpus";
  } catch {
    // no raw dir — fall through to seed
  }
  if (!postings.length) postings = await loadSeed();

  console.log(`[demand] ${postings.length} postings from ${source}`);
  const texts = postings.map((p) => `${p.title}. ${p.text}`);
  const tagged = await tagPostings(texts, 15);
  const trained = tagged.some((t) => t.length > 0 && t.some((x) => x.probability !== 0.85));
  const tagger: "trained" | "keyword" = trained ? "trained" : "keyword";
  console.log(`[demand] tagger: ${tagger}`);

  const strengths = tagged.map((ts) => ts.map((t) => ({ skillId: t.skillId, strength: t.strength })));
  const { overall, perSector } = summarize(postings, strengths);

  const audit: Record<string, string[]> = {};
  for (let i = 0; i < postings.length; i++) {
    audit[postings[i].id] = (await keywordMatches(texts[i])).map((m) => m.matchedAlias);
  }

  const demand: DemandFile = {
    meta: {
      builtAt: new Date().toISOString(),
      source,
      tagger,
      postings: postings.length,
      sectors: perSector.size,
    },
    overall,
    sectors: [...perSector.entries()]
      .map(([sector, topSkills]) => ({ sector, postings: postings.filter((p) => p.sector === sector).length, topSkills, uncoveredSkills: [] }))
      .sort((a, b) => b.postings - a.postings),
    audit,
  };

  const out = path.join(process.cwd(), "data", "demand.json");
  await fs.writeFile(out, JSON.stringify(demand, null, 2));
  console.log(`[demand] wrote ${out}`);
  console.log(`[demand] top 10 overall: ${overall.slice(0, 10).map((s) => `${s.skillId}(${s.demand})`).join(", ")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
