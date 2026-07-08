import nodemailer from "nodemailer";
import type Transporter from "nodemailer/lib/mailer";
import { settingsRepository } from "@/repositories/settings.repository";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

export const mailFrom =
  process.env.SMTP_FROM ?? "Genius Mart <noreply@digitalgeniusmart.com>";

export interface MailTransportConfig {
  transport: Transporter;
  from: string;
}

function buildSmtpTransport(host: string, port: number, user: string, pass: string) {
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: pass.replace(/\s/g, "") },
  });
}

/** Legacy sync helper — prefers env SMTP only. */
export function createTransport() {
  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }
  return buildSmtpTransport(smtpHost, smtpPort, smtpUser, smtpPass);
}

/** Resolves SMTP from env vars, then Resend API key in DB or env. */
export async function resolveMailTransport(): Promise<MailTransportConfig | null> {
  if (smtpHost && smtpUser && smtpPass) {
    return {
      transport: buildSmtpTransport(smtpHost, smtpPort, smtpUser, smtpPass),
      from: mailFrom,
    };
  }

  const resendKey =
    process.env.RESEND_API_KEY ||
    (await settingsRepository.getSmtp()).apiKey ||
    "";

  if (resendKey.startsWith("re_")) {
    const smtpSettings = await settingsRepository.getSmtp();
    return {
      transport: nodemailer.createTransport({
        host: "smtp.resend.com",
        port: 465,
        secure: true,
        auth: { user: "resend", pass: resendKey },
      }),
      from: smtpSettings.fromEmail || process.env.RESEND_FROM_EMAIL || mailFrom,
    };
  }

  return null;
}

export async function isMailConfigured(): Promise<boolean> {
  return (await resolveMailTransport()) !== null;
}
