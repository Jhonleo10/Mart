import { EmailLayout, appUrl } from "../layout";
import {
  EmailBadge,
  EmailBulletList,
  EmailClosing,
  EmailGreeting,
  EmailHighlight,
  EmailParagraph,
} from "../components";

interface Props {
  name: string;
}

export function UserWelcomeEmail({ name }: Props) {
  return (
    <EmailLayout
      preview="Welcome to Genius Mart — your account is ready"
      title="Welcome to Genius Mart"
      subtitle="Your email has been verified and your buyer account is now active."
      ctaLabel="Browse Products"
      ctaHref={appUrl("/products")}
    >
      <EmailBadge tone="green">Account Active</EmailBadge>
      <EmailGreeting name={name} />
      <EmailParagraph>
        We are delighted to welcome you to India&apos;s trusted SaaS marketplace. Your
        account is ready — start exploring verified software solutions tailored for modern
        teams.
      </EmailParagraph>
      <EmailHighlight tone="green">
        Here&apos;s what you can do right away:
      </EmailHighlight>
      <EmailBulletList
        items={[
          "Browse and compare verified software products",
          "Book live product demos with vendors",
          "Save favourites to your wishlist",
          "Track bookings and meetings from your dashboard",
        ]}
      />
      <EmailClosing />
    </EmailLayout>
  );
}
