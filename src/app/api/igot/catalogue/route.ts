import { NextRequest, NextResponse } from "next/server";
import { igotMode, sunbirdSearchCourses } from "@/lib/igot/adapter";
import { promises as fs } from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

/**
 * GET /api/igot/catalogue?q=survey&limit=20
 *
 * Course catalogue across modes. Live: searches the real Sunbird course
 * search endpoint (documented contract) and normalizes records. Mock: serves
 * the committed seed catalogue, explicitly tagged mock:true.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() || "";
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 20, 50);
  const mode = igotMode();
  if (mode === "live") {
    try {
      const courses = await sunbirdSearchCourses(q || "statistics", limit);
      return NextResponse.json({ mode, mock: false, count: courses.length, courses });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Sunbird search failed", mode, mock: false },
        { status: 502 },
      );
    }
  }
  const file = await fs.readFile(path.join(process.cwd(), "data", "courses.json"), "utf-8");
  const parsed = JSON.parse(file) as { courses: Array<Record<string, unknown>> };
  const needle = q.toLowerCase();
  const courses = parsed.courses
    .filter((c) => !needle || JSON.stringify(c).toLowerCase().includes(needle))
    .slice(0, limit);
  return NextResponse.json({
    mode,
    mock: true,
    count: courses.length,
    courses,
    note: "MOCK CATALOGUE — committed seed data for demo/offline use. Live mode queries the real Sunbird course search once a data-sharing agreement is provisioned.",
  });
}
