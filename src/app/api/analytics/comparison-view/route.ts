import { NextResponse } from "next/server";
import { z } from "zod";
import { headers } from "next/headers";
import { analyticsRepository } from "@/repositories/analytics.repository";
import { rateLimit } from "@/lib/rate-limit";
import { requireDbQuery } from "@/lib/db/safe-query";

const bodySchema = z.object({
  productAId: z.string().min(1),
  productBId: z.string().min(1),
  slug: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const limited = await rateLimit(`comparison-view:${ip}`, "api");
    if (!limited.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await requireDbQuery("comparisonView", async () => {
      await analyticsRepository.getOrCreateComparison(
        parsed.data.productAId,
        parsed.data.productBId,
        parsed.data.slug,
      );
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[analytics/comparison-view]", error);
    return NextResponse.json({ error: "Failed to record comparison" }, { status: 500 });
  }
}
