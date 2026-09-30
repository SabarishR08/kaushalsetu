import { NextRequest, NextResponse } from "next/server";
import { syncCompletions, igotMode, igotFeedUrl } from "@/lib/igot/adapter";

export const dynamic = "force-dynamic";

/**
 * GET /api/igot/sync?email=official@gov.in&userId=&userToken=
 *
 * Polls the iGOT completion feed for the learner. In mock mode (default,
 * until a data-sharing agreement with Karmayogi Bharat SPV / DoPT is issued)
 * the response is explicitly tagged `mock: true` with a disclosure note the
 * UI must render. Live mode polls the real Sunbird enrollment list using the
 * learner's Keycloak user token (from SSO) and fails loudly, never fakes.
 */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "A valid ?email= query parameter is required." }, { status: 400 });
  }
  const userId = request.nextUrl.searchParams.get("userId") || undefined;
  const userToken = request.headers.get("x-authenticated-user-token") || undefined;
  try {
    const result = await syncCompletions(email, userId && userToken ? { userId, userToken } : undefined);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "iGOT sync failed",
        mode: igotMode(),
        endpoint: igotFeedUrl(),
      },
      { status: 502 },
    );
  }
}
