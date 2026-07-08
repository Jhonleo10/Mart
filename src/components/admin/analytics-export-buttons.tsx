"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface AnalyticsExportButtonsProps {
  days?: number;
}

export function AnalyticsExportButtons({ days = 30 }: AnalyticsExportButtonsProps) {
  const [loading, setLoading] = useState<"pdf" | "xlsx" | null>(null);

  async function download(format: "pdf" | "xlsx") {
    setLoading(format);
    try {
      const res = await fetch(`/api/admin/analytics/export?format=${format}&days=${days}`);
      if (!res.ok) {
        throw new Error("Export failed");
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename =
        match?.[1] ?? `dgm-analytics-${days}d.${format === "xlsx" ? "xlsx" : "pdf"}`;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success(format === "xlsx" ? "Excel report downloaded" : "PDF report downloaded");
    } catch {
      toast.error("Could not download report. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 bg-white"
        disabled={loading !== null}
        onClick={() => download("xlsx")}
      >
        {loading === "xlsx" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4 text-brand-green" />
        )}
        Excel
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 bg-white"
        disabled={loading !== null}
        onClick={() => download("pdf")}
      >
        {loading === "pdf" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4 text-brand-blue" />
        )}
        PDF
      </Button>
    </div>
  );
}
