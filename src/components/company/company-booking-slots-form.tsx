"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { saveCompanyBookingSlots, createCustomTimeSlot } from "@/actions/booking-time-slot.actions";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import type { BookingTimeSlotOption } from "@/lib/booking-time-slots";

export function CompanyBookingSlotsForm({
  allSlots,
  selectedSlotIds,
}: {
  allSlots: BookingTimeSlotOption[];
  selectedSlotIds: string[];
}) {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedSlotIds));
  const [saving, setSaving] = useState(false);
  const [customStartTime, setCustomStartTime] = useState("");
  const [customEndTime, setCustomEndTime] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);

  async function handleAddCustom() {
    if (!customStartTime || !customEndTime) {
      toast.error("Select both start and end time");
      return;
    }

    if (customStartTime >= customEndTime) {
      toast.error("End time must be after start time");
      return;
    }

    const ok = await confirm({
      title: "Add custom time slot?",
      description: "This creates a new demo window buyers can book after you open availability dates.",
      confirmLabel: "Add slot",
      variant: "default",
    });
    if (!ok) return;

    setAddingCustom(true);

    const startDate = new Date(`2000-01-01T${customStartTime}:00`);
    const endDate = new Date(`2000-01-01T${customEndTime}:00`);
    const startLabel = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const endLabel = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const label = `${startLabel} - ${endLabel}`;
    const value = `${customStartTime}-${customEndTime}`;

    const result = await createCustomTimeSlot(label, value);
    setAddingCustom(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    if (result.data?.id) {
      setSelected(new Set([...Array.from(selected), result.data.id]));
      toast.success("Custom time slot added and selected");
      setCustomStartTime("");
      setCustomEndTime("");
      router.refresh();
    }
  }

  function toggleSlot(slotId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slotId)) next.delete(slotId);
      else next.add(slotId);
      return next;
    });
  }

  async function handleSave() {
    if (selected.size === 0) {
      toast.error("Select at least one time slot");
      return;
    }

    const ok = await confirm({
      title: "Save booking time slots?",
      description: `Update your demo windows to ${selected.size} selected slot(s). Buyers will only see these times when scheduling.`,
      confirmLabel: "Save slots",
      variant: "default",
    });
    if (!ok) return;

    setSaving(true);
    const result = await saveCompanyBookingSlots(Array.from(selected));
    setSaving(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("Booking time slots updated");
    router.refresh();
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
      {confirmDialog}
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-brand-blue" />
        <h3 className="font-heading text-base font-semibold text-slate-900">
          Demo Booking Time Slots
        </h3>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Choose your general demo time windows, then schedule specific dates on the{" "}
        <a href="/company/availability" className="font-medium text-brand-blue hover:underline">
          Availability
        </a>{" "}
        page.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {allSlots.map((slot) => {
          const isChecked = selected.has(slot.id);
          return (
            <label
              key={slot.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${isChecked
                  ? "border-brand-blue/30 bg-brand-blue/5"
                  : "border-slate-200 bg-slate-50/80 hover:border-slate-300"
                }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleSlot(slot.id)}
                className="h-4 w-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
              />
              <span className="text-sm font-medium text-slate-700">{slot.label}</span>
            </label>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4">
        <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Add Custom Time:</label>
        <div className="flex flex-1 items-center gap-2">
          <input
            type="time"
            value={customStartTime}
            onChange={(e) => setCustomStartTime(e.target.value)}
            className="flex-1 rounded-lg border-slate-200 h-9 shrink-0 text-sm focus:ring-brand-blue focus:border-brand-blue"
            placeholder="Start"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="time"
            value={customEndTime}
            onChange={(e) => setCustomEndTime(e.target.value)}
            className="flex-1 rounded-lg border-slate-200 h-9 shrink-0 text-sm focus:ring-brand-blue focus:border-brand-blue"
            placeholder="End"
          />
          <Button type="button" size="sm" variant="secondary" onClick={handleAddCustom} disabled={addingCustom || !customStartTime || !customEndTime}>
            {addingCustom ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500 font-medium">
          <span className="text-brand-blue">{selected.size}</span> of {allSlots.length} slots selected
        </p>
        <Button type="button" size="sm" onClick={handleSave} disabled={saving} className="bg-brand-blue hover:bg-brand-blue/90 shadow-sm">
          {saving ? "Saving..." : "Save time slots"}
        </Button>
      </div>
    </div>
  );
}
