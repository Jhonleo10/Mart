"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Crown,
  Sparkles,
  Star,
} from "lucide-react";
import { ShopHeroProductCard, type ShopProductCardData } from "@/components/landing/shop-product-card";
import { calculateAverageRating, cn } from "@/lib/utils";
import { formatProductPriceLabel } from "@/lib/product-price";
import { getProductBookDemoPath } from "@/lib/product-public-url";

const AUTO_MS = 6000;

function SpotlightSlide({ product }: { product: ShopProductCardData }) {
  const rating = product.reviews
    ? calculateAverageRating(product.reviews.map((r) => r.rating))
    : 0;
  const priceLabel = formatProductPriceLabel(product.price);
  const href = getProductBookDemoPath(product.slug);
  const imageUrl = product.images[0]?.url;

  return (
    <Link href={href} className="spotlight-slide group block h-full">
      <div className="spotlight-slide-inner">
        <div className="spotlight-slide-visual relative min-h-[240px] overflow-hidden sm:min-h-[300px] lg:min-h-0 lg:w-[54%]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 52vw"
              priority
            />
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center bg-gradient-to-br from-amber-100 via-white to-brand-blue/10">
              <span className="font-heading text-7xl font-black text-amber-500/25">
                {product.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/85 via-slate-900/25 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="spotlight-pill spotlight-pill-pro">
              <Crown className="h-3 w-3" />
              Spotlight
            </span>
            <span className="spotlight-pill">{product.category.name}</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center p-6 sm:p-8 lg:p-10">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-700">
            <Building2 className="h-3.5 w-3.5" />
            {product.company.name}
          </p>
          <h3 className="font-heading mt-2 text-2xl font-bold text-slate-900 transition-colors group-hover:text-brand-blue sm:text-3xl lg:text-4xl">
            {product.name}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            {product.shortDescription}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {priceLabel ? (
              <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-bold text-white">
                {priceLabel}
              </span>
            ) : null}
            {rating > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-800 ring-1 ring-amber-100">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {rating.toFixed(1)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function SpotlightCarousel({
  products,
  compact = false,
}: {
  products: ShopProductCardData[];
  compact?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = products.length;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  if (count === 0) return null;

  const product = products[index]!;

  if (compact) {
    return (
      <div
        className="spotlight-carousel spotlight-carousel-compact"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Sparkles className="h-4 w-4 text-amber-500" />
             Spotlight
          </p>
          {count > 1 ? (
            <div className="flex items-center gap-2">
              <button type="button" className="spotlight-nav-btn" onClick={() => goTo(index - 1)} aria-label="Previous">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button type="button" className="spotlight-nav-btn" onClick={() => goTo(index + 1)} aria-label="Next">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
        <ShopHeroProductCard product={product} />
      </div>
    );
  }

  return (
    <section
      className="spotlight-carousel safe-container py-10 sm:py-14"
      aria-label="Pro spotlight products"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="spotlight-carousel-shell">
        <div className="spotlight-carousel-bg" aria-hidden>
          <div className="spotlight-carousel-orb spotlight-carousel-orb-a" />
          <div className="spotlight-carousel-orb spotlight-carousel-orb-b" />
        </div>

        <div className="relative">
          <div className="spotlight-carousel-header">
            <div>
              <span className="spotlight-carousel-eyebrow">
                <Crown className="h-3.5 w-3.5" />
                Spotlighted Products
              </span>
              <h2 className="spotlight-carousel-title">
                Featured Products{" "}
                
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
                Curated listings from Pro plan vendors — rotated in the spotlight carousel on the homepage.
              </p>
            </div>

            {count > 1 ? (
              <div className="spotlight-carousel-controls">
                <button
                  type="button"
                  className="spotlight-nav-btn"
                  onClick={() => goTo(index - 1)}
                  aria-label="Previous spotlight"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="spotlight-nav-btn"
                  onClick={() => goTo(index + 1)}
                  aria-label="Next spotlight"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>

          <div className="spotlight-carousel-stage mt-8">
            <div
              className="spotlight-carousel-track"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {products.map((item) => (
                <div key={item.id} className="spotlight-carousel-slide">
                  <SpotlightSlide product={item} />
                </div>
              ))}
            </div>
          </div>

          {count > 1 ? (
            <div className="mt-5 flex items-center justify-center gap-2">
              {products.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Show ${item.name}`}
                  onClick={() => goTo(i)}
                  className={cn("spotlight-dot", i === index && "spotlight-dot-active")}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
