import { EmailLayout } from "../layout";
import {
  EmailBadge,
  EmailClosing,
  EmailDetailCard,
  EmailDetailRow,
  EmailHighlight,
  EmailParagraph,
} from "../components";

interface Props {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactInquiryEmail({ name, email, subject, message }: Props) {
  return (
    <EmailLayout
      preview={`Contact inquiry: ${subject}`}
      title="New Contact Inquiry"
      subtitle="A visitor has submitted a message through the contact form."
    >
      <EmailBadge>Admin Alert</EmailBadge>
      <EmailDetailCard title="Inquiry Details">
        <EmailDetailRow label="Name" value={name} />
        <EmailDetailRow label="Email" value={email} />
        <EmailDetailRow label="Subject" value={subject} />
      </EmailDetailCard>
      <EmailHighlight>
        <strong>Message:</strong>
        <br />
        {message}
      </EmailHighlight>
      <EmailParagraph>
        Please respond to this inquiry within one business day.
      </EmailParagraph>
      <EmailClosing />
    </EmailLayout>
  );
}
