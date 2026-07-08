import { NextResponse } from "next/server";
import { z } from "zod";
import { productRepository } from "@/repositories/product.repository";

const querySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  industry: z.string().optional(),
  sort: z.enum(["popular", "latest", "trending", "featured"]).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    const [products, total] = await productRepository.search(parsed.data);
    return NextResponse.json({ products, total, page: parsed.data.page ?? 1 });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
