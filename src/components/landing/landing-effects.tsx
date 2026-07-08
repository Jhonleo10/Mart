"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Decorative floating shapes for the hero section background */
export function HeroFloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Large blurred orbs */}
      <div className="absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full bg-white/8 blur-3xl" />
      <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-brand-green/10 blur-2xl" />

      {/* Small decorative geometric shapes */}
      <div className="absolute right-[15%] top-[10%] h-16 w-16 rotate-12 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm" />
      <div className="absolute bottom-[20%] left-[8%] h-12 w-12 -rotate-6 rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm" />
      <div className="absolute bottom-[35%] right-[6%] h-10 w-10 rotate-45 rounded-lg border border-white/20 bg-white/8" />
      <div className="absolute left-[20%] top-[20%] h-8 w-8 rounded-full border border-white/20 bg-white/10" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    setVisible(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn("landing-reveal", visible && "landing-reveal-visible", className)}
    >
      {children}
    </div>
  );
}
