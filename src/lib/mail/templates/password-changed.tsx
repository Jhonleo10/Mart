import { EmailLayout } from "../layout";
import {
  EmailBadge,
  EmailClosing,
  EmailGreeting,
  EmailHighlight,
  EmailParagraph,
} from "../components";

interface Props {
  name: string;
}

export function PasswordChangedEmail({ name }: Props) {
  return (
    <EmailLayout
      preview="Your Genius Mart password was changed"
      title="Password Changed Successfully"
      subtitle="This confirms a recent update to your account security settings."
    >
      <EmailBadge tone="green">Security Update</EmailBadge>
      <EmailGreeting name={name} />
      <EmailParagraph>
        Your Genius Mart account password was successfully updated. You can now sign in
        using your new credentials.
      </EmailParagraph>
      <EmailHighlight tone="warning">
        If you did not make this change, please contact our support team immediately so
        we can help secure your account.
      </EmailHighlight>
      <EmailClosing />
    </EmailLayout>
  );
}
