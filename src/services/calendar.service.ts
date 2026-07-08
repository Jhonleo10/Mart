import { createAuthorizedClient, refreshGoogleTokens } from "@/lib/google/oauth";
import {
  cancelCalendarEvent,
  createMeetCalendarEvent,
  updateMeetCalendarEvent,
} from "@/lib/google/calendar";
import { companyGoogleRepository } from "@/repositories/meeting.repository";
import { AppError } from "@/lib/errors";

export const calendarService = {
  async getAuthenticatedClient(companyId: string) {
    const connection = await companyGoogleRepository.findByCompanyId(companyId);
    if (!connection) {
      throw new AppError("Connect Google Calendar before scheduling meetings", 400);
    }

    const needsRefresh =
      !connection.tokenExpiry || connection.tokenExpiry.getTime() < Date.now() + 60_000;

    if (needsRefresh) {
      try {
        const refreshed = await refreshGoogleTokens(
          connection.accessToken,
          connection.refreshToken,
        );
        await companyGoogleRepository.updateTokens(companyId, refreshed);
        return createAuthorizedClient(refreshed.accessToken, refreshed.refreshToken);
      } catch {
        throw new AppError(
          "Google Calendar connection expired. Please reconnect your account.",
          401,
        );
      }
    }

    return createAuthorizedClient(connection.accessToken, connection.refreshToken);
  },

  async createMeetEvent(
    companyId: string,
    input: {
      summary: string;
      description: string;
      start: Date;
      end: Date;
      timezone: string;
      attendeeEmails: string[];
    },
  ) {
    const auth = await this.getAuthenticatedClient(companyId);
    const connection = await companyGoogleRepository.findByCompanyId(companyId);
    return createMeetCalendarEvent(auth, {
      ...input,
      calendarId: connection?.calendarId ?? "primary",
    });
  },

  async updateMeetEvent(
    companyId: string,
    eventId: string,
    input: {
      summary: string;
      description: string;
      start: Date;
      end: Date;
      timezone: string;
      attendeeEmails: string[];
    },
  ) {
    const auth = await this.getAuthenticatedClient(companyId);
    const connection = await companyGoogleRepository.findByCompanyId(companyId);
    const calendarId = connection?.calendarId ?? "primary";
    return updateMeetCalendarEvent(auth, calendarId, eventId, input);
  },

  async cancelEvent(companyId: string, eventId: string, calendarId = "primary") {
    const auth = await this.getAuthenticatedClient(companyId);
    await cancelCalendarEvent(auth, calendarId, eventId);
  },
};
