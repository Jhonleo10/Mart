"use client";

import { CheckCircle2, Search, Layers, Calendar, TrendingUp } from "lucide-react";
import { WORKFLOW_STEPS } from "@/lib/landing";
import { SectionTitle } from "@/components/landing/landing-primitives";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const STEP_ICONS = {
  search: Search,
  layers: Layers,
  calendar: Calendar,
  trending: TrendingUp,
} as const;

const BUYER_PERKS = [
  "Free registration & browsing",
  "Wishlist & compare tools",
  "One-click demo requests",
  "Track all your bookings",
];

const VENDOR_PERKS = [
  "Company verification & profile",
  "Product listing & lead inbox",
  "Analytics & payment tracking",
  "Priority marketplace placement",
];

export function HowItWorksSection() {
  return (
    <div>
      <SectionTitle
        title="How It Works"
        subtitle="A simple workflow for buyers and software vendors."
      />

      <div className="relative mt-14">
        <div
          className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-10 hidden h-0.5 bg-gradient-to-r from-brand-blue/20 via-brand-green/40 to-brand-blue/20 lg:block"
          aria-hidden
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {WORKFLOW_STEPS.map((item, i) => {
            const Icon = STEP_ICONS[item.icon] ?? Search;
            const accent = i % 2 === 0 ? "blue" : "green";
            return (
              <ScrollReveal key={item.step} delay={i * 90}>
                <article
                  className={`workflow-step-card group relative h-full rounded-2xl border bg-white/80 p-6 text-center backdrop-blur-sm ${
                    accent === "blue"
                      ? "border-brand-blue/15 hover:border-brand-blue/35"
                      : "border-brand-green/15 hover:border-brand-green/35"
                  }`}
                >
                  <div
                    className={`workflow-step-glow pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
                      accent === "blue" ? "workflow-glow-blue" : "workflow-glow-green"
                    }`}
                    aria-hidden
                  />

                  <div className="relative">
                    <span
                      className={`font-heading text-5xl font-extrabold ${
                        accent === "blue" ? "text-brand-blue/15" : "text-brand-green/15"
                      } transition-colors duration-300 group-hover:text-brand-blue/25`}
                    >
                      {item.step}
                    </span>

                    <div
                      className={`workflow-icon-wrap mx-auto -mt-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${
                        accent === "blue"
                          ? "bg-brand-blue/10 text-brand-blue"
                          : "bg-brand-green/10 text-brand-green"
                      }`}
                    >
                      <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    <h3 className="mt-5 font-heading text-base font-semibold text-slate-900 sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>

                    <div
                      className={`mx-auto mt-4 h-1 w-0 rounded-full transition-all duration-500 group-hover:w-12 ${
                        accent === "blue" ? "bg-brand-blue" : "bg-brand-green"
                      }`}
                    />
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <ScrollReveal animation="fade-right">
          <div className="workflow-audience-card group h-full rounded-2xl border border-brand-blue/15 bg-gradient-to-br from-white to-brand-blue/5 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-slate-900">For Buyers</h3>
            </div>
            <ul className="mt-6 space-y-3">
              {BUYER_PERKS.map((text) => (
                <li
                  key={text}
                  className="workflow-perk-row flex items-start gap-2.5 rounded-xl px-2 py-1.5 text-sm text-slate-600"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-left" delay={100}>
          <div className="workflow-audience-card group h-full rounded-2xl bg-gradient-brand p-6 text-white shadow-lg shadow-brand-blue/15 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-semibold">For Vendors</h3>
            </div>
            <ul className="mt-6 space-y-3">
              {VENDOR_PERKS.map((text) => (
                <li
                  key={text}
                  className="workflow-perk-row flex items-start gap-2.5 rounded-xl px-2 py-1.5 text-sm text-white/90"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
