"use server";

import { headers } from "next/headers";
import type { ActionResult } from "@/lib/action-types";
import { handleActionError, AppError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { sendMail, getAdminEmails } from "@/lib/mail/send";
import { ContactInquiryEmail } from "@/lib/mail/templates/contact-inquiry";
import { ContactConfirmationEmail } from "@/lib/mail/templates/contact-confirmation";
import { getSupportEmail } from "@/repositories/settings.repository";
import { contactFormSchema } from "@/lib/validations";
import { firstZodError } from "@/lib/validations/helpers";

export async function submitContactForm(formData: FormData): Promise<ActionResult> {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const limited = await rateLimit(`contact:${ip}`, "api");
    if (!limited.success) {
      throw new AppError("Too many requests. Please try again in a minute.", 429);
    }

    const parsed = contactFormSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    });

    if (!parsed.success) {
      return { error: firstZodError(parsed.error) };
    }

    const admins = await getAdminEmails();
    const supportEmail = await getSupportEmail();
    const recipients = admins.length > 0 ? admins : [supportEmail];

    const adminResults = await Promise.all(
      recipients.map((to) =>
        sendMail({
          to,
          subject: `Contact: ${parsed.data.subject}`,
          template: "ContactInquiryEmail",
          react: ContactInquiryEmail(parsed.data),
          metadata: { fromEmail: parsed.data.email },
        }),
      ),
    );

    const adminFailed = adminResults.find((r) => !r.success);
    if (adminFailed && !adminFailed.success) {
      return {
        error:
          adminFailed.error ??
          "Unable to send your message right now. Please email support directly.",
      };
    }

    const confirmation = await sendMail({
      to: parsed.data.email,
      subject: "We received your message — Genius Mart",
      template: "ContactConfirmationEmail",
      react: ContactConfirmationEmail(parsed.data),
      metadata: { type: "contact_confirmation" },
    });

    if (!confirmation.success) {
      return {
        error:
          confirmation.error ??
          "Your message was received by our team, but we could not send a confirmation email. Please check your inbox or try again.",
      };
    }

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
