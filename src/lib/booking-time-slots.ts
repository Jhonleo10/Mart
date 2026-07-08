export type BookingSlotStatus = "available" | "booked" | "past";

export interface BookingTimeSlotOption {
  id: string;
  label: string;
  value: string;
}

export interface BookingSlotWithStatus extends BookingTimeSlotOption {
  availabilityId?: string;
  status: BookingSlotStatus;
}

/** Default demo windows — seeded in DB; used as a typed reference for UI copy. */
export const DEFAULT_BOOKING_TIME_SLOTS: Omit<BookingTimeSlotOption, "id">[] = [
  { label: "9:00 AM – 10:00 AM", value: "09:00" },
  { label: "10:00 AM – 11:00 AM", value: "10:00" },
  { label: "11:00 AM – 12:00 PM", value: "11:00" },
  { label: "2:00 PM – 3:00 PM", value: "14:00" },
  { label: "3:00 PM – 4:00 PM", value: "15:00" },
  { label: "4:00 PM – 5:00 PM", value: "16:00" },
];
