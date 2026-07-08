import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { companyRepository } from "@/repositories/company.repository";
import { companyGoogleRepository } from "@/repositories/meeting.repository";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await companyRepository.findByUserId(session.user.id);
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const connection = await companyGoogleRepository.findByCompanyId(company.id);
  if (connection) {
    await companyGoogleRepository.delete(company.id);
  }

  return NextResponse.json({ success: true });
}
