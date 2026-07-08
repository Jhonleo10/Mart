import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { cn } from "@/lib/utils";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <ScrollReveal animation="fade-up" delay={0}>
      <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-brand-blue/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-blue">
        {children}
      </span>
    </ScrollReveal>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <ScrollReveal animation="fade-up" delay={80} className="mx-auto max-w-2xl text-center">
      <h2 className="font-heading break-safe text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
        {title.split(" ").length > 2 ? (
          <>
            {title.split(" ").slice(0, -2).join(" ")}{" "}
            <span className="text-gradient">{title.split(" ").slice(-2).join(" ")}</span>
          </>
        ) : (
          <span className="text-gradient">{title}</span>
        )}
      </h2>
      {subtitle && (
        <p className="mt-3 break-safe text-sm leading-relaxed text-slate-500 sm:text-base">{subtitle}</p>
      )}
    </ScrollReveal>
  );
}

export function LandingSection({
  id,
  alt,
  children,
  className,
}: {
  id: string;
  alt?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "section-anchor relative w-full",
        alt ? "landing-section-alt" : "landing-section-default",
      )}
    >
      <div className={cn("safe-container py-16 sm:py-20 lg:py-24", className)}>{children}</div>
    </section>
  );
}

export function Reveal({
  children,
  animation = "fade-up",
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom-in";
  delay?: number;
  className?: string;
}) {
  const scrollAnimation =
    animation === "zoom-in" || animation === "fade-down"
      ? "fade-up"
      : animation;

  return (
    <ScrollReveal animation={scrollAnimation} delay={delay} className={className}>
      {children}
    </ScrollReveal>
  );
}
