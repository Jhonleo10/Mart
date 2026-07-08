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
  companyName: string;
  ownerName: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  industry?: string | null;
  plan?: string | null;
}

export function AdminNewCompanyEmail({
  companyName,
  ownerName,
  email,
  phone,
  website,
  industry,
  plan,
}: Props) {
  return (
    <EmailLayout
      preview="A new company seller has registered"
      title="New Company Registration"
      subtitle="A seller application is awaiting your review and approval."
      ctaLabel="Review & Approve"
      ctaHref={appUrl("/admin/companies?status=PENDING")}
    >
      <EmailBadge>Admin Alert</EmailBadge>
      <EmailParagraph>
        A new company has registered on Genius Mart and is waiting for administrator
        verification before they can list products.
      </EmailParagraph>
      <EmailDetailCard title="Company Application">
        <EmailDetailRow label="Company" value={companyName} />
        <EmailDetailRow label="Owner" value={ownerName} />
        <EmailDetailRow label="Email" value={email} />
        <EmailDetailRow label="Phone" value={phone ?? "—"} />
        <EmailDetailRow label="Website" value={website ?? "—"} />
        <EmailDetailRow label="Industry" value={industry ?? "—"} />
        <EmailDetailRow label="Plan" value={plan ?? "—"} />
      </EmailDetailCard>
      <EmailHighlight>
        Please review the company profile and approve or reject the application from the
        admin dashboard.
      </EmailHighlight>
      <EmailClosing />
    </EmailLayout>
  );
}
