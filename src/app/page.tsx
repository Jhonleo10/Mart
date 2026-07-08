import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/landing/hero-section";
import { HomeProductCatalog } from "@/components/landing/home-product-catalog";
import { PricingSection } from "@/components/landing/pricing-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { HomeContactSection } from "@/components/landing/home-contact-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { TrustedCompaniesSection } from "@/components/landing/trusted-companies-section";
import { getHomePageData } from "@/services/home-page.service";
import { ABOUT_FEATURES } from "@/lib/landing";
import { AUTH_PATHS } from "@/lib/auth-paths";
import { buildPageMetadata, webSiteJsonLd } from "@/lib/seo";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { ScrollReveal } from "@/components/landing/landing-effects";
import { Shield, Calendar, Users, Search, Sparkles } from "lucide-react";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Enterprise Software Marketplace",
    description:
      "Browse verified B2B software, compare vendors, and book live demos — CRM, ERP, HRMS, and more from admin-approved companies.",
    path: "/",
  });
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="font-heading break-safe text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
        <span className="text-gradient">{title}</span>
      </h2>
      {subtitle && (
        <p className="mt-3 break-safe text-sm leading-relaxed text-slate-500 sm:text-base">{subtitle}</p>
      )}
    </div>
  );
}

const BENEFITS = [
  {
    icon: Sparkles,
    title: "Verified listings",
    text: "Every vendor is admin-approved before products go live on the marketplace.",
  },
  {
    icon: Search,
    title: "Browse freely",
    text: "Explore product pages, features, and pricing without creating an account.",
  },
  {
    icon: Shield,
    title: "Book live demos",
    text: "Sign in as a buyer to pick a time slot and request a demo directly from the vendor.",
  },
] as const;

