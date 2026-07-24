"use client";

import { useCallback } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function HomeContactSection() {
  const scrollToForm = useCallback(() => {
    const form = document.querySelector<HTMLDivElement>(".ref-cta-form-card");
    if (!form) return;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
    const firstInput = form.querySelector<HTMLInputElement>("input, textarea");
    firstInput?.focus({ preventScroll: true });
  }, []);

  return (
    <section id="contact" className="section-anchor safe-container py-14 sm:pb-16 lg:py-20">
      <div className="ref-cta-banner ref-cta-banner-animated">
        <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ScrollReveal animation="fade-right">
            <div className="min-w-0 text-center lg:text-left">
              <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90">
                Get in touch
              </span>
              <h2 className="font-heading mt-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                Ready to Transform Your Software Journey?
              </h2>
              <p className="mt-4 break-safe text-sm leading-relaxed text-white/90 sm:text-base">
                Send us a message — we reply within one business day. Buyers register free; sellers
                choose a plan during onboarding.
              </p>
              <ul className="mt-6 space-y-3 text-left">
                <li className="ref-cta-contact-row flex items-start gap-3 text-sm text-white/90">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
                  support@digitalgeniusmart.com
                </li>
                <li className="ref-cta-contact-row flex items-start gap-3 text-sm text-white/90">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
                  +91 98765 43210
                </li>
                <li className="ref-cta-contact-row flex items-start gap-3 text-sm text-white/90">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
                  Puducherry, India
                </li>
              </ul>
              <button
                type="button"
                onClick={scrollToForm}
                className="mt-5 inline-block text-sm font-semibold text-white underline-offset-4 hover:underline cursor-pointer"
              >
                Jump to contact form →
              </button>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-left" delay={120}>
            <div className="ref-cta-form-card">
              <h3 className="font-heading text-lg font-semibold text-slate-900">Quick message</h3>
              <p className="mt-1 text-sm text-slate-500">We&apos;ll email you a confirmation instantly.</p>
              <div className="mt-5">
                <ContactForm />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
