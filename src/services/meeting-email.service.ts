import { sendMail } from "@/lib/mail/send";
import {
  DemoConfirmedEmail,
  DemoRequestReceivedEmail,
  FeedbackRequestEmail,
  MeetingCancelledEmail,
  MeetingCompletedEmail,
  MeetingReminderEmail,
  MeetingRescheduledEmail,
  MeetingScheduledEmail,
} from "@/lib/mail/templates/meeting";

export interface MeetingEmailDetails {
  productName: string;
  companyName: string;
  leadName: string;
  leadEmail: string;
  vendorEmail: string;
  meetLink: string;
  scheduledAt: Date;
  durationMinutes: number;
  timezone: string;
  notes?: string | null;
  cancelledReason?: string | null;
  previousScheduledAt?: Date;
  meetingId?: string;
  reminderLabel?: string;
}

function formatDateTime(date: Date, timezone: string) {
  return date.toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: timezone,
  });
}

function toTemplateProps(details: MeetingEmailDetails) {
  return {
    productName: details.productName,
    companyName: details.companyName,
    leadName: details.leadName,
    meetLink: details.meetLink,
    scheduledAt: formatDateTime(details.scheduledAt, details.timezone),
    durationMinutes: details.durationMinutes,
    timezone: details.timezone,
    notes: details.notes ?? undefined,
    cancelledReason: details.cancelledReason ?? undefined,
    previousScheduledAt: details.previousScheduledAt
      ? formatDateTime(details.previousScheduledAt, details.timezone)
      : undefined,
    meetingId: details.meetingId,
    reminderLabel: details.reminderLabel,
  };
}

export const meetingEmailService = {
  demoRequestReceived(to: string, details: MeetingEmailDetails) {
    return sendMail({
      to,
      subject: `New Demo Request — ${details.productName}`,
      template: "DemoRequestReceivedEmail",
      react: DemoRequestReceivedEmail(toTemplateProps(details)),
    });
  },

  demoConfirmed(to: string, details: MeetingEmailDetails) {
    return sendMail({
      to,
      subject: `Demo Confirmed — ${details.productName}`,
      template: "DemoConfirmedEmail",
      react: DemoConfirmedEmail(toTemplateProps(details)),
    });
  },

  meetingScheduled(to: string, details: MeetingEmailDetails) {
    return sendMail({
      to,
      subject: `Meeting Scheduled — ${details.productName}`,
      template: "MeetingScheduledEmail",
      react: MeetingScheduledEmail(toTemplateProps(details)),
    });
  },

  meetingReminder(to: string, details: MeetingEmailDetails) {
    return sendMail({
      to,
      subject: `Reminder: ${details.productName} demo ${details.reminderLabel ?? "soon"}`,
      template: "MeetingReminderEmail",
      react: MeetingReminderEmail(toTemplateProps(details)),
    });
  },

  meetingCancelled(to: string, details: MeetingEmailDetails) {
    return sendMail({
      to,
      subject: `Meeting Cancelled — ${details.productName}`,
      template: "MeetingCancelledEmail",
      react: MeetingCancelledEmail(toTemplateProps(details)),
    });
  },

  meetingRescheduled(to: string, details: MeetingEmailDetails) {
    return sendMail({
      to,
      subject: `Meeting Rescheduled — ${details.productName}`,
      template: "MeetingRescheduledEmail",
      react: MeetingRescheduledEmail(toTemplateProps(details)),
    });
  },

  meetingCompleted(to: string, details: MeetingEmailDetails) {
    return sendMail({
      to,
      subject: `Meeting Completed — ${details.productName}`,
      template: "MeetingCompletedEmail",
      react: MeetingCompletedEmail(toTemplateProps(details)),
    });
  },

  feedbackRequest(to: string, details: MeetingEmailDetails) {
    return sendMail({
      to,
      subject: `We value your review — ${details.productName} demo`,
      template: "FeedbackRequestEmail",
      react: FeedbackRequestEmail(toTemplateProps(details)),
    });
  },
};
