"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const SKY = ["#0ea5e9", "#38bdf8", "#6366f1", "#8b5cf6", "#a855f7", "#22c55e", "#14b8a6", "#06b6d4", "#f59e0b", "#f97316"];

function shortName(name: string, max = 22): string {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

export function DemandChart({ data }: { data: { name: string; demand: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" opacity={0.15} />
        <XAxis type="number" allowDecimals={false} fontSize={11} stroke="currentColor" opacity={0.6} />
        <YAxis
          type="category"
          dataKey="name"
          width={150}
          tickFormatter={(v: string) => shortName(v)}
          fontSize={11}
          stroke="currentColor"
          opacity={0.8}
        />
        <Tooltip
          formatter={(value: number) => [`${value} postings`, "Demand"]}
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="demand" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={SKY[i % SKY.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SectorCoverageChart({ data }: { data: { name: string; coverage: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" opacity={0.15} />
        <XAxis type="number" domain={[0, 100]} fontSize={11} stroke="currentColor" opacity={0.6} unit="%" />
        <YAxis type="category" dataKey="name" width={150} fontSize={11} stroke="currentColor" opacity={0.8} />
        <Tooltip
          formatter={(value: number) => [`${value}% of top demand mass`, "Coverage"]}
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="coverage" radius={[0, 4, 4, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.coverage >= 80 ? "#22c55e" : d.coverage < 50 ? "#ef4444" : "#f59e0b"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
