import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ProductCard } from "@/components/products/product-card";
import { SpotlightCarousel } from "@/components/landing/spotlight-carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProductPublicPath } from "@/lib/product-public-url";
import { LandingSection, SectionLabel, SectionTitle } from "@/components/landing/landing-primitives";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Mail,
  Package,
  Phone,
  Shield,
  Sparkles,
} from "lucide-react";

interface VendorLandingPageProps {
  company: {
    name: string;
    slug: string;
    description: string | null;
    industry: string | null;
    website: string | null;
    logo: string | null;
    contactEmail: string;
    contactPhone: string | null;
    seoTagline: string | null;
    metaDescription: string | null;
    products: {
      id: string;
      name: string;
      slug: string;
      shortDescription: string;
      pricingModel: string;
      price: number | null;
      viewCount: number;
      featured: boolean;
      category: { name: string };
      images: { url: string }[];
    }[];
  };
  theme?: {
    primaryColor?: string;
    accentColor?: string;
    heroHeadline?: string | null;
  };
}

export function VendorLandingPage({ company, theme }: VendorLandingPageProps) {
  const companyRef = {
    name: company.name,
    slug: company.slug,
    logo: company.logo,
  };

  const withCompany = (product: VendorLandingPageProps["company"]["products"][number]) => ({
    ...product,
    company: companyRef,
    reviews: [] as { rating: number }[],
  });

  const featured = company.products.filter((p) => p.featured);
  const spotlight = featured;
  const rest = company.products.filter((p) => !p.featured);
  const primaryProduct = spotlight[0] ?? company.products[0];
  const primaryColor = theme?.primaryColor ?? "#2563eb";
  const accentColor = theme?.accentColor ?? "#10b981";
  const heroTitle = theme?.heroHeadline?.trim() || company.name;
  const tagline =
    company.seoTagline ??
    company.metaDescription ??
    company.description ??
    `Explore verified software solutions from ${company.name}`;

  const themeStyle = {
    "--vendor-primary": primaryColor,
    "--vendor-accent": accentColor,
  } as CSSProperties;

  return (
    <div className="vendor-landing min-h-screen bg-white" style={themeStyle}>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/90 text-white backdrop-blur-md">
        <div className="safe-container flex h-14 items-center justify-between gap-4 sm:h-16">
          <div className="flex min-w-0 items-center gap-3">
            {company.logo ? (
              <Image
                src={company.logo}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-white/20"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-bold">
                {company.name.charAt(0)}
              </div>
            )}
            <span className="truncate font-heading text-sm font-bold sm:text-base">{company.name}</span>
          </div>
          <nav className="hidden items-center gap-5 text-sm text-white/80 sm:flex">
            <a href="#about" className="hover:text-white">
              About
            </a>
            <a href="#spotlight" className="hover:text-white">
              Products
            </a>
            {primaryProduct ? (
              <Link href={getProductPublicPath(primaryProduct.slug)}>
                <Button size="sm" className="bg-white hover:bg-white/90" style={{ color: primaryColor }}>
                  Book demo
                </Button>
              </Link>
            ) : (
              <a href={`mailto:${company.contactEmail}`}>
                <Button size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  Contact
                </Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero — full-bleed SEO landing header */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 55%, ${accentColor}33 100%)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.14),transparent_42%)]" />
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-brand-green/20 blur-3xl" />
        <div className="safe-container relative py-14 sm:py-16 lg:py-20">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-white/75">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link href="/companies" className="hover:text-white">
              Vendors
            </Link>
            <span aria-hidden>/</span>
            <span className="text-white">{company.name}</span>
          </nav>

          <div className="mx-auto max-w-4xl text-center">
            {company.logo ? (
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                width={88}
                height={88}
                className="mx-auto mb-6 rounded-2xl bg-white/10 object-cover p-1 ring-2 ring-white/20"
              />
            ) : (
              <div className="mx-auto mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-2xl bg-white/10 text-3xl font-bold ring-2 ring-white/20">
                {company.name.charAt(0)}
              </div>
            )}

            <Badge className="mb-4 border-white/25 bg-white/10 text-white backdrop-blur">
              <Shield className="mr-1.5 h-3.5 w-3.5" />
              Verified vendor on Genius Mart
            </Badge>

            <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              {heroTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
              {tagline}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {primaryProduct ? (
                <Link href={getProductPublicPath(primaryProduct.slug)}>
                  <Button size="lg" className="bg-white hover:bg-white/90" style={{ color: primaryColor }}>
                    <Calendar className="h-4 w-4" />
                    Book a demo
                  </Button>
                </Link>
              ) : (
                <a href={`mailto:${company.contactEmail}`}>
                  <Button size="lg" className="bg-white text-brand-blue hover:bg-white/90">
                    <Mail className="h-4 w-4" />
                    Contact vendor
                  </Button>
                </a>
              )}
              {company.website ? (
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/40 bg-transparent text-white hover:bg-white/10"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit website
                  </Button>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Trust stats */}
      <section className="border-b border-slate-100 bg-white">
        <div className="safe-container grid gap-4 py-8 sm:grid-cols-3 sm:gap-6">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-4">
            <Package className="h-5 w-5 shrink-0 text-brand-blue" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{company.products.length}</p>
              <p className="text-sm text-slate-500">Published products</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-4">
            <Building2 className="h-5 w-5 shrink-0 text-brand-green" />
            <div>
              <p className="truncate text-lg font-bold text-slate-900">
                {company.industry ?? "Software vendor"}
              </p>
              <p className="text-sm text-slate-500">Industry focus</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-blue" />
            <div>
              <p className="text-lg font-bold text-slate-900">Admin verified</p>
              <p className="text-sm text-slate-500">Trusted marketplace partner</p>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <LandingSection id="about">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionLabel>About the vendor</SectionLabel>
            <div className="mt-4">
              <h2 className="font-heading text-left text-2xl font-bold text-slate-900 sm:text-3xl">
                Why choose <span className="text-gradient">{company.name}</span>?
              </h2>
              <p className="mt-4 text-left text-base leading-relaxed text-slate-600">
                {company.description ??
                  `${company.name} offers business software solutions on Genius Mart. Browse products below and book a personalized demo with their team.`}
              </p>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                Verified vendor profile with published product listings
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                Book demos directly from product pages
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                Compare solutions before you buy
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-brand-blue/5 to-brand-green/5 p-6 sm:p-8">
            <h3 className="font-heading text-lg font-semibold text-slate-900">Get in touch</h3>
            <div className="mt-5 space-y-4 text-sm">
              <a
                href={`mailto:${company.contactEmail}`}
                className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-slate-700 shadow-sm ring-1 ring-slate-100 hover:ring-brand-blue/30"
              >
                <Mail className="h-4 w-4 text-brand-blue" />
                {company.contactEmail}
              </a>
              {company.contactPhone ? (
                <a
                  href={`tel:${company.contactPhone}`}
                  className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-slate-700 shadow-sm ring-1 ring-slate-100 hover:ring-brand-blue/30"
                >
                  <Phone className="h-4 w-4 text-brand-blue" />
                  {company.contactPhone}
                </a>
              ) : null}
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-slate-700 shadow-sm ring-1 ring-slate-100 hover:ring-brand-blue/30"
                >
                  <ExternalLink className="h-4 w-4 text-brand-blue" />
                  {company.website.replace(/^https?:\/\//, "")}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </LandingSection>

      {/* Product spotlight */}
      {spotlight.length > 0 ? (
        <LandingSection id="spotlight" alt>
          <SectionLabel>Pro spotlight</SectionLabel>
          <div className="mt-4">
            <SectionTitle
              title="Product Spotlight"
              subtitle={`Featured Pro listings from ${company.name} — book a demo to see them in action.`}
            />
          </div>
          <div className="mt-8">
            <SpotlightCarousel
              compact
              products={spotlight.map((product) => ({
                id: product.id,
                name: product.name,
                slug: product.slug,
                shortDescription: product.shortDescription,
                price: product.price,
                company: { name: company.name },
                category: { name: product.category.name },
                images: product.images,
                featured: true,
              }))}
            />
          </div>
        </LandingSection>
      ) : null}

      {/* All products */}
      {rest.length > 0 ? (
        <LandingSection id="products">
          <SectionLabel>Full catalog</SectionLabel>
          <div className="mt-4">
            <SectionTitle
              title="All Products"
              subtitle={`Browse every solution published by ${company.name}.`}
            />
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((product) => (
              <ProductCard key={product.id} product={withCompany(product)} />
            ))}
          </div>
        </LandingSection>
      ) : null}

      {/* Bottom CTA */}
      <section className="border-t border-slate-100 bg-gradient-to-br from-slate-900 via-brand-blue-dark to-brand-blue text-white">
        <div className="safe-container py-14 text-center sm:py-16">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Ready to explore {company.name}?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/85 sm:text-base">
            Book a demo, compare products, or reach out to their team — all from Genius Mart.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {primaryProduct ? (
              <Link href={getProductPublicPath(primaryProduct.slug)}>
                <Button size="lg" className="bg-white text-brand-blue hover:bg-white/90">
                  Book a demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : null}
            <Link href="/products">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                Explore marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
        <p>
          © {new Date().getFullYear()} {company.name}. Listed on{" "}
          <Link href="/" className="font-medium text-brand-blue hover:underline">
            Genius Mart
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
