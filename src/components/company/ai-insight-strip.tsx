"use client";

import Link from "next/link";
import { Sparkles, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AiInsightStrip({
  locked,
  headline,
  detail,
  href,
  score,
}: {
  locked: boolean;
  headline: string;
  detail: string;
  href: string;
  score?: number | null;
}) {
  return (
    <div
      className={cn(
        "relative mb-6 overflow-hidden rounded-2xl border p-5",
        locked
          ? "border-violet-200/80 bg-gradient-to-r from-violet-50 via-white to-brand-blue/5"
          : "border-violet-300/60 bg-gradient-to-r from-violet-500/10 via-brand-blue/5 to-brand-green/5",
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-400/10 blur-2xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-brand-blue text-white shadow-md">
            {locked ? <Lock className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
              Genius AI {locked ? "· Pro plan" : "· Insight"}
            </p>
            <h2 className="mt-0.5 font-heading text-base font-semibold text-slate-900 sm:text-lg">
              {headline}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{detail}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!locked && score != null && (
            <div className="text-center">
              <p className="text-2xl font-bold text-violet-600">{score}</p>
              <p className="text-[10px] font-semibold uppercase text-slate-400">AI score</p>
            </div>
          )}
          <Link href={href}>
            <Button size="sm" variant={locked ? "default" : "outline"} className="gap-1">
              {locked ? "Upgrade to Pro" : "Open AI Hub"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AiScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-brand-green bg-brand-green/15" : score >= 60 ? "text-brand-blue bg-brand-blue/15" : "text-amber-700 bg-amber-100";

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold", color)}>
      <Sparkles className="h-3 w-3" />
      AI {score}
    </span>
  );
}
