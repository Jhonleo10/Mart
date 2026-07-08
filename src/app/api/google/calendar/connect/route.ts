import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGoogleAuthUrl, isGoogleOAuthConfigured } from "@/lib/google/oauth";
import { companyRepository } from "@/repositories/company.repository";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";

export async function GET() {
  try {
    if (!isGoogleOAuthConfigured()) {
      return NextResponse.json(
        { error: "Google Calendar integration is not configured" },
        { status: 503 },
      );
    }

    const session = await auth();
    if (!session?.user || session.user.role !== "COMPANY") {
      return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL));
    }

    const company = await companyRepository.findByUserId(session.user.id);
    if (!company) {
      return NextResponse.redirect(new URL("/company/settings?tab=profile", process.env.NEXTAUTH_URL));
    }

    const state = randomBytes(16).toString("hex");
    const cookieStore = await cookies();
    cookieStore.set("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    cookieStore.set("google_oauth_company", company.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    const url = getGoogleAuthUrl(state);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(
      new URL("/company/settings?google=error", process.env.NEXTAUTH_URL),
    );
  }
}
