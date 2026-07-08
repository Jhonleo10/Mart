import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { contactFormSchema } from "@/lib/validations";
import { sanitizeText } from "@/lib/security/sanitize";
import { rateLimit } from "@/lib/rate-limit";
import { mailService } from "@/lib/mail";
import { getAdminEmails } from "@/lib/mail/send";
import { getSupportEmail } from "@/repositories/settings.repository";

export async function POST(request: Request) {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const limited = await rateLimit(`contact:${ip}`, "api");
    if (!limited.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 },
      );
    }

    const formData = await request.formData();
    const parsed = contactFormSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const payload = {
      name: sanitizeText(parsed.data.name),
      email: parsed.data.email.trim().toLowerCase(),
      subject: sanitizeText(parsed.data.subject),
      message: sanitizeText(parsed.data.message),
    };

    const [supportEmail, adminEmails] = await Promise.all([
      getSupportEmail(),
      getAdminEmails(),
    ]);
    const recipients = [...new Set([supportEmail, ...adminEmails].filter(Boolean))];

    await Promise.all([
      ...recipients.map((to) => mailService.contactInquiry(to, payload)),
      mailService.contactConfirmation(payload.email, {
        name: payload.name,
        subject: payload.subject,
        message: payload.message,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact]", error);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }
}
