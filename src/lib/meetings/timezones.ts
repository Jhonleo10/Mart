export const MEETING_TIMEZONES = [
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Dubai", label: "UAE (GST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Europe/London", label: "UK (GMT/BST)" },
  { value: "Europe/Paris", label: "Central Europe (CET)" },
  { value: "America/New_York", label: "US Eastern" },
  { value: "America/Chicago", label: "US Central" },
  { value: "America/Los_Angeles", label: "US Pacific" },
  { value: "Australia/Sydney", label: "Australia (Sydney)" },
  { value: "UTC", label: "UTC" },
] as const;

export const MEETING_DURATIONS = [15, 30, 45, 60, 90, 120] as const;
