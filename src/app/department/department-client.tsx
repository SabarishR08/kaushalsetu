"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  Activity, 
  GraduationCap, 
  AlertTriangle, 
  Target, 
  CheckCircle2, 
  FileText, 
  Lightbulb, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Search,
  Check
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectorDemandTabs, type SectorTabData } from "./sector-tabs";
import { DistrictMap, type DistrictDatum } from "./district-map";
import { DistrictDemandChart, DistrictSkillChart, type DistrictSkillRow } from "./district-charts";
import { PIPELINE_POSTINGS } from "@/lib/pipeline-meta";

export interface DepartmentClientProps {
  demand: any;
  alignment: any;
  skillNames: Record<string, string>;
  programSkillsList: string[];
  sectorTabData: SectorTabData[];
  mapData: DistrictDatum[];
  districtPivot: DistrictSkillRow[];
  topDistricts: any[];
  weakest: any[];
  districtActions: any[];
  focus: any;
  zeroCount: number;
}

const pct = (x: number) => `${Math.round(x * 100)}%`;

function coverageColor(c: number): string {
  if (c >= 0.8) return "text-emerald-400";
  if (c < 0.5) return "text-rose-400";
  return "text-amber-400";
}

function coverageBg(c: number): string {
  if (c >= 0.8) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
  if (c < 0.5) return "bg-rose-500/10 border-rose-500/20 text-rose-300";
  return "bg-amber-500/10 border-amber-500/20 text-amber-300";
}

