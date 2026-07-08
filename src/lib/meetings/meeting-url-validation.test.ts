import test from "node:test";
import assert from "node:assert/strict";
import {
  MeetingUrlValidationError,
  providerRequiresManualUrl,
  validateMeetingUrl,
} from "@/lib/meetings/meeting-url-validation";
import { resolveMeetingLink, resolveMeetingProvider } from "@/lib/meetings/meeting-link";

test("validateMeetingUrl rejects javascript protocol", () => {
  assert.throws(
    () => validateMeetingUrl("CUSTOM", "javascript:alert(1)"),
    (error: unknown) => error instanceof MeetingUrlValidationError,
  );
});

test("validateMeetingUrl rejects non-HTTPS", () => {
  assert.throws(
    () => validateMeetingUrl("CUSTOM", "http://example.com/meet"),
    /HTTPS/i,
  );
});

test("validateMeetingUrl accepts custom HTTPS URL", () => {
  const url = validateMeetingUrl("CUSTOM", "https://meet.example.com/room/abc");
  assert.equal(url, "https://meet.example.com/room/abc");
});

test("validateMeetingUrl accepts Teams URL", () => {
  const url = validateMeetingUrl(
    "TEAMS",
    "https://teams.microsoft.com/l/meetup-join/19%3ameeting",
  );
  assert.ok(url.startsWith("https://teams.microsoft.com/"));
});

test("validateMeetingUrl rejects invalid Teams host", () => {
  assert.throws(
    () => validateMeetingUrl("TEAMS", "https://zoom.us/j/123"),
    /Teams meeting URL/i,
  );
});

test("validateMeetingUrl accepts zoom.us", () => {
  const url = validateMeetingUrl("ZOOM", "https://zoom.us/j/123456789");
  assert.equal(url, "https://zoom.us/j/123456789");
});

test("validateMeetingUrl accepts subdomain zoom host", () => {
  const url = validateMeetingUrl("ZOOM", "https://company.zoom.us/my/meeting");
  assert.ok(url.includes("zoom.us"));
});

test("validateMeetingUrl rejects Google manual URL", () => {
  assert.throws(
    () => validateMeetingUrl("GOOGLE", "https://meet.google.com/abc-defg-hij"),
    /generated automatically/i,
  );
});

test("providerRequiresManualUrl", () => {
  assert.equal(providerRequiresManualUrl("GOOGLE"), false);
  assert.equal(providerRequiresManualUrl("TEAMS"), true);
  assert.equal(providerRequiresManualUrl("ZOOM"), true);
  assert.equal(providerRequiresManualUrl("CUSTOM"), true);
});

test("resolveMeetingLink prefers meetingLink over legacy field", () => {
  assert.equal(
    resolveMeetingLink({
      meetingLink: "https://teams.microsoft.com/l/meet",
      googleMeetLink: "https://meet.google.com/old",
    }),
    "https://teams.microsoft.com/l/meet",
  );
});

test("resolveMeetingLink falls back to googleMeetLink", () => {
  assert.equal(
    resolveMeetingLink({ meetingLink: null, googleMeetLink: "https://meet.google.com/legacy" }),
    "https://meet.google.com/legacy",
  );
});

test("resolveMeetingProvider infers GOOGLE from legacy link", () => {
  assert.equal(
    resolveMeetingProvider({ meetingProvider: null, googleMeetLink: "https://meet.google.com/x" }),
    "GOOGLE",
  );
});
