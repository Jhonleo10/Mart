"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeadKanban } from "./lead-kanban";
import type { BookingStatus } from "@prisma/client";

export type LeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: BookingStatus;
  preferredDate: Date | null;
  preferredTime: string | null;
  message: string | null;
  createdAt: Date;
  product: { name: string } | null;
  hasScheduledMeeting?: boolean;
  preferredDateIso?: string;
};

export function LeadsViewToggle({
  listView,
  kanbanView,
  defaultView = "list",
}: {
  listView: React.ReactNode;
  kanbanView: React.ReactNode;
  defaultView?: "list" | "kanban";
}) {
  const [view, setView] = useState<"list" | "kanban">(defaultView);

  return (
    <div>
      <div className="mb-4 flex items-center justify-end gap-1 rounded-xl border border-slate-200 bg-white p-1 w-fit ml-auto">
        <button
          type="button"
          onClick={() => setView("list")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            view === "list" ? "bg-brand-green text-white" : "text-slate-500 hover:text-slate-700",
          )}
        >
          <List className="h-3.5 w-3.5" />
          List
        </button>
        <button
          type="button"
          onClick={() => setView("kanban")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            view === "kanban" ? "bg-brand-green text-white" : "text-slate-500 hover:text-slate-700",
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Kanban
        </button>
      </div>
      {view === "list" ? listView : kanbanView}
    </div>
  );
}

export { LeadKanban };
