import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, FileText, GraduationCap, Lightbulb, Target, MapPin, Sparkles, Activity, ShieldCheck, Mic } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemandChart, SectorCoverageChart } from "./charts";
import { DistrictMap } from "./district-map";
import { DistrictDemandChart, DistrictSkillChart, type DistrictSkillRow } from "./district-charts";
import { ALL_DISTRICTS } from "@/lib/geo/districts";
import { getDepartmentData } from "@/lib/dept-data";

export const dynamic = "force-dynamic";

const pct = (x: number) => `${Math.round(x * 100)}%`;

function coverageClass(c: number): string {
  if (c >= 0.8) return "text-green-500";
  if (c < 0.5) return "text-red-500";
  return "text-amber-500";
}

export default async function DepartmentPage() {
  const { demand, alignment, skillNames } = await getDepartmentData();

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
              <p>Drop a real jobs corpus (Kaggle CSV) into <code>data/jobs/raw/</code> and re-run to refresh the demand signal on live data.</p>
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
  const topDemand = demand.overall.slice(0, 10);
  const weakest = [...alignment.sectorCoverage].sort((a, b) => a.coverage - b.coverage).slice(0, 5);

  // District layer: choropleth over all 36 districts — zero-demand districts
  // are the "skill deserts" and must appear on the map. Multi-district
  // postings credit every listed district, so counts sum above the total.
  const districtList = demand.districts.filter((d) => d.district !== "Unattributed");
  const mapData = districtList.map((d) => ({
    district: d.district,
    postings: d.postings,
    topSkills: d.topSkills.slice(0, 3).map((s) => name(s.skillId)),
  }));
  const zeroCount = ALL_DISTRICTS.filter((n) => !districtList.some((d) => d.district === n)).length;
  const topDistricts = districtList.filter((d) => d.postings >= 20).slice(0, 4);
  const focus = alignment.focusComparison;
  const districtPivot: DistrictSkillRow[] = demand.overall.slice(0, 8).map((s) => {
    const row: DistrictSkillRow = { skill: name(s.skillId) };
    for (const d of topDistricts) {
      row[d.district] = d.topSkills.find((t) => t.skillId === s.skillId)?.demand ?? 0;
    }
    return row;
  });

  return (
    <AppShell>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">
                State Administration Cockpit
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                SIH26134 • Government of Maharashtra
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Department Dashboard — Skilling Alignment
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Live sensing of {demand.meta.postings.toLocaleString("en-IN")} real Maharashtra postings → automated gap detection → recommendations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm" className="border-white/10 text-xs h-9 bg-black/40">
              <Link href="/districts">
                <MapPin className="mr-1.5 h-3.5 w-3.5 text-orange-400" /> 36-District GIS Twin
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="border-white/10 text-xs h-9 bg-black/40">
              <Link href="/curriculum-diff">
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-orange-400" /> Curriculum Diff
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="border-white/10 text-xs h-9 bg-black/40">
              <Link href="/telemetry">
                <Activity className="mr-1.5 h-3.5 w-3.5 text-emerald-400" /> 1,000 Postings
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">
              <Link href="/department/report">
                <FileText className="mr-1.5 h-3.5 w-3.5" /> Printable Report
              </Link>
            </Button>
          </div>
        </div>

      {/* KPI row */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Postings analysed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{demand.meta.postings}</div>
            <p className="text-xs text-muted-foreground">
              {demand.meta.tagger} tagger · {demand.meta.sectors} sectors
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Programs in catalog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{alignment.meta.programs}</div>
            <p className="text-xs text-muted-foreground">course/program supply tagged on the same skill graph</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uncovered in-demand skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{alignment.uncoveredSkills.length}</div>
            <p className="text-xs text-muted-foreground">demanded in postings, taught by no program</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weakest sector coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${coverageClass(weakest[0]?.coverage ?? 1)}`}>
              {weakest[0] ? pct(weakest[0].coverage) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">{weakest[0]?.sector ?? "—"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top skill demand (all sectors)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <DemandChart
              data={topDemand.map((s) => ({ name: name(s.skillId), demand: s.demand }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Coverage of top demand mass by sector</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <SectorCoverageChart
              data={[...alignment.sectorCoverage]
                .sort((a, b) => b.postings - a.postings)
                .map((s) => ({ name: s.sector, coverage: Math.round(s.coverage * 100) }))}
            />
          </CardContent>
        </Card>
      </div>

      {/* District-level demand: choropleth + bars */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">District-level demand heatmap (all 36 districts)</CardTitle>
          <p className="text-xs text-muted-foreground">
            Postings attribute to every district they list, so counts sum above the total · {zeroCount} districts show zero demand in this corpus — the skill deserts
          </p>
        </CardHeader>
        <CardContent>
          <DistrictMap data={mapData} />
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="h-72">
              <DistrictDemandChart
                data={[...districtList]
                  .sort((a, b) => b.postings - a.postings)
                  .slice(0, 12)
                  .map((d) => ({ name: d.district, postings: d.postings }))}
              />
            </div>
            <div className="h-72">
              <DistrictSkillChart data={districtPivot} districts={topDistricts.map((d) => d.district)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sector coverage table */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Sector-wise gap detection</CardTitle>
          <p className="text-xs text-muted-foreground">
            Coverage = share of the sector&apos;s top-12 demand mass taught by at least one current program
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4">Sector</th>
                  <th className="py-2 pr-4">Postings</th>
                  <th className="py-2 pr-4">Coverage</th>
                  <th className="py-2 pr-4">In-demand skills taught</th>
                  <th className="py-2">In-demand skills missing</th>
                </tr>
              </thead>
              <tbody>
                {alignment.sectorCoverage.map((s) => {
                  const missing = s.topSkills.filter((id) => !s.coveredSkills.includes(id));
                  return (
                    <tr key={s.sector} className="border-b last:border-0 align-top">
                      <td className="py-2 pr-4 font-medium">{s.sector}</td>
                      <td className="py-2 pr-4">{s.postings}</td>
                      <td className={`py-2 pr-4 font-semibold ${coverageClass(s.coverage)}`}>{pct(s.coverage)}</td>
                      <td className="py-2 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {s.coveredSkills.slice(0, 6).map((id) => (
                            <Badge key={id} variant="secondary" className="text-[11px]">{name(id)}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-1">
                          {missing.length ? (
                            missing.slice(0, 6).map((id) => (
                              <Badge key={id} variant="destructive" className="text-[11px]">{name(id)}</Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">none in top 12</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Uncovered skills */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Uncovered in-demand skills</CardTitle>
          <p className="text-xs text-muted-foreground">Appearing in postings but absent from every current program</p>
        </CardHeader>
        <CardContent>
          {alignment.uncoveredSkills.length ? (
            <div className="flex flex-wrap gap-2">
              {alignment.uncoveredSkills.map((g) => (
                <Badge key={g.skillId} variant="destructive" className="text-xs">
                  {name(g.skillId)} · {g.demand} posting{g.demand === 1 ? "" : "s"}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" /> Every in-demand skill is taught somewhere in the catalog.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Per-district coverage & focus comparison */}
      {alignment.districtCoverage?.length ? (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">District coverage &amp; what each city is missing</CardTitle>
            <p className="text-xs text-muted-foreground">
              Same catalog everywhere — differences come from local industry mix. Missing = top-demand skill (≥15% of the district&apos;s postings) taught by no program
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4">District</th>
                    <th className="py-2 pr-4">Postings</th>
                    <th className="py-2 pr-4">Coverage</th>
                    <th className="py-2">Missing in-demand skills</th>
                  </tr>
                </thead>
                <tbody>
                  {alignment.districtCoverage.slice(0, 12).map((d) => (
                    <tr key={d.district} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{d.district}</td>
                      <td className="py-2 pr-4">{d.postings}</td>
                      <td className={`py-2 pr-4 font-semibold ${coverageClass(d.coverage)}`}>{pct(d.coverage)}</td>
                      <td className="py-2">
                        {d.missingSkills.length ? (
                          <div className="flex flex-wrap gap-1">
                            {d.missingSkills.slice(0, 4).map((id) => (
                              <Badge key={id} variant="destructive" className="text-[11px]">{name(id)}</Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">none in top 12</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {focus && focus.rows.length ? (
              <div className="mt-6 rounded-lg border p-4">
                <p className="text-sm font-medium">
                  Focus: {focus.districts[0]} ({pct(focus.coverages[0])} coverage) vs {focus.districts[1]} ({pct(focus.coverages[1])})
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Divergent rows are the per-city story: the same catalog leaves different holes in different cities.
                </p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-1.5 pr-4">Skill</th>
                        <th className="py-1.5 pr-4">{focus.districts[0]}</th>
                        <th className="py-1.5 pr-4">Gap?</th>
                        <th className="py-1.5 pr-4">{focus.districts[1]}</th>
                        <th className="py-1.5">Gap?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {focus.rows.map((r) => (
                        <tr key={r.skillId} className="border-b last:border-0">
                          <td className="py-1.5 pr-4 font-medium">{name(r.skillId)}</td>
                          <td className="py-1.5 pr-4">{r.aDemand} ({pct(r.aShare)})</td>
                          <td className="py-1.5 pr-4">
                            {r.aMissing ? <Badge variant="destructive" className="text-[11px]">missing</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                          </td>
                          <td className="py-1.5 pr-4">{r.bDemand} ({pct(r.bShare)})</td>
                          <td className="py-1.5">
                            {r.bMissing ? <Badge variant="destructive" className="text-[11px]">missing</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Recommendations */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alignment.recommendations.length ? (
            alignment.recommendations.map((r, i) => (
              <div key={i} className="flex gap-3 rounded-lg border p-3">
                {r.type === "add-program" ? (
                  <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                ) : (
                  <Target className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
                )}
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-sm text-muted-foreground">{r.detail}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No critical gaps detected with the current demand signal.</p>
          )}
        </CardContent>
      </Card>

      {/* Best-aligned programs */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Most market-aligned programs</CardTitle>
          <p className="text-xs text-muted-foreground">Share of overall in-demand skill mass each program covers</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4">Program</th>
                  <th className="py-2 pr-4">Alignment</th>
                  <th className="py-2 pr-4">Best-fit sector</th>
                  <th className="py-2">Skills taught</th>
                </tr>
              </thead>
              <tbody>
                {alignment.programAlignment.slice(0, 10).map((p) => (
                  <tr key={p.courseId} className="border-b last:border-0 align-top">
                    <td className="py-2 pr-4">
                      <span className="font-medium">{p.title}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{p.courseId}</span>
                    </td>
                    <td className="py-2 pr-4 font-semibold">{pct(p.alignment)}</td>
                    <td className="py-2 pr-4">{p.bestSector}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-1">
                        {p.skills.map((id) => (
                          <Badge key={id} variant="secondary" className="text-[11px]">{name(id)}</Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer provenance note */}
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Demand signal built from {demand.meta.postings} postings ({demand.meta.source}
        {demand.meta.source.startsWith("maharashtra_seed") ? " — labeled synthetic seed; drop a Kaggle corpus into data/jobs/raw/ to re-run on real postings" : ""}).
        Alignment scoring is deterministic given the tagged demand and catalog.
      </p>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <GraduationCap className="h-4 w-4" />
        KaushalSetu · closed-loop skilling alignment for Maharashtra · built on the PathFinder evidence pipeline
      </div>
      </div>
    </AppShell>
  );
}
