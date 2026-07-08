import { summarizeReviews } from "@/lib/intelligence/review-nlp";
import { Sparkles, ThumbsUp, ThumbsDown, Target } from "lucide-react";

export function ReviewSummaryPanel({
  reviews,
  features,
  suitableFor,
}: {
  reviews: { rating: number; comment: string | null }[];
  features: string[];
  suitableFor: string[];
}) {
  const summary = summarizeReviews(reviews, features, suitableFor);

  return (
    <div className="discovery-glass rounded-2xl border border-slate-200/80 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-brand-blue" />
        <h3 className="font-heading text-base font-semibold text-slate-900">Intelligent review summary</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{summary.overallSummary}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-green-dark">
            <ThumbsUp className="h-3.5 w-3.5" />
            Things users love
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {summary.thingsUsersLove.map((t) => (
              <li key={t}>• {t}</li>
            ))}
          </ul>
        </div>
        {summary.commonComplaints.length > 0 && (
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <ThumbsDown className="h-3.5 w-3.5" />
              Common complaints
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-500">
              {summary.commonComplaints.map((t) => (
                <li key={t}>• {t}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {summary.mentionedFeatures.slice(0, 5).map((m) => (
          <span key={m.feature} className="rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs font-medium text-brand-blue">
            {m.feature} ({m.count})
          </span>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Target className="h-3.5 w-3.5" />
          Best suited for
        </p>
        <p className="mt-1 text-sm text-slate-600">{summary.bestSuitedFor.join(" · ")}</p>
        <p className="mt-2 text-sm font-medium text-brand-blue">{summary.overallVerdict}</p>
      </div>
    </div>
  );
}
