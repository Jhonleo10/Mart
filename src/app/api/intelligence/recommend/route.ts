import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateRecommendations } from "@/lib/intelligence/recommendation-engine";
import { userRequirementsSchema } from "@/lib/validations/intelligence";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = userRequirementsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const recommendations = await generateRecommendations(parsed.data, 12);
  return NextResponse.json({ recommendations });
}
