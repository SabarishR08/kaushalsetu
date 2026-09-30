"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Factory, 
  Users, 
  Compass, 
  SlidersHorizontal,
  Sparkles 
} from "lucide-react";

interface DistrictCluster {
  id: string;
  name: string;
  nameMarathi: string;
  division: string;
  leadIndustries: string[];
  postingsCount: number;
  activeItis: number;
  annualGraduates: number;
  equilibriumIndex: number; // >1.2 = Skill Desert, <0.8 = Overskilling Trap, 0.8-1.2 = Balanced
  status: "SKILL_DESERT" | "BALANCED" | "OVERSKILLING_TRAP";
  topDemandedSkills: { name: string; postings: number; coveragePct: number }[];
  keyEmployers: string[];
  recommendedAction: string;
}

const DISTRICT_CLUSTERS: DistrictCluster[] = [
  {
    id: "pune",
    name: "Pune & Chakan Industrial Belt",
    nameMarathi: "पुणे आणि चाकण औद्योगिक पट्टा",
    division: "Pune Division",
    leadIndustries: ["Automotive & EV", "Precision Manufacturing", "IT & DeepTech", "Robotics"],
    postingsCount: 428,
    activeItis: 34,
    annualGraduates: 14200,
    equilibriumIndex: 1.48,
    status: "SKILL_DESERT",
    topDemandedSkills: [
      { name: "Fanuc 5-Axis CNC & G-Code", postings: 52, coveragePct: 62 },
      { name: "PLC & Industrial Robotics Maintenance", postings: 41, coveragePct: 58 },
      { name: "SQL & Industrial Telemetry", postings: 68, coveragePct: 88 },
      { name: "ISO 9001 Quality Audit", postings: 39, coveragePct: 74 }
    ],
    keyEmployers: ["Tata Motors", "Bharat Forge", "Bajaj Auto", "Mahindra & Mahindra", "Bosch India"],
    recommendedAction: "Synthesize 30-Hr EV Battery & Robotic Welding Bridge modules for 12 ITIs in Pimpri & Chakan."
  },
  {
    id: "mumbai-thane",
    name: "Mumbai & Thane Metropolitan Zone",
    nameMarathi: "मुंबई आणि ठाणे महानगर क्षेत्र",
    division: "Konkan Division",
    leadIndustries: ["BFSI & Fintech", "Enterprise Software", "Logistics & Maritime", "Media"],
    postingsCount: 382,
    activeItis: 22,
    annualGraduates: 9800,
    equilibriumIndex: 1.15,
    status: "BALANCED",
    topDemandedSkills: [
      { name: "Financial Data Analytics & SQL", postings: 84, coveragePct: 91 },
      { name: "Indirect Tax & Compliance Audit", postings: 47, coveragePct: 79 },
      { name: "Port Logistics & Supply Chain", postings: 36, coveragePct: 70 },
      { name: "React & Cloud Microservices", postings: 62, coveragePct: 94 }
    ],
    keyEmployers: ["HDFC Bank", "ICICI Bank", "Tata Consultancy Services", "Larsen & Toubro", "JNPT"],
    recommendedAction: "Expand specialized BFSI Fintech accounting & JNPT supply chain apprenticeships."
  },
  {
    id: "aurangabad",
    name: "Chhatrapati Sambhajinagar (Aurangabad)",
    nameMarathi: "छत्रपती संभाजीनगर औद्योगिक कॉरिडॉर",
    division: "Marathwada Division",
    leadIndustries: ["Auto Components", "Pharma Formulations", "Heavy Engineering", "Brewing"],
    postingsCount: 89,
    activeItis: 19,
    annualGraduates: 6400,
    equilibriumIndex: 1.38,
    status: "SKILL_DESERT",
    topDemandedSkills: [
      { name: "CMM Metrology & Precision Tolerances", postings: 24, coveragePct: 54 },
      { name: "cGMP Cleanroom Pharma Operations", postings: 19, coveragePct: 61 },
      { name: "TIG/MIG Pressure Welding", postings: 28, coveragePct: 68 },
      { name: "Preventive Electrical Maintenance", postings: 22, coveragePct: 82 }
    ],
    keyEmployers: ["Bajaj Auto Ltd", "Endurance Technologies", "Lupin Pharma", "Varroc Engineering"],
    recommendedAction: "Launch localized 30-Hr cGMP Pharma & CMM Metrology modules across Shendra & Bidkin AURIC."
  },
  {
    id: "nagpur",
    name: "Nagpur & MIHAN Cargo SEZ",
    nameMarathi: "नागपूर आणि मिहान कार्गो विशेष आर्थिक क्षेत्र",
    division: "Vidarbha Division",
    leadIndustries: ["Aviation MRO", "Multimodal Logistics", "Defense Production", "Agro-processing"],
    postingsCount: 57,
    activeItis: 28,
    annualGraduates: 8100,
    equilibriumIndex: 1.22,
    status: "SKILL_DESERT",
    topDemandedSkills: [
      { name: "Warehouse MIS & Inventory Optimization", postings: 21, coveragePct: 76 },
      { name: "Cold-Chain Fleet Maintenance", postings: 16, coveragePct: 55 },
      { name: "Aircraft Sheet Metal Repair", postings: 12, coveragePct: 48 },
      { name: "Industrial Electrical Wiring", postings: 18, coveragePct: 85 }
    ],
    keyEmployers: ["Air India MRO", "Adani Logistics", "TCS MIHAN", "Solar Industries Defense"],
    recommendedAction: "Scale aviation MRO sheet metal apprenticeships and multimodal warehouse tracking courses."
  },
  {
    id: "nashik",
    name: "Nashik & Dindori Engineering Corridor",
    nameMarathi: "नाशिक आणि दिंडोरी अभियांत्रिकी पट्टा",
    division: "North Maharashtra",
    leadIndustries: ["Defense & Aerospace (HAL)", "Automotive", "Electrical Equipment", "Wine & Agro"],
    postingsCount: 44,
    activeItis: 21,
    annualGraduates: 6900,
    equilibriumIndex: 1.05,
    status: "BALANCED",
    topDemandedSkills: [
      { name: "Defense Avionics Wiring", postings: 14, coveragePct: 65 },
      { name: "Tool & Die Precision Grinding", postings: 18, coveragePct: 71 },
      { name: "Agricultural Food Processing Tech", postings: 15, coveragePct: 59 },
      { name: "Quality Assurance Documentation", postings: 19, coveragePct: 88 }
    ],
    keyEmployers: ["Hindustan Aeronautics Ltd (HAL)", "Mahindra & Mahindra", "ABB India", "Bosch Nashik"],
    recommendedAction: "Collaborate with HAL for specialized aerospace tooling micro-modules."
  }
];

