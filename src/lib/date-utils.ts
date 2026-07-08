/** Parse YYYY-MM-DD into a UTC date-only value for DB storage. */
export function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Format a date-only value for HTML date inputs (YYYY-MM-DD). */
export function formatDateInput(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Minimum bookable date (today, UTC). */
export function minBookableDate(): string {
  return formatDateInput(new Date());
}
