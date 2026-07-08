import test from "node:test";
import assert from "node:assert/strict";
import {
  isSlotInPast,
  parsePreferredTimeValue,
  resolveMeetingDefaultsFromBooking,
} from "@/lib/meetings/booking-schedule-defaults";

test("parsePreferredTimeValue parses slot labels", () => {
  assert.equal(parsePreferredTimeValue("9:00 AM – 10:00 AM"), "09:00");
  assert.equal(parsePreferredTimeValue("14:00"), "14:00");
});

test("resolveMeetingDefaultsFromBooking uses buyer preferred date and time", () => {
  const result = resolveMeetingDefaultsFromBooking({
    preferredDate: new Date(Date.UTC(2026, 5, 15)),
    preferredTime: "2:00 PM – 3:00 PM",
  });
  assert.equal(result.meetingDate, "2026-06-15");
  assert.equal(result.meetingTime, "14:00");
});

test("isSlotInPast returns false for future dates", () => {
  assert.equal(isSlotInPast("2099-01-01", "09:00"), false);
});