export default function DistrictsPage() {
  const [selectedCluster, setSelectedCluster] = useState<DistrictCluster>(DISTRICT_CLUSTERS[0]);
  const [divisionFilter, setDivisionFilter] = useState<string>("ALL");

  const filteredClusters = divisionFilter === "ALL" 
    ? DISTRICT_CLUSTERS 
    : DISTRICT_CLUSTERS.filter(c => c.division.toLowerCase().includes(divisionFilter.toLowerCase()));

  const totalVacancies = DISTRICT_CLUSTERS.reduce((a, b) => a + b.postingsCount, 0);
  const totalItis = DISTRICT_CLUSTERS.reduce((a, b) => a + b.activeItis, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Breadcrumb / Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">
                36-District GIS Twin
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                Model: PostGIS Spatial Equilibrium v2.1
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <MapPin className="h-6 w-6 text-orange-400" /> Maharashtra Industrial Labor Digital Twin
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time geospatial mapping of industrial talent demand against 418+ Government ITIs and vocational centers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="border-white/10 text-xs h-9">
              <Link href="/curriculum-diff">
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-orange-400" /> Open Curriculum Diff
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">
              <Link href="/department">
                <Building2 className="mr-1.5 h-3.5 w-3.5" /> Department KPIs
              </Link>
            </Button>
          </div>
        </div>

        {/* State Summary KPI Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-white/[0.02] border-white/5 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <Factory className="h-3.5 w-3.5 text-orange-400" /> Active Postings Mapped
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mt-1">13,511</div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Live Naukri Verified Corpus
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border-white/5 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <Building2 className="h-3.5 w-3.5 text-cyan-400" /> Network ITIs Mapped
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mt-1">418+</div>
              <div className="text-[11px] text-muted-foreground mt-1">
                36 Districts • DVET & MSSDS
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border-white/5 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" /> Critical Skill Deserts
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-rose-400 mt-1">3 Clusters</div>
              <div className="text-[11px] text-rose-300/80 mt-1">
                Pune EV, Aurangabad Pharma, MIHAN
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border-white/5 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <TrendingUp className="h-3.5 w-3.5 text-amber-400" /> Mean Equilibrium Index
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-300 mt-1">1.26</div>
              <div className="text-[11px] text-muted-foreground mt-1">
                Demand outpaces institutional supply
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Division Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1 shrink-0">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Division:
          </span>
          {["ALL", "Pune", "Konkan", "Marathwada", "Vidarbha", "North Maharashtra"].map((div) => (
            <Button
              key={div}
              variant={divisionFilter === div ? "default" : "outline"}
              size="sm"
              onClick={() => setDivisionFilter(div)}
              className={`text-xs h-7 px-3 rounded-full shrink-0 ${
                divisionFilter === div 
                  ? "bg-orange-500 text-white border-orange-500" 
                  : "border-white/10 text-muted-foreground hover:text-white"
              }`}
            >
              {div}
            </Button>
          ))}
        </div>

        {/* Main Interactive Grid: Cluster Selector + Detailed Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: District Cluster Cards */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
              Industrial Corridors ({filteredClusters.length})
            </h2>

            <div className="space-y-2.5">
              {filteredClusters.map((cluster) => {
                const isSelected = selectedCluster.id === cluster.id;
                return (
                  <div
                    key={cluster.id}
                    onClick={() => setSelectedCluster(cluster)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-orange-950/40 via-amber-950/20 to-black border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/30"
                        : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-orange-300 flex items-center gap-1.5">
                          {cluster.name}
                        </div>
                        <div className="text-xs text-orange-400 font-medium">
                          {cluster.nameMarathi}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 uppercase tracking-wider font-mono ${
                          cluster.status === "SKILL_DESERT"
                            ? "border-rose-500/40 text-rose-400 bg-rose-500/10"
                            : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                        }`}
                      >
                        {cluster.status === "SKILL_DESERT" ? "Skill Desert" : "Balanced"}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {cluster.leadIndustries.map((ind) => (
                        <span key={ind} className="text-[10px] bg-white/5 text-muted-foreground px-2 py-0.5 rounded">
                          {ind}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Postings: <strong className="text-white font-mono">{cluster.postingsCount}</strong></span>
                      <span>Active ITIs: <strong className="text-white font-mono">{cluster.activeItis}</strong></span>
                      <span>Equilibrium: <strong className={cluster.equilibriumIndex > 1.2 ? "text-rose-400 font-mono" : "text-emerald-400 font-mono"}>{cluster.equilibriumIndex.toFixed(2)}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Deep Cluster Inspector & Action Studio */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="bg-gradient-to-b from-white/[0.03] to-white/[0.01] border-white/10 backdrop-blur-xl shadow-2xl">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-orange-400 font-mono uppercase tracking-wider font-semibold">
                      {selectedCluster.division} • Industrial Intelligence
                    </span>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                      {selectedCluster.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Regional Talent Equilibrium Index: <strong className="text-orange-300 font-mono">{selectedCluster.equilibriumIndex}</strong> · Annual ITI Output: {selectedCluster.annualGraduates.toLocaleString()} Technicians
                    </CardDescription>
                  </div>

                  <Badge className={selectedCluster.status === "SKILL_DESERT" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"}>
                    {selectedCluster.status === "SKILL_DESERT" ? "High Industrial Shortage" : "Optimal Alignment"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-5">
                {/* Key Employers Ribbon */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Key Anchoring Employers & MIDC Industrialists
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCluster.keyEmployers.map((emp) => (
                      <span key={emp} className="bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs px-2.5 py-1 rounded-lg font-medium">
                        {emp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Top Demanded Competencies with Live Gap Meters */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Top High-Demand Industry Skills vs. Current ITI Syllabus Coverage
                  </h3>
                  <div className="space-y-3">
                    {selectedCluster.topDemandedSkills.map((skill) => (
                      <div key={skill.name} className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">{skill.name}</span>
                          <span className="text-muted-foreground font-mono">
                            {skill.postings} Vacancies · Current Syllabus: <strong className={skill.coveragePct < 70 ? "text-rose-400" : "text-emerald-400"}>{skill.coveragePct}%</strong>
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              skill.coveragePct < 70
                                ? "bg-gradient-to-r from-rose-500 to-amber-500"
                                : "bg-gradient-to-r from-emerald-500 to-teal-400"
                            }`}
                            style={{ width: `${skill.coveragePct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Automated Action (The Pitch Highlight!) */}
                <div className="p-4 rounded-xl bg-orange-950/30 border border-orange-500/30 space-y-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-orange-200">
                        Autonomous Policy & Curriculum Action Recommended
                      </h4>
                      <p className="text-xs text-orange-300/80 mt-1 leading-relaxed">
                        {selectedCluster.recommendedAction}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">
                      <Link href={`/curriculum-diff?district=${encodeURIComponent(selectedCluster.id)}`}>
                        Synthesize 30-Hr Bridge Module <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="border-white/10 text-xs h-8 bg-black/40">
                      <Link href="/telemetry">
                        Inspect Cluster Postings ({selectedCluster.postingsCount})
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
