import { EmailLayout, appUrl } from "../../layout";
import {
  EmailBadge,
  EmailClosing,
  EmailDetailCard,
  EmailDetailRow,
  EmailGreeting,
  EmailHighlight,
  EmailInlineLink,
  EmailParagraph,
} from "../../components";

export interface MeetingTemplateProps {
  productName: string;
  companyName: string;
  leadName: string;
  meetLink?: string;
  scheduledAt: string;
  durationMinutes: number;
  timezone: string;
  notes?: string;
  cancelledReason?: string;
  previousScheduledAt?: string;
  meetingId?: string;
  reminderLabel?: string;
}

function MeetingDetailsCard(props: MeetingTemplateProps) {
  return (
    <EmailDetailCard title="Meeting Details">
      <EmailDetailRow label="Product" value={props.productName} />
      <EmailDetailRow label="Vendor" value={props.companyName} />
      <EmailDetailRow label="Date & Time" value={props.scheduledAt} />
      <EmailDetailRow label="Duration" value={`${props.durationMinutes} minutes`} />
      <EmailDetailRow label="Time Zone" value={props.timezone} />
      {props.notes ? <EmailDetailRow label="Notes" value={props.notes} /> : null}
    </EmailDetailCard>
  );
}

export function DemoRequestReceivedEmail(props: MeetingTemplateProps) {
  return (
    <EmailLayout
      preview={`New demo request for ${props.productName}`}
      title="New Demo Request Received"
      subtitle="A prospective buyer has requested a product demonstration."
      ctaLabel="Review Demo Request"
      ctaHref={appUrl("/company/leads")}
    >
      <EmailBadge>Vendor Notification</EmailBadge>
      <EmailGreeting />
      <EmailParagraph>
        We are pleased to inform you that a new demo request has been submitted for{" "}
        <strong>{props.productName}</strong> by <strong>{props.leadName}</strong>.
      </EmailParagraph>
      <MeetingDetailsCard {...props} />
      <EmailParagraph>
        Please review the request promptly and schedule the meeting at your earliest
        convenience to maintain a professional buyer experience.
      </EmailParagraph>
      <EmailClosing />
    </EmailLayout>
  );
}

export function DemoConfirmedEmail(props: MeetingTemplateProps) {
  return (
    <EmailLayout
      preview={`Demo confirmed for ${props.productName}`}
      title="Demo Successfully Confirmed"
      subtitle="Your scheduled demonstration has been confirmed on Genius Mart."
      ctaLabel="Open Meetings Dashboard"
      ctaHref={appUrl("/company/meetings")}
    >
      <EmailBadge>Confirmation</EmailBadge>
      <EmailGreeting />
      <EmailParagraph>
        This email confirms that your demo for <strong>{props.productName}</strong> with{" "}
        <strong>{props.leadName}</strong> has been successfully scheduled.
      </EmailParagraph>
      <MeetingDetailsCard {...props} />
      <EmailClosing />
    </EmailLayout>
  );
}

export function MeetingScheduledEmail(props: MeetingTemplateProps) {
  return (
    <EmailLayout
      preview={`Meeting scheduled for ${props.productName}`}
      title="Your Product Demo Is Scheduled"
      subtitle="Your live software demonstration has been confirmed by the vendor."
      ctaLabel={props.meetLink ? "Join Meeting" : "View My Meetings"}
      ctaHref={props.meetLink ?? appUrl("/user/meetings")}
    >
      <EmailBadge>Meeting Scheduled</EmailBadge>
      <EmailGreeting name={props.leadName} />
      <EmailParagraph>
        We are pleased to confirm that your demo session for{" "}
        <strong>{props.productName}</strong> with <strong>{props.companyName}</strong> has
        been scheduled.
      </EmailParagraph>
      <MeetingDetailsCard {...props} />
      {props.meetLink ? (
        <EmailHighlight tone="green">
          <strong>Join link:</strong>{" "}
          <EmailInlineLink href={props.meetLink}>{props.meetLink}</EmailInlineLink>
        </EmailHighlight>
      ) : null}
      <EmailParagraph>
        We recommend joining the meeting a few minutes early and ensuring your audio and
        video are ready for a smooth evaluation experience.
      </EmailParagraph>
      <EmailClosing />
    </EmailLayout>
  );
}

export function MeetingReminderEmail(props: MeetingTemplateProps) {
  return (
    <EmailLayout
      preview={`Reminder: ${props.productName} demo`}
      title={`Meeting Reminder${props.reminderLabel ? ` — ${props.reminderLabel}` : ""}`}
      subtitle="A courteous reminder for your upcoming product demonstration."
      ctaLabel={props.meetLink ? "Join Meeting" : "View My Meetings"}
      ctaHref={props.meetLink ?? appUrl("/user/meetings")}
    >
      <EmailBadge>Reminder</EmailBadge>
      <EmailGreeting name={props.leadName} />
      <EmailParagraph>
        This is a friendly reminder regarding your upcoming demo of{" "}
        <strong>{props.productName}</strong> with <strong>{props.companyName}</strong>.
      </EmailParagraph>
      <MeetingDetailsCard {...props} />
      {props.meetLink ? (
        <EmailHighlight>
          <strong>Meeting link:</strong>{" "}
          <EmailInlineLink href={props.meetLink}>{props.meetLink}</EmailInlineLink>
        </EmailHighlight>
      ) : null}
      <EmailClosing />
    </EmailLayout>
  );
}

