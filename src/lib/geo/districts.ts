/**
 * Maharashtra district geography for the department dashboard heatmap.
 *
 * 36 districts; Mumbai City and Mumbai Suburban are combined into a single
 * "Mumbai" tile (job corpora never distinguish them). Tile positions are an
 * approximate geographic grid — Konkan coast on the left, Vidarbha on the
 * right, rows running west-to-east — good enough to read the map at a glance
 * without a GeoJSON/Leaflet dependency, and it prints cleanly in the report.
 */

export const DISTRICT_GRID: Record<string, [number, number]> = {
  Nandurbar: [0, 1], Dhule: [0, 2], Jalgaon: [0, 3], Gondia: [0, 7],
  Palghar: [1, 0], Nashik: [1, 1], "Chh. Sambhajinagar": [1, 2], Jalna: [1, 3],
  Buldhana: [1, 4], Akola: [1, 5], Amravati: [1, 6], Bhandara: [1, 7],
  Mumbai: [2, 0], Pune: [2, 1], Ahmednagar: [2, 2], Beed: [2, 3],
  Parbhani: [2, 4], Hingoli: [2, 5], Washim: [2, 6], Nagpur: [2, 7],
  Thane: [3, 0], Satara: [3, 1], Solapur: [3, 2], Latur: [3, 3],
  Nanded: [3, 4], Yavatmal: [3, 5], Wardha: [3, 6], Chandrapur: [3, 7],
  Raigad: [4, 0], Sangli: [4, 1], "Osmanabad (Dharashiv)": [4, 2], Gadchiroli: [4, 7],
  Ratnagiri: [5, 0], Kolhapur: [5, 1],
  Sindhudurg: [6, 0],
};

/** Canonical district list for "zero demand" tiles. */
export const ALL_DISTRICTS: string[] = [
  "Palghar", "Mumbai", "Thane", "Raigad", "Ratnagiri", "Sindhudurg",
  "Pune", "Satara", "Sangli", "Solapur", "Kolhapur", "Nashik",
  "Dhule", "Nandurbar", "Jalgaon", "Ahmednagar", "Chh. Sambhajinagar",
  "Jalna", "Beed", "Osmanabad (Dharashiv)", "Latur", "Nanded", "Parbhani",
  "Hingoli", "Buldhana", "Akola", "Washim", "Amravati", "Yavatmal", "Wardha",
  "Nagpur", "Bhandara", "Gondia", "Chandrapur", "Gadchiroli",
];

export const GRID_ROWS = 7;
export const GRID_COLS = 8;

/** Consistent color ramp for the choropleth, shared by map and legend. */
export function districtColor(postings: number, max: number): string {
  if (postings <= 0) return "bg-zinc-900 border border-dashed border-zinc-700";
  if (max <= 0) return "bg-sky-900";
  const r = postings / max;
  if (r > 0.5) return "bg-sky-500";
  if (r > 0.2) return "bg-sky-600";
  if (r > 0.05) return "bg-sky-700";
  if (r > 0.01) return "bg-sky-800";
  return "bg-sky-900";
}
