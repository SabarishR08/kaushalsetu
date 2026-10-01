import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ALL_DISTRICTS } from "@/lib/geo/districts";
import { getDepartmentData } from "@/lib/dept-data";
import { DepartmentClient } from "./department-client";
import { type SectorTabData } from "./sector-tabs";
import { type DistrictSkillRow } from "./district-charts";

export const dynamic = "force-static";

export default async function DepartmentPage() {
  const { demand, alignment, skillNames, programSkills } = await getDepartmentData();

  if (!demand || !alignment) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-16">
          <Card>
            <CardHeader>
              <CardTitle>Department dashboard needs its data build</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Run <code className="rounded bg-muted px-1 py-0.5">npm run sih:demand</code> then{" "}
                <code className="rounded bg-muted px-1 py-0.5">npm run sih:alignment</code> to generate{" "}
                <code className="rounded bg-muted px-1 py-0.5">data/demand.json</code> and{" "}
                <code className="rounded bg-muted px-1 py-0.5">data/alignment.json</code>.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  const name = (id: string) => skillNames[id] ?? id;
  const weakest = [...alignment.sectorCoverage].sort((a, b) => a.coverage - b.coverage).slice(0, 5);

  const sectorTabData: SectorTabData[] = (() => {
    const groups: Record<string, string[]> = {
      Manufacturing: ["Manufacturing & Auto", "Automobile / Auto Anciliary / Auto Components", "Industrial Products / Heavy Machinery", "Chemicals / PetroChemical / Plastic / Rubber", "Textiles / Garments / Accessories", "Electricals / Switchgears", "Semiconductors / Electronics"],
      "IT & Tech": ["IT & Software", "IT-Software / Software Services", "Software Engineering", "Data Science & AI", "Internet / Ecommerce", "BPO / Call Centre / ITES", "IT-Hardware & Networking", "KPO / Research / Analytics"],
      Healthcare: ["Medical / Healthcare / Hospitals", "Pharma / Biotech / Clinical Research", "Medical Devices / Equipments", "Wellness / Fitness / Sports / Beauty", "Wellness / Fitness / Sports"],
      BFSI: ["Banking / Financial Services / Broking", "BFSI", "Accounting / Finance", "Insurance", "Strategy / Management Consulting Firms"],
      Logistics: ["Courier / Transportation / Freight / Warehousing", "Logistics & Supply Chain", "Shipping / Marine", "Export / Import"],
    };
    const sectorSkillMap = new Map(demand.sectors.map((s) => [s.sector, s.topSkills]));
    const covMap = new Map(alignment.sectorCoverage.map((s) => [s.sector, s]));

    const build = (tab: string, sectors: string[]): SectorTabData => {
      if (tab === "ALL") {
        const topSkills = demand.overall.slice(0, 12).map((s) => ({ skillId: s.skillId, demand: s.demand }));
        const totalMass = topSkills.reduce((a, s) => a + s.demand, 0) || 1;
        const coveredMass = topSkills.reduce((a, s) => a + (programSkills.has(s.skillId) ? s.demand : 0), 0);
        const coverage = alignment.sectorCoverage.map((s) => ({
          sector: s.sector,
          postings: s.postings,
          coverage: s.coverage,
        }));
        return {
          tab: "ALL",
          topSkills,
          coverage,
          coverageTop12: Math.round((coveredMass / totalMass) * 1000) / 1000,
          postings: demand.meta.postings,
        };
      }

      const merged = new Map<string, number>();
      let postings = 0;
      for (const s of sectors) {
        const skills = sectorSkillMap.get(s);
        if (!skills) continue;
        postings += demand.sectors.find((x) => x.sector === s)?.postings ?? 0;
        for (const sk of skills) merged.set(sk.skillId, (merged.get(sk.skillId) ?? 0) + sk.demand);
      }
      const topSkills = [...merged.entries()]
        .map(([skillId, d]) => ({ skillId, demand: d }))
        .sort((a, b) => b.demand - a.demand);
      const top12 = topSkills.slice(0, 12);
      const totalMass = top12.reduce((a, s) => a + s.demand, 0) || 1;
      const coveredMass = top12.reduce((a, s) => a + (programSkills.has(s.skillId) ? s.demand : 0), 0);
      const coverage = top12.length
        ? [...sectors].map((s) => ({
            sector: s,
            postings: demand.sectors.find((x) => x.sector === s)?.postings ?? 0,
            coverage: covMap.get(s)?.coverage ?? 0,
          }))
        : [];
      return { tab, topSkills, coverage, coverageTop12: Math.round((coveredMass / totalMass) * 1000) / 1000, postings };
    };

    const tabs = [build("ALL", [])];
    for (const [tab, sectors] of Object.entries(groups)) tabs.push(build(tab, sectors));
    return tabs;
  })();

  const districtList = demand.districts.filter((d) => d.district !== "Unattributed");
  const mapData = districtList.map((d) => ({
    district: d.district,
    postings: d.postings,
    topSkills: d.topSkills.slice(0, 5).map((s) => name(s.skillId)),
  }));
  const zeroCount = ALL_DISTRICTS.filter((n) => !districtList.some((d) => d.district === n)).length;
  const topDistricts = districtList.filter((d) => d.postings >= 20).slice(0, 4);
  const focus = alignment.focusComparison;
  const districtActions = (alignment.districtCoverage ?? [])
    .filter((d) => d.postings >= 20 && d.missingDetail?.length)
    .sort((a, b) => b.uncoveredPostings - a.uncoveredPostings)
    .slice(0, 4);
  const districtPivot: DistrictSkillRow[] = demand.overall.slice(0, 8).map((s) => {
    const row: DistrictSkillRow = { skill: name(s.skillId) };
    for (const d of topDistricts) {
      row[d.district] = d.topSkills.find((t) => t.skillId === s.skillId)?.demand ?? 0;
    }
    return row;
  });

  return (
    <AppShell>
      <DepartmentClient
        demand={demand}
        alignment={alignment}
        skillNames={skillNames}
        programSkillsList={Array.from(programSkills)}
        sectorTabData={sectorTabData}
        mapData={mapData}
        districtPivot={districtPivot}
        topDistricts={topDistricts}
        weakest={weakest}
        districtActions={districtActions}
        focus={focus}
        zeroCount={zeroCount}
      />
    </AppShell>
  );
}
