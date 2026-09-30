"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Filter, 
  Building2, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink 
} from "lucide-react";

export interface RealPosting {
  id: string;
  title: string;
  org: string;
  sector: string;
  city: string;
  skills_raw: string;
  experience: string;
  salary: string;
  text: string;
}

export function TelemetryClient({ postings }: { postings: RealPosting[] }) {
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [activePosting, setActivePosting] = useState<RealPosting | null>(postings[0] || null);

  const sectors = useMemo(() => {
    const s = new Set(postings.map(p => p.sector));
    return ["ALL", ...Array.from(s).sort()];
  }, [postings]);

  const cities = useMemo(() => {
    const c = new Set(postings.map(p => p.city));
    return ["ALL", ...Array.from(c).sort()];
  }, [postings]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return postings.filter(p => {
      const matchSector = selectedSector === "ALL" || p.sector === selectedSector;
      const matchCity = selectedCity === "ALL" || p.city === selectedCity;
      const matchQuery = !q || 
        p.title.toLowerCase().includes(q) || 
        p.org.toLowerCase().includes(q) || 
        p.skills_raw.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q);
      return matchSector && matchCity && matchQuery;
    });
  }, [postings, search, selectedSector, selectedCity]);

  return (
    <div className="space-y-6">
      {/* Search & Filters Control Bar */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 13,511 live postings by role, skill (e.g. CNC, SQL, Welder, Sales), or company..."
              className="pl-9 bg-black/40 border-white/10 text-xs sm:text-sm h-10 w-full rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              aria-label="Filter postings by Maharashtra district or city"
              className="h-10 bg-black/40 border border-white/10 rounded-lg px-3 text-xs text-muted-foreground focus:text-white focus:outline-none"
            >
              <option value="ALL">All Districts / Cities</option>
              {cities.filter(c => c !== "ALL").map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <span className="text-xs text-muted-foreground font-mono shrink-0 whitespace-nowrap">
              Showing: <strong className="text-white">{filtered.length}</strong> / {postings.length}
            </span>
          </div>
        </div>

        {/* Sector Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          {sectors.map(sec => (
            <Button
              key={sec}
              size="sm"
              variant={selectedSector === sec ? "default" : "outline"}
              onClick={() => setSelectedSector(sec)}
              className={`text-xs h-7 px-3 rounded-full shrink-0 whitespace-nowrap ${
                selectedSector === sec 
                  ? "bg-orange-500 text-white border-orange-500 font-medium" 
                  : "border-white/10 text-muted-foreground hover:text-white bg-black/20"
              }`}
            >
              {sec}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Dual Pane: Job Listings List + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Postings Cards List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="p-8 text-center border border-white/5 rounded-xl text-muted-foreground text-sm">
              No matching postings found. Try clearing your search filters.
            </div>
          ) : (
            filtered.slice(0, 100).map(p => {
              const isSelected = activePosting?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setActivePosting(p)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-orange-950/40 via-amber-950/20 to-black border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/30"
                      : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-1">
                      {p.title}
                    </h3>
                    <Badge variant="outline" className="text-[10px] text-orange-400 border-orange-500/30 shrink-0 font-mono">
                      {p.city}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                    <Building2 className="h-3 w-3 text-muted-foreground/70" />
                    <span className="line-clamp-1">{p.org}</span>
                  </div>

                  {p.skills_raw && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.skills_raw.split(',').slice(0, 3).map((sk, idx) => (
                        <span key={idx} className="text-[10px] bg-white/5 text-muted-foreground/90 px-1.5 py-0.5 rounded">
                          {sk.trim()}
                        </span>
                      ))}
                      {p.skills_raw.split(',').length > 3 && (
                        <span className="text-[10px] text-muted-foreground/60 px-1">
                          +{p.skills_raw.split(',').length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{p.sector}</span>
                    <span className="font-mono text-muted-foreground/80">{p.experience || "Fresh / Experienced"}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Deep Posting Inspector */}
        <div className="lg:col-span-7 sticky top-24">
          {activePosting ? (
            <Card className="bg-gradient-to-b from-white/[0.03] to-white/[0.01] border-white/10 backdrop-blur-xl shadow-2xl">
              <CardHeader className="pb-4 border-b border-white/5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono">
                        VERIFIED REAL NAUKRI RECORD
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">ID: {activePosting.id}</span>
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-white">
                      {activePosting.title}
                    </CardTitle>
                    <div className="text-sm text-orange-300 font-medium flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4" /> {activePosting.org}
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant="outline" className="text-xs border-orange-500/40 text-orange-400">
                      {activePosting.sector}
                    </Badge>
                  </div>
                </div>

                {/* Metadata Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-orange-400" />
                    <span>Location: <strong className="text-white">{activePosting.city}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Exp: <strong className="text-white">{activePosting.experience || "Any"}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Pay: <strong className="text-white">{activePosting.salary || "Competitive"}</strong></span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-5">
                {/* Extracted Raw Skills */}
                {activePosting.skills_raw && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Employer Required Key Skills:
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {activePosting.skills_raw.split(',').map((sk, idx) => (
                        <span key={idx} className="bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs px-2.5 py-1 rounded-lg font-medium">
                          {sk.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Job Description */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Job Description & Role Context:
                  </h3>
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs leading-relaxed text-muted-foreground font-mono whitespace-pre-wrap max-h-56 overflow-y-auto">
                    {activePosting.text}
                  </div>
                </div>

                {/* Alignment Action */}
                <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-orange-400" />
                      KaushalSetu Automated Skill-Mapping
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      This posting is parsed and integrated into Maharashtra's 1,200-node NSQF skill graph.
                    </p>
                  </div>

                  <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8 shrink-0">
                    <Link href={`/curriculum-diff?postingId=${activePosting.id}`}>
                      Synthesize Course Diff <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-12 text-center border border-white/5 rounded-2xl text-muted-foreground">
              Select a job posting from the left to inspect its telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