export function DepartmentClient({
  demand,
  alignment,
  skillNames,
  programSkillsList,
  sectorTabData,
  mapData,
  districtPivot,
  topDistricts,
  weakest,
  districtActions,
  focus,
  zeroCount,
}: DepartmentClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "sectors" | "districts" | "programs">("overview");
  const [sectorSearch, setSectorSearch] = useState<string>("");

  const name = (id: string) => skillNames[id] ?? id;
  const programSkillsSet = new Set(programSkillsList);

  const filteredSectorCoverage = alignment.sectorCoverage.filter((s: any) =>
    s.sector.toLowerCase().includes(sectorSearch.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* Sleek Page Header - Without Duplicate Navigation Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge className="bg-orange-500/15 text-orange-300 border-orange-500/30 text-xs font-semibold px-2.5 py-0.5">
              State Policy Cockpit
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              SIH26134 • Maharashtra Skills Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Skilling Alignment Dashboard
          </h1>
          <p className="text-sm text-muted-foreground/90 mt-1 max-w-2xl leading-relaxed">
            Live sensing of {demand.meta.postings.toLocaleString("en-IN")} authentic Maharashtra vacancies mapped against institutional programs to detect gaps and guide policy.
          </p>
        </div>

        {/* Clean, Non-Duplicative Action Area */}
        <div className="flex items-center gap-3">
          <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold h-10 px-4 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.25)]">
            <Link href="/department/report">
              <FileText className="mr-2 h-4 w-4" /> Export Printable Briefing
            </Link>
          </Button>
        </div>
      </div>

      {/* Clean View Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Executive Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("sectors")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "sectors"
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Sector Gap Matrix ({alignment.sectorCoverage.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("districts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "districts"
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>36-District Geography</span>
        </button>

        <button
          onClick={() => setActiveTab("programs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "programs"
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Curriculum Alignment ({alignment.meta.programs})</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: EXECUTIVE COCKPIT OVERVIEW */}
      {/* ==================================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Executive KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card relative overflow-hidden group border-white/10 hover:border-orange-500/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all pointer-events-none" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Postings Analysed</CardTitle>
                  <Activity className="h-4 w-4 text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{demand.meta.postings.toLocaleString("en-IN")}</div>
                <p className="text-xs text-muted-foreground/80 mt-1.5 flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {demand.meta.tagger} tagger · {demand.meta.sectors} industrial sectors
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card relative overflow-hidden group border-white/10 hover:border-cyan-500/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Programs in Catalog</CardTitle>
                  <GraduationCap className="h-4 w-4 text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{alignment.meta.programs}</div>
                <p className="text-xs text-muted-foreground/80 mt-1.5">
                  Accredited vocational courses mapped to topological skill DAG
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card relative overflow-hidden group border-white/10 hover:border-rose-500/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Uncovered Skills</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-rose-400">{alignment.uncoveredSkills.length}</div>
                <p className="text-xs text-rose-300/80 mt-1.5">
                  High market demand with 0% institutional syllabus coverage
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card relative overflow-hidden group border-white/10 hover:border-amber-500/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Lowest Sector Coverage</CardTitle>
                  <Target className="h-4 w-4 text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${coverageColor(weakest[0]?.coverage ?? 1)}`}>
                  {weakest[0] ? pct(weakest[0].coverage) : "—"}
                </div>
                <p className="text-xs text-muted-foreground/80 mt-1.5 truncate">
                  {weakest[0]?.sector ?? "—"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Strategic Recommendations Card */}
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-400" />
                <CardTitle className="text-base sm:text-lg font-bold text-white">
                  High-Priority Secretariat Policy Recommendations
                </CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                Actionable interventions computed by comparing live market hiring vs ITI training catalogs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {alignment.recommendations.slice(0, 4).map((r: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-snug">{r.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sector-Level Skill Demand & Coverage Charts */}
          <div className="mb-2">
            <SectorDemandTabs tabs={sectorTabData} skillNames={skillNames} />
          </div>

          {/* District Heatmap (All 36 Districts) + Visual Charts */}
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold text-white">
                    District-level demand heatmap (all 36 districts)
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Multi-district attribution across Maharashtra · {zeroCount} districts identified as critical skill deserts.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-orange-500/30 text-orange-300 text-xs hidden sm:inline-flex">
                  36 Districts Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DistrictMap data={mapData} />
              
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="h-72">
                  <DistrictDemandChart
                    data={[...mapData]
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

          {/* Focus Comparison (Pune vs Mumbai) */}
          {focus && focus.rows?.length ? (
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-white">
                  Focus: {focus.districts[0]} ({pct(focus.coverages[0])} coverage) vs {focus.districts[1]} ({pct(focus.coverages[1])})
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                  The same vocational catalog leaves divergent curriculum gaps based on regional industry makeup.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="py-2.5 px-3">Skill Demand</th>
                        <th className="py-2.5 px-3">{focus.districts[0]} Demand</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">{focus.districts[1]} Demand</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {focus.rows.slice(0, 6).map((r: any) => (
                        <tr key={r.skillId} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 px-3 font-medium text-white">{name(r.skillId)}</td>
                          <td className="py-2.5 px-3 text-muted-foreground">{r.aDemand} ({pct(r.aShare)})</td>
                          <td className="py-2.5 px-3">
                            {r.aMissing ? (
                              <Badge variant="destructive" className="text-xs px-2 py-0.5">Missing</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5">Covered</Badge>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">{r.bDemand} ({pct(r.bShare)})</td>
                          <td className="py-2.5 px-3">
                            {r.bMissing ? (
                              <Badge variant="destructive" className="text-xs px-2 py-0.5">Missing</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5">Covered</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: SECTOR GAP MATRIX & UNCOVERED SKILLS */}
      {/* ==================================================================== */}
      {activeTab === "sectors" && (
        <div className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-bold text-white">
                    Sector-wise Competency Gap Detection
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Percentage of top-12 market demand covered by existing state vocational courses.
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Filter sectors..."
                    value={sectorSearch}
                    onChange={(e) => setSectorSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4">Industry Sector</th>
                      <th className="py-3 px-4">Vacancies</th>
                      <th className="py-3 px-4">Curriculum Coverage</th>
                      <th className="py-3 px-4">In-Demand Skills Taught</th>
                      <th className="py-3 px-4">Missing Skills (Curriculum Gaps)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredSectorCoverage.map((s: any) => {
                      const missing = s.topSkills.filter((id: string) => !s.coveredSkills.includes(id));
                      return (
                        <tr key={s.sector} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">{s.sector}</td>
                          <td className="py-3 px-4 text-muted-foreground">{s.postings.toLocaleString("en-IN")}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${coverageBg(s.coverage)}`}>
                              {pct(s.coverage)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1.5 max-w-sm">
                              {s.coveredSkills.slice(0, 5).map((id: string) => (
                                <Badge key={id} variant="secondary" className="text-xs bg-white/5 border-white/10 text-zinc-300 font-medium px-2 py-0.5">
                                  {name(id)}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1.5 max-w-sm">
                              {missing.length ? (
                                missing.slice(0, 5).map((id: string) => (
                                  <Badge key={id} variant="destructive" className="text-xs font-medium px-2 py-0.5">
                                    {name(id)}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                                  <Check className="h-3 w-3" /> Fully covered
                                </span>
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

          {/* Uncovered Skills Registry */}
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                <CardTitle className="text-base sm:text-lg font-bold text-white">
                  Uncovered High-Demand Skills Registry ({alignment.uncoveredSkills.length})
                </CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                High hiring frequency across Maharashtra with 0% formal representation in standard ITI syllabi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {alignment.uncoveredSkills.map((g: any) => (
                  <div key={g.skillId} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-rose-500/30 transition-colors">
                    <div className="text-xs font-bold text-white leading-snug">{name(g.skillId)}</div>
                    <div className="text-xs text-rose-400 font-mono mt-1">
                      {g.demand} active posting{g.demand === 1 ? "" : "s"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: 36-DISTRICT GEOGRAPHY & ACTION PLANS */}
      {/* ==================================================================== */}
      {activeTab === "districts" && (
        <div className="space-y-6">
          {/* Actionable District Priority Plans */}
          <Card className="glass-card border-amber-500/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-400" />
                <CardTitle className="text-base sm:text-lg font-bold text-white">
                  District-Specific Conversion Actions
                </CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                Districts ranked by actionable vacancies that convert into placements when priority bridge modules are taught.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {districtActions.map((d: any) => (
                  <div key={d.district} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-amber-500/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-white">{d.district}</span>
                      <span className="text-xs sm:text-sm font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                        ~{d.uncoveredPostings.toLocaleString("en-IN")} Actionable Vacancies
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {d.missingDetail.slice(0, 4).map((m: any) => (
                        <Badge key={m.skillId} variant="destructive" className="text-xs px-2 py-0.5">
                          {name(m.skillId)} ({Math.round(m.share * 100)}% demand)
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                      Recommended: deploy a 30-hour bridge module for <strong className="text-white">{name(d.missingDetail[0]?.skillId)}</strong> at {d.district} ITI centers to increase coverage from {pct(d.coverage)}.
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Full District Coverage Table */}
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg font-bold text-white">
                All 36 Districts Coverage Breakdown
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                Local demand concentration and missing skills across industrial centers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="py-2.5 px-4">District</th>
                      <th className="py-2.5 px-4">Postings</th>
                      <th className="py-2.5 px-4">Coverage</th>
                      <th className="py-2.5 px-4">Missing Priority Skills</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {alignment.districtCoverage?.map((d: any) => (
                      <tr key={d.district} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-white">{d.district}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">{d.postings}</td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${coverageBg(d.coverage)}`}>
                            {pct(d.coverage)}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {d.missingDetail?.length ? (
                              d.missingDetail.slice(0, 3).map((m: any) => (
                                <Badge key={m.skillId} variant="destructive" className="text-xs px-2 py-0.5">
                                  {name(m.skillId)} ({Math.round(m.share * 100)}%)
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">No significant deficit</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: VOCATIONAL PROGRAM & CATALOG ALIGNMENT */}
      {/* ==================================================================== */}
      {activeTab === "programs" && (
        <div className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg font-bold text-white">
                Most Market-Aligned Vocational Courses
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                Ranked by share of live industrial skill mass taught by each CTS / CITS course.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4">Course Title & Trade Code</th>
                      <th className="py-3 px-4">Market Alignment</th>
                      <th className="py-3 px-4">Best-Fit Sector</th>
                      <th className="py-3 px-4">Core Skills Taught</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {alignment.programAlignment.slice(0, 12).map((p: any) => (
                      <tr key={p.courseId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{p.title}</div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">{p.courseId}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                              {pct(p.alignment)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs font-medium text-orange-300">
                          {p.bestSector}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1.5 max-w-md">
                            {p.skills.slice(0, 6).map((id: string) => (
                              <Badge key={id} variant="secondary" className="text-xs bg-white/5 border-white/10 text-zinc-300 font-medium px-2 py-0.5">
                                {name(id)}
                              </Badge>
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
        </div>
      )}
    </div>
  );
}
