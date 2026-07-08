import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Search, Calendar, Users, ArrowRight } from "lucide-react";
import { PublicPageHero } from "@/components/layout/public-page-hero";
import { ABOUT_FEATURES } from "@/lib/landing";
import { AUTH_PATHS } from "@/lib/auth-paths";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "About Us",
    description:
      "Learn about Genius Mart — India's trusted B2B software marketplace connecting businesses with verified SaaS vendors.",
    path: "/about",
  });
}

const ICONS = [Shield, Search, Calendar, Users];

export default function AboutPage() {
  return (
    <div className="overflow-x-hidden">
      <PublicPageHero
        badge="Our Story"
        title="About Genius Mart"
        description="A premier software marketplace built to simplify discovery, evaluation, and connections between innovative vendors and growing businesses."
      />

      <section className="safe-container -mt-6 pb-14 sm:pb-16 lg:pb-20">
        <div className="ref-public-card max-w-4xl">
          <div className="space-y-4 text-slate-600">
            <p className="text-base leading-relaxed">
              Genius Mart connects businesses with verified software companies. We help
              organizations discover, evaluate, and book demos for the best SaaS solutions — with
              transparency, trust, and a seamless workflow.
            </p>
            <p className="text-base leading-relaxed">
              Our platform features rigorous vendor verification, product review processes, and a
              lead generation system that benefits both software vendors and buyers across India and
              beyond.
            </p>
          </div>

          <h2 className="font-heading mt-10 text-2xl font-bold text-slate-900">Our Mission</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            To simplify software discovery and create meaningful connections between innovative
            software companies and the businesses that need their solutions.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ABOUT_FEATURES.map((feature, i) => {
            const Icon = ICONS[i] ?? Shield;
            return (
              <div key={feature.title} className="ref-feature-card group">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${
                    i % 2 === 0 ? "bg-brand-blue/10 text-brand-blue" : "bg-brand-green/10 text-brand-green"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="ref-cta-banner mt-12 p-8 sm:p-10">
          <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
            <div>
              <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
                Ready to get started?
              </h2>
              <p className="mt-2 text-sm text-white/85">
                Join as a buyer for free or register as a verified seller.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href={AUTH_PATHS.userRegister}>
                <Button className="w-full bg-white text-brand-blue hover:bg-white/90 sm:w-auto">
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={AUTH_PATHS.companyRegister}>
                <Button variant="green" className="w-full sm:w-auto">
                  Become a Seller
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
