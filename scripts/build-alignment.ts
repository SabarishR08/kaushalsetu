/**
 * Build the alignment layer for SIH26134: compare the skilling supply
 * (courses/programs with tagged skills) against the demand signal
 * (data/demand.json) and write `data/alignment.json`.
 *
 * Outputs:
 *   - per-program alignment score (share of in-demand skill mass the program covers)
 *   - per-sector coverage and the skills no program currently teaches
 *   - concrete recommendations (revise / add programs)
 *
 * Usage: npm run sih:alignment
 */
import { promises as fs } from "node:fs";
import path from "node:path";

interface Course {
  course_id: string;
  Title: string;
  Category?: string;
  SubCategory?: string;
  Level?: string;
  DurationRaw?: string;
  URL?: string;
}

interface DemandSkill {
  skillId: string;
  demand: number;
  share: number;
  examplePostingIds: string[];
}

interface DemandFile {
  meta: { source: string; tagger: string; postings: number };
  overall: DemandSkill[];
  sectors: { sector: string; postings: number; topSkills: DemandSkill[] }[];
}

interface AlignmentFile {
  meta: {
    builtAt: string;
    demandSource: string;
    tagger: string;
    postings: number;
    programs: number;
    minDemandShare: number;
  };
  programAlignment: {
    courseId: string;
    title: string;
    category?: string;
    skills: string[];
    alignment: number;              // 0-1, share of overall in-demand mass covered
    bestSector: string;
    bestSectorRelevance: number;    // 0-1, share of that sector's demand mass covered
    sectorDemand: number;           // postings in bestSector
    missingInBestSector: string[];  // that sector's top skills this program lacks
  }[];
  sectorCoverage: {
    sector: string;
    postings: number;
    topSkills: string[];
    coveredSkills: string[];
    coverage: number;               // 0-1 of top-demand mass taught somewhere
  }[];
  uncoveredSkills: {
    skillId: string;
    demand: number;
    share: number;
    sectors: string[];
    examplePostingIds: string[];
  }[];
  recommendations: { type: "add-program" | "revise-program"; skillId?: string; sector?: string; courseId?: string; title: string; detail: string }[];
}

/** Demand mass considered "top" when scoring coverage. */
const TOP_N = 12;
/** A skill must appear in at least this share of a sector's postings to count as a sector gap. */
const GAP_SHARE = 0.15;

async function readJson<T>(p: string): Promise<T> {
  return JSON.parse(await fs.readFile(p, "utf8")) as T;
}

