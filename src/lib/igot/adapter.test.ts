import { describe, it, expect, vi, afterEach } from "vitest";
import { importCourses, syncCompletions, igotMode, deepLink, healthProbe, sunbirdSearchCourses } from "./adapter";

describe("igot adapter — catalogue import", () => {
  it("accepts a valid batch and normalizes fields", () => {
    const { valid, rejected } = importCourses([
      {
        course_id: " IGOT999 ",
        Title: "Test Course",
        URL: "https://igotkarmayogi.gov.in/course/igot999",
        Skills: "Survey Design, Sampling Fundamentals",
        Level: "Beginner",
      },
    ]);
    expect(rejected).toHaveLength(0);
    expect(valid).toHaveLength(1);
    expect(valid[0].course_id).toBe("IGOT999");
    expect(valid[0].source).toBe("igot");
  });

  it("accepts the { courses: [...] } envelope", () => {
    const { valid } = importCourses({ courses: [{ course_id: "X1", Title: "T", URL: "https://x.gov.in/1" }] });
    expect(valid).toHaveLength(1);
  });

  it("rejects records missing id, title, or a http(s) URL — with reasons", () => {
    const { valid, rejected } = importCourses([
      { Title: "No id", URL: "https://x.gov.in/1" },
      { course_id: "X2", URL: "https://x.gov.in/2" },
      { course_id: "X3", Title: "Bad URL", URL: "ftp://nope" },
    ]);
    expect(valid).toHaveLength(0);
    expect(rejected).toHaveLength(3);
    expect(rejected.map((r) => r.reason).join(" ")).toMatch(/course_id|Title|http/);
  });

  it("throws on a payload that is neither array nor envelope", () => {
    expect(() => importCourses({ nope: true })).toThrow(/array|courses/);
  });
});

describe("igot adapter — deep links", () => {
  it("returns the course URL unchanged (manual enrol works today, no API needed)", () => {
    expect(deepLink("IGOT001", "https://igotkarmayogi.gov.in/course/igot001")).toBe(
      "https://igotkarmayogi.gov.in/course/igot001",
    );
  });
});

describe("igot adapter — completion sync (mock mode)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("defaults to mock mode with an explicit disclosure note", async () => {
    expect(igotMode()).toBe("mock");
    const result = await syncCompletions("official@gov.in");
    expect(result.mode).toBe("mock");
    expect(result.mock).toBe(true);
    expect(result.note).toMatch(/MOCK FEED/i);
    expect(result.note).toMatch(/NOT verified/i);
  });

  it("maps completions to graph skill ids via the seed catalogue", async () => {
    const result = await syncCompletions("official@gov.in");
    const withSkills = result.completions.filter((c) => c.matchedSkillIds.length > 0);
    expect(withSkills.length).toBeGreaterThan(0);
  });

  it("is deterministic for the same learner email", async () => {
    const a = await syncCompletions("demo@mospi.gov.in");
    const b = await syncCompletions("demo@mospi.gov.in");
    expect(a.completions.map((c) => c.courseId)).toEqual(b.completions.map((c) => c.courseId));
  });

  it("live mode without an SSO user token fails loudly, never fabricates", async () => {
    process.env.STATSETU_IGOT_MODE = "live";
    await expect(syncCompletions("official@gov.in")).rejects.toThrow(/SSO|user token|Sunbird userId/i);
    delete process.env.STATSETU_IGOT_MODE;
  });
});

describe("igot adapter — Sunbird live contract (hermetic stubs)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("search normalizes Sunbird course search responses", async () => {
    process.env.STATSETU_IGOT_MODE = "live";
    process.env.STATSETU_IGOT_BASE_URL = "https://igot.example.gov.in";
    process.env.STATSETU_IGOT_API_KEY = "key-1";
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith("/api/course/v1/search")) {
        return new Response(
          JSON.stringify({
            result: {
              content: [
                {
                  identifier: "do_123",
                  name: "Survey Design Fundamentals",
                  description: "A course on survey design.",
                  webUrl: "https://igotkarmayogi.gov.in/course/do_123",
                  primaryCategory: "Course",
                  level: "beginner",
                  duration: 240,
                },
              ],
            },
          }),
          { status: 200 },
        );
      }
      return new Response("not found", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const courses = await sunbirdSearchCourses("survey", 10);
    expect(courses).toHaveLength(1);
    expect(courses[0].course_id).toBe("do_123");
    expect(courses[0].Title).toBe("Survey Design Fundamentals");
    expect(courses[0].URL).toContain("igotkarmayogi.gov.in/course/do_123");
    expect(courses[0].source).toBe("igot");
    delete process.env.STATSETU_IGOT_MODE;
    delete process.env.STATSETU_IGOT_BASE_URL;
    delete process.env.STATSETU_IGOT_API_KEY;
  });

  it("health probe honestly reports not-connected in mock mode", async () => {
    const report = await healthProbe();
    expect(report.mode).toBe("mock");
    expect(report.connected).toBe(false);
    expect(report.detail).toMatch(/Mock mode/i);
  });

  it("health probe reports connected with latency on a live round-trip", async () => {
    process.env.STATSETU_IGOT_MODE = "live";
    process.env.STATSETU_IGOT_BASE_URL = "https://igot.example.gov.in";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ result: { content: [] } }), { status: 200 })),
    );
    const report = await healthProbe();
    expect(report.mode).toBe("live");
    expect(report.connected).toBe(true);
    expect(typeof report.latencyMs).toBe("number");
    delete process.env.STATSETU_IGOT_MODE;
    delete process.env.STATSETU_IGOT_BASE_URL;
  });

  it("health probe reports the failure detail when the live endpoint is down", async () => {
    process.env.STATSETU_IGOT_MODE = "live";
    process.env.STATSETU_IGOT_BASE_URL = "https://igot.example.gov.in";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 500 })));
    const report = await healthProbe();
    expect(report.connected).toBe(false);
    expect(report.detail).toMatch(/Live probe failed/i);
    delete process.env.STATSETU_IGOT_MODE;
    delete process.env.STATSETU_IGOT_BASE_URL;
  });
});
