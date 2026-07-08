import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { productRepository } from "@/repositories/product.repository";
import { summarizeReviews } from "@/lib/intelligence/review-nlp";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await params;
  const product = await productRepository.findById(productId);
  if (!product || product.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const summary = summarizeReviews(
    product.reviews.map((r) => ({ rating: r.rating, comment: r.comment })),
    product.features,
    product.suitableFor,
  );

  return NextResponse.json({ summary });
}
