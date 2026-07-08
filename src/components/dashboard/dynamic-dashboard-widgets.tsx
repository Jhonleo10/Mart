"use client";

import dynamic from "next/dynamic";

function ChartSkeleton() {
  return (
    <div className="dash-panel flex h-[14.5rem] items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-brand-blue border-t-transparent"
        aria-hidden
      />
    </div>
  );
}

export const DonutStatusCard = dynamic(
  () => import("./donut-status-card").then((m) => m.DonutStatusCard),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
