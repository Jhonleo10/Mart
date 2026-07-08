import { EmailLayout, OtpDisplay } from "../layout";
import {
  EmailBadge,
  EmailClosing,
  EmailGreeting,
  EmailHighlight,
  EmailParagraph,
} from "../components";

interface Props {
  name: string;
  otp: string;
}

export function UserOtpEmail({ name, otp }: Props) {
  return (
    <EmailLayout
      preview="Your verification code for Genius Mart"
      title="Verify Your Email Address"
      subtitle="Enter this code on the verification page to activate your account."
    >
      <EmailBadge>Verification</EmailBadge>
      <EmailGreeting name={name} />
      <EmailParagraph>
        Thank you for joining Genius Mart. Use the one-time verification code below to
        confirm your email address and complete your registration.
      </EmailParagraph>
      <OtpDisplay otp={otp} />
      <EmailHighlight>
        Go to the registration verify page, enter your email, and paste this code. You
        can sign in once verification is complete.
      </EmailHighlight>
      <EmailParagraph>
        If you did not create an account, you can safely ignore this email. Your account
        will not be activated without this code.
      </EmailParagraph>
      <EmailClosing />
    </EmailLayout>
  );
}