export default async function HomePage() {
  const { companyCount, userCount, productCount, categoryCount, pricingPlans, companies, bubbleProducts } =
    await getHomePageData();
  const webSiteSchema = await webSiteJsonLd();

  return (
    <div className="">
      <JsonLdScript data={webSiteSchema} />
      <HeroSection
        companyCount={companyCount}
        userCount={userCount}
        productCount={productCount}
        categoryCount={categoryCount}
        bubbleProducts={bubbleProducts}
      />

      <ScrollReveal>
        <HomeProductCatalog />
      </ScrollReveal>

      <section id="about" className="section-anchor safe-container py-14 sm:py-16 lg:py-20">
        <ScrollReveal>
          <div className="ref-section-shell ref-section-shell-hero">
            <div className="ref-section-grid">
              <div className="min-w-0">
                <div className="ref-section-kicker">Marketplace advantage</div>
                <h2 className="font-heading break-safe text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  Your Gateway to <span className="text-gradient">Enterprise Software</span>
                </h2>
                <p className="mt-4 max-w-2xl break-safe text-sm leading-7 text-slate-600 sm:text-base">
                  A trusted B2B marketplace where buyers discover verified vendors, compare solutions, and schedule
                  product demos in one place.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="ref-tag-chip">Verified vendors</span>
                  <span className="ref-tag-chip">Guided discovery</span>
                  <span className="ref-tag-chip">Live demo booking</span>
                </div>
              </div>
              <div className="ref-section-editorial">
                <div className="ref-section-editorial-card">
                  <p className="ref-section-editorial-label">Designed for serious evaluation</p>
                  <h3 className="mt-3 font-heading text-2xl font-bold text-slate-900">
                    Explore premium software with clarity, not clutter.
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Browse business-ready products, compare trusted vendors, and move from research to demo booking in
                    a single refined workflow.
                  </p>
                </div>
                <div className="ref-section-editorial-note">
                  <span className="ref-section-editorial-line" />
                  <p className="text-sm leading-6 text-slate-500">
                    Built to feel more like a curated software gallery than a noisy listing board.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {ABOUT_FEATURES.map((feature, i) => (
                <ScrollReveal key={feature.title} delay={i * 80}>
                  <div className="ref-feature-card ref-feature-card-rich group h-full">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${
                        i % 2 === 0 ? "bg-brand-blue/10 text-brand-blue" : "bg-brand-green/10 text-brand-green"
                      }`}
                    >
                      {i === 0 && <Shield className="h-5 w-5" />}
                      {i === 1 && <Search className="h-5 w-5" />}
                      {i === 2 && <Calendar className="h-5 w-5" />}
                      {i === 3 && <Users className="h-5 w-5" />}
                    </div>
                    <h3 className="mt-4 font-heading text-base font-semibold text-slate-900 sm:text-lg">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.description}</p>
                    <div className="mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-brand-blue/40 to-brand-green/40" />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section id="benefits" className="section-anchor landing-section-alt safe-container py-14 sm:py-16">
        <ScrollReveal>
          <div className="ref-section-shell ref-section-shell-alt ref-benefits-shell">
            <div className="ref-section-grid ref-section-grid-tight">
              <div className="min-w-0">
                <div className="ref-section-kicker">Why teams choose us</div>
                <h2 className="font-heading break-safe text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  Why <span className="text-gradient">Genius Mart</span>
                </h2>
                <p className="mt-4 max-w-2xl break-safe text-sm leading-7 text-slate-600 sm:text-base">
                  Everything you need to evaluate and purchase business software with confidence.
                </p>
              </div>
              <div className="ref-benefits-aside">
                <p className="text-sm leading-6 text-slate-600">
                  From verified listings to direct demo scheduling, every step is designed to reduce noise and help
                  serious buyers move faster.
                </p>
              </div>
            </div>
            <div className="mt-10 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <div className="ref-benefit-story">
                <div className="ref-benefit-story-glow" />
                <div className="relative z-[1]">
                  <div className="ref-benefit-featured-badge">Built for confident buying</div>
                  <h3 className="mt-4 font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-[2rem]">
                    A curated software journey that feels premium from discovery to demo.
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                    Genius Mart blends trusted vendor quality, elegant discovery, and direct buyer-to-vendor action
                    into one modern experience shaped around clarity, trust, and speed.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      "Verified vendor quality",
                      "Clarity-first product discovery",
                      "Native demo booking flow",
                    ].map((point) => (
                      <div key={point} className="ref-benefit-story-point">
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                {BENEFITS.map(({ icon: Icon, title, text }, index) => (
                  <ScrollReveal key={title} delay={index * 100}>
                    <div className="ref-feature-card ref-benefit-card ref-benefit-card-creative h-full p-6">
                      <div className="ref-benefit-card-orb" />
                      <div className="ref-benefit-icon">
                        <Icon className="h-7 w-7 text-brand-blue" />
                      </div>
                      <div className="relative z-[1]">
                        <h3 className="mt-5 font-heading text-lg font-semibold text-slate-900">{title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
                        <div className="mt-4 h-1 w-12 rounded-full bg-gradient-to-r from-brand-blue/50 to-brand-green/50" />
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <ScrollReveal>
        <TrustedCompaniesSection companies={companies} />
      </ScrollReveal>
      <ScrollReveal>
        <TestimonialsSection />
      </ScrollReveal>

      <section id="how-it-works" className="section-anchor safe-container py-14 sm:py-16 lg:py-20">
        <ScrollReveal>
          <HowItWorksSection />
        </ScrollReveal>
      </section>

      <ScrollReveal>
        <PricingSection plans={pricingPlans} />
      </ScrollReveal>

      <section className="safe-container pb-16 pt-4">
        <ScrollReveal>
        <div className="ref-cta-banner ref-cta-banner-animated rounded-2xl px-6 py-10 text-center sm:px-10">
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            Ready to find your perfect software?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/90">
            Browse the catalog for free — create a buyer account to book demos, save wishlists, and track
            vendor responses from your dashboard.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/products">
              <Button size="lg" className="ref-hero-btn-primary gap-2">
                Browse products
              </Button>
            </Link>
            <Link href={AUTH_PATHS.userRegister}>
              <Button size="lg" className="ref-hero-btn-primary gap-2">
                Get started free
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                Book a demo
              </Button>
            </Link>
          </div>
        </div>
        </ScrollReveal>
      </section>

      <ScrollReveal>
        <HomeContactSection />
      </ScrollReveal>
    </div>
  );
}
