import { describe, it, expect } from "vitest";
import { recommendTpacProgrammes, upsertTpacProgramme, deleteTpacProgramme, type TpacProgramme } from "./tpac";

const GAPS = ["ss_weighting", "sm_estimation", "dc_cspro", "cg_report_writing"];

describe("tpac recommender", () => {
  it("ranks by eligibility, then relevance, then shorter duration", async () => {
    const recs = await recommendTpacProgrammes(GAPS, "Statistical Investigator");
    expect(recs.length).toBeGreaterThan(0);
    for (let i = 1; i < recs.length; i++) {
      const a = recs[i - 1];
      const b = recs[i];
      if (a.eligible === b.eligible && a.relevance === b.relevance) {
        expect(a.programme.DurationDays).toBeLessThanOrEqual(b.programme.DurationDays);
      }
    }
  });

  it("marks restricted programmes ineligible with a reason", async () => {
    const recs = await recommendTpacProgrammes(["os_gva"], "Statistical Investigator");
    const national = recs.find((r) => r.programme.programme_id === "TPAC005");
    expect(national).toBeDefined();
    expect(national!.eligible).toBe(false);
    expect(national!.eligibilityReason).toMatch(/Restricted to/);
  });

  it("treats 'Any designation' programmes as eligible for everyone", async () => {
    const recs = await recommendTpacProgrammes(["it_python_basics"], "Deputy Director");
    expect(recs.some((r) => r.programme.programme_id === "TPAC008" && r.eligible)).toBe(true);
  });

  it("only returns programmes that cover at least one open gap", async () => {
    const recs = await recommendTpacProgrammes(["sm_small_area"], "Statistical Investigator");
    // No seeded programme covers SAE — expect empty rather than noise.
    expect(recs.every((r) => r.coveredGapSkillIds.length > 0)).toBe(true);
  });

  it("supports runtime calendar management (upsert + delete)", async () => {
    const prog: TpacProgramme = {
      programme_id: "TPAC999",
      Title: "Test Programme",
      URL: "https://nssta.gov.in/tpac/TPAC999",
      Mode: "online",
      DurationDays: 2,
      Eligibility: ["Any designation"],
      Skills: ["sm_small_area"],
      Description: "Test-only programme for SAE.",
    };
    const { total } = await upsertTpacProgramme(prog);
    const recs = await recommendTpacProgrammes(["sm_small_area"], "Statistical Investigator");
    expect(recs.some((r) => r.programme.programme_id === "TPAC999")).toBe(true);
    const removed = await deleteTpacProgramme("TPAC999");
    expect(removed).toBe(true);
    void total;
  });
});
