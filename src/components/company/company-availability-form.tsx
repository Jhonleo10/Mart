"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Clock, Plus, Trash2, Ban } from "lucide-react";
import {
  addCompanyAvailability,
  removeCompanyAvailability,
  removeCompanyAvailabilityForDate,
} from "@/actions/company-availability.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import { formatDateInput, minBookableDate } from "@/lib/date-utils";
import type { BookingTimeSlotOption } from "@/lib/booking-time-slots";
import { cn } from "@/lib/utils";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

interface UpcomingAvailability {
  id: string;
  date: Date;
  slotId: string;
  bookingTimeSlot: { label: string };
  isBooked: boolean;
}

export interface DateScheduleSummary {
  date: string;
  openCount: number;
  bookedCount: number;
}

export function CompanyAvailabilityForm({
  configuredSlots,
  upcomingAvailability,
  dateSummaries,
}: {
  configuredSlots: BookingTimeSlotOption[];
  upcomingAvailability: UpcomingAvailability[];
  dateSummaries: DateScheduleSummary[];
}) {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [date, setDate] = useState(minBookableDate());
  const [selectedSlotIds, setSelectedSlotIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [closingDay, setClosingDay] = useState(false);
  const [applyToAll, setApplyToAll] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);

  const groupedUpcoming = useMemo(() => {
    const groups = new Map<string, UpcomingAvailability[]>();
    for (const entry of upcomingAvailability) {
      const key = formatDateInput(entry.date);
      const list = groups.get(key) ?? [];
      list.push(entry);
      groups.set(key, list);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [upcomingAvailability]);

  const entriesOnSelectedDate = useMemo(
    () => upcomingAvailability.filter((entry) => formatDateInput(entry.date) === date),
    [upcomingAvailability, date],
  );

  const isToday = useMemo(() => date === formatDateInput(new Date()), [date]);

  const currentMinutes = useMemo(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, []);

  function isSlotPast(slotLabel: string) {
    if (!isToday) return false;
    const match = slotLabel.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return false;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return (h * 60 + m) < currentMinutes;
  }

  const openSlotIdsOnDate = useMemo(
    () => new Set(entriesOnSelectedDate.map((e) => e.slotId)),
    [entriesOnSelectedDate],
  );

  const summaryByDate = useMemo(
    () => new Map(dateSummaries.map((s) => [s.date, s])),
    [dateSummaries],
  );

  function selectAllOpenableSlots() {
    setSelectedSlotIds(new Set(configuredSlots.map((slot) => slot.id)));
    setBulkMode(true);
    setApplyToAll(true);
  }

  function selectDateFromOverview(dateKey: string) {
    setDate(dateKey);
    setSelectedSlotIds(new Set());
  }

  function toggleSlot(slotId: string) {
    if (openSlotIdsOnDate.has(slotId)) return;
    setSelectedSlotIds((prev) => {
      const next = new Set(prev);
      if (next.has(slotId)) next.delete(slotId);
      else next.add(slotId);
      return next;
    });
  }

  async function handleAdd() {
    if (!date) {
      toast.error("Select a date");
      return;
    }
    if (selectedSlotIds.size === 0) {
      toast.error("Select at least one time slot to open");
      return;
    }

    const ok = await confirm({
      title: applyToAll ? "Open slots on all upcoming days?" : "Open selected time slots?",
      description: applyToAll
        ? `This will open ${selectedSlotIds.size} slot(s) on all ${dateSummaries.length} upcoming days for buyer booking.`
        : `This will open ${selectedSlotIds.size} slot(s) on ${formatDate(date)} for buyer booking.`,
      confirmLabel: applyToAll ? "Open on all days" : "Open slots",
      variant: "default",
    });
    if (!ok) return;

    setAdding(true);
    let errorOccurred = false;

    if (applyToAll) {
      for (const summary of dateSummaries) {
        const result = await addCompanyAvailability(summary.date, Array.from(selectedSlotIds));
        if ("error" in result) {
          errorOccurred = true;
        }
      }
    } else {
      const result = await addCompanyAvailability(date, Array.from(selectedSlotIds));
      if ("error" in result) {
        errorOccurred = true;
        toast.error(result.error);
      }
    }
    setAdding(false);

    if (errorOccurred && !applyToAll) {
      return;
    } else if (errorOccurred && applyToAll) {
      toast.error("Some dates failed to update, please check.");
    } else {
      toast.success(applyToAll ? "Availability updated for all upcoming days" : "Availability updated for this date");
    }

    setSelectedSlotIds(new Set());
    setApplyToAll(false);
    router.refresh();
  }

  async function handleRemove(id: string, slotLabel: string) {
    const ok = await confirm({
      title: "Remove this time slot?",
      description: `Mark "${slotLabel}" unavailable on ${formatDate(date)}. Buyers will no longer be able to book it.`,
      confirmLabel: "Remove slot",
      variant: "destructive",
    });
    if (!ok) return;

    setRemovingId(id);
    const result = await removeCompanyAvailability(id);
    setRemovingId(null);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("Slot marked unavailable for this date");
    router.refresh();
  }

  async function handleCloseDay() {
    if (!date) return;

    const ok = await confirm({
      title: "Close entire day?",
      description: `This removes all open slots on ${formatDate(date)}. Booked slots cannot be closed.`,
      confirmLabel: "Close day",
      variant: "destructive",
    });
    if (!ok) return;

    setClosingDay(true);
    const result = await removeCompanyAvailabilityForDate(date);
    setClosingDay(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("All open slots closed for this date");
    router.refresh();
  }

  if (configuredSlots.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-medium">Configure your demo time windows first</p>
        <p className="mt-2 text-amber-800/90">
          Select the time slots buyers can book above, then open specific dates below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {confirmDialog}
      <div className="company-bulk-availability rounded-2xl border border-brand-green/25 bg-gradient-to-br from-brand-green/10 via-white to-brand-blue/5 p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="font-heading text-base font-semibold text-slate-900">Bulk schedule</h3>
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              Open the same time slots across all {dateSummaries.length} upcoming days in one step —
              ideal when you want buyers to book any day.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectAllOpenableSlots}
            className="border-brand-green/40 text-brand-green-dark hover:bg-brand-green/10"
          >
            Select all slots & apply to all days
          </Button>
        </div>
        {bulkMode && selectedSlotIds.size > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-brand-green/20 bg-white/80 px-4 py-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={() => setApplyToAll(!applyToAll)}
                className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
              />
              Apply to all {dateSummaries.length} days
            </label>
            <Button type="button" onClick={handleAdd} disabled={adding} className="bg-brand-green text-white hover:bg-brand-green-dark">
              <Plus className="h-4 w-4" />
              {adding ? "Saving..." : `Open ${selectedSlotIds.size} slot(s)${applyToAll ? " on every day" : ""}`}
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-brand-blue" />
          <h3 className="font-heading text-base font-semibold text-slate-900">Date overview</h3>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Tap a date to manage which time slots are open. Days with no open slots are unavailable
          for buyers.
        </p>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {dateSummaries.map((summary) => {
            const isSelected = summary.date === date;
            const hasOpen = summary.openCount > 0;
            return (
              <button
                key={summary.date}
                type="button"
                onClick={() => selectDateFromOverview(summary.date)}
                className={cn(
                  "min-w-[88px] shrink-0 rounded-xl border px-3 py-2 text-left transition-colors",
                  isSelected
                    ? "border-brand-blue bg-brand-blue/10"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300",
                )}
              >
                <span className="block text-xs font-medium text-slate-500">
                  {formatDate(summary.date).split(",")[0]}
                </span>
                <span className="mt-0.5 block text-sm font-semibold text-slate-800">
                  {new Date(`${summary.date}T00:00:00`).getDate()}
                </span>
                <span
                  className={cn(
                    "mt-1 block text-[10px] font-medium uppercase tracking-wide",
                    !hasOpen
                      ? "text-slate-400"
                      : summary.bookedCount === summary.openCount
                        ? "text-amber-600"
                        : "text-brand-green",
                  )}
                >
                  {!hasOpen
                    ? "Unavailable"
                    : `${summary.openCount - summary.bookedCount} open`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-blue" />
              <h3 className="font-heading text-base font-semibold text-slate-900">
                Manage {formatDate(date)}
              </h3>
            </div>
            {entriesOnSelectedDate.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={closingDay}
                onClick={handleCloseDay}
                className="text-red-600 hover:text-red-700"
              >
                <Ban className="h-4 w-4" />
                {closingDay ? "Closing..." : "Close day"}
              </Button>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Open slots buyers can book, or remove slots to mark yourself unavailable.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="availability-date">Date</Label>
              <Input
                id="availability-date"
                type="date"
                min={minBookableDate()}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedSlotIds(new Set());
                }}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Time slots on this date</Label>
              <div className="mt-2 grid grid-cols-1 gap-2">
                {configuredSlots.map((slot) => {
                  const entry = entriesOnSelectedDate.find((e) => e.slotId === slot.id);
                  const isOpen = Boolean(entry);
                  const isBooked = entry?.isBooked ?? false;
                  const checked = selectedSlotIds.has(slot.id);
                  const past = isSlotPast(slot.label);

                  if (isOpen) {
                    return (
                      <div
                        key={slot.id}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-all",
                          isBooked
                            ? "border-amber-200 bg-amber-50"
                            : "border-brand-green/30 bg-brand-green/5",
                          past ? "opacity-50 grayscale" : ""
                        )}
                      >
                        <div>
                          <span className="text-sm font-medium text-slate-700">{slot.label}</span>
                          <span
                            className={cn(
                              "mt-0.5 block text-xs font-medium",
                              isBooked ? "text-amber-700" : "text-brand-green",
                            )}
                          >
                            {isBooked ? "Booked by buyer" : "Open for booking"}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={removingId === entry?.id || isBooked}
                          title={isBooked ? "Cannot remove booked slot" : "Mark unavailable"}
                          onClick={() => entry && handleRemove(entry.id, slot.label)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <label
                      key={slot.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                        checked
                          ? "border-brand-green/30 bg-brand-green/5"
                          : "border-slate-200 bg-slate-50/80 hover:border-slate-300",
                        past ? "opacity-50 grayscale hover:border-slate-200" : ""
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSlot(slot.id)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-green focus:ring-brand-green"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {slot.label}
                        <span className="mt-0.5 block text-xs font-normal text-slate-400">
                          Not available — check to open
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {selectedSlotIds.size > 0 && !bulkMode && (
              <div className="flex flex-col gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={applyToAll}
                    onChange={() => setApplyToAll(!applyToAll)}
                    className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
                  />
                  Also apply to all {dateSummaries.length} upcoming days
                </label>
                <Button
                  type="button"
                  onClick={handleAdd}
                  disabled={adding}
                  className="w-full bg-brand-green text-white hover:bg-brand-green-dark sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  {adding ? "Saving..." : `Open ${selectedSlotIds.size} slot(s)${applyToAll ? " / all days" : ""}`}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-green" />
            <h3 className="font-heading text-base font-semibold text-slate-900">Upcoming schedule</h3>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {upcomingAvailability.length === 0
              ? "No upcoming demo slots — buyers cannot book demos until you open dates."
              : `${upcomingAvailability.length} open slot${upcomingAvailability.length === 1 ? "" : "s"} across ${groupedUpcoming.length} day${groupedUpcoming.length === 1 ? "" : "s"}`}
          </p>

          {groupedUpcoming.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-amber-200 bg-amber-50/80 p-8 text-center text-sm text-amber-900">
              <p className="font-medium">No availability scheduled</p>
              <p className="mt-2 text-amber-800/90">
                Buyers will not see bookable time slots until you open at least one date above.
              </p>
            </div>
          ) : (
            <ul className="mt-4 max-h-[420px] space-y-4 overflow-y-auto pr-1">
              {groupedUpcoming.map(([dateKey, entries]) => {
                const summary = summaryByDate.get(dateKey);
                return (
                  <li key={dateKey}>
                    <button
                      type="button"
                      onClick={() => selectDateFromOverview(dateKey)}
                      className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-brand-blue"
                    >
                      {formatDate(dateKey)}
                      {summary ? ` · ${summary.openCount - summary.bookedCount} open` : null}
                    </button>
                    <ul className="mt-2 space-y-2">
                      {entries.map((entry) => (
                        <li
                          key={entry.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5"
                        >
                          <div>
                            <span className="text-sm font-medium text-slate-700">
                              {entry.bookingTimeSlot.label}
                            </span>
                            <span
                              className={cn(
                                "mt-0.5 block text-xs font-medium",
                                entry.isBooked ? "text-amber-700" : "text-brand-green",
                              )}
                            >
                              {entry.isBooked ? "Booked" : "Open"}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
