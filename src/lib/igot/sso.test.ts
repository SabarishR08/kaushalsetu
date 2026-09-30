import { describe, it, expect, vi, afterEach } from "vitest";
import { ssoEnabled, buildSsoRedirectUrl, exchangeSsoCode, fetchSsoProfile } from "./sso";

const ENV = {
  STATSETU_IGOT_SSO_ENABLED: "true",
  STATSETU_IGOT_SSO_AUTH_URL: "https://auth.igotkarmayogi.gov.in/realms/igot/protocol/openid-connect/auth",
  STATSETU_IGOT_SSO_TOKEN_URL: "https://auth.igotkarmayogi.gov.in/realms/igot/protocol/openid-connect/token",
  STATSETU_IGOT_SSO_USERINFO_URL: "https://auth.igotkarmayogi.gov.in/realms/igot/protocol/openid-connect/userinfo",
  STATSETU_IGOT_SSO_CLIENT_ID: "statsetu-client",
  STATSETU_IGOT_SSO_CLIENT_SECRET: "secret-123",
  STATSETU_IGOT_SSO_REDIRECT_URI: "https://statsetu.app/api/igot/sso/callback",
};

describe("igot sso scaffolding", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("is disabled until credentials are configured (demo never breaks)", () => {
    process.env.STATSETU_IGOT_SSO_ENABLED = undefined;
    expect(ssoEnabled()).toBe(false);
    for (const [k, v] of Object.entries(ENV)) process.env[k] = v;
    expect(ssoEnabled()).toBe(true);
  });

  it("builds a standards-compliant authorization redirect", () => {
    for (const [k, v] of Object.entries(ENV)) process.env[k] = v;
    const url = new URL(buildSsoRedirectUrl("https://app/callback", "state-xyz"));
    expect(url.searchParams.get("client_id")).toBe("statsetu-client");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("scope")).toBe("openid");
    expect(url.searchParams.get("redirect_uri")).toBe("https://app/callback");
    expect(url.searchParams.get("state")).toBe("state-xyz");
  });

  it("exchanges the code via form-encoded POST and reads userinfo", async () => {
    for (const [k, v] of Object.entries(ENV)) process.env[k] = v;
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("/token")) {
        return new Response(JSON.stringify({ access_token: "at-1", refresh_token: "rt-1" }), { status: 200 });
      }
      if (url.includes("/userinfo")) {
        return new Response(JSON.stringify({ sub: "sunbird-user-42", email: "official@gov.in", name: "A. Officer" }), { status: 200 });
      }
      return new Response("nope", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const tokens = await exchangeSsoCode("abc", "https://app/callback");
    expect(tokens.accessToken).toBe("at-1");
    const profile = await fetchSsoProfile(tokens);
    expect(profile.userId).toBe("sunbird-user-42");
    expect(profile.email).toBe("official@gov.in");
  });

  it("throws a clear error when token exchange fails", async () => {
    for (const [k, v] of Object.entries(ENV)) process.env[k] = v;
    vi.stubGlobal("fetch", vi.fn(async () => new Response("bad", { status: 400 })));
    await expect(exchangeSsoCode("abc", "https://app/callback")).rejects.toThrow(/token exchange failed/i);
  });
});
