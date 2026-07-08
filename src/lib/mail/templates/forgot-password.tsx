import { EmailLayout, appUrl } from "../layout";
import {
  EmailBadge,
  EmailClosing,
  EmailGreeting,
  EmailHighlight,
  EmailParagraph,
} from "../components";

interface Props {
  name: string;
  token: string;
}

export function ForgotPasswordEmail({ name, token }: Props) {
  return (
    <EmailLayout
      preview="Reset your Genius Mart password"
      title="Reset Your Password"
      subtitle="We received a request to change the password on your account."
      ctaLabel="Reset Password"
      ctaHref={appUrl(`/reset-password?token=${token}`)}
    >
      <EmailBadge>Security</EmailBadge>
      <EmailGreeting name={name} />
      <EmailParagraph>
        Click the button below to set a new password for your Genius Mart account. For
        your security, this link expires in 30 minutes.
      </EmailParagraph>
      <EmailHighlight>
        If you did not request a password reset, you can safely ignore this email. Your
        current password will remain unchanged.
      </EmailHighlight>
      <EmailClosing />
    </EmailLayout>
  );
}
