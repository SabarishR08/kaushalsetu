"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, GitCompare, MapPin, Sparkles, X } from "lucide-react";

import { 
  ALL_DISTRICTS, 
  DISTRICT_GRID, 
  GRID_ROWS, 
  GRID_COLS, 
  districtColor, 
  getNeighbors, 
  getCascadeHub 
} from "@/lib/geo/districts";

export interface DistrictDatum {
  district: string;
  postings: number;
  topSkills: string[]; // display names, best first
}

interface NeighborSummary {
  district: string;
  postings: number;
  topSkills: string[];
}

const DISTRICT_KEY_HUBS: Record<string, string> = {
  Pune: "Chakan Auto/EV Corridor, Hinjawadi IT Park, Talegaon Heavy Engineering & Bhosari MIDC",
  Mumbai: "BKC Financial Centre, Andheri East IT Corridor, Lower Parel FinTech & SEEPZ SEZ",
  Thane: "Thane-Belapur Trans-Thane Creek (TTC) Industrial Area, Kalyan-Dombivli Engineering & Turbhe",
  Nagpur: "MIHAN Multi-Modal International Cargo Hub, Butibori Industrial Area & Hingna MIDC",
  Nashik: "Ambad & Satpur MIDC, Dindori Electronics Cluster & Sinner Precision Engineering",
  "Chh. Sambhajinagar": "AURIC DMIC Smart City (Shendra-Bidkin Nodes), Waluj Auto Cluster & Chikalthana",
  Kolhapur: "Shiroli & Gokul Shirgaon Foundry Clusters, Auto Forging & Sugar Processing Complexes",
  Raigad: "JNPA Port Logistics Spine, Rasayani Chemical Belt, Roha & Taloja MIDC",
  Solapur: "Textile & Garment Cluster, Chiddarwar MIDC & Sugar-Ethanol By-product Complexes",
  Ahmednagar: "Supi MIDC Auto Hub, Shrirampur Agro-Tech & Precision Tooling Clusters",
};

/**
 * Tile-grid choropleth of Maharashtra — one tile per district, shaded by
 * posting volume. ALL 36 districts are interactive:
 * - Active industrial districts reveal vacancy share, top skills, and DVET curriculum bridge targets.
 * - Zero-demand ("skill desert") districts benchmark against neighbors and cascade to the nearest high-demand industrial corridor.
 */
