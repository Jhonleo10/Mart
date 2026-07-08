"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProductPublicPath } from "@/lib/product-public-url";
import { CATEGORY_TAGS } from "@/lib/landing";

export interface HeroFloatingProduct {
  id: string;
  name: string;
  slug: string;
  avgRating: number;
  reviewCount: number;
  imageUrl: string | null;
  companyName: string;
  isFeature?: boolean;
}

const BUBBLE_SLOTS = [
  { x: 50, y: -5, delay: 0, duration: 6.5, drift: 0 },
  { x: 95, y: 25, delay: 0.6, duration: 7.8, drift: 1 },
  { x: 85, y: 85, delay: 1.4, duration: 7.2, drift: 2 },
  { x: 15, y: 85, delay: 0.2, duration: 8.5, drift: 3 },
  { x: 5, y: 25, delay: 1.8, duration: 9, drift: 4 },
] as const;

const FALLBACK_RATINGS = [4.9, 4.8, 4.7, 4.9, 4.6];

function buildFallbackItems(): HeroFloatingProduct[] {
  return CATEGORY_TAGS.slice(0, 5).map((name, index) => ({
    id: `feature-${index}`,
    name,
    slug: "",
    avgRating: FALLBACK_RATINGS[index] ?? 4.8,
    reviewCount: 0,
    imageUrl: null,
    companyName: "Featured",
    isFeature: true,
  }));
}

export function HeroFloatingProducts({ products }: { products: HeroFloatingProduct[] }) {
  const items = products.length > 0 ? products.slice(0, 5) : buildFallbackItems();

  return (
    <div className="pointer-events-none absolute inset-0 z-[15]" aria-label="Featured software">
      {items.map((product, index) => {
        const slot = BUBBLE_SLOTS[index % BUBBLE_SLOTS.length];
        const isFeature = product.isFeature || !product.slug;
        const inner = (
          <>
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 shrink-0 rounded-md object-cover ring-1 ring-white/30"
                unoptimized
              />
            ) : (
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-green" />
            )}
            <span className="truncate">{product.name}</span>
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-white/20 bg-white/10 px-1.5 py-px text-[10px] font-bold text-amber-100">
              <Star className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
              {product.avgRating}
            </span>
            {isFeature ? <Zap className="h-3 w-3 shrink-0 text-brand-green/90" /> : null}
          </>
        );

        return (
          <div
            key={product.id}
            className={cn(
              "hero-badge-float pointer-events-auto absolute max-w-[12rem]",
              `hero-badge-drift-${slot.drift}`,
            )}
            style={{
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              animationDuration: `${slot.duration}s`,
              animationDelay: `${slot.delay}s`,
              zIndex: 14 + index,
            }}
          >
            {isFeature ? (
              <div
                className="ref-hero-badge hero-badge-inner block w-full shadow-lg shadow-black/15"
                title={product.name}
              >
                {inner}
              </div>
            ) : (
              <Link
                href={getProductPublicPath(product.slug)}
                className="ref-hero-badge hero-badge-inner block w-full shadow-lg shadow-black/15"
                title={`${product.name} · ${product.avgRating}★ · ${product.companyName}`}
              >
                {inner}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
