import { NextRequest, NextResponse } from "next/server";
import { ssoEnabled, exchangeSsoCode, fetchSsoProfile } from "@/lib/igot/sso";

export const dynamic = "force-dynamic";

/**
 * GET /api/igot/sso/callback
 *
 * OAuth2 redirect_uri target: exchanges the authorization code for tokens,
 * resolves the official's Sunbird userId from Keycloak userinfo, then hands
 * off to the app with the identity in query params. Until SSO credentials
 * exist this route reports 501 with setup instructions.
 */
export async function GET(request: NextRequest) {
  if (!ssoEnabled()) {
    return NextResponse.json(
      { error: "iGOT SSO is not enabled yet.", setup: "Configure STATSETU_IGOT_SSO_* variables issued with the data-sharing agreement." },
      { status: 501 },
    );
  }
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(new URL(`/onboarding?sso_error=${encodeURIComponent(error)}`, request.nextUrl.origin), 302);
  }
  if (!code) {
    return NextResponse.json({ error: "Missing ?code from the identity provider." }, { status: 400 });
  }
  try {
    const redirectUri = request.nextUrl.origin + "/api/igot/sso/callback";
    const tokens = await exchangeSsoCode(code, redirectUri);
    const profile = await fetchSsoProfile(tokens);
    const target = new URL("/onboarding", request.nextUrl.origin);
    target.searchParams.set("sso", "1");
    target.searchParams.set("igot_user_id", profile.userId);
    if (profile.email) target.searchParams.set("email", profile.email);
    if (profile.name) target.searchParams.set("name", profile.name);
    return NextResponse.redirect(target, 302);
  } catch (e) {
    return NextResponse.redirect(
      new URL(`/onboarding?sso_error=${encodeURIComponent(e instanceof Error ? e.message : "SSO exchange failed")}`, request.nextUrl.origin),
      302,
    );
  }
}
