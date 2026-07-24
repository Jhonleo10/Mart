import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { BRAND } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Terms of Service",
    description: `Terms of Service for ${BRAND.name} — rules for buyers, sellers, and marketplace use.`,
    path: "/terms-of-service",
  });
}

const LAST_UPDATED = new Date().toLocaleDateString("en-IN", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default function TermsOfServicePage() {
  return (
    <LegalDocumentPage
      variant="terms"
      title="Terms of Service"
      subtitle={`The rules of the road for using ${BRAND.name} — written to be clear, fair, and easy to navigate.`}
      lastUpdated={LAST_UPDATED}
      readMinutes={6}
      highlights={[
        { label: "Who it's for", value: "Buyers, sellers, and visitors on the marketplace" },
        { label: "Your role", value: "Keep account details accurate and use the platform in good faith" },
        { label: "Our role", value: "Connect verified vendors with teams looking for software" },
      ]}
      relatedLink={{ href: "/privacy-policy", label: "Privacy Policy" }}
      footerLinks={[
        { href: "/register", label: "Register as buyer", tone: "blue" },
        { href: "/seller/register", label: "Become a seller", tone: "green" },
      ]}
      sections={[
        {
          id: "acceptance",
          title: "1. Acceptance of Terms",
          tag: "Start here",
          icon: "handshake",
          body: `By accessing or using ${BRAND.name} ("the Platform"), you agree to these Terms of Service. If you do not agree, please do not use the Platform. We may update these terms from time to time; continued use after changes constitutes acceptance.`,
        },
        {
          id: "accounts",
          title: "2. Accounts & Registration",
          icon: "userCheck",
          body: `Buyers may register for free to browse software, save wishlists, and request demos. Vendors must complete registration, select a published vendor plan, and pay applicable fees before listing products. You are responsible for keeping your login credentials secure and for all activity under your account.`,
        },
        {
          id: "marketplace",
          title: "3. Marketplace Use",
          icon: "scale",
          body: `The Platform connects software buyers with verified vendors. We do not guarantee the accuracy of third-party product listings, pricing, or availability. Demo requests and communications between buyers and vendors are facilitated through the Platform but contractual relationships for software purchases remain between the parties involved.`,
        },
        {
          id: "sellers",
          title: "4. Vendor Obligations",
          icon: "store",
          body: `Vendors must provide accurate company and product information, honour demo requests in good faith, and comply with applicable laws. We reserve the right to review, approve, suspend, or remove listings that violate our policies or mislead users. Vendor subscription and registration fees are non-refundable except where required by law.`,
        },
        {
          id: "payments",
          title: "5. Payments",
          icon: "badgeIndianRupee",
          body: `Vendor registration and subscription payments are processed securely through our payment partners (e.g. Razorpay). Fees correspond to the plan selected at checkout and as configured in our admin settings. Failed or disputed payments may result in account suspension until resolved.`,
        },
        {
          id: "conduct",
          title: "6. Prohibited Conduct",
          icon: "ban",
          body: `You may not misuse the Platform, upload malicious content, scrape data without permission, impersonate others, or use the service for unlawful purposes. We may terminate accounts that breach these terms.`,
        },
        {
          id: "liability",
          title: "7. Limitation of Liability",
          icon: "shieldAlert",
          body: `${BRAND.name} is provided "as is" to the fullest extent permitted by law. We are not liable for indirect, incidental, or consequential damages arising from your use of the Platform or reliance on vendor content.`,
        },
        {
          id: "contact",
          title: "8. Contact",
          icon: "mail",
          body: `Questions about these terms? Email us at ${BRAND.contactEmail} or visit our contact page.`,
        },
      ]}
    />
  );
}
