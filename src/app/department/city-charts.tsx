"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CITY_COLORS: Record<string, string> = {
  Pune: "#0ea5e9",
  "Mumbai (MMR)": "#8b5cf6",
  Nagpur: "#f59e0b",
  Nashik: "#22c55e",
};

function shortName(name: string, max = 20): string {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

export interface CitySkillRow {
  skill: string;
  [city: string]: string | number;
}

/**
 * Grouped horizontal bars: for each top skill, one bar per city cluster.
 * City columns are pre-pivoted by the caller so Recharts gets one row per
 * skill and one <Bar> per city.
 */
export function CitySkillChart({ data, cities }: { data: CitySkillRow[]; cities: string[] }) {
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
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
          cursor={{ fill: "currentColor", opacity: 0.06 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {cities.map((c) => (
          <Bar key={c} dataKey={c} fill={CITY_COLORS[c] ?? "#64748b"} radius={[0, 3, 3, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
