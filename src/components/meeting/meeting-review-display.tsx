import { StarRatingDisplay } from "@/components/ui/star-rating";

export function MeetingReviewDisplay({
  rating,
  feedback,
  role,
}: {
  rating: number;
  feedback: string;
  role: "USER" | "COMPANY" | "ADMIN";
}) {
  return (
    <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">
          {role === "USER" ? "Your review" : "Buyer review"}
        </p>
        <StarRatingDisplay rating={rating} size="md" />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{feedback}</p>
      {role === "USER" ? (
        <p className="mt-2 text-xs text-slate-400">
          This review is published on the product page to help other buyers.
        </p>
      ) : null}
    </div>
  );
}
