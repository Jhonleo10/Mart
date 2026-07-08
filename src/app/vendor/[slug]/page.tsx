import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { companyRepository } from "@/repositories/company.repository";
import { productLandingRepository } from "@/repositories/product-landing.repository";
import { buildPageMetadata } from "@/lib/seo";
import { getProductPublicPath } from "@/lib/product-public-url";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await companyRepository.findBySlug(slug);
  if (!company || company.status !== "APPROVED") {
    return { title: "Vendor Not Found" };
  }

  const primary = await productLandingRepository.findPrimaryPublishedSlug(company.id);

  return buildPageMetadata({
    title: company.metaTitle ?? `${company.name} — Software Vendor`,
    description:
      company.metaDescription ??
      company.description?.slice(0, 160) ??
      `Browse products and book demos with ${company.name}.`,
    path: primary ? getProductPublicPath(primary.slug) : `/companies/${slug}`,
    image: company.logo,
  });
}

/** Legacy vendor URL — redirects to the primary product SEO landing or company profile. */
export default async function VendorSeoPage({ params }: PageProps) {
  const { slug } = await params;
  const company = await companyRepository.findBySlug(slug);

  if (!company || company.status !== "APPROVED") notFound();

  const primary = await productLandingRepository.findPrimaryPublishedSlug(company.id);
  if (primary) {
    redirect(getProductPublicPath(primary.slug));
  }

  redirect(`/companies/${slug}`);
}
