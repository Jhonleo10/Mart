import { Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { emailColors } from "./theme";

export function EmailGreeting({ name }: { name?: string }) {
  return (
    <Text style={paragraph}>
      Dear {name ? name : "Valued Customer"},
    </Text>
  );
}

export function EmailParagraph({ children }: { children: React.ReactNode }) {
  return <Text style={paragraph}>{children}</Text>;
}

export function EmailClosing({ siteName }: { siteName?: string }) {
  const brand = siteName ?? "Genius Mart";
  return (
    <>
      <Text style={paragraph}>
        Warm regards,
        <br />
        <strong>The {brand} Team</strong>
      </Text>
      <Text style={muted}>
        This is an automated message from your {brand} account. Please do not reply
        directly unless instructed.
      </Text>
    </>
  );
}

export function EmailBadge({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "green" | "neutral" | "warning";
}) {
  const styles =
    tone === "green"
      ? badgeGreen
      : tone === "neutral"
        ? badgeNeutral
        : tone === "warning"
          ? badgeWarning
          : badgeBlue;

  return (
    <Section style={badgeWrap}>
      <Text style={styles}>{children}</Text>
    </Section>
  );
}

export function EmailDetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Section style={card}>
      <Text style={cardTitle}>{title}</Text>
      {children}
    </Section>
  );
}

export function EmailDetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Text style={row}>
      <span style={rowLabel}>{label}</span>
      <span style={rowValue}>{value}</span>
    </Text>
  );
}

export function EmailHighlight({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "green" | "neutral" | "warning";
}) {
  const styles =
    tone === "green"
      ? highlightGreen
      : tone === "neutral"
        ? highlightNeutral
        : tone === "warning"
          ? highlightWarning
          : highlightBlue;

  return (
    <Section style={styles}>
      <Text style={highlightText}>{children}</Text>
    </Section>
  );
}

export function EmailBulletList({ items }: { items: string[] }) {
  return (
    <Section style={listWrap}>
      {items.map((item) => (
        <Text key={item} style={listItem}>
          <span style={bullet}>•</span> {item}
        </Text>
      ))}
    </Section>
  );
}

export function EmailInlineLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} style={inlineLink}>
      {children}
    </Link>
  );
}

const paragraph = {
  color: emailColors.slate700,
  fontSize: "15px",
  lineHeight: "26px",
  margin: "0 0 16px",
};

const muted = {
  color: emailColors.slate400,
  fontSize: "12px",
  lineHeight: "20px",
  margin: "16px 0 0",
};

const badgeWrap = {
  margin: "0 0 18px",
};

const badgeBase = {
  borderRadius: "999px",
  display: "inline-block" as const,
  fontSize: "11px",
  fontWeight: "700" as const,
  letterSpacing: "0.08em",
  margin: "0",
  padding: "6px 12px",
  textTransform: "uppercase" as const,
};

const badgeBlue = {
  ...badgeBase,
  backgroundColor: "#eff6ff",
  border: `1px solid ${emailColors.brandBlue}33`,
  color: emailColors.brandBlue,
};

const badgeGreen = {
  ...badgeBase,
  backgroundColor: emailColors.greenTint,
  border: `1px solid ${emailColors.brandGreen}33`,
  color: emailColors.brandGreenDark,
};

const badgeNeutral = {
  ...badgeBase,
  backgroundColor: emailColors.slate50,
  border: `1px solid ${emailColors.slate200}`,
  color: emailColors.slate600,
};

const badgeWarning = {
  ...badgeBase,
  backgroundColor: "#fffbeb",
  border: "1px solid #fcd34d",
  color: "#b45309",
};

const card = {
  backgroundColor: emailColors.slate50,
  border: `1px solid ${emailColors.slate200}`,
  borderRadius: "14px",
  margin: "20px 0",
  padding: "18px 20px",
};

const cardTitle = {
  color: emailColors.slate900,
  fontSize: "12px",
  fontWeight: "700" as const,
  letterSpacing: "0.06em",
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
};

const row = {
  color: emailColors.slate600,
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 8px",
};

const rowLabel = {
  color: emailColors.slate500,
  display: "inline-block" as const,
  fontWeight: "600" as const,
  minWidth: "112px",
};

const rowValue = {
  color: emailColors.slate900,
};

const highlightBlue = {
  background: `linear-gradient(135deg, ${emailColors.brandBlue}12 0%, ${emailColors.brandGreen}10 100%)`,
  border: `1px solid ${emailColors.brandBlue}22`,
  borderRadius: "12px",
  margin: "18px 0",
  padding: "14px 16px",
};

const highlightGreen = {
  background: `linear-gradient(135deg, ${emailColors.brandGreen}14 0%, #ffffff 100%)`,
  border: `1px solid ${emailColors.brandGreen}33`,
  borderRadius: "12px",
  margin: "18px 0",
  padding: "14px 16px",
};

const highlightNeutral = {
  backgroundColor: emailColors.slate50,
  border: `1px solid ${emailColors.slate200}`,
  borderRadius: "12px",
  margin: "18px 0",
  padding: "14px 16px",
};

const highlightWarning = {
  backgroundColor: "#fffbeb",
  border: "1px solid #fde68a",
  borderRadius: "12px",
  margin: "18px 0",
  padding: "14px 16px",
};

const highlightText = {
  color: emailColors.slate700,
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};

const listWrap = {
  margin: "8px 0 18px",
};

const listItem = {
  color: emailColors.slate700,
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 6px",
};

const bullet = {
  color: emailColors.brandBlue,
  fontWeight: "700" as const,
  marginRight: "8px",
};

const inlineLink = {
  color: emailColors.brandBlue,
  textDecoration: "underline",
};
