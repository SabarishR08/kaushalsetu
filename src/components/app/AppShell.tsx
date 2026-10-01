"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PIPELINE_POSTINGS } from "@/lib/pipeline-meta";
import { 
  Compass, 
  Building2, 
  MapPin, 
  Sparkles, 
  Activity, 
  Route, 
  Mic, 
  ShieldCheck, 
  FileText 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { href: "/department", label: "State Cockpit", icon: Building2 },
  { href: "/districts", label: "36-District GIS", icon: MapPin },
  { href: "/curriculum-diff", label: "Curriculum Diff", icon: Sparkles },
  { href: "/telemetry", label: "Live Telemetry", icon: Activity },
  { href: "/path", label: "Skill Roadmap", icon: Route },
  { href: "/voice-sahayak", label: "Voice Sahayak", icon: Mic },
  { href: "/passport", label: "Kaushal Passport", icon: ShieldCheck },
];

export function AppShell({
  children,
  learnerName,
  onReset,
}: {
  children: React.ReactNode;
  learnerName?: string | null;
  onReset?: () => void;
}) {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full max-w-full bg-black text-foreground">
      {/* Top Banner for Government of Maharashtra context */}
      <div className="bg-gradient-to-r from-orange-950/40 via-amber-900/20 to-orange-950/40 border-b border-orange-500/10 px-3 py-1.5 text-center text-xs font-medium text-orange-200/90 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>महाराष्ट्र शासन • Department of Skills, Employment, Entrepreneurship & Innovation (SIH26134)</span>
        <Badge variant="outline" className="border-orange-500/30 text-orange-300 text-xs py-0 px-2 h-5 ml-1">
          {PIPELINE_POSTINGS.toLocaleString("en-IN")} Real Postings Active
        </Badge>
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mr-2 shrink-0 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 group-hover:border-orange-500/60 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.15)]">
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
          <nav className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs xl:text-sm font-semibold transition-all shrink-0",
                    active
                      ? "bg-orange-500/15 text-orange-300 border border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.15)] font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse ml-0.5" />}
                </Link>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex border-white/10 text-xs sm:text-sm font-medium h-9 px-3 bg-white/5 hover:bg-white/10 text-white rounded-xl">
              <Link href="/department/report">
                <FileText className="mr-1.5 h-4 w-4 text-orange-400" /> State Report
              </Link>
            </Button>
            
            {learnerName ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden md:inline">{learnerName}</span>
                {onReset && (
                  <Button variant="ghost" size="sm" onClick={onReset} className="text-xs h-7 px-2 text-muted-foreground hover:text-white">
                    Reset
                  </Button>
                )}
              </div>
            ) : null}

            {/* Mobile Nav Button */}
            <div className="lg:hidden flex items-center gap-1">
              <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8 px-3 rounded-lg">
                <Link href="/department">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile secondary navigation bar with clear active indicator */}
        <div className="lg:hidden flex items-center gap-1 px-3 py-2 overflow-x-auto border-t border-white/5 bg-black/90 scrollbar-none text-xs">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 whitespace-nowrap shrink-0 text-xs font-medium transition-colors",
                  active ? "bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30" : "text-muted-foreground hover:text-white"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 py-6 overflow-x-hidden min-w-0">
        {children}
      </main>

      <footer className="border-t border-white/5 bg-black/90 py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground text-center sm:text-left">
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
