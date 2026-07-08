"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HeroProductBubbles, type HeroBubbleProduct } from "@/components/landing/hero-product-bubbles";
import { AUTH_PATHS } from "@/lib/auth-paths";
import {
  Users,
  Package,
  LayoutGrid,
  Building2,
  ArrowRight,
  UserPlus,
} from "lucide-react";

interface HeroSectionProps {
  companyCount: number;
  userCount: number;
  productCount: number;
  categoryCount: number;
  bubbleProducts: HeroBubbleProduct[];
}

function formatStat(value: number, fallback: string) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M+`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k+`;
  if (value > 0) return `${value}+`;
  return fallback;
}

export function HeroSection({
  companyCount,
  userCount,
  productCount,
  categoryCount,
  bubbleProducts,
}: HeroSectionProps) {
  const stats = [
    { icon: Package, value: formatStat(productCount, "20+"), label: "Products" },
    { icon: LayoutGrid, value: formatStat(categoryCount, "8+"), label: "Categories" },
    { icon: Users, value: formatStat(userCount, "500+"), label: "Buyers" },
    { icon: Building2, value: formatStat(companyCount, "50+"), label: "Vendors" },
  ];

  return (
    <section
      id="hero"
      className="ref-hero ref-hero-viewport ref-hero-clean section-anchor relative isolate overflow-hidden"
    >
      <div className="ref-hero-gradient" aria-hidden />
      <div className="ref-hero-mesh" aria-hidden />
      <div className="ref-hero-rings" aria-hidden>
        <span className="ref-hero-ring ref-hero-ring-1" />
        <span className="ref-hero-ring ref-hero-ring-2" />
      </div>

      <div className="hero-clean-inner safe-container relative z-10">
        <div className="hero-clean-grid">
          <ScrollReveal animation="fade-up" className="hero-clean-copy">

            <h1 className="hero-clean-title font-heading mt-5 font-extrabold tracking-tight text-white">
              Discover &amp; book demos for{" "}
              <span className="text-gradient-hero">enterprise software</span>
            </h1>

            <p className="hero-clean-lead mt-4 max-w-lg text-sm leading-relaxed text-white/90 sm:text-base">
              Browse verified CRM, ERP &amp; HRMS from admin-approved vendors. Explore freely —
              sign in only when you&apos;re ready to schedule a live demo.
            </p>

            <div className="hero-clean-cta mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/products" className="w-full sm:w-auto">
                <Button size="lg" className="ref-hero-btn-primary w-full gap-2 sm:w-auto">
                  Shop software
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={AUTH_PATHS.userRegister} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="hero-clean-btn-outline w-full gap-2 sm:w-auto"
                >
                  <UserPlus className="h-4 w-4" />
                  Become a Buyer
                </Button>
              </Link>
            </div>

            <div className="hero-clean-stats" role="list">
              {stats.map(({ icon: Icon, label, value }, i) => (
                <div
                  key={label}
                  className="hero-stat-tile"
                  role="listitem"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  <div
                    className={
                      i % 2 === 0 ? "hero-stat-icon-wrap hero-stat-icon-wrap-blue" : "hero-stat-icon-wrap hero-stat-icon-wrap-green"
                    }
                  >
                    <Icon className="hero-stat-icon" aria-hidden strokeWidth={2.25} />
                  </div>
                  <div className="hero-stat-content">
                    <span className="hero-stat-value">{value}</span>
                    <span className="hero-stat-label">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-left" delay={120} className="hero-clean-visual">
            <div className="hero-showcase-panel">
              <div className="hero-showcase-panel-head">
                <span className="hero-showcase-badge">Trending now</span>
                <p className="hero-showcase-caption">Top rated &amp; booked products</p>
              </div>
              <HeroProductBubbles products={bubbleProducts} />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
