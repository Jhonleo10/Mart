import { DEFAULT_BOOKING_TIME_SLOTS } from "@/lib/booking-time-slots";
import { formatDateInput, minBookableDate } from "@/lib/date-utils";
import { parseScheduledDateTime } from "@/lib/validations/meeting";

const BOOKING_TIMEZONE = "Asia/Kolkata";

/** Map stored preferred time (label or HH:mm) to a time input value. */
export function parsePreferredTimeValue(preferredTime: string | null | undefined): string | null {
  if (!preferredTime?.trim()) return null;

  const trimmed = preferredTime.trim();
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;

  const fromCatalog = DEFAULT_BOOKING_TIME_SLOTS.find(
    (slot) => slot.label === trimmed || slot.value === trimmed,
  );
  if (fromCatalog) return fromCatalog.value;

  const twelveHour = trimmed.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (twelveHour) {
    let hour = Number(twelveHour[1]);
    const minute = twelveHour[2];
    const meridiem = twelveHour[3].toUpperCase();
    if (meridiem === "PM" && hour < 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  return null;
}

export function isSlotInPast(
  dateInput: string,
  slotValue: string,
  timezone = BOOKING_TIMEZONE,
): boolean {
  try {
    const start = parseScheduledDateTime(dateInput, slotValue, timezone);
    return start.getTime() <= Date.now();
  } catch {
    return false;
  }
}

export function resolveMeetingDefaultsFromBooking(input: {
  preferredDate?: Date | null;
  preferredTime?: string | null;
  timezone?: string;
}): { meetingDate: string; meetingTime: string } {
  const timezone = input.timezone ?? BOOKING_TIMEZONE;
  const today = minBookableDate();

  let meetingDate = input.preferredDate ? formatDateInput(input.preferredDate) : today;
  if (meetingDate < today) meetingDate = today;

  let meetingTime =
    parsePreferredTimeValue(input.preferredTime) ??
    DEFAULT_BOOKING_TIME_SLOTS[1]?.value ??
    "10:00";

  if (isSlotInPast(meetingDate, meetingTime, timezone)) {
    const nextSlot = DEFAULT_BOOKING_TIME_SLOTS.find(
      (slot) => !isSlotInPast(meetingDate, slot.value, timezone),
    );
    if (nextSlot) {
      meetingTime = nextSlot.value;
    } else {
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      meetingDate = formatDateInput(tomorrow);
      meetingTime = DEFAULT_BOOKING_TIME_SLOTS[0]?.value ?? "09:00";
    }
  }

  return { meetingDate, meetingTime };
}
