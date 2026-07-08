import { NextResponse } from "next/server";
import { z } from "zod";
import { analyticsRepository } from "@/repositories/analytics.repository";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  productId: z.string().min(1),
  clickType: z.enum(["website", "demo"]),
});

export async function POST(request: Request) {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const limited = await rateLimit(`analytics-click:${ip}`, "api");
    if (!limited.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const headerIp = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    await analyticsRepository.recordClick(parsed.data.productId, parsed.data.clickType, headerIp);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to record click" }, { status: 500 });
  }
}
