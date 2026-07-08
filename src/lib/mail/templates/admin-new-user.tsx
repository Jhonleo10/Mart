import { EmailLayout, appUrl } from "../layout";
import {
  EmailBadge,
  EmailClosing,
  EmailDetailCard,
  EmailDetailRow,
  EmailParagraph,
} from "../components";

interface Props {
  name: string;
  email: string;
  phone?: string | null;
  registeredAt: string;
}

export function AdminNewUserEmail({ name, email, phone, registeredAt }: Props) {
  return (
    <EmailLayout
      preview="A new user has verified their account"
      title="New User Registered"
      subtitle="A buyer account has been verified and is now active."
      ctaLabel="View Users"
      ctaHref={appUrl("/admin/users")}
    >
      <EmailBadge>Admin Alert</EmailBadge>
      <EmailParagraph>
        A new user has successfully registered and verified their account on Genius Mart.
      </EmailParagraph>
      <EmailDetailCard title="User Details">
        <EmailDetailRow label="Name" value={name} />
        <EmailDetailRow label="Email" value={email} />
        <EmailDetailRow label="Phone" value={phone ?? "—"} />
        <EmailDetailRow label="Registered" value={registeredAt} />
      </EmailDetailCard>
      <EmailClosing />
    </EmailLayout>
  );
}
