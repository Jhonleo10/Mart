import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PublicPageHeroProps {
  badge?: string;
  title: string;
  description?: string;
}

export function PublicPageHero({ badge, title, description }: PublicPageHeroProps) {
  return (
    <section className="public-page-hero">
      <div className="public-page-hero-bg" aria-hidden />
      <div className="safe-container relative z-10 py-12 sm:py-14">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        {badge ? (
          <span className="inline-flex rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            {badge}
          </span>
        ) : null}
        <h1 className="font-heading mt-4 max-w-3xl text-3xl font-bold text-white sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
