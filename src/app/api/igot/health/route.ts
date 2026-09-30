import { NextResponse } from "next/server";
import { healthProbe } from "@/lib/igot/adapter";

export const dynamic = "force-dynamic";

/**
 * GET /api/igot/health
 *
 * Verifiable, not assumed: in live mode performs a real round-trip against
 * the Sunbird-contract search endpoint and reports connected/not-connected
 * with latency. In mock mode it honestly reports connected:false — so an
 * admin dashboard badge always reflects reality, never a claim.
 */
export async function GET() {
  const report = await healthProbe();
  return NextResponse.json(report);
}
