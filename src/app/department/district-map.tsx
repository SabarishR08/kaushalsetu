import { ALL_DISTRICTS, DISTRICT_GRID, GRID_ROWS, GRID_COLS, districtColor } from "@/lib/geo/districts";

export interface DistrictDatum {
  district: string;
  postings: number;
  topSkills: string[]; // already resolved to display names
}

/**
 * Tile-grid choropleth of Maharashtra — one tile per district, shaded by
 * posting volume. A CSS grid stand-in for a GeoJSON map: no client JS, no
 * map dependency, prints cleanly. Hover a tile for exact counts.
 */
export function DistrictMap({ data }: { data: DistrictDatum[] }) {
  const byName = new Map(data.map((d) => [d.district, d]));
  const max = Math.max(...data.map((d) => d.postings), 1);

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
          const title = postings
            ? `${name}: ${postings} postings — top: ${d?.topSkills.slice(0, 3).join(", ") || "—"}`
            : `${name}: no demand signal in corpus`;
          return (
            <div
              key={name}
              style={pos ? { gridColumn: pos[1] + 1, gridRow: pos[0] + 1 } : undefined}
              title={title}
              className={`${districtColor(postings, max)} flex min-h-[48px] flex-col justify-center rounded-md px-1.5 py-1 text-center transition-transform hover:scale-[1.06] hover:shadow-lg`}
            >
              <span className="text-[10px] leading-tight font-medium text-white/95">{label}</span>
              <span className="text-[11px] font-bold text-white">
                {postings > 0 ? postings : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span className="font-medium">Postings per district:</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-sky-500" /> high</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-sky-600" /> </span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-sky-700" /> </span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-sky-800" /> </span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-sky-900" /> low</span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-dashed border-zinc-700 bg-zinc-900" /> zero demand detected
        </span>
        <span>* Mumbai City + Suburban combined</span>
      </div>
    </div>
  );
}
