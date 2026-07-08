import { cn } from "@/lib/utils";
import { healthScoreBg, healthScoreColor } from "@/lib/vendor-health-score";

/** Compact pill badge — used in dense layouts */
export function VendorHealthBadge({ score, label }: { score: number; label: string }) {
  return (
    <div
      className={cn(
        "admin-health-pill inline-flex flex-col items-center rounded-xl px-2.5 py-1.5 text-center",
        healthScoreBg(score),
      )}
      title={`Health: ${label}`}
    >
      <span className={cn("text-sm font-bold tabular-nums", healthScoreColor(score))}>{score}</span>
      <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
    </div>
  );
}

/** Circular ring meter — primary display in admin tables */
export function VendorHealthMeter({
  score,
  label,
  size = "md",
}: {
  score: number;
  label: string;
  size?: "sm" | "md";
}) {
  const radius = size === "sm" ? 16 : 20;
  const stroke = size === "sm" ? 3 : 3.5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;
  const dimension = (radius + stroke) * 2;

  const ringColor =
    score >= 75 ? "#00c367" : score >= 50 ? "#0076df" : score >= 30 ? "#f59e0b" : "#ef4444";

  return (
    <div
      className="admin-health-meter group inline-flex flex-col items-center gap-1"
      title={`Vendor health: ${label} (${score}/100)`}
    >
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <svg width={dimension} height={dimension} className="-rotate-90">
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke="rgba(148,163,184,0.25)"
            strokeWidth={stroke}
          />
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center font-bold tabular-nums",
            healthScoreColor(score),
            size === "sm" ? "text-[10px]" : "text-xs",
          )}
        >
          {score}
        </span>
      </div>
      <span className="max-w-[4.5rem] truncate text-center text-[9px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
    </div>
  );
}
