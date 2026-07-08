import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeGoogleCode } from "@/lib/google/oauth";
import { companyGoogleRepository } from "@/repositories/meeting.repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const settingsUrl = new URL("/company/settings", baseUrl);

  if (error || !code || !state) {
    settingsUrl.searchParams.set("google", "error");
    return NextResponse.redirect(settingsUrl);
  }

  try {
    const cookieStore = await cookies();
    const savedState = cookieStore.get("google_oauth_state")?.value;
    const companyId = cookieStore.get("google_oauth_company")?.value;

    if (!savedState || savedState !== state || !companyId) {
      settingsUrl.searchParams.set("google", "invalid");
      return NextResponse.redirect(settingsUrl);
    }

    const tokens = await exchangeGoogleCode(code);
    await companyGoogleRepository.upsert(companyId, tokens);

    cookieStore.delete("google_oauth_state");
    cookieStore.delete("google_oauth_company");

    settingsUrl.searchParams.set("google", "connected");
    return NextResponse.redirect(settingsUrl);
  } catch {
    settingsUrl.searchParams.set("google", "error");
    return NextResponse.redirect(settingsUrl);
  }
}
