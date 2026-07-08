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
  note?: string;
}

export function CompanyRejectedEmail({ ownerName, companyName, note }: Props) {
  return (
    <EmailLayout
      preview="Update on your company registration"
      title="Company Registration Update"
      subtitle="We were unable to approve your seller application at this time."
    >
      <EmailBadge tone="warning">Not Approved</EmailBadge>
      <EmailGreeting name={ownerName} />
      <EmailParagraph>
        Thank you for your interest in selling on Genius Mart. After reviewing your
        application, we are unable to approve your company registration at this time.
      </EmailParagraph>
      <EmailDetailCard title="Application Details">
        <EmailDetailRow label="Company" value={companyName} />
        <EmailDetailRow label="Status" value="Not approved" />
        {note ? <EmailDetailRow label="Note" value={note} /> : null}
      </EmailDetailCard>
      <EmailHighlight tone="neutral">
        If you believe this decision was made in error or you would like guidance on
        reapplying, please contact our support team. We are happy to help.
      </EmailHighlight>
      <EmailClosing />
    </EmailLayout>
  );
}
