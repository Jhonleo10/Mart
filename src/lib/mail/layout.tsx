import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { getEmailBranding } from "./branding";
import { emailColors, emailFonts, emailTheme } from "./theme";

export const BRAND_BLUE = emailColors.brandBlue;
export const BRAND_GREEN = emailColors.brandGreen;
export const BRAND_BLUE_DARK = emailColors.brandBlueDark;
export const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL ?? "support@digitalgeniusmart.in";

import { appUrl as buildAppUrl } from "@/lib/app-url";

export function appUrl(path = "") {
  return buildAppUrl(path);
}

interface EmailLayoutProps {
  preview: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  siteName?: string;
  supportEmail?: string;
}

export function EmailLayout({
  preview,
  title,
  subtitle,
  children,
  ctaLabel,
  ctaHref,
  siteName: siteNameProp,
  supportEmail: supportEmailProp,
}: EmailLayoutProps) {
  const branding = getEmailBranding();
  const siteName = siteNameProp ?? branding.siteName;
  const supportEmail = supportEmailProp ?? branding.supportEmail;
  const logoUrl = branding.logoUrl || undefined;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Row>
              <Column>
                {logoUrl ? (
                  <Img
                    src={logoUrl}
                    alt={siteName}
                    width="120"
                    height="40"
                    style={logoImg}
                  />
                ) : (
                  <Heading style={logoText}>{siteName}</Heading>
                )}
                <Text style={headerEyebrow}>India&apos;s Trusted SaaS Marketplace</Text>
                <Text style={headerTagline}>
                  {branding.tagline ||
                    "Discover verified software, compare solutions, and book demos with confidence."}
                </Text>
              </Column>
            </Row>
          </Section>

          <Section style={content}>
            <Section style={titleAccent} />
            <Heading style={h1}>{title}</Heading>
            {subtitle ? <Text style={subtitleStyle}>{subtitle}</Text> : null}
            {children}
            {ctaLabel && ctaHref ? (
              <Section style={{ textAlign: "center" as const, marginTop: 28 }}>
                <Button style={button} href={ctaHref}>
                  {ctaLabel}
                </Button>
              </Section>
            ) : null}
            <Hr style={hr} />
            <Text style={footer}>
              Questions? Reach our support team at{" "}
              <Link href={`mailto:${supportEmail}`} style={link}>
                {supportEmail}
              </Link>
            </Text>
            <Text style={footer}>
              Visit{" "}
              <Link href={branding.website} style={link}>
                {branding.website.replace(/^https?:\/\//, "")}
              </Link>{" "}
              to explore products, manage bookings, and update your account preferences.
            </Text>
            <Text style={footerMuted}>
              You received this email because you have an account or active activity on{" "}
              {siteName}. We respect your privacy and never share your information without
              consent.
            </Text>
            <Text style={copyright}>
              © {new Date().getFullYear()} {siteName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function OtpDisplay({ otp }: { otp: string }) {
  return (
    <Section style={otpBox}>
      <Text style={otpLabel}>Your verification code</Text>
      <Text style={otpCode}>{otp}</Text>
      <Text style={otpHint}>Valid for 10 minutes — do not share this code.</Text>
    </Section>
  );
}

const main = {
  backgroundColor: emailColors.pageBg,
  fontFamily: emailFonts.sans,
  margin: 0,
  padding: "24px 0",
};

const container = {
  margin: "0 auto",
  maxWidth: "600px",
  padding: "0 12px",
};

const header = {
  background: emailTheme.gradient.header,
  borderRadius: `${emailTheme.radius.lg} ${emailTheme.radius.lg} 0 0`,
  padding: "28px 28px 24px",
};

const logoImg = {
  display: "block" as const,
  margin: "0 0 12px",
  objectFit: "contain" as const,
};

const logoText = {
  color: emailColors.white,
  fontSize: "26px",
  fontWeight: "800" as const,
  letterSpacing: "-0.02em",
  lineHeight: "32px",
  margin: "0 0 8px",
};

const headerEyebrow = {
  color: "rgba(255,255,255,0.88)",
  fontSize: "11px",
  fontWeight: "700" as const,
  letterSpacing: "0.12em",
  margin: "0 0 6px",
  textTransform: "uppercase" as const,
};

const headerTagline = {
  color: "rgba(255,255,255,0.92)",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0",
};

const content = {
  backgroundColor: emailColors.white,
  border: `1px solid ${emailColors.cardBorder}`,
  borderTop: "none",
  borderRadius: `0 0 ${emailTheme.radius.lg} ${emailTheme.radius.lg}`,
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
  padding: "28px",
};

const titleAccent = {
  background: emailTheme.gradient.button,
  borderRadius: emailTheme.radius.pill,
  height: "4px",
  margin: "0 0 18px",
  width: "56px",
};

const h1 = {
  color: emailColors.slate900,
  fontSize: "24px",
  fontWeight: "800" as const,
  letterSpacing: "-0.02em",
  lineHeight: "30px",
  margin: "0 0 10px",
};

const subtitleStyle = {
  color: emailColors.slate500,
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 20px",
};

const button = {
  background: emailTheme.gradient.button,
  borderRadius: emailTheme.radius.pill,
  color: emailColors.white,
  display: "inline-block" as const,
  fontSize: "14px",
  fontWeight: "700" as const,
  padding: "14px 28px",
  textDecoration: "none",
};

const hr = {
  borderColor: emailColors.slate200,
  margin: "28px 0 18px",
};

const footer = {
  color: emailColors.slate500,
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0 0 8px",
};

const footerMuted = {
  color: emailColors.slate400,
  fontSize: "11px",
  lineHeight: "18px",
  margin: "0 0 8px",
};

const copyright = {
  color: emailColors.slate400,
  fontSize: "11px",
  margin: "12px 0 0",
};

const link = {
  color: emailColors.brandBlue,
  textDecoration: "underline",
};

const otpBox = {
  backgroundColor: emailColors.blueTint,
  border: `2px dashed ${emailColors.brandBlue}`,
  borderRadius: emailTheme.radius.md,
  margin: "20px 0",
  padding: "20px",
  textAlign: "center" as const,
};

const otpLabel = {
  color: emailColors.slate500,
  fontSize: "11px",
  fontWeight: "700" as const,
  letterSpacing: "0.1em",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
};

const otpCode = {
  color: emailColors.brandBlue,
  fontSize: "36px",
  fontWeight: "800" as const,
  letterSpacing: "10px",
  lineHeight: "44px",
  margin: "0",
};

const otpHint = {
  color: emailColors.slate400,
  fontSize: "12px",
  lineHeight: "18px",
  margin: "10px 0 0",
};
