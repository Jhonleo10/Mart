import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { resolveAppBaseUrl } from "@/lib/app-url";
import { getGoogleAuthUrl, isGoogleOAuthConfigured } from "@/lib/google/oauth";
import { companyRepository } from "@/repositories/company.repository";

function useSecureCookies() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

export async function GET() {
  const baseUrl = await resolveAppBaseUrl();

  try {
    if (!isGoogleOAuthConfigured()) {
      return NextResponse.redirect(new URL("/company/meetings?google=not_configured", baseUrl));
    }

    const session = await auth();
    if (!session?.user || session.user.role !== "COMPANY") {
      return NextResponse.redirect(new URL("/login", baseUrl));
    }

    const company = await companyRepository.findByUserId(session.user.id);
    if (!company) {
      return NextResponse.redirect(new URL("/company/settings?tab=profile", baseUrl));
    }

    const state = randomBytes(16).toString("hex");
    const cookieStore = await cookies();
    const secure = useSecureCookies();

    cookieStore.set("google_oauth_state", state, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    cookieStore.set("google_oauth_company", company.id, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    const url = getGoogleAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("[google/calendar/connect]", error);
    return NextResponse.redirect(new URL("/company/meetings?google=error", baseUrl));
  }
}
