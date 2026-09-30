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

/**
 * Adjacency within Maharashtra (approximate — border stretches simplified) —
 * the benchmark heuristic for zero-demand districts: what do their real-world
 * neighbors' labor markets demand? Approximation is fine here; the panel is a
 * planning aid, not a boundary map.
 */
export const DISTRICT_NEIGHBORS: Record<string, string[]> = {
  Nandurbar: ["Dhule"],
  Dhule: ["Nandurbar", "Jalgaon", "Nashik"],
  Jalgaon: ["Dhule", "Nashik", "Buldhana", "Chh. Sambhajinagar"],
  Gondia: ["Bhandara", "Gadchiroli", "Chandrapur"],
  Palghar: ["Thane"],
  Nashik: ["Dhule", "Jalgaon", "Palghar", "Thane", "Ahmednagar", "Chh. Sambhajinagar"],
  Mumbai: ["Thane", "Palghar"],
  Thane: ["Mumbai", "Palghar", "Raigad", "Pune", "Nashik"],
  Raigad: ["Thane", "Pune", "Ratnagiri", "Satara"],
  Ratnagiri: ["Raigad", "Satara", "Sangli", "Kolhapur", "Sindhudurg"],
  Sindhudurg: ["Ratnagiri", "Kolhapur"],
  Pune: ["Thane", "Raigad", "Ahmednagar", "Solapur", "Satara"],
  Satara: ["Pune", "Solapur", "Sangli", "Ratnagiri"],
  Sangli: ["Satara", "Kolhapur", "Solapur", "Ratnagiri"],
  Solapur: ["Pune", "Satara", "Sangli", "Ahmednagar", "Osmanabad (Dharashiv)", "Latur"],
  Kolhapur: ["Sangli", "Ratnagiri", "Sindhudurg"],
  Ahmednagar: ["Nashik", "Pune", "Beed", "Osmanabad (Dharashiv)", "Solapur", "Chh. Sambhajinagar"],
  "Chh. Sambhajinagar": ["Jalgaon", "Nashik", "Ahmednagar", "Beed", "Jalna"],
  Jalna: ["Chh. Sambhajinagar", "Buldhana", "Beed", "Parbhani"],
  Beed: ["Ahmednagar", "Chh. Sambhajinagar", "Jalna", "Parbhani", "Latur", "Osmanabad (Dharashiv)"],
  "Osmanabad (Dharashiv)": ["Solapur", "Ahmednagar", "Beed", "Latur"],
  Latur: ["Beed", "Osmanabad (Dharashiv)", "Nanded"],
  Nanded: ["Latur", "Parbhani", "Hingoli", "Yavatmal"],
  Parbhani: ["Jalna", "Beed", "Hingoli", "Nanded"],
  Hingoli: ["Parbhani", "Nanded", "Washim", "Yavatmal"],
  Buldhana: ["Jalgaon", "Jalna", "Akola", "Washim"],
  Akola: ["Buldhana", "Washim", "Amravati"],
  Washim: ["Akola", "Amravati", "Buldhana", "Hingoli", "Yavatmal"],
  Amravati: ["Akola", "Washim", "Yavatmal", "Wardha"],
  Yavatmal: ["Washim", "Hingoli", "Nanded", "Amravati", "Wardha", "Chandrapur"],
  Wardha: ["Amravati", "Nagpur", "Chandrapur", "Yavatmal"],
  Nagpur: ["Wardha", "Bhandara", "Chandrapur"],
  Bhandara: ["Nagpur", "Gondia", "Chandrapur"],
  Chandrapur: ["Nagpur", "Bhandara", "Gadchiroli", "Yavatmal", "Gondia"],
  Gadchiroli: ["Chandrapur", "Gondia"],
};

/** Neighbors of a district, unknown districts returning []. */
export function getNeighbors(district: string): string[] {
  return DISTRICT_NEIGHBORS[district] ?? [];
}

export interface CascadeHubInfo {
  hubDistrict: string;
  distanceKm: number;
  corridor: string;
  focusSectors: string[];
  linkageType: "Direct Commute" | "Apprenticeship Feeder" | "Regional Supply Chain";
}

/**
 * Gravity-model cascade mapping for zero-demand or feeder districts to their
 * nearest high-absorptive industrial corridor in Maharashtra.
 */