export function MeetingCancelledEmail(props: MeetingTemplateProps) {
  return (
    <EmailLayout
      preview={`Meeting cancelled — ${props.productName}`}
      title="Meeting Cancellation Notice"
      subtitle="Your scheduled product demonstration has been cancelled."
      ctaHref={appUrl("/user/meetings")}
      ctaLabel="View My Meetings"
    >
      <EmailBadge>Cancelled</EmailBadge>
      <EmailGreeting name={props.leadName} />
      <EmailParagraph>
        We regret to inform you that the scheduled demo for{" "}
        <strong>{props.productName}</strong> with <strong>{props.companyName}</strong> has
        been cancelled.
      </EmailParagraph>
      {props.cancelledReason ? (
        <EmailHighlight tone="neutral">
          <strong>Reason provided:</strong> {props.cancelledReason}
        </EmailHighlight>
      ) : null}
      <MeetingDetailsCard {...props} />
      <EmailParagraph>
        If you would like to reschedule, please visit your meetings dashboard or submit a
        new demo request through the product page.
      </EmailParagraph>
      <EmailClosing />
    </EmailLayout>
  );
}

export function MeetingRescheduledEmail(props: MeetingTemplateProps) {
  return (
    <EmailLayout
      preview={`Meeting rescheduled — ${props.productName}`}
      title="Meeting Rescheduled"
      subtitle="Your product demonstration has been moved to a new date and time."
      ctaLabel={props.meetLink ? "Join Meeting" : "View My Meetings"}
      ctaHref={props.meetLink ?? appUrl("/user/meetings")}
    >
      <EmailBadge>Rescheduled</EmailBadge>
      <EmailGreeting name={props.leadName} />
      <EmailParagraph>
        Please note that your demo for <strong>{props.productName}</strong> with{" "}
        <strong>{props.companyName}</strong> has been rescheduled.
      </EmailParagraph>
      {props.previousScheduledAt ? (
        <EmailHighlight tone="neutral">
          <strong>Previous schedule:</strong> {props.previousScheduledAt}
        </EmailHighlight>
      ) : null}
      <MeetingDetailsCard {...props} />
      <EmailClosing />
    </EmailLayout>
  );
}

export function MeetingCompletedEmail(props: MeetingTemplateProps) {
  return (
    <EmailLayout
      preview={`Meeting completed — ${props.productName}`}
      title="Thank You for Attending Your Demo"
      subtitle="We hope your product evaluation session was valuable and informative."
      ctaLabel="View My Meetings"
      ctaHref={appUrl("/user/meetings")}
    >
      <EmailBadge>Session Completed</EmailBadge>
      <EmailGreeting name={props.leadName} />
      <EmailParagraph>
        Thank you for attending the demonstration of <strong>{props.productName}</strong>{" "}
        with <strong>{props.companyName}</strong>. We appreciate your time and interest in
        evaluating enterprise software through Genius Mart.
      </EmailParagraph>
      <MeetingDetailsCard {...props} />
      <EmailParagraph>
        Your feedback helps other buyers make informed decisions and enables vendors to
        deliver better product experiences.
      </EmailParagraph>
      <EmailClosing />
    </EmailLayout>
  );
}

export function FeedbackRequestEmail(props: MeetingTemplateProps) {
  return (
    <EmailLayout
      preview={`Share your review for ${props.productName}`}
      title="We Would Value Your Review"
      subtitle="Please rate your demo experience and share your feedback with the community."
      ctaLabel="Write Your Review"
      ctaHref={appUrl(props.meetingId ? `/user/meetings/${props.meetingId}` : "/user/meetings")}
    >
      <EmailBadge>Review Request</EmailBadge>
      <EmailGreeting name={props.leadName} />
      <EmailParagraph>
        Following your recent demonstration of <strong>{props.productName}</strong> with{" "}
        <strong>{props.companyName}</strong>, we invite you to submit a brief review
        including a 5-star rating and your experience in your own words.
      </EmailParagraph>
      <EmailHighlight tone="green">
        Your published review helps other buyers evaluate software with confidence and
        supports verified vendors in building trust on Genius Mart.
      </EmailHighlight>
      <MeetingDetailsCard {...props} />
      <EmailParagraph>
        Reviews can only be submitted once per completed meeting and will appear on the
        product page after publication.
      </EmailParagraph>
      <EmailClosing />
    </EmailLayout>
  );
}
