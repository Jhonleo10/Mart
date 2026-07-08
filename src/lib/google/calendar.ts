import { google, calendar_v3 } from "googleapis";
import { randomUUID } from "crypto";

export interface CreateMeetEventInput {
  summary: string;
  description: string;
  start: Date;
  end: Date;
  timezone: string;
  attendeeEmails: string[];
  calendarId?: string;
}

export interface MeetEventResult {
  eventId: string;
  meetLink: string;
  htmlLink: string;
  icsUid: string;
}

function getCalendarApi(auth: object) {
  return google.calendar({ version: "v3", auth: auth as never });
}

export async function createMeetCalendarEvent(
  auth: object,
  input: CreateMeetEventInput,
): Promise<MeetEventResult> {
  const calendar = getCalendarApi(auth);
  const calendarId = input.calendarId ?? "primary";
  const requestId = randomUUID();

  const event: calendar_v3.Schema$Event = {
    summary: input.summary,
    description: input.description,
    start: {
      dateTime: input.start.toISOString(),
      timeZone: input.timezone,
    },
    end: {
      dateTime: input.end.toISOString(),
      timeZone: input.timezone,
    },
    attendees: input.attendeeEmails.map((email) => ({ email })),
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 30 },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId,
    requestBody: event,
    conferenceDataVersion: 1,
    sendUpdates: "all",
  });

  const meetLink =
    response.data.hangoutLink ??
    response.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")
      ?.uri ??
    null;

  if (!response.data.id || !meetLink) {
    throw new Error("Google Calendar did not return a Meet link for this event");
  }

  return {
    eventId: response.data.id,
    meetLink,
    htmlLink: response.data.htmlLink ?? "",
    icsUid: response.data.iCalUID ?? requestId,
  };
}

export async function updateMeetCalendarEvent(
  auth: object,
  calendarId: string,
  eventId: string,
  input: Omit<CreateMeetEventInput, "calendarId">,
): Promise<MeetEventResult> {
  const calendar = getCalendarApi(auth);
  const requestId = randomUUID();

  const response = await calendar.events.patch({
    calendarId,
    eventId,
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: {
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.start.toISOString(), timeZone: input.timezone },
      end: { dateTime: input.end.toISOString(), timeZone: input.timezone },
      attendees: input.attendeeEmails.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  const meetLink =
    response.data.hangoutLink ??
    response.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")
      ?.uri ??
    null;

  if (!response.data.id || !meetLink) {
    throw new Error("Failed to update Google Calendar event with Meet link");
  }

  return {
    eventId: response.data.id,
    meetLink,
    htmlLink: response.data.htmlLink ?? "",
    icsUid: response.data.iCalUID ?? requestId,
  };
}

export async function cancelCalendarEvent(
  auth: object,
  calendarId: string,
  eventId: string,
): Promise<void> {
  const calendar = getCalendarApi(auth);
  await calendar.events.delete({
    calendarId,
    eventId,
    sendUpdates: "all",
  });
}