async function main(): Promise<void> {
  const demand = await readJson<DemandFile>(path.join(process.cwd(), "data", "demand.json"));
  const coursesFile = await readJson<{ courses: Course[] }>(path.join(process.cwd(), "data", "courses.json"));
  const mapping = await readJson<Record<string, string[]>>(path.join(process.cwd(), "data", "course_skill_mapping.json"));

  const demandIds = new Set(demand.overall.map((s) => s.skillId));
  const programs = coursesFile.courses.map((c) => ({ course: c, skills: mapping[c.course_id] ?? [] }));

  // Overall demand mass as a map for fast scoring.
  const overallShare = new Map(demand.overall.map((s) => [s.skillId, s.share]));
  const sectorShare = new Map<string, Map<string, number>>();
  for (const sec of demand.sectors) sectorShare.set(sec.sector, new Map(sec.topSkills.map((s) => [s.skillId, s.share])));

  // Per-program alignment.
  const programAlignment = programs.map(({ course, skills }) => {
    const skillSet = new Set(skills);
    const alignment = skills.reduce((acc, s) => acc + (overallShare.get(s) ?? 0), 0);

    let bestSector = "—";
    let bestSectorRelevance = 0;
    let bestSectorDemand = 0;
    let missingInBestSector: string[] = [];
    for (const sec of demand.sectors) {
      const shares = sectorShare.get(sec.sector)!;
      const rel = skills.reduce((acc, s) => acc + (shares.get(s) ?? 0), 0);
      if (rel > bestSectorRelevance) {
        bestSectorRelevance = rel;
        bestSector = sec.sector;
        bestSectorDemand = sec.postings;
        missingInBestSector = sec.topSkills
          .filter((s) => s.share >= GAP_SHARE && !skillSet.has(s.skillId))
          .slice(0, 6)
          .map((s) => s.skillId);
      }
    }
    return {
      courseId: course.course_id,
      title: course.Title,
      category: course.Category,
      skills,
      alignment: Math.round(alignment * 1000) / 1000,
      bestSector,
      bestSectorRelevance: Math.round(bestSectorRelevance * 1000) / 1000,
      sectorDemand: bestSectorDemand,
      missingInBestSector,
    };
  }).sort((a, b) => b.alignment - a.alignment || a.courseId.localeCompare(b.courseId));

  // Sector coverage: of each sector's top-N demand mass, how much does ANY program teach?
  const allProgramSkills = new Set(programs.flatMap((p) => p.skills));
  const sectorCoverage = demand.sectors.map((sec) => {
    const top = sec.topSkills.slice(0, TOP_N);
    const covered = top.filter((s) => allProgramSkills.has(s.skillId));
    const mass = top.reduce((a, s) => a + s.share, 0) || 1;
    const coveredMass = covered.reduce((a, s) => a + s.share, 0);
    return {
      sector: sec.sector,
      postings: sec.postings,
      topSkills: top.map((s) => s.skillId),
      coveredSkills: covered.map((s) => s.skillId),
      coverage: Math.round((coveredMass / mass) * 1000) / 1000,
    };
  }).sort((a, b) => a.coverage - b.coverage || b.postings - a.postings);

  // Skills in demand that no program teaches.
  const uncoveredSkills = demand.overall
    .filter((s) => demandIds.has(s.skillId) && !allProgramSkills.has(s.skillId) && s.demand >= 2)
    .map((s) => {
      const sectors = demand.sectors
        .filter((sec) => sec.topSkills.some((t) => t.skillId === s.skillId))
        .sort((a, b) => b.postings - a.postings)
        .map((sec) => sec.sector);
      return { skillId: s.skillId, demand: s.demand, share: s.share, sectors, examplePostingIds: s.examplePostingIds };
    })
    .sort((a, b) => b.demand - a.demand);

  // Recommendations.
  const recommendations: AlignmentFile["recommendations"] = [];
  for (const g of uncoveredSkills.slice(0, 8)) {
    recommendations.push({
      type: "add-program",
      skillId: g.skillId,
      sector: g.sectors[0],
      title: `Add content for "${g.skillId}"`,
      detail: `${g.demand} posting(s) demand this skill (notably in ${g.sectors.slice(0, 2).join(", ") || "multiple sectors"}) but no current program teaches it. Prioritise a module or bridge course.`,
    });
  }
  for (const sec of sectorCoverage.filter((s) => s.coverage < 0.6).slice(0, 5)) {
    const missing = sec.topSkills.filter((s) => !sec.coveredSkills.includes(s));
    recommendations.push({
      type: "revise-program",
      sector: sec.sector,
      title: `Revise programs serving "${sec.sector}"`,
      detail: `Only ${Math.round(sec.coverage * 100)}% of top demand mass is covered. Missing: ${missing.slice(0, 6).join(", ")}. Update existing curricula before adding new programs.`,
    });
  }

  const alignment: AlignmentFile = {
    meta: {
      builtAt: new Date().toISOString(),
      demandSource: demand.meta.source,
      tagger: demand.meta.tagger,
      postings: demand.meta.postings,
      programs: programs.length,
      minDemandShare: GAP_SHARE,
    },
    programAlignment,
    sectorCoverage,
    uncoveredSkills,
    recommendations,
  };

  const out = path.join(process.cwd(), "data", "alignment.json");
  await fs.writeFile(out, JSON.stringify(alignment, null, 2));
  console.log(`[alignment] wrote ${out}`);
  console.log(`[alignment] uncovered in-demand skills: ${uncoveredSkills.slice(0, 8).map((s) => `${s.skillId}(${s.demand})`).join(", ") || "none"}`);
  console.log(`[alignment] weakest sector coverage: ${sectorCoverage.slice(0, 3).map((s) => `${s.sector} ${Math.round(s.coverage * 100)}%`).join(", ")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
