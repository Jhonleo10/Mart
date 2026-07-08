import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { productRepository } from "@/repositories/product.repository";
import { buildIntelligentComparison } from "@/lib/intelligence/comparison-engine";
import type { IntelligenceProduct } from "@/lib/intelligence/types";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slugA = searchParams.get("a");
  const slugB = searchParams.get("b");
  if (!slugA || !slugB) {
    return NextResponse.json({ error: "Missing product slugs" }, { status: 400 });
  }

  const [productA, productB] = await Promise.all([
    productRepository.findBySlug(slugA),
    productRepository.findBySlug(slugB),
  ]);

  if (
    !productA ||
    !productB ||
    productA.status !== "PUBLISHED" ||
    productB.status !== "PUBLISHED"
  ) {
    return NextResponse.json({ error: "Products not found" }, { status: 404 });
  }

  const comparison = buildIntelligentComparison(
    productA as IntelligenceProduct,
    productB as IntelligenceProduct,
  );

  return NextResponse.json({ comparison });
}
