"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { minBookableDate } from "@/lib/date-utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseYmd(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

interface BookDemoDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  className?: string;
}

export function BookDemoDatePicker({
  value,
  onChange,
  min = minBookableDate(),
  className,
}: BookDemoDatePickerProps) {
  const selected = value ? parseYmd(value) : null;
  const minDate = parseYmd(min);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selected ?? minDate));

  const cells = useMemo(() => {
    const first = startOfMonth(viewMonth);
    const startPad = first.getDay();
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const items: { date: Date; inMonth: boolean }[] = [];

    for (let i = 0; i < startPad; i++) {
      const d = new Date(first);
      d.setDate(d.getDate() - (startPad - i));
      items.push({ date: d, inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      items.push({
        date: new Date(first.getFullYear(), first.getMonth(), day),
        inMonth: true,
      });
    }
    while (items.length % 7 !== 0) {
      const last = items[items.length - 1].date;
      const d = new Date(last);
      d.setDate(d.getDate() + 1);
      items.push({ date: d, inMonth: false });
    }
    return items;
  }, [viewMonth]);

  const monthLabel = viewMonth.toLocaleString("en-IN", { month: "long", year: "numeric" });
  const todayYmd = toYmd(new Date());

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-brand-blue/15 bg-gradient-to-br from-white via-brand-blue/[0.03] to-brand-green/[0.04] p-3 shadow-sm",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, -1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-brand-blue/30 hover:text-brand-blue"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold text-slate-800">{monthLabel}</p>
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-brand-blue/30 hover:text-brand-blue"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400"
          >
            {day}
          </span>
        ))}
        {cells.map(({ date, inMonth }) => {
          const ymd = toYmd(date);
          const isDisabled = date < minDate;
          const isSelected = value === ymd;
          const isToday = ymd === todayYmd;

          return (
            <button
              key={ymd + (inMonth ? "in" : "out")}
              type="button"
              disabled={isDisabled}
              onClick={() => onChange(ymd)}
              className={cn(
                "relative flex h-9 w-full items-center justify-center rounded-xl text-sm font-medium transition-all",
                !inMonth && "text-slate-300",
                inMonth && !isDisabled && "text-slate-700 hover:bg-brand-blue/10 hover:text-brand-blue",
                isDisabled && "cursor-not-allowed text-slate-300",
                isSelected &&
                  "bg-gradient-brand text-white shadow-md shadow-brand-blue/20 hover:text-white",
                isToday && !isSelected && "ring-1 ring-brand-green/40",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {value ? (
        <p className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-center text-xs text-slate-600">
          Selected:{" "}
          <span className="font-semibold text-brand-blue">
            {parseYmd(value).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </p>
      ) : null}
    </div>
  );
}
