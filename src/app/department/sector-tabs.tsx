"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemandChart, SectorCoverageChart } from "./charts";

export interface SectorDemandSkill {
  skillId: string;
  demand: number;
}

export interface SectorCoverageDatum {
  sector: string;
  postings: number;
  coverage: number; // 0-1
}

export interface SectorTabData {
  tab: string;
  /** Merged per-skill demand across the tab's underlying sectors. */
  topSkills: SectorDemandSkill[];
  /** Per underlying sector coverage + postings (drives the coverage chart). */
  coverage: SectorCoverageDatum[];
  /** Tab-level demand-weighted coverage of top-12 mass. */
  coverageTop12: number;
  postings: number;
}

/**
 * Sector filter tabs over the two headline charts. Pure client-side
 * filtering — the server precomputes one merged demand ranking and one
 * coverage list per tab, so switching tabs never touches the network.
 */
export function SectorDemandTabs({ tabs, skillNames }: { tabs: SectorTabData[]; skillNames: Record<string, string> }) {
  const [active, setActive] = useState<string>("ALL");
  const activeTab = useMemo(() => tabs.find((t) => t.tab === active) ?? tabs[0], [active, tabs]);
  const name = (id: string) => skillNames[id] ?? id;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Top skill demand</CardTitle>
          <SectorTabButtons tabs={tabs} active={active} onChange={setActive} />
        </CardHeader>
        <CardContent className="h-80">
          <DemandChart
            data={activeTab.topSkills.slice(0, 10).map((s) => ({ name: name(s.skillId), demand: s.demand }))}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Coverage in this sector{activeTab.tab !== "ALL" ? " group" : ""}</CardTitle>
          <span className="text-xs text-muted-foreground">
            {activeTab.postings.toLocaleString("en-IN")} postings · top-12 mass {Math.round(activeTab.coverageTop12 * 100)}%
          </span>
        </CardHeader>
        <CardContent className="h-80">
          <SectorCoverageChart
            data={[...activeTab.coverage]
              .sort((a, b) => b.postings - a.postings)
              .map((s) => ({ name: s.sector, coverage: Math.round(s.coverage * 100) }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SectorTabButtons({
  tabs,
  active,
  onChange,
}: {
  tabs: SectorTabData[];
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1" role="tablist" aria-label="Sector filter">
      {tabs.map((t) => (
        <button
          key={t.tab}
          type="button"
          role="tab"
          aria-selected={active === t.tab}
          onClick={() => onChange(t.tab)}
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
            active === t.tab
              ? "border-sky-400/60 bg-sky-500/15 text-sky-300"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.tab}
        </button>
      ))}
    </div>
  );
}
