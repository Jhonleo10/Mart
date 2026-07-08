import Image from "next/image";
import Link from "next/link";
import type { ProductLandingConfig, LandingSectionId } from "@/lib/product-landing/types";
import { EXCLUDED_PRODUCT_LANDING_SECTIONS } from "@/lib/product-landing/types";
import { ProductLandingNav } from "./product-landing-nav";
import { ProductLandingGallery } from "./product-landing-gallery";
import { LandingFeatureIcon } from "./landing-feature-icon";
import { ProductCompanyStrip } from "./product-company-strip";
import { PlReveal } from "./pl-reveal";
import { BookingForm } from "@/components/forms/booking-form";
import { ContactVendorForm } from "@/components/forms/contact-vendor-form";
import { LandingSection } from "@/components/landing/landing-primitives";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Mail,
  Phone,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type LandingProduct = {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string | null;
  demoUrl: string | null;
  companyId: string;
  company: {
    name: string;
    slug: string;
    logo: string | null;
    website: string | null;
    contactEmail: string;
    contactPhone: string | null;
    description: string | null;
  };
  category: { name: string };
};

function themeVars(theme: ProductLandingConfig["theme"]) {
  const radius =
    theme.borderRadius === "sm" ? "0.5rem" : theme.borderRadius === "md" ? "0.75rem" : "1rem";
  const font =
    theme.fontFamily === "dm-sans"
      ? "var(--font-sans)"
      : theme.fontFamily === "inter"
        ? "Inter, system-ui, sans-serif"
        : theme.fontFamily === "system"
          ? "system-ui, sans-serif"
          : "var(--font-heading)";

  return {
    "--landing-primary": theme.primaryColor,
    "--landing-secondary": theme.secondaryColor,
    "--landing-accent": theme.accentColor,
    "--landing-radius": radius,
    "--landing-font": font,
  } as React.CSSProperties;
}

function buttonClass(theme: ProductLandingConfig["theme"]) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-semibold",
    theme.buttonStyle === "pill" && "rounded-full",
    theme.buttonStyle === "square" && "rounded-md",
    theme.buttonStyle === "rounded" && "rounded-[var(--landing-radius)]",
  );
}

const excludedSet = new Set(EXCLUDED_PRODUCT_LANDING_SECTIONS);

