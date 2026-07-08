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

export function CompanyPendingApprovalEmail({ ownerName, companyName }: Props) {
  return (
    <EmailLayout
      preview="Your company registration is awaiting administrator approval"
      title="Registration Submitted Successfully"
      subtitle="Your profile is under review by our verification team."
    >
      <EmailBadge tone="neutral">Under Review</EmailBadge>
      <EmailGreeting name={ownerName} />
      <EmailParagraph>
        Your account has been verified and payment received. Your company profile is now
        with our administrators for final approval.
      </EmailParagraph>
      <EmailDetailCard title="Registration Status">
        <EmailDetailRow label="Company" value={companyName} />
        <EmailDetailRow label="Email" value="Verified" />
        <EmailDetailRow label="Payment" value="Received" />
        <EmailDetailRow label="Approval" value="Pending" />
      </EmailDetailCard>
      <EmailHighlight>
        You will receive another email once your seller account is approved. This
        typically takes one to two business days.
      </EmailHighlight>
      <EmailClosing />
    </EmailLayout>
  );
}
