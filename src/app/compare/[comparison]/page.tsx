import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { productRepository } from "@/repositories/product.repository";
import { analyticsRepository } from "@/repositories/analytics.repository";
import { buildIntelligentComparison } from "@/lib/intelligence/comparison-engine";
import type { IntelligenceProduct } from "@/lib/intelligence/types";
import { buildPageMetadata } from "@/lib/seo";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";
import { IntelligentComparisonView } from "@/components/intelligence/intelligent-comparison-view";

interface PageProps {
  params: Promise<{ comparison: string }>;
}

function parseComparisonSlug(slug: string): [string, string] | null {
  const idx = slug.indexOf("-vs-");
  if (idx <= 0) return null;
  return [slug.slice(0, idx), slug.slice(idx + 4)];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { comparison } = await params;
  const parsed = parseComparisonSlug(comparison);
  if (!parsed) return { title: "Compare Products" };

  const [slugA, slugB] = parsed;
  const [a, b] = await Promise.all([
    productRepository.findBySlug(slugA),
    productRepository.findBySlug(slugB),
  ]);
  if (!a || !b) return { title: "Compare Products" };

  return buildPageMetadata({
    title: `${a.name} vs ${b.name} — Intelligent Comparison`,
    description: `AI-grade comparison of ${a.name} and ${b.name} — price, features, security, reviews, and more.`,
    path: `/compare/${comparison}`,
  });
}

export default async function ComparePage({ params }: PageProps) {
  const { comparison } = await params;
  const parsed = parseComparisonSlug(comparison);
  if (!parsed) notFound();

  const [slugA, slugB] = parsed;
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
    notFound();
  }

  await analyticsRepository.getOrCreateComparison(productA.id, productB.id, comparison);

  const intelligent = buildIntelligentComparison(
    productA as IntelligenceProduct,
    productB as IntelligenceProduct,
  );

  const session = await auth();
  const isBuyer = session?.user?.role === "USER";
  const backHref = isBuyer ? "/user/dashboard" : "/products";
  const backLabel = isBuyer ? "Back to Discovery Lounge" : "Back to products";
  const discoverHref = isBuyer ? "/user/discover" : "/products";

  return (
    <div className="dash-page-enter mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href={backHref}
        className="mb-4 inline-flex text-sm font-medium text-brand-blue hover:underline"
      >
        ← {backLabel}
      </Link>
      <DashboardPageHeader
        title={`${productA.name} vs ${productB.name}`}
        description="Intelligent side-by-side analysis powered by product metadata and marketplace signals"
      />
      <IntelligentComparisonView data={intelligent} />
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href={discoverHref} className="font-semibold text-brand-blue hover:underline">
          Discover more software
        </Link>
      </p>
    </div>
  );
}
