"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    quote:
      "The requirement builder felt like talking to a consultant. We found our HRMS in minutes, not weeks.",
    name: "Priya Sharma",
    role: "HR Director",
    company: "Nova Retail Group",
    accent: "from-brand-blue/20 to-cyan-100/40",
    dot: "bg-brand-blue",
  },
  {
    quote:
      "Smart search understood 'CRM under 5000 with WhatsApp' instantly. No more endless spreadsheet comparisons.",
    name: "Arjun Mehta",
    role: "Founder",
    company: "ScaleForge SaaS",
    accent: "from-brand-green/20 to-emerald-100/40",
    dot: "bg-brand-green",
  },
  {
    quote:
      "Verified vendors and match scores gave our procurement team confidence before every demo call.",
    name: "Lisa Fernandes",
    role: "IT Manager",
    company: "Meridian Health",
    accent: "from-violet-200/50 to-fuchsia-100/30",
    dot: "bg-violet-500",
  },
  {
    quote:
      "Booking demos without sales friction — we compared three tools and scheduled calls the same afternoon.",
    name: "Rahul Kapoor",
    role: "Ops Lead",
    company: "FinEdge Logistics",
    accent: "from-amber-200/50 to-orange-100/40",
    dot: "bg-amber-500",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = TESTIMONIALS.length;

  const go = useCallback(
    (index: number) => {
      setActive((index + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActive((a) => (a + 1) % count);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [paused, count]);

  const current = TESTIMONIALS[active]!;

  return (
    <section
      id="testimonials"
      className="section-anchor safe-container py-14 sm:py-16 lg:py-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          <span className="text-gradient">Trusted by buyers</span>
        </h2>
        <p className="mt-3 text-sm text-slate-500">Teams using intelligent discovery on Genius Mart</p>
      </div>

      <div className="testimonial-slider mx-auto mt-10 max-w-4xl">
        <div
          className={cn(
            "testimonial-slider-card relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br p-8 shadow-xl sm:p-10",
            current.accent,
          )}
        >
          <Quote className="absolute right-6 top-6 h-16 w-16 text-white/40" aria-hidden />
          <div className="relative">
            <p className="font-heading text-xl font-medium leading-relaxed text-slate-800 sm:text-2xl">
              &ldquo;{current.quote}&rdquo;
            </p>
            <footer className="mt-8 flex flex-wrap items-center gap-4">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg",
                  current.dot,
                )}
              >
                {initials(current.name)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{current.name}</p>
                <p className="text-sm text-slate-600">
                  {current.role} · {current.company}
                </p>
              </div>
            </footer>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Previous testimonial"
            onClick={() => go(active - 1)}
            className="testimonial-slider-nav"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex gap-2">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.name}
                type="button"
                aria-label={`Show testimonial from ${t.name}`}
                aria-current={i === active}
                onClick={() => go(i)}
                className={cn("testimonial-slider-dot", i === active && "testimonial-slider-dot-active")}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Next testimonial"
            onClick={() => go(active + 1)}
            className="testimonial-slider-nav"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={`peek-${t.name}`}
              type="button"
              onClick={() => go(i)}
              className={cn(
                "testimonial-peek text-left transition-all",
                i === active && "testimonial-peek-active",
              )}
            >
              <p className="line-clamp-2 text-xs text-slate-600">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-2 text-xs font-semibold text-slate-800">{t.name}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
