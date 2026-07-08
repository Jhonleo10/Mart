import { EmailLayout, appUrl } from "../layout";
import {
  EmailBadge,
  EmailBulletList,
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

export function CompanyApprovedEmail({ ownerName, companyName }: Props) {
  return (
    <EmailLayout
      preview="Your seller account is now active on Genius Mart"
      title="Your Account Has Been Verified"
      subtitle="You can now list products, manage leads, and grow your presence."
      ctaLabel="Go to Seller Dashboard"
      ctaHref={appUrl("/company/dashboard")}
    >
      <EmailBadge tone="green">Approved</EmailBadge>
      <EmailGreeting name={ownerName} />
      <EmailParagraph>
        Great news! Your company has been verified and your seller account is now fully
        active on Genius Mart.
      </EmailParagraph>
      <EmailDetailCard title="Account Details">
        <EmailDetailRow label="Company" value={companyName} />
        <EmailDetailRow label="Status" value="Active seller" />
      </EmailDetailCard>
      <EmailHighlight tone="green">
        You can now sign in and start selling on the marketplace.
      </EmailHighlight>
      <EmailBulletList
        items={[
          "List and manage your software products",
          "Receive and respond to demo requests",
          "Schedule meetings with prospective buyers",
          "Track performance from your seller dashboard",
        ]}
      />
      <EmailClosing />
    </EmailLayout>
  );
}
