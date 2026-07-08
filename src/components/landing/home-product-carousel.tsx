"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Package,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  ShopProductCard,
  type ShopProductCardData,
} from "@/components/landing/shop-product-card";
import { cn } from "@/lib/utils";

type CategoryChip = { id: string; name: string; slug: string };

export function HomeProductCarousel({
  products,
  totalCount,
  categories = [],
}: {
  products: ShopProductCardData[];
  totalCount: number;
  categories?: CategoryChip[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < maxScroll - 8);
    setScrollProgress(maxScroll > 0 ? el.scrollLeft / maxScroll : 0);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, products.length]);

  function scrollByCard(direction: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(".shop-card")?.offsetWidth ?? 300;
    el.scrollBy({ left: direction * (cardWidth + 20), behavior: "smooth" });
  }

  const carouselProducts = products;

  return (
    <div className="shop-showcase">
      <div className="shop-showcase-bg" aria-hidden>
        <div className="shop-showcase-orb shop-showcase-orb-a" />
        <div className="shop-showcase-orb shop-showcase-orb-b" />
        <div className="shop-showcase-grid" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="shop-showcase-header">
          <div className="max-w-xl">
            <h2 className="shop-showcase-title">
              Shop <span className="shop-showcase-title-accent">software</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              {totalCount}+ verified listings from approved vendors — open any product to see features,
              pricing, and book a live demo after signing in.
            </p>
          </div>

          <div className="shop-showcase-actions">
            <div className="shop-stat-pills">
              <span className="shop-stat-pill">
                <Package className="h-3.5 w-3.5 text-brand-blue" />
                {totalCount} products
              </span>
              <span className="shop-stat-pill">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-green" />
                Admin verified
              </span>
            </div>
            <div className="shop-showcase-nav">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => scrollByCard(-1)}
                disabled={!canScrollLeft}
                className={cn("shop-nav-btn", !canScrollLeft && "shop-nav-btn-disabled")}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => scrollByCard(1)}
                disabled={!canScrollRight}
                className={cn("shop-nav-btn", !canScrollRight && "shop-nav-btn-disabled")}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link href="/products" className="shop-catalog-btn">
                Full catalog
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Product carousel */}
        <div className="mt-8 lg:mt-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Layers className="h-4 w-4 text-brand-blue" />
              Trending listings
            </p>
            <div className="shop-progress-track hidden max-w-[140px] flex-1 sm:block">
              <div
                className="shop-progress-fill"
                style={{ width: `${Math.max(8, scrollProgress * 100)}%` }}
              />
            </div>
          </div>

          <div className="shop-track-shell">
            <div ref={trackRef} className="shop-track" role="list">
              {carouselProducts.map((product, i) => (
                <div key={product.id} role="listitem">
                  <ShopProductCard product={product} index={i} />
                </div>
              ))}
            </div>
            <div className="shop-track-fade shop-track-fade-left" aria-hidden />
            <div className="shop-track-fade shop-track-fade-right" aria-hidden />
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="shop-category-rail mt-10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Filter in catalog
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/products" className="shop-category-chip shop-category-chip-active">
                All
              </Link>
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="shop-category-chip"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
