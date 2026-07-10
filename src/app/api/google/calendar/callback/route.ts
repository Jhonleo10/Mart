import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { resolveAppBaseUrl } from "@/lib/app-url";
import { exchangeGoogleCode } from "@/lib/google/oauth";
import { companyGoogleRepository } from "@/repositories/meeting.repository";
import { companyRepository } from "@/repositories/company.repository";

export async function GET(request: Request) {
  const baseUrl = await resolveAppBaseUrl();
  const meetingsUrl = new URL("/company/meetings", baseUrl);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    meetingsUrl.searchParams.set("google", error === "access_denied" ? "denied" : "error");
    return NextResponse.redirect(meetingsUrl);
  }

  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COMPANY") {
      return NextResponse.redirect(new URL("/login", baseUrl));
    }

    const company = await companyRepository.findByUserId(session.user.id);
    if (!company) {
      meetingsUrl.searchParams.set("google", "error");
      return NextResponse.redirect(meetingsUrl);
    }

    const cookieStore = await cookies();
    const savedState = cookieStore.get("google_oauth_state")?.value;
    const companyId = cookieStore.get("google_oauth_company")?.value;

    if (!savedState || savedState !== state || !companyId) {
      meetingsUrl.searchParams.set("google", "invalid");
      return NextResponse.redirect(meetingsUrl);
    }

    if (companyId !== company.id) {
      meetingsUrl.searchParams.set("google", "invalid");
      return NextResponse.redirect(meetingsUrl);
    }

    const tokens = await exchangeGoogleCode(code);
    await companyGoogleRepository.upsert(company.id, tokens);

    cookieStore.delete("google_oauth_state");
    cookieStore.delete("google_oauth_company");

    meetingsUrl.searchParams.set("google", "connected");
    return NextResponse.redirect(meetingsUrl);
  } catch (err) {
    console.error("[google/calendar/callback]", err);
    meetingsUrl.searchParams.set("google", "error");
    return NextResponse.redirect(meetingsUrl);
  }
}