export const INDUSTRIAL_CASCADE_HUBS: Record<string, CascadeHubInfo> = {
  Nandurbar: {
    hubDistrict: "Dhule",
    distanceKm: 90,
    corridor: "NH 53 (Surat-Nagpur Corridor)",
    focusSectors: ["Renewable Energy & Solar", "Agri-Logistics", "Light Engineering"],
    linkageType: "Regional Supply Chain",
  },
  Dhule: {
    hubDistrict: "Nashik",
    distanceKm: 155,
    corridor: "NH 60 (Nashik-Dhule Industrial Belt)",
    focusSectors: ["Automotive Components", "Electrical Machinery", "Agro-Processing"],
    linkageType: "Apprenticeship Feeder",
  },
  Jalgaon: {
    hubDistrict: "Nashik",
    distanceKm: 190,
    corridor: "NH 53 & Central Railway Corridor",
    focusSectors: ["Polymer Piping & Extrusion", "Electronics Manufacturing", "Solar Pumps"],
    linkageType: "Regional Supply Chain",
  },
  Gondia: {
    hubDistrict: "Nagpur",
    distanceKm: 160,
    corridor: "NH 53 & MIHAN Metro Corridor",
    focusSectors: ["Logistics & Warehousing", "Aerospace MRO", "Steel & Mineral Processing"],
    linkageType: "Apprenticeship Feeder",
  },
  Bhandara: {
    hubDistrict: "Nagpur",
    distanceKm: 65,
    corridor: "NH 53 (Nagpur-Bhandara Highway)",
    focusSectors: ["Ferro-Alloys & Foundry", "Automotive Ancillaries", "MIHAN Multi-Modal"],
    linkageType: "Direct Commute",
  },
  Gadchiroli: {
    hubDistrict: "Chandrapur",
    distanceKm: 75,
    corridor: "SH 9 (Gadchiroli-Chandrapur Mining Belt)",
    focusSectors: ["Mining Heavy Equipment Maintenance", "Forest Biomass", "Industrial Safety"],
    linkageType: "Apprenticeship Feeder",
  },
  Chandrapur: {
    hubDistrict: "Nagpur",
    distanceKm: 150,
    corridor: "NH 353 (Nagpur-Chandrapur Belt)",
    focusSectors: ["Thermal Power Automation", "Cement Plant Metrology", "Heavy Fabrication"],
    linkageType: "Apprenticeship Feeder",
  },
  Wardha: {
    hubDistrict: "Nagpur",
    distanceKm: 75,
    corridor: "Samruddhi Mahamarg & Wardha Dry Port",
    focusSectors: ["Multi-Modal Logistics", "Defense Ordinance Ancillaries", "Textile Finishing"],
    linkageType: "Direct Commute",
  },
  Yavatmal: {
    hubDistrict: "Nagpur",
    distanceKm: 150,
    corridor: "NH 361 (Nagpur-Wardha-Yavatmal Belt)",
    focusSectors: ["Industrial Garments", "Biomass Processing", "Commercial Vehicle Driving"],
    linkageType: "Apprenticeship Feeder",
  },
  Washim: {
    hubDistrict: "Amravati",
    distanceKm: 110,
    corridor: "Samruddhi Mahamarg Corridor",
    focusSectors: ["Textile Weaving", "Agri-Warehousing & Cold Chain", "Solar Inverters"],
    linkageType: "Apprenticeship Feeder",
  },
  Akola: {
    hubDistrict: "Amravati",
    distanceKm: 90,
    corridor: "NH 6 (Vidarbha Industrial Corridor)",
    focusSectors: ["Cotton Processing & Textiles", "Chemical Fertilizers", "Electrical Panels"],
    linkageType: "Direct Commute",
  },
  Amravati: {
    hubDistrict: "Nagpur",
    distanceKm: 155,
    corridor: "Samruddhi Expressway Corridor",
    focusSectors: ["Textile City MIDC", "Food Processing", "Electrical Assemblies"],
    linkageType: "Regional Supply Chain",
  },
  Buldhana: {
    hubDistrict: "Jalgaon",
    distanceKm: 95,
    corridor: "NH 53 & Malkapur Rail Junction",
    focusSectors: ["Plastics & Polymer Extrusion", "Cotton Ginning", "Drip Irrigation Systems"],
    linkageType: "Direct Commute",
  },
  Hingoli: {
    hubDistrict: "Nanded",
    distanceKm: 80,
    corridor: "NH 161 (Marathwada Link)",
    focusSectors: ["Bio-Fertilizers", "Agro-Equipment Repair", "Pharma Packaging"],
    linkageType: "Regional Supply Chain",
  },
  Parbhani: {
    hubDistrict: "Chh. Sambhajinagar",
    distanceKm: 190,
    corridor: "Jalna-Nanded Samruddhi Spur",
    focusSectors: ["Automotive Ancillaries", "Seed Biotechnology", "Cold Chain Logistics"],
    linkageType: "Apprenticeship Feeder",
  },
  Nanded: {
    hubDistrict: "Chh. Sambhajinagar",
    distanceKm: 240,
    corridor: "Samruddhi Connector Corridor",
    focusSectors: ["Specialty Chemicals", "Textile Looms", "Automotive Sub-assemblies"],
    linkageType: "Apprenticeship Feeder",
  },
  Jalna: {
    hubDistrict: "Chh. Sambhajinagar",
    distanceKm: 60,
    corridor: "DMIC Shendra-Bidkin Corridor",
    focusSectors: ["Steel Re-Rolling", "Hybrid Seeds", "Automotive Castings"],
    linkageType: "Direct Commute",
  },
  Beed: {
    hubDistrict: "Ahmednagar",
    distanceKm: 135,
    corridor: "NH 61 Industrial Belt",
    focusSectors: ["Precision Tooling", "Dairy & Agro-Processing", "Commercial EV Maintenance"],
    linkageType: "Apprenticeship Feeder",
  },
  Latur: {
    hubDistrict: "Solapur",
    distanceKm: 120,
    corridor: "NH 52 Marathwada Corridor",
    focusSectors: ["Soybean Processing", "Solar Installations", "Medium Industrial Fabrication"],
    linkageType: "Regional Supply Chain",
  },
  "Osmanabad (Dharashiv)": {
    hubDistrict: "Solapur",
    distanceKm: 70,
    corridor: "NH 52 (Dharashiv-Solapur Belt)",
    focusSectors: ["Technical Textiles", "Sugar By-products & Ethanol", "Heavy Fabrication"],
    linkageType: "Direct Commute",
  },
  Solapur: {
    hubDistrict: "Pune",
    distanceKm: 250,
    corridor: "Pune-Solapur Highway (NH 65)",
    focusSectors: ["Garment Manufacturing", "Heavy Boilers", "Automotive Ancillaries"],
    linkageType: "Regional Supply Chain",
  },
  Satara: {
    hubDistrict: "Pune",
    distanceKm: 110,
    corridor: "NH 48 (Pune-Bengaluru Industrial Corridor)",
    focusSectors: ["Automotive Assemblies", "Food Engineering", "Electrical Component Tooling"],
    linkageType: "Direct Commute",
  },
  Sangli: {
    hubDistrict: "Kolhapur",
    distanceKm: 50,
    corridor: "Sangli-Kolhapur Twin Hub",
    focusSectors: ["Foundry & Casting", "Textile Weaving", "Agri-Cold Storage"],
    linkageType: "Direct Commute",
  },
  Kolhapur: {
    hubDistrict: "Pune",
    distanceKm: 230,
    corridor: "NH 48 Industrial Spine",
    focusSectors: ["Precision Casting & Foundry", "Auto Forging", "Sugar Machinery"],
    linkageType: "Regional Supply Chain",
  },
  Ratnagiri: {
    hubDistrict: "Kolhapur",
    distanceKm: 130,
    corridor: "NH 166 Coastal Link",
    focusSectors: ["Marine Logistics", "Chemical Processing", "Heavy Engineering"],
    linkageType: "Regional Supply Chain",
  },
  Sindhudurg: {
    hubDistrict: "Kolhapur",
    distanceKm: 140,
    corridor: "NH 66 & Anuskura Ghat",
    focusSectors: ["Precision Foundry", "Food & Fruit Processing", "Hospitality Technology"],
    linkageType: "Regional Supply Chain",
  },
  Raigad: {
    hubDistrict: "Mumbai",
    distanceKm: 60,
    corridor: "MTHL Atal Setu & JNPA Port Corridor",
    focusSectors: ["Port Logistics & Supply Chain", "Petrochemicals", "Steel Manufacturing"],
    linkageType: "Direct Commute",
  },
  Palghar: {
    hubDistrict: "Thane",
    distanceKm: 75,
    corridor: "Western Corridor & DMIC",
    focusSectors: ["Pharma Formulation", "Specialty Plastics", "Industrial Fabrication"],
    linkageType: "Direct Commute",
  },
};

/**
 * Returns industrial cascade hub information for a district, if defined.
 */
export function getCascadeHub(district: string): CascadeHubInfo | undefined {
  return INDUSTRIAL_CASCADE_HUBS[district];
}

