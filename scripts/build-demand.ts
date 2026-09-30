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
  cities: { city: string; postings: number; topSkills: DemandSkill[] }[];
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

/**
 * Naukri JSONL corpora (real postings, e.g. muhammetakkurt/naukri-jobs-dataset
 * on Hugging Face, fetched anonymously over plain HTTP — no CLI/token needed).
 * Drop `*.jsonl` files into data/jobs/raw/. Columns auto-mapped; HTML stripped
 * from descriptions.
 */
function stripHtml(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, ". ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const MH_PATTERN = /(mumbai|pune|nagpur|nashik|nashik|thane|navi mumbai|aurangabad|chh\.? sambhajinagar|kolhapur|solapur|amravati|jalgaon|sangli|satara|latur|ichalkaranji|bhiwandi|hinjawadi|chakan|maharashtra)/i;

/**
 * City clusters for the department dashboard. Ordered rules; a posting whose
 * location mentions several cities ("Pune, Bengaluru", "Navi Mumbai, Mumbai")
 * credits every Maharashtra cluster it matches — multi-city postings are real
 * demand in each listed city. Hinjawadi/Pimpri/Chakan fold into Pune, Navi
 * Mumbai/Thane into the Mumbai MMR cluster.
 */
const CITY_RULES: { city: string; patterns: RegExp[] }[] = [
  { city: "Pune", patterns: [/pune/i, /hinjawadi/i, /pimpri/i, /chakan/i] },
  { city: "Mumbai (MMR)", patterns: [/mumbai/i, /navi mumbai/i, /thane/i] },
  { city: "Nagpur", patterns: [/nagpur/i] },
  { city: "Nashik", patterns: [/nashik|nasik/i] },
  { city: "Other Maharashtra", patterns: [/kolhapur/i, /aurangabad/i, /chh\.? sambhajinagar/i, /solapur/i, /amravati/i, /jalgaon/i, /sangli/i, /satara/i, /latur/i, /ichalkaranji/i, /bhiwandi/i] },
];

export function extractCities(location: string): string[] {
  if (!location) return [];
  const out = CITY_RULES.filter((r) => r.patterns.some((p) => p.test(location))).map((r) => r.city);
  return out;
}

async function loadJsonlDir(): Promise<Posting[]> {
  const dir = path.join(process.cwd(), "data", "jobs", "raw");
  // `*.sample.jsonl` files exist for repo browsing/tests only — never ingest
  // them alongside the full corpora (they duplicate the first N rows).
  const files = (await fs.readdir(dir)).filter(
    (f) => f.toLowerCase().endsWith(".jsonl") && !f.includes(".sample."),
  );
  // Read every file fully and filter FIRST (Maharashtra attribution), then cap
  // the kept rows at MAX_POSTINGS round-robin across files so no file's slice
  // crowds out the others.
  const perFile: string[][] = [];
  for (const f of files) {
    const text = await fs.readFile(path.join(dir, f), "utf8");
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    perFile.push(lines);
  }
  const postings: Posting[] = [];
  const seenIds = new Set<string>();
  const cursors = perFile.map(() => 0);
  let remaining = perFile.reduce((a, lines) => a + lines.length, 0);
  while (postings.length < 5000 && remaining > 0) {
    let keptThisRound = false;
    for (let fi = 0; fi < perFile.length && postings.length < 5000; fi++) {
      const f = files[fi];
      const lines = perFile[fi];
      while (cursors[fi] < lines.length) {
        const i = cursors[fi]++;
        remaining--;
        let row: Record<string, unknown>;
        try {
          row = JSON.parse(lines[i]) as Record<string, unknown>;
        } catch {
          continue; // truncated last line from a range fetch is fine
        }
        const title = String(row.title ?? row.Title ?? "").trim();
        const desc = stripHtml(String(row.jobDescription ?? row.job_description ?? ""));
        const skills = String(row.tagsAndSkills ?? row.skills ?? "").replace(/,/g, ", ");
        const location = String(row.location ?? "").trim();
        if (!title && !desc && !skills) continue;
        // Maharashtra attribution filter: the department is a state body, so
        // postings must be in Maharashtra cities to count toward the demand signal.
        if (!MH_PATTERN.test(location)) continue;
        const id = `nk-${String(row.jobId ?? `${path.basename(f, ".jsonl")}-${i}`)}`;
        if (seenIds.has(id)) continue; // corpus overlap guard
        seenIds.add(id);
        const stem = path.basename(f, ".jsonl").toLowerCase();
        const sector = stem.includes("data_scientist")
          ? "Data Science & AI"
          : stem.includes("software")
            ? "Software Engineering"
            : stem;
        postings.push({
          id,
          title,
          org: String(row.companyName ?? row.company ?? "").trim() || undefined,
          sector,
          city: location || undefined,
          text: `${title}. Skills: ${skills}. ${desc}`.slice(0, 4000),
        });
        keptThisRound = true;
        break; // one kept row per file per round
      }
    }
    if (!keptThisRound) break; // every remaining line was rejected — files exhausted
  }
  return postings;
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

/** Number of postings attributed to a city cluster ("Unattributed" for none). */
function cityPostings(postings: Posting[], city: string): number {
  return postings.filter((p) => {
    const cities = extractCities(p.city ?? "");
    return cities.length ? cities.includes(city) : city === "Unattributed";
  }).length;
}

function summarize(postings: Posting[], tags: { skillId: string; strength: number }[][]): { overall: DemandSkill[]; perSector: Map<string, DemandSkill[]>; perCity: Map<string, DemandSkill[]> } {
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
  // City attribution: a posting can credit multiple clusters (multi-city
  // listings are demand in each). Postings with no Maharashtra city (should
  // not happen after the filter, but the CSV may lack one) land in
  // "Unattributed" so the counts reconcile.
  const cityIndex = new Map<string, number[]>();
  for (let i = 0; i < postings.length; i++) {
    const cities = extractCities(postings[i].city ?? "");
    for (const c of cities.length ? cities : ["Unattributed"]) {
      const arr = cityIndex.get(c) ?? [];
      arr.push(i);
      cityIndex.set(c, arr);
    }
  }
  const perCity = new Map<string, DemandSkill[]>();
  for (const [c, idxs] of cityIndex) perCity.set(c, accumulate(idxs));
  return { overall: all, perSector, perCity };
}

async function main(): Promise<void> {
  const rawDir = path.join(process.cwd(), "data", "jobs", "raw");
  // Merge every available real corpus: JSONL (deep tech families) + CSV
  // (sector-tagged breadth). The synthetic seed is the last-resort fallback so
  // the pipeline always has something to chew on.
  let postings: Posting[] = [];
  const sources: string[] = [];
  try {
    const jsonl = await loadJsonlDir();
    if (jsonl.length) {
      postings = postings.concat(jsonl);
      sources.push("Naukri JSONL");
    }
  } catch (e) {
    console.warn(`[demand] jsonl load failed: ${e instanceof Error ? e.message : String(e)}`);
  }
  try {
    const csv = await loadRawCsv();
    if (csv.length) {
      postings = postings.concat(csv);
      sources.push("sector CSV");
    }
  } catch {
    // no raw dir — fall through
  }
  let source = sources.length ? `real corpus merge: ${sources.join(" + ")} (data/jobs/raw)` : "maharashtra_seed_v1";
  if (!postings.length) postings = await loadSeed();

  console.log(`[demand] ${postings.length} postings from ${source}`);
  const texts = postings.map((p) => `${p.title}. ${p.text}`);
  const tagged = await tagPostings(texts, 15);
  const trained = tagged.some((t) => t.length > 0 && t.some((x) => x.probability !== 0.85));
  const tagger: "trained" | "keyword" = trained ? "trained" : "keyword";
  console.log(`[demand] tagger: ${tagger}`);

  const strengths = tagged.map((ts) => ts.map((t) => ({ skillId: t.skillId, strength: t.strength })));
  const { overall, perSector, perCity } = summarize(postings, strengths);

  // Audit trail is capped so large real corpora keep demand.json compact.
  const audit: Record<string, string[]> = {};
  const auditLimit = Math.min(postings.length, 500);
  for (let i = 0; i < auditLimit; i++) {
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
    cities: [...perCity.entries()]
      .map(([city, topSkills]) => ({
        city,
        postings: cityPostings(postings, city),
        topSkills,
      }))
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
