/**
 * Server-side loader for the department dashboard. Reads the artifacts
 * produced by `npm run sih:demand` and `npm run sih:alignment`, plus the
 * skill names for human-readable labels.
 *
 * Imported only from server components/route handlers — the underlying
 * node:fs calls do not exist in the browser.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

export interface DemandSkill {
  skillId: string;
  demand: number;
  share: number;
  avgStrength: number;
  examplePostingIds: string[];
}

export interface DemandData {
  meta: { builtAt: string; source: string; tagger: string; postings: number; sectors: number };
  overall: DemandSkill[];
  sectors: { sector: string; postings: number; topSkills: DemandSkill[]; uncoveredSkills: DemandSkill[] }[];
  districts: { district: string; postings: number; topSkills: DemandSkill[] }[];
  audit: Record<string, string[]>;
}

export interface AlignmentData {
  meta: { builtAt: string; demandSource: string; tagger: string; postings: number; programs: number; minDemandShare: number };
  programAlignment: {
    courseId: string;
    title: string;
    category?: string;
    skills: string[];
    alignment: number;
    bestSector: string;
    bestSectorRelevance: number;
    sectorDemand: number;
    missingInBestSector: string[];
  }[];
  sectorCoverage: { sector: string; postings: number; topSkills: string[]; coveredSkills: string[]; coverage: number }[];
  districtCoverage: {
    district: string;
    postings: number;
    topSkills: string[];
    coveredSkills: string[];
    missingSkills: string[];
    coverage: number;
  }[];
  focusComparison: {
    districts: [string, string];
    coverages: [number, number];
    missing: [string[], string[]];
    rows: {
      skillId: string;
      aDemand: number;
      aShare: number;
      aMissing: boolean;
      bDemand: number;
      bShare: number;
      bMissing: boolean;
    }[];
  } | null;
  uncoveredSkills: { skillId: string; demand: number; share: number; sectors: string[]; examplePostingIds: string[] }[];
  recommendations: { type: "add-program" | "revise-program"; skillId?: string; sector?: string; district?: string; courseId?: string; title: string; detail: string }[];
}

async function readJson<T>(rel: string, fallback: T | null = null): Promise<T | null> {
  try {
    const abs = path.join(process.cwd(), "data", rel);
    return JSON.parse(await fs.readFile(abs, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function getDepartmentData(): Promise<{
  demand: DemandData | null;
  alignment: AlignmentData | null;
  skillNames: Record<string, string>;
}> {
  const [demand, alignment, graph] = await Promise.all([
    readJson<DemandData>("demand.json"),
    readJson<AlignmentData>("alignment.json"),
    readJson<Record<string, { id: string; name: string }[]>>("skill_graph.json"),
  ]);
  const skillNames: Record<string, string> = {};
  if (graph) {
    for (const skills of Object.values(graph)) for (const s of skills) skillNames[s.id] = s.name;
  }
  // Demand-only skills (postings demand them, no course teaches them) still
  // need human-readable labels on the dashboard.
  try {
    const demandOnly = JSON.parse(await fs.readFile(path.join(process.cwd(), "data", "demand_only_skills.json"), "utf8")) as Record<string, string>;
    Object.assign(skillNames, demandOnly);
  } catch {
    // optional file
  }
  return { demand, alignment, skillNames };
}
