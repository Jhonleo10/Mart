"use client";

import dynamic from "next/dynamic";

export const RequirementWizard = dynamic(
  () => import("./requirement-wizard").then((m) => m.RequirementWizard),
  {
    ssr: false,
    loading: () => (
      <div className="dash-panel flex min-h-[20rem] items-center justify-center p-8">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-brand-blue border-t-transparent"
          aria-hidden
        />
      </div>
    ),
  },
);
