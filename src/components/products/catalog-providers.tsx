"use client";

import { ComparisonProvider } from "@/components/compare/comparison-tray-context";
import { ComparisonTray } from "@/components/compare/comparison-tray";

export function CatalogProviders({ children }: { children: React.ReactNode }) {
  return (
    <ComparisonProvider>
      {children}
      <ComparisonTray />
    </ComparisonProvider>
  );
}
