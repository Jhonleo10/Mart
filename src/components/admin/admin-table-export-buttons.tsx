"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type AdminExportEntity = "companies" | "products" | "users" | "payments";

interface AdminTableExportButtonsProps {
  entity: AdminExportEntity;
  searchParams?: Record<string, string | undefined>;
}

export function AdminTableExportButtons({ entity, searchParams = {} }: AdminTableExportButtonsProps) {
  const [loading, setLoading] = useState<"pdf" | "xlsx" | null>(null);

  async function download(format: "pdf" | "xlsx") {
    setLoading(format);
    try {
      const params = new URLSearchParams({ entity, format });
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      const res = await fetch(`/api/admin/export?${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename =
        match?.[1] ?? `dgm-${entity}.${format === "xlsx" ? "xlsx" : "pdf"}`;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success(format === "xlsx" ? "Excel downloaded" : "PDF downloaded");
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="admin-export-actions flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="admin-export-btn gap-2"
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
        className="admin-export-btn gap-2"
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
