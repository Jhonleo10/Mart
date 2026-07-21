"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CompanyCard {
  name: string;
  slug: string;
  logo: string | null;
  industry: string | null;
}

export function TrustedCompaniesSection({
  companies,
}: {
  companies: CompanyCard[];
}) {
  if (companies.length === 0) return null;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const maxSlideRef = useRef(0);

  useEffect(() => {
    function updateCount() {
      const w = window.innerWidth;
      const next = w < 640 ? 1 : w < 1024 ? 3 : 5;
      setVisibleCount(next);
    }
    updateCount();
    window.addEventListener("resize", updateCount);
    return () => window.removeEventListener("resize", updateCount);
  }, []);

  const maxSlide = Math.max(0, companies.length - visibleCount);

  useEffect(() => {
    maxSlideRef.current = maxSlide;
    setCurrentSlide((prev) => (prev > maxSlide ? Math.max(0, maxSlide) : prev));
  }, [maxSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlideRef.current));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    if (isPaused || maxSlide <= 0) return;
    intervalRef.current = setInterval(() => {
      const ms = maxSlideRef.current;
      if (ms <= 0) return;
      setCurrentSlide((prev) => (prev >= ms ? 0 : prev + 1));
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, maxSlide]);

  const shapes = [
    "rounded-[2rem] sm:rounded-[2.5rem]",
    "rounded-[1.75rem] rounded-tr-[0.75rem] sm:rounded-[2.25rem] sm:rounded-tr-[1rem]",
    "rounded-[1.75rem] rounded-bl-[0.75rem] sm:rounded-[2.25rem] sm:rounded-bl-[1rem]",
    "rounded-[1.5rem] sm:rounded-[2rem]",
  ];
  const accents = [
    "from-brand-blue/15 via-white to-brand-green/10",
    "from-violet-100 via-white to-brand-blue/10",
    "from-emerald-100 via-white to-brand-green/10",
    "from-sky-100 via-white to-slate-100",
  ];

  return (
    <section
      id="companies"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#f6fbf8_48%,#f8fafc_100%)] py-16 sm:py-24 lg:py-28"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-full -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-blue/5 via-brand-green/5 to-brand-blue/5 blur-[120px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_70%)]" />

      <div className="mb-12 flex flex-col items-center px-4 text-center sm:mb-14">
        <div className="inline-flex max-w-full cursor-default items-center gap-3 rounded-full border border-slate-200/80 bg-white/85 px-4 py-2.5 text-center shadow-[0_4px_24px_rgba(37,99,235,0.06)] backdrop-blur-md transition-all duration-500 hover:scale-105 sm:px-6">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-blue opacity-80"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-blue"></span>
          </span>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-600 sm:text-[11px]">
            Trusted software vendors on our platform
          </p>
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-blue opacity-80"
              style={{ animationDelay: "600ms" }}
            ></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-blue"></span>
          </span>
        </div>
        <h2 className="mt-5 max-w-4xl font-heading text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Discover the <span className="text-gradient"> SaaS brands</span> trusted by serious buyers
        </h2>
        <div className="mt-4 max-w-2xl">
          <p className="text-sm leading-6 text-slate-500 sm:text-base">
            A curated ribbon of verified vendors, premium product makers, and standout software companies presented
            with a more elevated visual system.
          </p>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * (100 / visibleCount)}%)` }}
          >
            {companies.map((c, i) => (
              <Link
                key={c.slug}
                href={`/companies/${c.slug}`}
                className="group shrink-0 px-2 sm:px-3 lg:px-4"
                style={{ minWidth: `${100 / visibleCount}%`, width: `${100 / visibleCount}%` }}
              >
                <div className="flex flex-col items-center justify-start py-2">
                  <div
                    className={cn(
                      "relative h-[7.25rem] w-full overflow-hidden border border-slate-200/70 bg-gradient-to-br shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-500 group-hover:border-brand-blue/30 group-hover:shadow-[0_20px_50px_-12px_rgba(0,118,223,0.2)] sm:h-[8.5rem] lg:h-[9rem]",
                      accents[i % accents.length],
                      shapes[i % shapes.length],
                    )}
                  >
                    <div className="pointer-events-none absolute inset-[1px] rounded-[inherit] bg-white/96 transition-opacity duration-500 group-hover:opacity-0" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,118,223,0.08),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(0,195,103,0.08),transparent_36%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
                    {c.logo ? (
                      <div className="relative z-[1] h-full w-full">
                        <Image
                          src={c.logo}
                          alt={c.name}
                          fill
                          sizes="(max-width: 640px) 168px, (max-width: 1024px) 216px, 248px"
                          className="object-contain p-3 transition-all duration-500 group-hover:scale-110 group-hover:object-cover group-hover:p-0 sm:p-4"
                        />
                      </div>
                    ) : (
                      <div className="relative z-[1] flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 transition-colors duration-500 group-hover:from-brand-blue/10 group-hover:to-brand-green/10">
                        <span className="px-4 text-center font-heading text-lg font-black text-slate-400 drop-shadow-sm transition-colors duration-500 group-hover:text-brand-blue group-hover:drop-shadow-md sm:text-2xl">
                          {c.name}
                        </span>
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[2] transition-all duration-500 group-hover:bottom-2 group-hover:scale-105">
                      <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/80 bg-white/88 px-3 py-1.5 shadow-lg shadow-slate-200/60 backdrop-blur-md">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                        <span className="truncate text-[11px] font-bold tracking-wide text-slate-700">
                          {c.industry ?? c.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 w-full text-center">
                    <p className="truncate font-heading text-sm font-bold text-slate-900 transition-colors duration-300 group-hover:text-brand-blue sm:text-[15px]">
                      {c.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {maxSlide > 0 ? (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlide(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === currentSlide
                      ? "w-6 bg-brand-blue"
                      : "w-2 bg-slate-300 hover:bg-slate-400",
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={nextSlide}
              disabled={currentSlide >= maxSlide}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
