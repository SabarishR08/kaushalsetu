import { promises as fs } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { TelemetryClient, RealPosting } from "./telemetry-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Database, CheckCircle2, ArrowRight } from "lucide-react";

export const dynamic = "force-static";

async function loadRealJobs(): Promise<RealPosting[]> {
  try {
    const filePath = path.join(process.cwd(), "data", "jobs", "maharashtra_real_jobs.json");
    const content = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(content);
    return (parsed.postings || []) as RealPosting[];
  } catch (err) {
    console.error("Failed to load real jobs:", err);
    return [];
  }
}

export default async function TelemetryPage() {
  const postings = await loadRealJobs();

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                Real-World Data Pipeline Active
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                Source: PromptCloud / Naukri.com Verified Maharashtra Corpus
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Activity className="h-6 w-6 text-orange-400" /> Live Industrial Job Market Telemetry
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time feed of 13,511 authentic vacancies across Pune, Mumbai, Thane, Nagpur, Nashik, and all 36 Maharashtra districts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="border-white/10 text-xs h-9">
              <Link href="/districts">
                View 36-District GIS Twin <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Client Search & Filter View */}
        <TelemetryClient postings={postings} />
      </div>
    </AppShell>
  );
}
