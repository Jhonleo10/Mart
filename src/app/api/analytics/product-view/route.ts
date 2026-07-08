import { NextResponse } from "next/server";
import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { productRepository } from "@/repositories/product.repository";
import { recentlyViewedRepository } from "@/repositories/intelligence.repository";
import { rateLimit } from "@/lib/rate-limit";
import { requireDbQuery } from "@/lib/db/safe-query";

const bodySchema = z.object({
  productId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const limited = await rateLimit(`product-view:${ip}`, "api");
    if (!limited.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await requireDbQuery("productView", async () => {
      await productRepository.incrementViews(parsed.data.productId);
    });

    const session = await auth();
    if (session?.user?.role === "USER") {
      await requireDbQuery("recentlyViewed", async () => {
        await recentlyViewedRepository.record(session.user.id, parsed.data.productId);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[analytics/product-view]", error);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
