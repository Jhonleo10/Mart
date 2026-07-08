import { EmailLayout, appUrl } from "../layout";
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
  token: string;
}

export function CompanyVerificationEmail({ ownerName, companyName, token }: Props) {
  return (
    <EmailLayout
      preview="Verify your company account on Genius Mart"
      title="Verify Your Company Account"
      subtitle="Confirm your email to continue with subscription and onboarding."
      ctaLabel="Verify Account"
      ctaHref={appUrl(`/verify-company?token=${token}`)}
    >
      <EmailBadge>Verification</EmailBadge>
      <EmailGreeting name={ownerName} />
      <EmailParagraph>
        Welcome to Genius Mart! Your company has been registered and we are excited to
        have you join our verified seller community.
      </EmailParagraph>
      <EmailDetailCard title="Company Details">
        <EmailDetailRow label="Company" value={companyName} />
        <EmailDetailRow label="Action required" value="Email verification" />
      </EmailDetailCard>
      <EmailHighlight>
        Please verify your email address within 24 hours to continue with subscription
        selection and seller onboarding.
      </EmailHighlight>
      <EmailClosing />
    </EmailLayout>
  );
}
