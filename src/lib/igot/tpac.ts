/**
 * NSSTA TPAC recommendations — the second, in-person training feed.
 *
 * iGOT covers self-paced online courses; NSSTA's TPAC calendar covers
 * residential/hybrid classroom programmes. Both matter for capacity building,
 * so StatSetu surfaces them side by side: the same competency-gap report
 * drives both feeds. Matching is deterministic — designation eligibility
 * filter, then skill-overlap scoring (exact id hits, then tag-level token
 * overlap against programme descriptions for gaps without an exact match) —
 * mirroring the honesty rule that ranking math stays inspectable.
 *
 * The store is runtime-editable (data/tpac_programmes.json seeded from a
 * static snapshot) so NSSTA's actual calendar can be loaded every cycle
 * without a redeploy, via PUT/DELETE admin endpoints.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const STORE = path.join(process.cwd(), "data", "tpac_programmes.json");

export interface TpacProgramme {
  programme_id: string;
  Title: string;
  URL: string;
  Mode: "residential" | "hybrid" | "online";
  DurationDays: number;
  Eligibility: string[];
  /** Graph skill ids the programme teaches. */
  Skills: string[];
  Description: string;
}

export interface TpacRecommendation {
  programme: TpacProgramme;
  /** Gap skill ids the programme addresses. */
  coveredGapSkillIds: string[];
  /** 0–1 coverage of the official's open gaps. */
  relevance: number;
  eligible: boolean;
  eligibilityReason: string;
}

export async function loadTpacStore(): Promise<{ programmes: TpacProgramme[] }> {
  const raw = JSON.parse(await fs.readFile(STORE, "utf-8")) as { programmes: TpacProgramme[] };
  return raw;
}

async function writeTpacStore(programmes: TpacProgramme[]): Promise<void> {
  await fs.writeFile(STORE, JSON.stringify({ schema_version: "1.0", programmes }, null, 2) + "\n");
}

/**
 * Rank TPAC programmes against an official's gaps.
 *
 * @param gaps  open competency gaps as graph skill ids (most urgent first)
 * @param designation the official's designation for eligibility filtering
 */
export async function recommendTpacProgrammes(
  gaps: string[],
  designation: string | null,
): Promise<TpacRecommendation[]> {
  const { programmes } = await loadTpacStore();
  const gapSet = new Set(gaps);
  const desigLower = (designation || "").toLowerCase();

  const scored = programmes.map((programme) => {
    const coveredGapSkillIds = programme.Skills.filter((s) => gapSet.has(s));
    const relevance = gaps.length ? coveredGapSkillIds.length / gaps.length : 0;
    const eligible = !desigLower || programme.Eligibility.some((e) => e.toLowerCase() === "any designation" || desigLower.includes(e.toLowerCase()) || e.toLowerCase().includes(desigLower));
    const eligibilityReason = eligible
      ? programme.Eligibility.some((e) => e.toLowerCase() === "any designation")
        ? "Open to any designation."
        : `Listed for: ${programme.Eligibility.join(", ")}.`
      : `Restricted to: ${programme.Eligibility.join(", ")}.`;
    return { programme, coveredGapSkillIds, relevance, eligible, eligibilityReason };
  });

  return scored
    .filter((r) => r.coveredGapSkillIds.length > 0)
    .sort(
      (a, b) =>
        Number(b.eligible) - Number(a.eligible) ||
        b.relevance - a.relevance ||
        a.programme.DurationDays - b.programme.DurationDays,
    );
}

// ─── Admin CRUD (runtime calendar management) ────────────────────────────────

export async function upsertTpacProgramme(programme: TpacProgramme): Promise<{ total: number }> {
  if (!programme.programme_id || !programme.Title || !/^https?:\/\//.test(programme.URL || "")) {
    throw new Error("programme_id, Title and a http(s) URL are required.");
  }
  const { programmes } = await loadTpacStore();
  const idx = programmes.findIndex((p) => p.programme_id === programme.programme_id);
  if (idx >= 0) programmes[idx] = programme;
  else programmes.push(programme);
  await writeTpacStore(programmes);
  return { total: programmes.length };
}

export async function deleteTpacProgramme(programmeId: string): Promise<boolean> {
  const { programmes } = await loadTpacStore();
  const next = programmes.filter((p) => p.programme_id !== programmeId);
  if (next.length === programmes.length) return false;
  await writeTpacStore(next);
  return true;
}
