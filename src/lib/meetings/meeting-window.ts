export function getMeetingWindowEnd(scheduledAt: Date, durationMinutes: number): Date {
  return new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000);
}

/** Meeting can only be marked complete while it is in progress (start ≤ now ≤ end). */
export function canCompleteMeeting(
  scheduledAt: Date,
  durationMinutes: number,
  now = new Date(),
): boolean {
  const start = scheduledAt.getTime();
  const end = getMeetingWindowEnd(scheduledAt, durationMinutes).getTime();
  const t = now.getTime();
  return t >= start && t <= end;
}

export function isMeetingUpcoming(
  scheduledAt: Date,
  status: string,
  now = new Date(),
): boolean {
  return status === "SCHEDULED" && scheduledAt.getTime() > now.getTime();
}

export function formatCountdown(scheduledAt: Date, now = new Date()): string | null {
  const diff = scheduledAt.getTime() - now.getTime();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

  if (days > 0) return `Starts in ${days}d ${hours}h`;
  if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
  return `Starts in ${minutes}m`;
}
