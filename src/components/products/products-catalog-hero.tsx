import Link from "next/link";
import { Package, ShieldCheck, Sparkles } from "lucide-react";

interface ProductsCatalogHeroProps {
  total: number;
  categories: { id: string; name: string; slug: string }[];
  activeCategory?: string;
}

export function ProductsCatalogHero({
  total,
  categories,
  activeCategory,
}: ProductsCatalogHeroProps) {
  return (
    <section className="catalog-hero">
      <div className="catalog-hero-bg" aria-hidden />
      <div className="catalog-hero-grid" aria-hidden />
      <div className="catalog-hero-orb catalog-hero-orb--a" aria-hidden />
      <div className="catalog-hero-orb catalog-hero-orb--b" aria-hidden />

      <div className="safe-container relative z-10 py-10 sm:py-14">
        <div className="catalog-hero-meta">
          <span className="catalog-hero-badge">
            <Sparkles className="h-3.5 w-3.5" />
            Full catalog
          </span>
          <span className="catalog-hero-stat">
            <Package className="h-3.5 w-3.5" />
            {total} products
          </span>
          <span className="catalog-hero-stat">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin verified
          </span>
        </div>

        <div className="catalog-hero-copy">
          <h1 className="catalog-hero-title">
            Shop <span className="catalog-hero-accent">software</span>
          </h1>
          <p className="catalog-hero-subtitle">
            Every published listing from approved vendors — browse freely, compare solutions, and
            book live demos when you are ready.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="catalog-hero-chips">
            <span className="catalog-hero-chips-label">Quick browse</span>
            <div className="catalog-hero-chips-row">
              <Link
                href="/products"
                className={`catalog-hero-chip ${!activeCategory ? "catalog-hero-chip--active" : ""}`}
              >
                All
              </Link>
              {categories.slice(0, 7).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={`catalog-hero-chip ${
                    activeCategory === cat.slug ? "catalog-hero-chip--active" : ""
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
