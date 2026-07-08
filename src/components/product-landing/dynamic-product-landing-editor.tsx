"use client";

import dynamic from "next/dynamic";

export const ProductLandingEditor = dynamic(
  () => import("./product-landing-editor").then((m) => m.ProductLandingEditor),
  {
    ssr: false,
    loading: () => (
      <div className="dash-panel flex min-h-[24rem] items-center justify-center p-8">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-brand-blue border-t-transparent"
          aria-hidden
        />
      </div>
    ),
  },
);