export function DistrictMap({ data }: { data: DistrictDatum[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  const byName = useMemo(() => new Map(data.map((d) => [d.district, d])), [data]);
  const max = useMemo(() => Math.max(...data.map((d) => d.postings), 1), [data]);
  const totalDemand = useMemo(() => data.reduce((acc, d) => acc + d.postings, 0), [data]);

  const selectedData = selected ? byName.get(selected) : undefined;
  const hasPostings = Boolean(selectedData && selectedData.postings > 0);

  const neighbors: NeighborSummary[] = useMemo(() => {
    if (!selected) return [];
    return getNeighbors(selected)
      .map((n) => byName.get(n))
      .filter((d): d is DistrictDatum => Boolean(d) && (d as DistrictDatum).postings > 0)
      .sort((a, b) => b.postings - a.postings);
  }, [selected, byName]);

  // Aggregate neighbor demand: sum postings per skill across neighbors, weighted by volume and rank.
  const benchmark = useMemo(() => {
    if (!neighbors.length) return [];
    const totals = new Map<string, number>();
    for (const n of neighbors) {
      n.topSkills.forEach((skill, i) => {
        const weight = (3 - Math.min(i, 2)) * Math.log10(n.postings + 10);
        totals.set(skill, (totals.get(skill) ?? 0) + weight);
      });
    }
    return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([skill]) => skill);
  }, [neighbors]);

  const cascadeInfo = selected ? getCascadeHub(selected) : undefined;

  return (
    <div className="flex flex-col gap-3">
      <div
        className="grid w-full max-w-[720px] gap-1"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${GRID_ROWS}, minmax(48px, auto))`,
        }}
      >
        {ALL_DISTRICTS.map((name) => {
          const d = byName.get(name);
          const postings = d?.postings ?? 0;
          const pos = DISTRICT_GRID[name];
          const label = name === "Mumbai" ? "Mumbai*" : name;
          const isSel = selected === name;
          const title = postings
            ? `${name}: ${postings} postings — top: ${d?.topSkills.slice(0, 3).join(", ") || "—"} (click for industrial intelligence)`
            : `${name}: zero direct postings — click to view neighbor benchmark & corridor cascade`;
          return (
            <button
              key={name}
              type="button"
              style={pos ? { gridColumn: pos[1] + 1, gridRow: pos[0] + 1 } : undefined}
              title={title}
              onClick={() => setSelected(isSel ? null : name)}
              className={`${districtColor(postings, max)} cursor-pointer hover:scale-[1.06] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isSel ? "ring-2 ring-amber-400 scale-[1.04]" : ""
              } flex min-h-[48px] flex-col justify-center rounded-md px-1.5 py-1 text-center transition-all`}
            >
              <span className="text-[10px] leading-tight font-medium text-white/95">{label}</span>
              <span className="text-[11px] font-bold text-white">{postings > 0 ? postings : "—"}</span>
            </button>
          );
        })}
      </div>

      {/* Selected District Detail Panel: Active Industrial Hub vs Skill Desert */}
      {selected && (
        <div
          className={`rounded-lg border p-4 transition-all ${
            hasPostings
              ? "border-sky-500/30 bg-sky-950/20"
              : "border-amber-500/30 bg-amber-500/5"
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-foreground">
                  {selected}
                </span>
                {hasPostings ? (
                  <span className="rounded-full bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 text-[11px] font-medium text-sky-400">
                    Active Industrial Cluster ({selectedData?.postings.toLocaleString()} postings ·{" "}
                    {((selectedData!.postings / (totalDemand || 1)) * 100).toFixed(1)}% of state demand)
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                    Zero Direct Vacancy Signal (Skill Desert Heuristic)
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {hasPostings
                  ? "Real-time demand mass captured from active employer requisitions across industrial corridors."
                  : "No formal job listings attributed in this corpus. Seat planning relies on neighbor labor absorption and gravity corridor cascades."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close district intelligence panel"
              className="rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          {hasPostings ? (
            /* Active Industrial District Intelligence */
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">
                  Top Demanded Technical Skills
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedData?.topSkills.map((skill, i) => (
                    <span
                      key={skill}
                      className={`rounded-md border px-2 py-1 text-[11px] font-medium ${
                        i === 0
                          ? "border-sky-400/50 bg-sky-400/15 text-sky-200 font-semibold"
                          : "border-sky-500/20 bg-sky-500/5 text-foreground/90"
                      }`}
                    >
                      #{i + 1} {skill}
                    </span>
                  ))}
                </div>

                {DISTRICT_KEY_HUBS[selected] && (
                  <div className="mt-3 rounded border border-white/5 bg-white/[0.02] p-2.5">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      <span className="font-semibold text-foreground">Core Industrial Zones:</span>{" "}
                      {DISTRICT_KEY_HUBS[selected]}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">
                  Recommended DVET Intervention
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Deploy 30-hour modular delta-diff bridge units into local ITIs to align graduating craftsmen with {selected}&apos;s verified employer requisition profiles.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href="/curriculum-diff"
                    className="inline-flex items-center gap-1.5 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Simulate 30-Hr Curriculum Diff
                  </Link>
                  <Link
                    href="/districts"
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Inspect District GIS Twin
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Zero-Demand / Skill Desert with Cascade */
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {/* Neighboring labor markets */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Neighboring Districts ({neighbors.length})
                </p>
                <ul className="mt-1.5 space-y-1 text-sm">
                  {neighbors.map((n) => (
                    <li key={n.district} className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-medium">{n.district}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {n.postings} · {n.topSkills.slice(0, 2).join(", ") || "—"}
                      </span>
                    </li>
                  ))}
                  {!neighbors.length && (
                    <li className="text-xs text-muted-foreground">No neighbor postings in corpus.</li>
                  )}
                </ul>
              </div>

              {/* Neighbor Skill Benchmark */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-400/90">
                  Neighbor Skill Benchmark
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {benchmark.map((skill, i) => (
                    <span
                      key={skill}
                      className={`rounded-md border px-2 py-1 text-[11px] font-medium ${
                        i === 0
                          ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
                          : "border-border text-foreground/90"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                  {!benchmark.length && (
                    <span className="text-xs text-muted-foreground">Insufficient neighbor data.</span>
                  )}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  Gravity-weighted by neighbor vacancy volume. Shortlist for local ITI advisory councils before locking annual trades.
                </p>
              </div>

              {/* Cascade to Nearest Industrial Hub */}
              <div className="rounded border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">
                    Industrial Hub Cascade
                  </p>
                  {cascadeInfo && (
                    <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                      {cascadeInfo.linkageType}
                    </span>
                  )}
                </div>
                {cascadeInfo ? (
                  <div className="mt-2 space-y-1.5 text-xs">
                    <p className="font-semibold text-foreground">
                      Primary Hub: {cascadeInfo.hubDistrict}{" "}
                      <span className="font-normal text-muted-foreground">({cascadeInfo.distanceKm} km)</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Corridor: {cascadeInfo.corridor}
                    </p>
                    <div className="mt-1">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">Feeder Focus:</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {cascadeInfo.focusSectors.map((sec) => (
                          <span key={sec} className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[10px] text-foreground/80">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] leading-relaxed text-amber-300/80">
                      Align ITI cohorts to {cascadeInfo.hubDistrict}&apos;s industrial corridor to enable structured apprenticeships without unplanned distress migration.
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Cascade target: {neighbors[0]?.district ?? "Regional Industrial Hub"} via nearest state highway link.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span className="font-medium">Postings per district:</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-sky-500" /> high</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-sky-600" /> </span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-sky-700" /> </span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-sky-800" /> </span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-sky-900" /> low</span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-dashed border-zinc-700 bg-zinc-900" /> zero demand (skill desert)
        </span>
        <span className="text-amber-400 font-medium">✨ Click any district tile to inspect active demand or regional cascade benchmark</span>
        <span>* Mumbai City + Suburban combined</span>
      </div>
    </div>
  );
}

