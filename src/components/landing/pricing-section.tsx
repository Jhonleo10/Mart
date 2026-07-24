"use client";

import { Check } from "lucide-react";
import type { PricingPlan } from "@/lib/settings/defaults";
import { PlanCheckoutButton } from "@/components/landing/plan-checkout-button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { cn } from "@/lib/utils";

export function PricingSection({ plans }: { plans: PricingPlan[] }) {
  const activePlans = plans.filter((plan) => plan.active !== false);

  if (activePlans.length === 0) return null;

  return (
    <section id="pricing" className="section-anchor safe-container py-14 sm:py-16 lg:py-20">
      <ScrollReveal animation="fade-up">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading mt-4 text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
            Simple, <span className="text-gradient">Transparent Plans</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
            Three vendor plans — Basic, Growth, and Pro — synced across registration, upgrades, and
            billing.
          </p>
        </div>
      </ScrollReveal>

      <div className="mt-10 grid gap-5 lg:grid-cols-3 lg:gap-6">
        {activePlans.map((plan, index) => (
          <ScrollReveal key={plan.id} delay={index * 100}>
            <article
              className={cn(
                "ref-pricing-card group relative flex h-full flex-col overflow-hidden transition-all duration-200",
                plan.highlighted && "ref-pricing-card-highlighted",
                plan.accent === "green" && "ref-pricing-card-green",
              )}
            >
              <div className="ref-pricing-card-shine pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {plan.audience}
                  </p>
                  <h3 className="font-heading mt-1 text-xl font-bold text-slate-900">{plan.name}</h3>
                </div>
                {plan.highlighted ? (
                  <span className="shrink-0 rounded-full bg-brand-green/15 px-2.5 py-1 text-[10px] font-bold uppercase text-brand-green">
                    Popular
                  </span>
                ) : null}
              </div>

              <div className="relative mt-4">
                <span className="font-heading text-3xl font-extrabold text-slate-900">{plan.price}</span>
                <span className="ml-1 text-sm text-slate-500">/ {plan.period}</span>
              </div>

              <p className="relative mt-3 text-sm leading-relaxed text-slate-500">{plan.description}</p>

              <ul className="relative mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110",
                        plan.accent === "green" ? "text-brand-green" : "text-brand-blue",
                      )}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="relative mt-6">
                <PlanCheckoutButton plan={plan} />
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
