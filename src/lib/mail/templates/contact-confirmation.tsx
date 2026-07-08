import { EmailLayout } from "../layout";
import {
  EmailBadge,
  EmailClosing,
  EmailDetailCard,
  EmailDetailRow,
  EmailHighlight,
  EmailGreeting,
  EmailParagraph,
} from "../components";

interface Props {
  name: string;
  subject: string;
  message: string;
}

export function ContactConfirmationEmail({ name, subject, message }: Props) {
  return (
    <EmailLayout
      preview="We received your message — Genius Mart"
      title="Thanks for Contacting Us"
      subtitle="Our team has received your inquiry and will respond shortly."
    >
      <EmailBadge tone="green">Message Received</EmailBadge>
      <EmailGreeting name={name} />
      <EmailParagraph>
        Thank you for reaching out to Genius Mart. We have received your message and our
        team will get back to you within one business day.
      </EmailParagraph>
      <EmailDetailCard title="Your Inquiry">
        <EmailDetailRow label="Subject" value={subject} />
      </EmailDetailCard>
      <EmailHighlight tone="neutral">
        <strong>Your message:</strong>
        <br />
        {message}
      </EmailHighlight>
      <EmailParagraph>
        If your matter is urgent, please contact our support team directly using the
        email address in the footer of this message.
      </EmailParagraph>
      <EmailClosing />
    </EmailLayout>
  );
}
