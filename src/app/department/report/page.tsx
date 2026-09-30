import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDepartmentData } from "@/lib/dept-data";

export const dynamic = "force-dynamic";

const pct = (x: number) => `${Math.round(x * 100)}%`;

/**
 * Printable department report — plain, high-contrast, no charts. Judges and
 * officials can print this page directly (browser print → PDF) as the
 * department-facing output of the alignment run.
 */
export default async function DepartmentReportPage() {
  const { demand, alignment, skillNames } = await getDepartmentData();

  if (!demand || !alignment) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-sm">
        Run <code>npm run sih:demand &amp;&amp; npm run sih:alignment</code> first.
      </div>
    );
  }

  const name = (id: string) => skillNames[id] ?? id;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 print:py-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="text-xl font-bold">Skilling Alignment Report — Maharashtra (SIH26134)</h1>
        <Button asChild variant="ghost" size="sm">
          <Link href="/department"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link>
        </Button>
      </div>

      <div className="mb-8 hidden print:block">
        <h1 className="text-xl font-bold">Skilling Alignment Report — Government of Maharashtra</h1>
        <p className="text-xs">
          Generated {new Date().toLocaleString()} · {demand.meta.postings} postings · {alignment.meta.programs} programs ·
          tagger: {demand.meta.tagger} · source: {demand.meta.source}
        </p>
      </div>

      <section className="mb-8">
        <h2 className="mb-2 text-base font-semibold">1. Sector-wise coverage of top demand</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-1 pr-4">Sector</th>
              <th className="py-1 pr-4">Postings</th>
              <th className="py-1 pr-4">Coverage</th>
              <th className="py-1">Missing from top-12 demand</th>
            </tr>
          </thead>
          <tbody>
            {alignment.sectorCoverage.map((s) => {
              const missing = s.topSkills.filter((id) => !s.coveredSkills.includes(id));
              return (
                <tr key={s.sector} className="border-b align-top">
                  <td className="py-1.5 pr-4 font-medium">{s.sector}</td>
                  <td className="py-1.5 pr-4">{s.postings}</td>
                  <td className="py-1.5 pr-4">{pct(s.coverage)}</td>
                  <td className="py-1.5">{missing.length ? missing.map(name).join(", ") : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-base font-semibold">2. Skill demand by city cluster</h2>
        {demand.cities?.length ? (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1 pr-4">City cluster</th>
                <th className="py-1 pr-4">Postings</th>
                <th className="py-1">Top 5 skills demanded</th>
              </tr>
            </thead>
            <tbody>
              {demand.cities
                .filter((c) => c.city !== "Unattributed" && c.postings >= 5)
                .map((c) => (
                  <tr key={c.city} className="border-b align-top">
                    <td className="py-1.5 pr-4 font-medium">{c.city}</td>
                    <td className="py-1.5 pr-4">{c.postings}</td>
                    <td className="py-1.5">{c.topSkills.slice(0, 5).map((s) => name(s.skillId)).join(", ")}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm">City attribution unavailable for this demand build.</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Multi-city postings credit every listed city, so counts sum above the posting total.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-base font-semibold">3. In-demand skills no program teaches</h2>
        {alignment.uncoveredSkills.length ? (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {alignment.uncoveredSkills.map((g) => (
              <li key={g.skillId}>
                <span className="font-medium">{name(g.skillId)}</span> — {g.demand} posting(s)
                {g.sectors.length ? <> (notably {g.sectors.slice(0, 2).join(", ")})</> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm">None — all in-demand skills are covered by current programs.</p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-base font-semibold">4. Recommendations</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          {alignment.recommendations.map((r, i) => (
            <li key={i}>
              <span className="font-medium">{r.title}</span>
              {r.sector ? <span className="text-muted-foreground"> · {r.sector}</span> : null}
              <br />
              <span className="text-muted-foreground">{r.detail}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">5. Most market-aligned programs</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-1 pr-4">Program</th>
              <th className="py-1 pr-4">Alignment</th>
              <th className="py-1 pr-4">Best-fit sector</th>
              <th className="py-1">Missing in that sector</th>
            </tr>
          </thead>
          <tbody>
            {alignment.programAlignment.slice(0, 12).map((p) => (
              <tr key={p.courseId} className="border-b align-top">
                <td className="py-1.5 pr-4">
                  {p.title} <span className="text-xs text-muted-foreground">({p.courseId})</span>
                </td>
                <td className="py-1.5 pr-4">{pct(p.alignment)}</td>
                <td className="py-1.5 pr-4">{p.bestSector}</td>
                <td className="py-1.5">{p.missingInBestSector.map(name).join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="mt-8 text-xs text-muted-foreground">
        KaushalSetu · demand-signal, gap-detection and program-recommendation pipeline for SIH26134 ·
        deterministic scoring; artifacts at data/demand.json and data/alignment.json.
      </p>
    </div>
  );
}
