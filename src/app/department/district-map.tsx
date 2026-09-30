"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { ALL_DISTRICTS, DISTRICT_GRID, GRID_ROWS, GRID_COLS, districtColor, getNeighbors } from "@/lib/geo/districts";

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

/**
 * Tile-grid choropleth of Maharashtra — one tile per district, shaded by
 * posting volume. Zero-demand ("skill desert") tiles are clickable: a detail
 * panel benchmarks the district against its real-world neighbors' top
 * demanded skills, turning "no data here" into "what to train for, based on
 * the nearest labor markets".
 */
export function DistrictMap({ data }: { data: DistrictDatum[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  const byName = useMemo(() => new Map(data.map((d) => [d.district, d])), [data]);
  const max = useMemo(() => Math.max(...data.map((d) => d.postings), 1), [data]);

  const neighbors: NeighborSummary[] = useMemo(() => {
    if (!selected) return [];
    return getNeighbors(selected)
      .map((n) => byName.get(n))
      .filter((d): d is DistrictDatum => Boolean(d) && (d as DistrictDatum).postings > 0)
      .sort((a, b) => b.postings - a.postings);
  }, [selected, byName]);

  // Aggregate neighbor demand: sum postings per skill across neighbors, keep
  // display order stable by first appearance.
  const benchmark = useMemo(() => {
    if (!neighbors.length) return [];
    const totals = new Map<string, number>();
    for (const n of neighbors) {
      n.topSkills.forEach((skill, i) => {
        // Weight: first-listed skill counts more; postings scale the weight.
        const weight = (3 - Math.min(i, 2)) * Math.log10(n.postings + 10);
        totals.set(skill, (totals.get(skill) ?? 0) + weight);
      });
    }
    return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([skill]) => skill);
  }, [neighbors]);

  const selectedData = selected ? byName.get(selected) : undefined;

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
          const isDesert = postings <= 0;
          const clickable = isDesert && getNeighbors(name).length > 0;
          const isSel = selected === name;
          const title = postings
            ? `${name}: ${postings} postings — top: ${d?.topSkills.slice(0, 3).join(", ") || "—"}`
            : clickable
              ? `${name}: no demand signal — click to benchmark against neighboring districts`
              : `${name}: no demand signal in corpus`;
          return (
            <button
              key={name}
              type="button"
              style={pos ? { gridColumn: pos[1] + 1, gridRow: pos[0] + 1 } : undefined}
              title={title}
              onClick={clickable ? () => setSelected(isSel ? null : name) : undefined}
              disabled={!clickable}
              className={`${districtColor(postings, max)} ${clickable ? "cursor-pointer hover:scale-[1.06] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400" : "cursor-default"} ${isSel ? "ring-2 ring-amber-400" : ""} flex min-h-[48px] flex-col justify-center rounded-md px-1.5 py-1 text-center transition-transform`}
            >
              <span className="text-[10px] leading-tight font-medium text-white/95">{label}</span>
              <span className="text-[11px] font-bold text-white">{postings > 0 ? postings : "—"}</span>
            </button>
          );
        })}
      </div>

      {/* Benchmark panel for the selected zero-demand district */}
      {selected && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-amber-400">
                {selected} — zero demand in corpus
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                No formal postings attribute here, but training seats still get planned. Benchmark: what the nearest active labor markets demand.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close benchmark panel"
              className="rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Neighboring districts ({neighbors.length})
              </p>
              <ul className="mt-1.5 space-y-1 text-sm">
                {neighbors.map((n) => (
                  <li key={n.district} className="flex items-baseline justify-between gap-2">
                    <span>{n.district}</span>
                    <span className="text-xs text-muted-foreground">
                      {n.postings} · {n.topSkills.slice(0, 2).join(", ") || "—"}
                    </span>
                  </li>
                ))}
                {!neighbors.length && <li className="text-xs text-muted-foreground">No neighbor postings in corpus.</li>}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Suggested skill benchmark
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {benchmark.map((skill, i) => (
                  <span
                    key={skill}
                    className={`rounded-md border px-2 py-1 text-[11px] font-medium ${i === 0 ? "border-amber-400/50 bg-amber-400/10 text-amber-300" : "border-border text-foreground/90"}`}
                  >
                    {skill}
                  </span>
                ))}
                {!benchmark.length && <span className="text-xs text-muted-foreground">Insufficient neighbor data.</span>}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Weighted by neighbor posting volume and skill rank. Treat as a starting shortlist for {selected} —
                validate with local employer surveys before committing seats.
              </p>
            </div>
          </div>
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
          <span className="inline-block h-3 w-3 cursor-pointer rounded border border-dashed border-amber-400/60 bg-zinc-900" /> zero demand — clickable for neighbor benchmark
        </span>
        <span>* Mumbai City + Suburban combined</span>
      </div>
    </div>
  );
}
