"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  name?: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function StarRatingInput({
  name = "rating",
  value,
  onChange,
  disabled = false,
  size = "md",
}: StarRatingInputProps) {
  const starSize = size === "sm" ? "h-5 w-5" : "h-7 w-7";

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={value} />
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          aria-label={`Rate ${star} out of 5 stars`}
          onClick={() => onChange(star)}
          className={cn(
            "rounded-md p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          <Star
            className={cn(
              starSize,
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-slate-300",
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-medium text-slate-600">
        {value > 0 ? `${value} / 5` : "Select rating"}
      </span>
    </div>
  );
}

interface StarRatingDisplayProps {
  rating: number;
  size?: "sm" | "md";
  showValue?: boolean;
}

export function StarRatingDisplay({
  rating,
  size = "sm",
  showValue = true,
}: StarRatingDisplayProps) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            starSize,
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-slate-300",
          )}
        />
      ))}
      {showValue ? (
        <span className="ml-1 text-xs font-semibold text-slate-600">{rating.toFixed(1)}</span>
      ) : null}
    </div>
  );
}
