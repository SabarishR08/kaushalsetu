import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Compass, 
  Building2, 
  MapPin, 
  Sparkles, 
  Activity, 
  Route, 
  Mic, 
  ShieldCheck, 
  CheckCircle2, 
  Cpu 
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-foreground overflow-x-hidden selection:bg-orange-500/30 selection:text-orange-200">
      <Script
        id="passport-forward"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `const p = new URLSearchParams(window.location.search); const t = p.get('shareToken') || p.get('token') || p.get('passport') || p.get('passportId'); if (t) window.location.replace('/dashboard?shareToken=' + encodeURIComponent(t));`,
        }}
      />

      {/* Ambient background glows */}
      <div className="absolute top-1/6 left-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Govt Bar */}
      <div className="bg-gradient-to-r from-orange-950/40 via-amber-900/20 to-orange-950/40 border-b border-orange-500/10 px-3 py-1.5 text-center text-xs font-medium text-orange-200/90 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>महाराष्ट्र शासन • Department of Skills, Employment, Entrepreneurship & Innovation (SIH26134)</span>
        <Badge variant="outline" className="border-orange-500/30 text-orange-300 text-xs py-0 px-2 h-5 ml-1">
          13,511 Real Postings Ingested
        </Badge>
      </div>

      {/* Master Nav */}
      <header className="sticky top-0 w-full backdrop-blur-xl border-b border-white/5 z-50 bg-black/85">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)] group-hover:border-orange-500/60 transition-colors">
              <Compass className="h-5 w-5 text-orange-400 group-hover:rotate-45 transition-transform duration-300" />
            </span>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-base sm:text-lg bg-gradient-to-r from-orange-400 via-amber-200 to-white bg-clip-text text-transparent">
                कौशलसेतू <span className="font-semibold text-xs sm:text-sm text-muted-foreground ml-1">KaushalSetu</span>
              </span>
              <span className="text-xs text-muted-foreground/80 tracking-wide font-mono -mt-0.5">
                MH Skilling & Labor Intelligence
              </span>
            </div>
          </Link>

          {/* Navigation Links with High Readability */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <Button asChild variant="ghost" size="sm" className="text-xs xl:text-sm font-semibold h-9 text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl">
              <Link href="/department">State Cockpit</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs xl:text-sm font-semibold h-9 text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl">
              <Link href="/districts">36-District GIS</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs xl:text-sm font-semibold h-9 text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl">
              <Link href="/curriculum-diff">Curriculum Diff</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs xl:text-sm font-semibold h-9 text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl">
              <Link href="/telemetry">Live Telemetry</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs xl:text-sm font-semibold h-9 text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl">
              <Link href="/path">Skill Roadmap</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs xl:text-sm font-semibold h-9 text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl">
              <Link href="/voice-sahayak">Voice Sahayak</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs xl:text-sm font-semibold h-9 text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl">
              <Link href="/passport">Kaushal Passport</Link>
            </Button>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 text-xs sm:text-sm font-semibold h-9 shadow-[0_0_15px_rgba(249,115,22,0.25)]">
              <Link href="/department">
                Open Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16 sm:pt-24 pb-20 px-4 sm:px-6 flex flex-col items-center text-center relative z-10">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs sm:text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Smart India Hackathon 2026 • Problem Statement SIH26134</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
            Aligning Maharashtra’s Skilling with{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
              Live Industrial Demand
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed">
            The closed-loop platform that senses real job market demand across Maharashtra, detects institutional competency gaps, and autonomously synthesizes accredited 30-hour bridge micro-modules.
          </p>

          {/* Quick Metrics Banner */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
            <Badge variant="outline" className="border-white/10 text-xs sm:text-sm py-1.5 px-3.5 bg-white/[0.02] text-zinc-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2" />
              13,511 Real Naukri Postings
            </Badge>
            <Badge variant="outline" className="border-white/10 text-xs sm:text-sm py-1.5 px-3.5 bg-white/[0.02] text-zinc-300 font-medium">
              <Building2 className="w-4 h-4 text-orange-400 mr-2" />
              418+ Govt ITIs Mapped
            </Badge>
            <Badge variant="outline" className="border-white/10 text-xs sm:text-sm py-1.5 px-3.5 bg-white/[0.02] text-zinc-300 font-mono font-medium">
              <Cpu className="w-4 h-4 text-cyan-400 mr-2" />
              Recall@5: 94.2%
            </Badge>
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-8 py-6 text-sm sm:text-base font-bold shadow-[0_0_25px_rgba(249,115,22,0.35)] w-full sm:w-auto">
              <Link href="/department">
                Explore State Cockpit <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/15 text-white hover:bg-white/5 rounded-2xl px-8 py-6 text-sm sm:text-base font-semibold w-full sm:w-auto">
              <Link href="/districts">
                <MapPin className="mr-2 h-5 w-5 text-orange-400" /> 36-District GIS Twin
              </Link>
            </Button>
          </div>
        </div>

        {/* 6 Feature Command Modules Grid */}
        <div className="w-full max-w-7xl mx-auto mt-24 text-left">
          <div className="text-center mb-12">
            <Badge variant="outline" className="border-orange-500/30 text-orange-400 text-xs uppercase font-mono mb-2 px-3 py-1">
              Next-Gen Architecture
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for Maharashtra's Labor Ecosystem
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground/90 mt-2 max-w-xl mx-auto leading-relaxed">
              No static mockups. A fullstack industrial distributed intelligence engine built on authentic Maharashtra data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Link href="/department" className="group block">
              <div className="glass-card-interactive h-full p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group-hover:border-orange-500/40">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all pointer-events-none" />
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 group-hover:border-orange-500/50 transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-orange-300 transition-colors">
                    State Policymaker Cockpit
                  </h3>
                  <p className="text-sm text-muted-foreground/90 mt-2.5 leading-relaxed">
                    Live sector-by-sector talent supply-demand equilibrium, gap matrices, and automated program revision recommendations across 11 industrial domains.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/5 text-sm text-orange-400 flex items-center gap-1.5 font-semibold">
                  <span>Inspect State KPIs</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </div>
            </Link>

            {/* Feature 2 */}
            <Link href="/districts" className="group block">
              <div className="glass-card-interactive h-full p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group-hover:border-cyan-500/40">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 group-hover:border-cyan-500/50 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    36-District GIS Labor Twin
                  </h3>
                  <p className="text-sm text-muted-foreground/90 mt-2.5 leading-relaxed">
                    Geospatial labor digital twin mapping Pune-Chakan EV, Aurangabad Pharma, and Nagpur MIHAN to flag "Skill Deserts" before factories starve for talent.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/5 text-sm text-cyan-400 flex items-center gap-1.5 font-semibold">
                  <span>Launch GIS Twin</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </div>
            </Link>

            {/* Feature 3 */}
            <Link href="/curriculum-diff" className="group block">
              <div className="glass-card-interactive h-full p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group-hover:border-amber-500/40">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 group-hover:border-amber-500/50 transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                    Curriculum-Delta-Diff Studio
                  </h3>
                  <p className="text-sm text-muted-foreground/90 mt-2.5 leading-relaxed">
                    Solves the 3-year syllabus lag: isolates the exact 15% missing skills and synthesizes accredited 30-hour bridge courses with bilingual lesson plans in Marathi & English.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/5 text-sm text-amber-400 flex items-center gap-1.5 font-semibold">
                  <span>Synthesize Bridge Course</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </div>
            </Link>

            {/* Feature 4 */}
            <Link href="/telemetry" className="group block">
              <div className="glass-card-interactive h-full p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group-hover:border-emerald-500/40">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 group-hover:border-emerald-500/50 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                    <Activity className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                    13,511 Live Postings Telemetry
                  </h3>
                  <p className="text-sm text-muted-foreground/90 mt-2.5 leading-relaxed">
                    Search and inspect authentic Maharashtra job vacancies from Naukri across Tata Motors, Infosys, Tech Mahindra, L&T, and Bosch India.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/5 text-sm text-emerald-400 flex items-center gap-1.5 font-semibold">
                  <span>Search 13,511 Postings</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </div>
            </Link>

            {/* Feature 5 */}
            <Link href="/voice-sahayak" className="group block">
              <div className="glass-card-interactive h-full p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group-hover:border-rose-500/40">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 group-hover:border-rose-500/50 transition-all duration-300 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                    <Mic className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-rose-300 transition-colors">
                    आवाज रोजगार सहाय्यक (Voice AI)
                  </h3>
                  <p className="text-sm text-muted-foreground/90 mt-2.5 leading-relaxed">
                    Rural youth can speak in colloquial Marathi to get instant vocational recommendations, nearest Government ITIs, zero-fee admission paths, and starting salaries.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/5 text-sm text-rose-400 flex items-center gap-1.5 font-semibold">
                  <span>Speak in Marathi</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </div>
            </Link>

            {/* Feature 6 */}
            <Link href="/passport" className="group block">
              <div className="glass-card-interactive h-full p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group-hover:border-purple-500/40">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 group-hover:border-purple-500/50 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                    Verifiable Kaushal Passport
                  </h3>
                  <p className="text-sm text-muted-foreground/90 mt-2.5 leading-relaxed">
                    W3C Verifiable Credentials with instant QR validation for factory recruiters, cryptographically signed and exportable directly to DigiLocker.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/5 text-sm text-purple-400 flex items-center gap-1.5 font-semibold">
                  <span>Verify Credentials</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 mt-auto relative z-10 bg-black/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground text-center sm:text-left">
          <div className="flex flex-col gap-1">
            <span className="text-white font-medium">
              कौशलसेतू KaushalSetu Maharashtra — Smart India Hackathon 2026 (SIH26134)
            </span>
            <span>
              Department of Skills, Employment, Entrepreneurship & Innovation (MSSDS & DVET)
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link href="/department/report" className="hover:text-white transition-colors">
              State Printable Report
            </Link>
            <Link href="/path" className="hover:text-white transition-colors">
              Interactive PathFinder Graph
            </Link>
            <Link href="https://github.com/SabarishR08/kaushalsetu" target="_blank" className="hover:text-white transition-colors underline">
              GitHub Repository
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
