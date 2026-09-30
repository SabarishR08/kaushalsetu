/**
 * "Sign in with iGOT Karmayogi" — OAuth2 authorization-code scaffolding
 * against iGOT's Keycloak identity provider.
 *
 * iGOT Karmayogi authenticates officials through Keycloak (the standard
 * Sunbird identity layer). This module implements the standard authorization-
 * code flow so that, the moment MoSPI–DoPT issues client credentials, SSO
 * works with zero further engineering:
 *
 *   1. buildSsoRedirectUrl()  → send the official to iGOT's login page
 *   2. exchangeSsoCode()      → callback exchanges the code for tokens
 *   3. userinfo provides the Sunbird userId used by the live adapter
 *
 * Until credentials exist, ssoEnabled() returns false and the platform's own
 * learner identity is used — the login button is hidden, the flow never
 * breaks a demo, and switching on SSO is pure configuration.
 */
export interface SsoConfig {
  authUrl: string;
  tokenUrl: string;
  userinfoUrl: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
}

export function ssoEnabled(): boolean {
  return Boolean(
    process.env.STATSETU_IGOT_SSO_ENABLED === "true" &&
      process.env.STATSETU_IGOT_SSO_AUTH_URL &&
      process.env.STATSETU_IGOT_SSO_TOKEN_URL &&
      process.env.STATSETU_IGOT_SSO_CLIENT_ID,
  );
}

export function ssoConfig(redirectUri?: string): SsoConfig {
  const authUrl = process.env.STATSETU_IGOT_SSO_AUTH_URL;
  const tokenUrl = process.env.STATSETU_IGOT_SSO_TOKEN_URL;
  const userinfoUrl = process.env.STATSETU_IGOT_SSO_USERINFO_URL;
  const clientId = process.env.STATSETU_IGOT_SSO_CLIENT_ID;
  if (!authUrl || !tokenUrl || !clientId) {
    throw new Error("SSO is not configured: set STATSETU_IGOT_SSO_AUTH_URL, STATSETU_IGOT_SSO_TOKEN_URL and STATSETU_IGOT_SSO_CLIENT_ID.");
  }
  return {
    authUrl,
    tokenUrl,
    userinfoUrl: userinfoUrl || "",
    clientId,
    clientSecret: process.env.STATSETU_IGOT_SSO_CLIENT_SECRET,
    redirectUri: redirectUri || process.env.STATSETU_IGOT_SSO_REDIRECT_URI || "",
  };
}

/** Step 1: the URL that hands the official off to iGOT's Keycloak login. */
export function buildSsoRedirectUrl(redirectUri?: string, state?: string): string {
  const cfg = ssoConfig(redirectUri);
  const url = new URL(cfg.authUrl);
  url.searchParams.set("client_id", cfg.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid");
  if (cfg.redirectUri) url.searchParams.set("redirect_uri", cfg.redirectUri);
  if (state) url.searchParams.set("state", state);
  return url.toString();
}

export interface SsoTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
}

/** Step 2: exchange the authorization code for tokens (standard RFC 6749 §4.1.3). */
export async function exchangeSsoCode(code: string, redirectUri?: string): Promise<SsoTokens> {
  const cfg = ssoConfig(redirectUri);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: cfg.clientId,
    ...(cfg.clientSecret ? { client_secret: cfg.clientSecret } : {}),
    ...(cfg.redirectUri ? { redirect_uri: cfg.redirectUri } : {}),
  });
  const res = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`SSO token exchange failed: HTTP ${res.status}`);
  const data = (await res.json()) as { access_token?: string; refresh_token?: string; id_token?: string };
  if (!data.access_token) throw new Error("SSO token exchange returned no access_token.");
  return { accessToken: data.access_token, refreshToken: data.refresh_token, idToken: data.id_token };
}

export interface SsoProfile {
  /** Sunbird user id — the key the live adapter needs. */
  userId: string;
  email?: string;
  name?: string;
}

/** Step 3: resolve the Keycloak userinfo (sub = Sunbird userId). */
export async function fetchSsoProfile(tokens: SsoTokens): Promise<SsoProfile> {
  const cfg = ssoConfig();
  if (!cfg.userinfoUrl) throw new Error("STATSETU_IGOT_SSO_USERINFO_URL is not configured.");
  const res = await fetch(cfg.userinfoUrl, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });
  if (!res.ok) throw new Error(`SSO userinfo failed: HTTP ${res.status}`);
  const data = (await res.json()) as { sub?: string; email?: string; name?: string; preferred_username?: string };
  if (!data.sub) throw new Error("SSO userinfo returned no subject (sub).");
  return { userId: data.sub, email: data.email, name: data.name || data.preferred_username };
}
