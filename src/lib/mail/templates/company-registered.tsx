import { EmailLayout } from "../layout";
import {
  EmailBadge,
  EmailClosing,
  EmailDetailCard,
  EmailDetailRow,
  EmailGreeting,
  EmailHighlight,
  EmailParagraph,
} from "../components";

interface Props {
  ownerName: string;
  companyName: string;
}

export function CompanyRegisteredEmail({ ownerName, companyName }: Props) {
  return (
    <EmailLayout
      preview="Your seller account was created — verify your email"
      title="Seller Account Created"
      subtitle="Payment received. Complete email verification to activate your seller profile."
    >
      <EmailBadge tone="green">Registration</EmailBadge>
      <EmailGreeting name={ownerName} />
      <EmailParagraph>
        Thank you for choosing Genius Mart as your SaaS marketplace partner. Your seller
        account has been created and we have received your payment.
      </EmailParagraph>
      <EmailDetailCard title="Account Summary">
        <EmailDetailRow label="Company" value={companyName} />
        <EmailDetailRow label="Status" value="Pending email verification" />
      </EmailDetailCard>
      <EmailHighlight>
        Enter the 6-digit verification code we sent to this email address. Once verified,
        you can sign in and start listing your software products.
      </EmailHighlight>
      <EmailClosing />
    </EmailLayout>
  );
}
