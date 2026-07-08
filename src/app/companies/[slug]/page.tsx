import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { companyRepository } from "@/repositories/company.repository";
import { ProductCard } from "@/components/products/product-card";
import { Badge } from "@/components/ui/badge";
import { buildPageMetadata, breadcrumbJsonLd, organizationJsonLd } from "@/lib/seo";
import { getVendorPublicPath } from "@/lib/vendor-public-url";
import { resolveAppBaseUrl } from "@/lib/app-url";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { ExternalLink } from "lucide-react";
import { PageSection, EmptyState } from "@/components/layout/page-shell";

export const revalidate = 300;

interface CompanyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await companyRepository.findBySlug(slug);
  if (!company || company.status !== "APPROVED") return { title: "Company Not Found" };

  return buildPageMetadata({
    title: `${company.name} — Software Vendor`,
    description: company.description?.slice(0, 160) ?? `Products by ${company.name}`,
    path: `/companies/${slug}`,
    image: company.logo,
  });
}

export default async function CompanyDetailPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const company = await companyRepository.findBySlug(slug);

  if (!company || company.status !== "APPROVED") notFound();

  const baseUrl = await resolveAppBaseUrl();
  const vendorPath = getVendorPublicPath(company);
  const structuredData = [
    organizationJsonLd({
      name: company.name,
      description: company.description,
      website: company.website,
      logo: company.logo,
      slug: company.slug,
      landingUrl: `${baseUrl}${vendorPath}`,
    }),
    breadcrumbJsonLd(
      [
        { name: "Companies", path: "/companies" },
        { name: company.name, path: vendorPath },
      ],
      baseUrl,
    ),
  ];

  return (
    <PageSection>
      <JsonLdScript data={structuredData} />
      <div className="glass-card flex flex-col gap-6 rounded-2xl p-6 sm:flex-row sm:items-start sm:p-8">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-blue/10 text-2xl font-bold text-brand-blue">
          {company.logo ? (
            <Image src={company.logo} alt={company.name} width={80} height={80} className="object-cover" />
          ) : (
            company.name.charAt(0)
          )}
        </div>
        <div className="min-w-0">
          <h1 className="break-safe font-heading text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
            <span className="text-gradient">{company.name}</span>
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Badge>{company.industry}</Badge>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-brand-blue hover:text-brand-blue-dark"
              >
                <ExternalLink className="h-4 w-4" />
                Website
              </a>
            )}
          </div>
          <p className="mt-4 max-w-3xl break-safe text-slate-600">{company.description}</p>
          <p className="mt-2 break-safe text-sm text-slate-400">
            Contact: {company.contactEmail} · {company.contactPhone}
          </p>
        </div>
      </div>

      <div className="mt-10 sm:mt-12">
        <h2 className="font-heading text-xl font-semibold text-slate-900 sm:text-2xl">
          Products by {company.name}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {company.products.map((product) => (
            <ProductCard key={product.id} product={{ ...product, company, reviews: [] }} />
          ))}
        </div>
        {company.products.length === 0 && (
          <div className="mt-6">
            <EmptyState message="No published products yet." />
          </div>
        )}
      </div>
    </PageSection>
  );
}
