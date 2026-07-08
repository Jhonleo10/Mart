import type { MeetingProvider } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { isGoogleOAuthConfigured } from "@/lib/google/oauth";
import { calendarService } from "@/services/calendar.service";
import { companyGoogleRepository } from "@/repositories/meeting.repository";
import {
  MeetingUrlValidationError,
  providerRequiresManualUrl,
  validateMeetingUrl,
} from "@/lib/meetings/meeting-url-validation";

export interface ResolvedMeetingLink {
  meetingProvider: MeetingProvider;
  meetingLink: string;
  googleEventId?: string;
  googleCalendarId?: string;
  icsUid?: string;
}

export interface ScheduleLinkInput {
  companyId: string;
  provider: MeetingProvider;
  meetingUrl?: string | null;
  summary: string;
  description: string;
  start: Date;
  end: Date;
  timezone: string;
  attendeeEmails: string[];
}

async function assertGoogleConnected(companyId: string) {
  if (!isGoogleOAuthConfigured()) {
    throw new AppError(
      "Google Calendar is not configured on this server. Contact support or choose another provider.",
      503,
    );
  }
  const connection = await companyGoogleRepository.findByCompanyId(companyId);
  if (!connection) {
    throw new AppError("Connect Google Calendar before scheduling Google Meet meetings", 400);
  }
  return connection;
}

export const meetingProviderService = {
  async resolveScheduleLink(input: ScheduleLinkInput): Promise<ResolvedMeetingLink> {
    if (input.provider === "GOOGLE") {
      await assertGoogleConnected(input.companyId);
      const connection = await companyGoogleRepository.findByCompanyId(input.companyId);
      const googleEvent = await calendarService.createMeetEvent(input.companyId, {
        summary: input.summary,
        description: input.description,
        start: input.start,
        end: input.end,
        timezone: input.timezone,
        attendeeEmails: input.attendeeEmails,
      });

      return {
        meetingProvider: "GOOGLE",
        meetingLink: googleEvent.meetLink,
        googleEventId: googleEvent.eventId,
        googleCalendarId: connection?.calendarId ?? "primary",
        icsUid: googleEvent.icsUid,
      };
    }

    if (!providerRequiresManualUrl(input.provider)) {
      throw new AppError("Unsupported meeting provider", 400);
    }

    try {
      const meetingLink = validateMeetingUrl(input.provider, input.meetingUrl ?? "");
      return {
        meetingProvider: input.provider,
        meetingLink,
      };
    } catch (error) {
      if (error instanceof MeetingUrlValidationError) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  },

  async resolveRescheduleLink(
    input: ScheduleLinkInput & {
      existingGoogleEventId?: string | null;
      existingGoogleCalendarId?: string;
      existingMeetingLink?: string | null;
    },
  ): Promise<ResolvedMeetingLink> {
    if (input.provider === "GOOGLE") {
      if (!input.existingGoogleEventId) {
        throw new AppError("Missing Google Calendar event for this meeting", 400);
      }
      await assertGoogleConnected(input.companyId);
      const googleEvent = await calendarService.updateMeetEvent(
        input.companyId,
        input.existingGoogleEventId,
        {
          summary: input.summary,
          description: input.description,
          start: input.start,
          end: input.end,
          timezone: input.timezone,
          attendeeEmails: input.attendeeEmails,
        },
      );

      return {
        meetingProvider: "GOOGLE",
        meetingLink: googleEvent.meetLink,
        googleEventId: googleEvent.eventId,
        googleCalendarId: input.existingGoogleCalendarId ?? "primary",
        icsUid: googleEvent.icsUid,
      };
    }

    const nextUrl = input.meetingUrl?.trim()
      ? validateMeetingUrl(input.provider, input.meetingUrl)
      : input.existingMeetingLink;

    if (!nextUrl) {
      throw new AppError("Meeting URL is required for this provider", 400);
    }

    return {
      meetingProvider: input.provider,
      meetingLink: nextUrl,
    };
  },
};
