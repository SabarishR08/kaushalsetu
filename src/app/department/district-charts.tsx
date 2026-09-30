"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const DISTRICT_COLORS: Record<string, string> = {
  Mumbai: "#0ea5e9",
  Pune: "#8b5cf6",
  Thane: "#f59e0b",
  Nagpur: "#22c55e",
};

function shortName(name: string, max = 20): string {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

/** Horizontal bars: postings per district, highest-volume first. */
export function DistrictDemandChart({ data }: { data: { name: string; postings: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" opacity={0.15} />
        <XAxis type="number" allowDecimals={false} fontSize={11} stroke="currentColor" opacity={0.6} />
        <YAxis
          type="category"
          dataKey="name"
          width={130}
          tickFormatter={(v: string) => shortName(v)}
          fontSize={11}
          stroke="currentColor"
          opacity={0.8}
        />
        <Tooltip
          formatter={(value: number) => [`${value} postings`, "Demand"]}
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
          cursor={{ fill: "currentColor", opacity: 0.06 }}
        />
        <Bar dataKey="postings" radius={[0, 4, 4, 0]} fill="#0ea5e9" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export interface DistrictSkillRow {
  skill: string;
  [district: string]: string | number;
}

/**
 * Grouped horizontal bars: for each top skill, one bar per high-volume
 * district. Rows are pre-pivoted by the caller (one row per skill, one
 * dataKey per district) so Recharts needs a single <Bar> per district.
 */
export function DistrictSkillChart({ data, districts }: { data: DistrictSkillRow[]; districts: string[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }} barCategoryGap="22%">
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" opacity={0.15} />
        <XAxis type="number" allowDecimals={false} fontSize={11} stroke="currentColor" opacity={0.6} />
        <YAxis
          type="category"
          dataKey="skill"
          width={150}
          tickFormatter={(v: string) => shortName(v)}
          fontSize={11}
          stroke="currentColor"
          opacity={0.8}
        />
        <Tooltip
          formatter={(value: number, name: string) => [`${value} postings`, name]}
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
          cursor={{ fill: "currentColor", opacity: 0.06 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {districts.map((d) => (
          <Bar key={d} dataKey={d} fill={DISTRICT_COLORS[d] ?? "#64748b"} radius={[0, 3, 3, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
