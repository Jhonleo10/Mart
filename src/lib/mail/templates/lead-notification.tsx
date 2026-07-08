import { EmailLayout, appUrl } from "../layout";
import {
  EmailBadge,
  EmailClosing,
  EmailDetailCard,
  EmailDetailRow,
  EmailHighlight,
  EmailParagraph,
} from "../components";

interface Props {
  productName: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
  message?: string | null;
}

export function LeadNotificationEmail({
  productName,
  leadName,
  leadEmail,
  leadPhone,
  preferredDate,
  preferredTime,
  message,
}: Props) {
  return (
    <EmailLayout
      preview={`New lead received for ${productName}`}
      title="New Lead Received"
      subtitle="A prospective buyer has requested a product demonstration."
      ctaLabel="View Leads"
      ctaHref={appUrl("/company/leads")}
    >
      <EmailBadge tone="green">New Lead</EmailBadge>
      <EmailParagraph>
        You have received a new demo request for <strong>{productName}</strong>. Please
        review the lead details below and respond promptly to maintain a professional
        buyer experience.
      </EmailParagraph>
      <EmailDetailCard title="Lead Information">
        <EmailDetailRow label="Name" value={leadName} />
        <EmailDetailRow label="Email" value={leadEmail} />
        <EmailDetailRow label="Phone" value={leadPhone} />
        {preferredDate ? (
          <EmailDetailRow label="Preferred date" value={preferredDate} />
        ) : null}
        {preferredTime ? (
          <EmailDetailRow label="Preferred time" value={preferredTime} />
        ) : null}
      </EmailDetailCard>
      {message ? (
        <EmailHighlight>
          <strong>Message from buyer:</strong>
          <br />
          {message}
        </EmailHighlight>
      ) : null}
      <EmailClosing />
    </EmailLayout>
  );
}
