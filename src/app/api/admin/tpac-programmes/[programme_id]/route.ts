import { NextRequest, NextResponse } from "next/server";
import { upsertTpacProgramme, deleteTpacProgramme, type TpacProgramme } from "@/lib/igot/tpac";

export const dynamic = "force-dynamic";

/**
 * PUT  /api/admin/tpac-programmes/{programme_id}  — upsert a programme
 * DELETE /api/admin/tpac-programmes/{programme_id} — remove it
 *
 * Keeps NSSTA's calendar current every cycle without a redeploy.
 * NOTE: gate behind the platform's admin identity before production use.
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ programme_id: string }> }) {
  const { programme_id } = await params;
  let body: Partial<TpacProgramme>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON programme body." }, { status: 400 });
  }
  try {
    const programme: TpacProgramme = {
      programme_id,
      Title: String(body.Title ?? ""),
      URL: String(body.URL ?? ""),
      Mode: (body.Mode as TpacProgramme["Mode"]) ?? "residential",
      DurationDays: Number(body.DurationDays ?? 1),
      Eligibility: Array.isArray(body.Eligibility) ? body.Eligibility.map(String) : ["Any designation"],
      Skills: Array.isArray(body.Skills) ? body.Skills.map(String) : [],
      Description: String(body.Description ?? ""),
    };
    const { total } = await upsertTpacProgramme(programme);
    return NextResponse.json({ ok: true, programme_id, total });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upsert failed" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ programme_id: string }> }) {
  const { programme_id } = await params;
  const removed = await deleteTpacProgramme(programme_id);
  if (!removed) return NextResponse.json({ error: `Unknown programme_id: ${programme_id}` }, { status: 404 });
  return NextResponse.json({ ok: true, programme_id });
}
