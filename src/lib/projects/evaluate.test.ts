import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchRepoEvidence } from "./evaluate";

/**
 * Hermetic test: GitHub's unauthenticated API allows only 60 requests/hour,
 * so hitting the live API from CI is flaky by design. These tests stub the
 * network layer with realistic payloads, covering both the happy path
 * (API reachable) and the documented fallback (API rate-limited → web/raw).
 */

const REPO_JSON = {
  name: "sample-repo",
  description: "A sample repository used in tests",
  default_branch: "main",
  stargazers_count: 12,
  pushed_at: "2026-09-01T00:00:00Z",
};

const LANGUAGES_JSON = { TypeScript: 5100, JavaScript: 2400 };

const TREE_JSON = {
  tree: [
    { path: "package.json", type: "blob" },
    { path: "README.md", type: "blob" },
    { path: "src/index.ts", type: "blob" },
    { path: "src/util.ts", type: "blob" },
  ],
};

const README = "# sample-repo\n\nAn installation guide and feature list for testing.";

const PKG_JSON = JSON.stringify({ dependencies: { react: "^19.0.0" } });

const b64 = (s: string) => Buffer.from(s, "utf-8").toString("base64");

function okResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
}

function textResponse(body: string): Response {
  return new Response(body, { status: 200 });
}

/** Match a request against (method, pathname) pairs. */
function routeOf(input: string | URL | Request, init?: RequestInit): { method: string; path: string } {
  const url = typeof input === "string" || input instanceof URL ? new URL(String(input)) : new URL(input.url);
  const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
  return { method, path: url.pathname };
}

describe("fetchRepoEvidence (hermetic)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("parses a valid GitHub URL and assembles evidence from the API", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const { path } = routeOf(input, init);
      if (path === "/repos/owner/sample-repo") return okResponse(REPO_JSON);
      if (path === "/repos/owner/sample-repo/languages") return okResponse(LANGUAGES_JSON);
      if (path === "/repos/owner/sample-repo/git/trees/main") return okResponse(TREE_JSON);
      if (path === "/repos/owner/sample-repo/readme") return okResponse({ content: b64(README), encoding: "base64" });
      if (path === "/repos/owner/sample-repo/contents/src/index.ts") return okResponse({ content: b64("export const one = 1;"), encoding: "base64" });
      if (path === "/repos/owner/sample-repo/contents/src/util.ts") return okResponse({ content: b64("export const two = 2;"), encoding: "base64" });
      return new Response("not found", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const evidence = await fetchRepoEvidence("https://github.com/owner/sample-repo");
    expect(evidence.url).toBe("https://github.com/owner/sample-repo");
    expect(evidence.name).toBe("sample-repo");
    expect(evidence.description).toBe("A sample repository used in tests");
    expect(evidence.defaultBranch).toBe("main");
    expect(evidence.languages.TypeScript).toBeGreaterThan(0);
    expect(evidence.fileTree).toContain("package.json");
    expect(evidence.fileTree).toContain("src/index.ts");
    expect(evidence.readmeExcerpt).toContain("sample-repo");
    expect(evidence.dependencyHints).toContain("package.json");
    expect(evidence.sourceFiles.length).toBeGreaterThan(0);
  });

  it("falls back to web + raw endpoints when the API is rate-limited", async () => {
    const HTML = `<html><head><meta name="description" content="A sample repository used in tests - owner/sample-repo"></head><body>
      <span aria-label="TypeScript 68.0%"></span>
      <a href="/owner/sample-repo/blob/main/package.json">package.json</a>
      <a href="/owner/sample-repo/blob/main/src/index.ts">src/index.ts</a>
      <script>{"name":"README.md","path":"README.md"}{"name":"index.ts","path":"src/index.ts"}</script>
    </body></html>`;
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const { method, path } = routeOf(input, init);
      // All api.github.com calls fail (rate-limited → ghGet returns null)
      if (path.startsWith("/repos/")) return new Response("rate limited", { status: 403 });
      // Fallback path: the repository web page
      if (path === "/owner/sample-repo") return textResponse(HTML);
      // raw files served from github.com/<owner>/<repo>/raw/HEAD/...
      if (path === "/owner/sample-repo/raw/HEAD/README.md") return textResponse(README);
      if (path === "/owner/sample-repo/raw/HEAD/package.json") return textResponse(PKG_JSON);
      if (path === "/owner/sample-repo/raw/HEAD/src/index.ts") return textResponse("export const one = 1;");
      // HEAD probes for the other manifests must 404
      void method;
      return new Response("not found", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const evidence = await fetchRepoEvidence("https://github.com/owner/sample-repo");
    expect(evidence.name).toBe("sample-repo");
    expect(evidence.fileTree.length).toBeGreaterThan(0);
    expect(evidence.fileTree).toContain("package.json");
    expect(evidence.dependencyHints).toContain("package.json");
    expect(evidence.readmeExcerpt).toBeTruthy();
  });

  it("throws a clear error for a 404 repository", async () => {
    const fetchMock = vi.fn(async () => new Response("not found", { status: 404 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchRepoEvidence("https://github.com/owner/does-not-exist")).rejects.toThrow(
      /Repository not found or not accessible/,
    );
  });
});
