import { NextRequest, NextResponse } from "next/server";
import { recommendTpacProgrammes } from "@/lib/igot/tpac";

export const dynamic = "force-dynamic";

/**
 * POST /api/igot/tpac/recommend
 *   { gaps: string[], designation?: string }
 *
 * Ranks NSSTA TPAC (in-person) programmes against the official's competency
 * gaps — the classroom counterpart to the iGOT online course feed. Deterministic
 * scoring: eligibility first, then skill-overlap relevance, then shorter duration.
 */
export async function POST(request: NextRequest) {
  let body: { gaps?: unknown; designation?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body: { gaps, designation? }" }, { status: 400 });
  }
  const gaps = Array.isArray(body.gaps) ? body.gaps.filter((g): g is string => typeof g === "string") : [];
  const designation = typeof body.designation === "string" ? body.designation : null;
  if (!gaps.length) {
    return NextResponse.json({ error: "`gaps` must be a non-empty array of graph skill ids." }, { status: 400 });
  }
  const recommendations = await recommendTpacProgrammes(gaps, designation);
  return NextResponse.json({
    count: recommendations.length,
    recommendations: recommendations.map((r) => ({
      programme_id: r.programme.programme_id,
      Title: r.programme.Title,
      URL: r.programme.URL,
      Mode: r.programme.Mode,
      DurationDays: r.programme.DurationDays,
      Description: r.programme.Description,
      coveredGapSkillIds: r.coveredGapSkillIds,
      relevance: Math.round(r.relevance * 100) / 100,
      eligible: r.eligible,
      eligibilityReason: r.eligibilityReason,
    })),
  });
}
