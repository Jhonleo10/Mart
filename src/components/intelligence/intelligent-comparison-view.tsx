import Link from "next/link";
import { getProductBookDemoPath } from "@/lib/product-public-url";
import { Check, X, Trophy, Sparkles, AlertCircle, ArrowRight, Minus } from "lucide-react";
import type { IntelligentComparison } from "@/lib/intelligence/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function IntelligentComparisonView({ data }: { data: IntelligentComparison }) {
  const winnerIsA = data.winnerId === data.productA.id;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-2">
      {/* Winner & Verdict Section */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 shadow-2xl shadow-brand-blue/5 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-transparent to-brand-green/5" />

        <div className="relative flex flex-col md:flex-row">
          <div className="flex-1 p-8 lg:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-lg shadow-brand-blue/20">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-blue">
                  Overall Winner
                </p>
                <h2 className="font-heading mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                  {data.winnerName}
                </h2>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Why it won</p>
              <ul className="space-y-2.5 text-sm font-medium text-slate-700">
                {data.whyWinner.map((w) => (
                  <li key={w} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-green/15 text-brand-green-dark">
                      <Check className="h-3 w-3" />
                    </div>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex w-full flex-col justify-center border-t border-slate-200/50 bg-slate-50/50 p-8 md:w-72 md:border-l md:border-t-0 lg:w-96 lg:p-10">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400">Match Scores</p>
            <div className="mt-6 flex items-center justify-between gap-4 px-2">
              <div className="text-center">
                <div className={cn("text-4xl font-black", winnerIsA ? "text-brand-green" : "text-slate-400")}>
                  {data.scoreA}
                </div>
                <p className="mt-2 text-xs font-bold text-slate-600 line-clamp-1">{data.productA.name}</p>
              </div>
              <div className="text-sm font-bold text-slate-300">VS</div>
              <div className="text-center">
                <div className={cn("text-4xl font-black", !winnerIsA ? "text-brand-green" : "text-slate-400")}>
                  {data.scoreB}
                </div>
                <p className="mt-2 text-xs font-bold text-slate-600 line-clamp-1">{data.productB.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Verdict Box */}
        <div className="relative border-t border-brand-blue/10 bg-brand-blue/[0.03] p-6 lg:px-10 lg:py-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-brand-blue" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-blue">AI Expert Verdict</h3>
          </div>
          <p className="text-[15px] leading-relaxed text-slate-700">
            {data.overallVerdict}
          </p>
        </div>
      </div>

      {/* Feature Matrix */}
      <div className="overflow-x-auto rounded-[1.5rem] border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-xs">Dimension</th>
              <th
                className={cn(
                  "p-5 font-heading text-lg font-bold w-2/5",
                  winnerIsA ? "text-brand-blue" : "text-slate-900",
                )}
              >
                <div className="flex flex-col items-start gap-3">
                  {data.productA.name}
                  <Link href={getProductBookDemoPath(data.productA.slug)}>
                    <Button size="sm" variant="outline" className="h-8 rounded-full text-xs">
                      View Demo
                    </Button>
                  </Link>
                </div>
              </th>
              <th
                className={cn(
                  "p-5 font-heading text-lg font-bold w-2/5",
                  !winnerIsA ? "text-brand-blue" : "text-slate-900",
                )}
              >
                <div className="flex flex-col items-start gap-3">
                  {data.productB.name}
                  <Link href={getProductBookDemoPath(data.productB.slug)}>
                    <Button size="sm" variant="outline" className="h-8 rounded-full text-xs">
                      View Demo
                    </Button>
                  </Link>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.dimensions.map((row) => (
              <tr key={row.key} className="transition-colors hover:bg-slate-50/50">
                <td className="p-5 font-semibold text-slate-600">{row.label}</td>
                <td
                  className={cn(
                    "p-5",
                    row.winner === "a" && "bg-brand-green/[0.03] text-brand-green-dark font-medium",
                  )}
                >
                  {typeof row.productA === "boolean" ? (
                    row.productA ? (
                      <Check className="h-5 w-5 text-brand-green" />
                    ) : (
                      <Minus className="h-5 w-5 text-slate-300" />
                    )
                  ) : (
                    String(row.productA)
                  )}
                </td>
                <td
                  className={cn(
                    "p-5",
                    row.winner === "b" && "bg-brand-green/[0.03] text-brand-green-dark font-medium",
                  )}
                >
                  {typeof row.productB === "boolean" ? (
                    row.productB ? (
                      <Check className="h-5 w-5 text-brand-green" />
                    ) : (
                      <Minus className="h-5 w-5 text-slate-300" />
                    )
                  ) : (
                    String(row.productB)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pros & Cons / Recommended */}
      <div className="grid gap-6 md:grid-cols-2">
        {[data.productA, data.productB].map((p, i) => {
          const key = i === 0 ? "productA" : "productB";
          const pros = data.pros[key];
          const cons = data.cons[key];
          const rec = data.recommendedFor[key];
          return (
            <div key={p.id} className="relative overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/60 p-8 shadow-xl shadow-slate-200/30 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-blue/5">
              <h3 className="font-heading text-xl font-bold text-slate-900">{p.name}</h3>

              <div className="mt-6 space-y-6">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-green-dark">
                    <Check className="h-4 w-4" /> Pros
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {pros.map((x) => (
                      <li key={x} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <X className="h-4 w-4" /> Cons
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {cons.map((x) => (
                      <li key={x} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-brand-blue/5 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-blue">
                    <ArrowRight className="h-4 w-4" /> Recommended for
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {rec.join(" · ")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

