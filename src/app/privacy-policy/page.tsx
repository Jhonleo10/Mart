import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { BRAND } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Privacy Policy",
    description: `Privacy Policy for ${BRAND.name} — how we collect, use, and protect your data.`,
    path: "/privacy-policy",
  });
}

const LAST_UPDATED = new Date().toLocaleDateString("en-IN", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      variant="privacy"
      title="Privacy Policy"
      subtitle={`How ${BRAND.name} handles your data — transparent practices for a marketplace built on trust.`}
      lastUpdated={LAST_UPDATED}
      readMinutes={7}
      highlights={[
        { label: "We collect", value: "Account, demo, and usage data to run the marketplace" },
        { label: "We never", value: "Sell your personal information to third parties" },
        { label: "You control", value: "Access, correction, and deletion requests via support" },
      ]}
      relatedLink={{ href: "/terms-of-service", label: "Terms of Service" }}
      sections={[
        {
          id: "collection",
          title: "1. Information We Collect",
          tag: "Overview",
          icon: "database",
          body: `We collect information you provide when registering (name, email, company details for sellers), when contacting support, when booking demos, and when using dashboards. We also collect technical data such as IP address, browser type, and usage analytics to improve the Platform.`,
        },
        {
          id: "usage",
          title: "2. How We Use Your Information",
          icon: "sparkles",
          body: `We use your data to operate the marketplace, authenticate accounts, send verification codes and transactional emails, process seller payments, facilitate demo requests between buyers and vendors, and improve our services. Marketing communications are sent only where permitted and can be opted out.`,
        },
        {
          id: "sharing",
          title: "3. Sharing of Information",
          icon: "share2",
          body: `We share necessary contact details with vendors when you request a demo. Payment information is handled by our payment processors and is not stored on our servers in full. We do not sell your personal data. We may disclose information if required by law or to protect the Platform and its users.`,
        },
        {
          id: "cookies",
          title: "4. Cookies & Analytics",
          icon: "cookie",
          body: `We use cookies and similar technologies for session management, preferences, and analytics. You can control cookies through your browser settings; disabling them may affect some features.`,
        },
        {
          id: "security",
          title: "5. Data Security",
          icon: "lock",
          body: `We implement reasonable technical and organisational measures to protect your data, including encrypted connections and secure password storage. No method of transmission over the internet is 100% secure.`,
        },
        {
          id: "retention",
          title: "6. Data Retention",
          icon: "archive",
          body: `We retain account and transaction records as long as needed to provide services, comply with legal obligations, and resolve disputes. You may request account deletion subject to outstanding obligations.`,
        },
        {
          id: "rights",
          title: "7. Your Rights",
          icon: "userCog",
          body: `Depending on your location, you may have rights to access, correct, or delete your personal data. Contact us at ${BRAND.contactEmail} to exercise these rights.`,
        },
        {
          id: "children",
          title: "8. Children's Privacy",
          icon: "baby",
          body: `The Platform is not intended for users under 18. We do not knowingly collect data from children.`,
        },
        {
          id: "contact",
          title: "9. Contact",
          icon: "mail",
          body: `For privacy-related questions, email ${BRAND.contactEmail}.`,
        },
      ]}
    />
  );
}
