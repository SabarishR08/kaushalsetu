import { NextRequest, NextResponse } from "next/server";
import { ssoEnabled, buildSsoRedirectUrl } from "@/lib/igot/sso";

export const dynamic = "force-dynamic";

/**
 * GET /api/igot/sso/login
 *
 * "Sign in with iGOT Karmayogi" — redirects the official to iGOT's Keycloak
 * login page. Only active when SSO client credentials are configured
 * (STATSETU_IGOT_SSO_ENABLED=true + realm URLs + client id); otherwise
 * responds 501 with the exact setup needed, so the demo never breaks.
 */
export async function GET(request: NextRequest) {
  if (!ssoEnabled()) {
    return NextResponse.json(
      {
        error: "iGOT SSO is not enabled yet.",
        setup: "Set STATSETU_IGOT_SSO_ENABLED=true plus the Keycloak realm URLs and client credentials issued with the data-sharing agreement. Until then, use the platform's own learner identity.",
      },
      { status: 501 },
    );
  }
  const state = request.nextUrl.searchParams.get("state") ?? undefined;
  const redirectUri = request.nextUrl.origin + "/api/igot/sso/callback";
  return NextResponse.redirect(buildSsoRedirectUrl(redirectUri, state), 302);
}
