import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { runWithAppBaseUrl, appUrl } from "@/lib/app-url";
import { getSiteConfig } from "@/lib/site-config";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { setEmailBranding, resetEmailBranding } from "./branding";
import { resolveMailTransport, mailFrom } from "./transport";

export type EmailTemplate =
  | "CompanyRegisteredEmail"
  | "CompanyVerificationEmail"
  | "CompanyPendingApprovalEmail"
  | "CompanyApprovedEmail"
  | "CompanyRejectedEmail"
  | "UserOtpEmail"
  | "UserWelcomeEmail"
  | "AdminNewUserEmail"
  | "AdminNewCompanyEmail"
  | "LeadNotificationEmail"
  | "ForgotPasswordEmail"
  | "PasswordChangedEmail"
  | "BookingConfirmationEmail"
  | "BookingStatusUpdateEmail"
  | "ProductApprovedEmail"
  | "ProductRejectedEmail"
  | "ContactInquiryEmail"
  | "ContactConfirmationEmail"
  | "DemoRequestReceivedEmail"
  | "DemoConfirmedEmail"
  | "MeetingScheduledEmail"
  | "MeetingReminderEmail"
  | "MeetingCancelledEmail"
  | "MeetingRescheduledEmail"
  | "MeetingCompletedEmail"
  | "FeedbackRequestEmail";

interface SendMailOptions {
  to: string;
  subject: string;
  template: EmailTemplate;
  react: ReactElement;
  metadata?: Record<string, unknown>;
}

async function logEmail(
  to: string,
  subject: string,
  template: EmailTemplate,
  status: "SENT" | "FAILED",
  error?: string,
  metadata?: Record<string, unknown>,
) {
  try {
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        template,
        status,
        error,
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch {
    // Non-blocking
  }
}

export async function sendMail({
  to,
  subject,
  template,
  react,
  metadata,
}: SendMailOptions) {
  return runWithAppBaseUrl(async () => {
    const site = await getSiteConfig();
    const logoPath = site.logoSrc.startsWith("/") ? site.logoSrc : `/${site.logoSrc}`;
    setEmailBranding({
      siteName: site.name,
      supportEmail: site.contactEmail,
      tagline: site.tagline,
      website: site.website,
      logoUrl: appUrl(encodeURI(logoPath)),
    });

    try {
      const html = await render(react);
      const config = await resolveMailTransport();

      if (!config) {
        const devHint =
          process.env.NODE_ENV === "development"
            ? " Configure SMTP_HOST/SMTP_USER/SMTP_PASS or RESEND_API_KEY to deliver email."
            : "";
        console.warn(`[Email:${template}] No mail transport configured.${devHint} To: ${to}`);
        await logEmail(to, subject, template, "FAILED", "Mail transport not configured", metadata);
        return { success: false as const, error: "Email service is not configured" };
      }

      try {
        await config.transport.sendMail({
          from: config.from || mailFrom,
          to,
          subject,
          html,
        });
        await logEmail(to, subject, template, "SENT", undefined, metadata);
        return { success: true as const };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(`Email send failed [${template}]:`, message);
        await logEmail(to, subject, template, "FAILED", message, metadata);
        return { success: false as const, error: message };
      }
    } finally {
      resetEmailBranding();
    }
  });
}

export async function getAdminEmails(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });
  return admins.map((a) => a.email);
}
