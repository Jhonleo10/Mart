import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { smartSearch } from "@/lib/intelligence/smart-search";
import { profileToRequirements } from "@/lib/intelligence/requirement-search";
import { requirementRepository } from "@/repositories/intelligence.repository";
import { intelligenceSearchQuerySchema } from "@/lib/validations/intelligence";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await rateLimit(`search:${session.user.id}`, "search");
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many searches. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = intelligenceSearchQuerySchema.safeParse({
    q: searchParams.get("q") ?? "",
    page: searchParams.get("page") ?? "1",
    limit: searchParams.get("limit") ?? "12",
    category: searchParams.get("category") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 },
    );
  }

  const { q, page, limit, category, sort } = parsed.data;

  const profile = await requirementRepository.getByUserId(session.user.id);
  const requirements = profile ? profileToRequirements(profile) : undefined;

  const { results, total, parsed: searchParsed, requirementApplied, suggestedQuery } =
    await smartSearch({
      q,
      page,
      limit,
      category,
      sort,
      requirements,
    });

  return NextResponse.json({
    results,
    total,
    parsed: searchParsed,
    page,
    limit,
    requirementApplied,
    suggestedQuery,
  });
}