export function ProductLandingPage({
  product,
  config,
  isLoggedIn,
  userDefaults,
}: {
  product: LandingProduct;
  config: ProductLandingConfig;
  isLoggedIn: boolean;
  userDefaults?: { name?: string; email?: string };
}) {
  const { sections, sectionOrder, theme } = config;
  const website = product.websiteUrl ?? product.company.website;

  const enabledSections = sectionOrder.filter((id) => {
    if (excludedSet.has(id)) return false;
    const section = sections[id as keyof typeof sections];
    return section && "enabled" in section && section.enabled;
  });

  const renderSection = (id: LandingSectionId, index: number) => {
    const delay = Math.min(index * 60, 300);

    switch (id) {
      case "hero":
        return sections.hero.enabled ? (
          <section
            key={id}
            id="landing-hero"
            className={cn(
              "pl-hero-mesh relative overflow-hidden text-white",
              theme.heroBackground === "gradient" &&
              "bg-gradient-to-br from-[var(--landing-primary)] via-[var(--landing-secondary)] to-slate-900",
              theme.heroBackground === "solid" && "bg-[var(--landing-primary)]",
            )}
            style={
              theme.heroBackground === "image" && theme.heroBackgroundImage
                ? {
                  backgroundImage: `linear-gradient(rgba(15,23,42,0.82), rgba(15,23,42,0.88)), url(${theme.heroBackgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
                : undefined
            }
          >
            <div className="safe-container relative z-10 py-14 sm:py-20 lg:py-24">
              <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                <PlReveal>
                  <div>
                    <div className="mb-5 flex flex-wrap items-center gap-2">
                      <span className="pl-badge">
                        <Sparkles className="h-3 w-3" />
                        {product.category.name}
                      </span>
                      <span className="pl-badge border-white/15 bg-white/10">by {product.company.name}</span>
                    </div>
                    <h1
                      className="font-heading text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]"
                      style={{ fontFamily: "var(--landing-font)" }}
                    >
                      <span className="pl-shimmer-text">{product.name}</span>
                    </h1>
                    <p className="mt-4 text-lg font-medium text-white/92 sm:text-xl">{sections.hero.tagline}</p>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-white/78">
                      {sections.hero.shortDescription}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <a href="#landing-cta">
                        <button
                          type="button"
                          className={cn(
                            buttonClass(theme),
                            "pl-btn-primary bg-white px-7 py-3.5 text-[var(--landing-primary)] shadow-xl shadow-black/10",
                          )}
                        >
                          {sections.hero.primaryCtaLabel}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </a>
                      {website && (
                        <a href={website} target="_blank" rel="noopener noreferrer">
                          <button
                            type="button"
                            className={cn(
                              buttonClass(theme),
                              "border border-white/35 bg-white/10 px-7 py-3.5 text-white backdrop-blur-sm transition-transform hover:scale-[1.02]",
                            )}
                          >
                            {sections.hero.secondaryCtaLabel}
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </a>
                      )}
                    </div>
                    <div className="mt-10 flex flex-wrap gap-2">
                      {sections.features.items.slice(0, 4).map((f) => (
                        <span
                          key={f.title}
                          className="pl-stat-pill inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm"
                        >
                          <Zap className="h-3 w-3 text-[var(--landing-accent)]" />
                          {f.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </PlReveal>
                {sections.hero.heroImageUrl && (
                  <PlReveal delay={120}>
                    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                      <div
                        className="pl-hero-glow absolute -inset-6 rounded-[2.5rem] bg-white/15 blur-3xl"
                        aria-hidden
                      />
                      <div className="pl-float pl-glass relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-2xl ring-1 ring-white/25">
                        <Image
                          src={sections.hero.heroImageUrl}
                          alt={`${product.name} preview`}
                          fill
                          className="object-cover"
                          priority
                          sizes="(max-width: 1024px) 100vw, 512px"
                        />
                      </div>
                    </div>
                  </PlReveal>
                )}
              </div>
            </div>
          </section>
        ) : null;

      case "overview":
        return sections.overview.enabled ? (
          <LandingSection key={id} id="landing-overview">
            <PlReveal delay={delay}>
              <div className="text-center">
                <span className="pl-section-label">About {product.name}</span>
                <h2 className="font-heading mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Built for <span className="pl-gradient-text">your team</span>
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">{sections.overview.whyChoose}</p>
              </div>
              <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
                <div className="pl-glass pl-hover-lift rounded-2xl p-6 sm:p-8">
                  <p className="text-base leading-relaxed text-slate-600">
                    {sections.overview.detailedDescription}
                  </p>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {sections.overview.keyBenefits.map((b, i) => (
                    <li
                      key={b}
                      className="pl-hover-lift flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3.5 text-sm text-slate-700 shadow-sm"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--landing-primary)]/10 text-xs font-bold text-[var(--landing-primary)]">
                        {i + 1}
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </PlReveal>
          </LandingSection>
        ) : null;

      case "features":
        return sections.features.enabled && sections.features.items.length > 0 ? (
          <LandingSection key={id} id="landing-features" alt>
            <PlReveal delay={delay}>
              <div className="text-center">
                <span className="pl-section-label">Key features</span>
                <h2 className="font-heading mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                  Everything in one product
                </h2>
              </div>
              <div className="pl-bento-grid mt-12">
                {sections.features.items.map((f, i) => (
                  <div
                    key={f.title}
                    className="pl-bento-feature pl-hover-lift"
                    style={{ transitionDelay: `${i * 40}ms` }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--landing-primary)]/15 to-[var(--landing-accent)]/10 text-[var(--landing-primary)] transition-transform duration-300 group-hover:scale-110">
                      <LandingFeatureIcon name={f.icon} className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-heading text-lg font-semibold text-slate-900">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.description}</p>
                  </div>
                ))}
              </div>
            </PlReveal>
          </LandingSection>
        ) : null;

      case "gallery":
        return sections.gallery.enabled && sections.gallery.images.length > 0 ? (
          <LandingSection key={id} id="landing-gallery">
            <PlReveal delay={delay}>
              <div className="text-center">
                <span className="pl-section-label">Product preview</span>
                <h2 className="font-heading mt-4 text-3xl font-bold text-slate-900">See {product.name} in action</h2>
              </div>
              <div className="mt-10">
                <ProductLandingGallery images={sections.gallery.images} />
              </div>
            </PlReveal>
          </LandingSection>
        ) : null;

      case "pricing":
        return sections.pricing.enabled && sections.pricing.showCards ? (
          <LandingSection key={id} id="landing-pricing" alt>
            <PlReveal delay={delay}>
              <div className="text-center">
                <span className="pl-section-label">Pricing</span>
                <h2 className="font-heading mt-4 text-3xl font-bold text-slate-900">Simple, transparent pricing</h2>
              </div>
              <div
                className={cn(
                  "mx-auto mt-10 grid max-w-5xl gap-6",
                  sections.pricing.tiers.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : "max-w-md",
                )}
              >
                {sections.pricing.tiers.map((tier, i) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "pl-hover-lift rounded-2xl border p-6 shadow-sm",
                      tier.highlighted
                        ? "pl-pricing-glow border-[var(--landing-primary)] bg-white ring-2 ring-[var(--landing-primary)]/15"
                        : "border-slate-100 bg-white",
                    )}
                    style={{ transitionDelay: `${i * 50}ms` }}
                  >
                    <h3 className="font-heading text-lg font-bold text-slate-900">{tier.name}</h3>
                    <p className="mt-2">
                      <span className="text-3xl font-extrabold text-slate-900">{tier.price}</span>
                      {tier.period && <span className="text-sm text-slate-500">{tier.period}</span>}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">{tier.description}</p>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--landing-accent)]" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <a href="#landing-cta" className="mt-6 block">
                      <button
                        type="button"
                        className={cn(
                          buttonClass(theme),
                          "pl-btn-primary w-full px-4 py-2.5 text-sm",
                          tier.highlighted
                            ? "bg-[var(--landing-primary)] text-white"
                            : "border border-slate-200 bg-white text-slate-800",
                        )}
                      >
                        {tier.ctaLabel}
                      </button>
                    </a>
                  </div>
                ))}
              </div>
            </PlReveal>
          </LandingSection>
        ) : null;

      case "comparison":
        return sections.comparison.enabled ? (
          <LandingSection key={id} id="landing-comparison">
            <PlReveal delay={delay}>
              <div className="text-center">
                <span className="pl-section-label">Why {product.name}</span>
                <h2 className="font-heading mt-4 text-3xl font-bold text-slate-900">
                  {sections.comparison.headline}
                </h2>
              </div>
              <div className="mt-10 grid gap-5 sm:grid-cols-3">
                {sections.comparison.items.map((item, i) => (
                  <div
                    key={item.title}
                    className="pl-hover-lift rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm"
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    <h3 className="font-heading font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </PlReveal>
          </LandingSection>
        ) : null;

      case "testimonials":
        return sections.testimonials.enabled && sections.testimonials.items.length > 0 ? (
          <LandingSection key={id} id="landing-testimonials" alt>
            <PlReveal delay={delay}>
              <div className="text-center">
                <span className="pl-section-label">Reviews</span>
                <h2 className="font-heading mt-4 text-3xl font-bold text-slate-900">What users say</h2>
              </div>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {sections.testimonials.items.map((t, i) => (
                  <blockquote
                    key={`${t.name}-${t.company}`}
                    className="pl-hover-lift rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                    style={{ transitionDelay: `${i * 70}ms` }}
                  >
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">&ldquo;{t.review}&rdquo;</p>
                    <footer className="mt-4 border-t border-slate-50 pt-4">
                      <p className="font-semibold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.designation}</p>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </PlReveal>
          </LandingSection>
        ) : null;

      case "faqs":
        return sections.faqs.enabled && sections.faqs.items.length > 0 ? (
          <LandingSection key={id} id="landing-faqs">
            <PlReveal delay={delay}>
              <div className="text-center">
                <span className="pl-section-label">FAQ</span>
                <h2 className="font-heading mt-4 text-3xl font-bold text-slate-900">Common questions</h2>
              </div>
              <div className="mx-auto mt-10 max-w-3xl space-y-2">
                {sections.faqs.items.map((faq) => (
                  <details
                    key={faq.question}
                    className="pl-faq-item group rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm"
                  >
                    <summary className="cursor-pointer list-none font-medium text-slate-900 marker:content-none transition-colors group-open:text-[var(--landing-primary)]">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </PlReveal>
          </LandingSection>
        ) : null;

      case "cta":
        return sections.cta.enabled ? (
          <LandingSection key={id} id="landing-cta" alt>
            <PlReveal delay={delay}>
              <div className="pl-cta-panel mx-auto max-w-5xl px-6 py-12 text-center text-white sm:px-10 sm:py-14">
                <h2 className="relative font-heading text-2xl font-bold sm:text-3xl">{sections.cta.headline}</h2>
                <p className="relative mx-auto mt-3 max-w-xl text-white/88">{sections.cta.subheadline}</p>
              </div>
              <div className="mx-auto -mt-6 grid max-w-5xl gap-6 px-4 lg:grid-cols-2">
                {sections.cta.showDemoForm && (
                  <div className="pl-glass pl-hover-lift rounded-2xl p-6 sm:p-7">
                    <h3 className="font-heading font-semibold text-slate-900">Request a demo</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Book a walkthrough of {product.name}
                    </p>
                    <BookingForm
                      productId={product.id}
                      companyId={product.companyId}
                      className="mt-4"
                      isLoggedIn={isLoggedIn}
                      defaultValues={userDefaults}
                    />
                  </div>
                )}
                {sections.cta.showContactForm && (
                  <div className="pl-glass pl-hover-lift overflow-hidden rounded-2xl">
                    <ContactVendorForm companyId={product.companyId} />
                  </div>
                )}
              </div>
            </PlReveal>
          </LandingSection>
        ) : null;

      case "footer":
        return sections.footer.enabled ? (
          <footer key={id} id="landing-footer" className="border-t border-slate-200 bg-slate-50/80 py-10">
            <div className="safe-container">
              <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                <div className="text-center sm:text-left">
                  <p className="font-heading font-semibold text-slate-900">{product.name}</p>
                  <p className="mt-1 text-xs text-slate-500">A product by {product.company.name}</p>
                </div>
                {sections.footer.showContact && (
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
                    <a
                      href={`mailto:${product.company.contactEmail}`}
                      className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--landing-primary)]"
                    >
                      <Mail className="h-4 w-4" />
                      {product.company.contactEmail}
                    </a>
                    {product.company.contactPhone && (
                      <a
                        href={`tel:${product.company.contactPhone}`}
                        className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--landing-primary)]"
                      >
                        <Phone className="h-4 w-4" />
                        {product.company.contactPhone}
                      </a>
                    )}
                  </div>
                )}
                <Link
                  href="/"
                  className="text-xs text-slate-400 transition-colors hover:text-[var(--landing-primary)]"
                >
                  Genius Mart
                </Link>
              </div>
              <p className="mt-6 text-center text-[11px] text-slate-400">
                © {new Date().getFullYear()} {product.company.name}
              </p>
            </div>
          </footer>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "product-landing min-h-screen overflow-x-hidden",
        theme.colorMode === "dark" && "bg-slate-900 text-white",
      )}
      style={themeVars(theme)}
    >
      <ProductLandingNav
        sections={enabledSections}
        productName={product.name}
        companyName={product.company.name}
      />
      {enabledSections
        .filter((id) => id !== "footer")
        .map((id, index) => renderSection(id, index))}
      <ProductCompanyStrip company={product.company} />
      {enabledSections.includes("footer") ? renderSection("footer", enabledSections.length) : null}
    </div>
  );
}
