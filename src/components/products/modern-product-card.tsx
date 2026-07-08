"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Shield } from "lucide-react";
import { cn, calculateAverageRating } from "@/lib/utils";
import { formatProductPriceLabel } from "@/lib/product-price";
import { getProductBookDemoPath } from "@/lib/product-public-url";
import { CompareButton } from "@/components/compare/compare-button";
import { WishlistButton } from "@/components/products/wishlist-button";

export interface ModernProductCardData {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  pricingModel: string;
  price: number | null;
  company: { name: string; slug: string; logo: string | null; status?: string };
  category: { name: string };
  images: { url: string }[];
  reviews?: { rating: number }[];
  matchScore?: number;
  matchLabel?: string;
  featureTags?: string[];
}

export function ModernProductCard({
  product,
  className,
}: {
  product: ModernProductCardData;
  className?: string;
}) {
  const productHref = getProductBookDemoPath(product.slug);
  const rating = product.reviews
    ? calculateAverageRating(product.reviews.map((r) => r.rating))
    : 0;
  const imageUrl = product.images[0]?.url;
  const tags = product.featureTags ?? [];
  const priceLabel = formatProductPriceLabel(product.price);

  return (
    <article
      className={cn(
        "discovery-card group relative flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:border-brand-blue/25 hover:shadow-lg hover:shadow-brand-blue/8",
        className,
      )}
    >
      <Link
        href={productHref}
        className="absolute inset-0 z-[1] rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2"
        aria-label={`View ${product.name}`}
      />

      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-50 to-brand-blue/5">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-heading text-3xl font-bold text-brand-blue/25">
              {product.name.charAt(0)}
            </span>
          </div>
        )}

        {(product.matchLabel || (product.matchScore != null && product.matchScore > 0)) && (
          <span className="absolute left-3 top-3 z-[2] rounded-full bg-gradient-brand px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md">
            {product.matchLabel ?? `${product.matchScore}% Match`}
          </span>
        )}

        {product.company.status === "APPROVED" && (
          <span className="absolute right-3 top-3 z-[2] inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-brand-green-dark shadow-sm backdrop-blur-sm">
            <Shield className="h-3 w-3" />
            Verified
          </span>
        )}

        <div className="pointer-events-auto absolute bottom-3 right-3 z-[2] flex items-center gap-1.5 rounded-xl border border-white/60 bg-white/85 p-1 shadow-sm backdrop-blur-md">
          <WishlistButton productId={product.id} compact />
          <CompareButton
            product={{ id: product.id, slug: product.slug, name: product.name }}
            compact
          />
        </div>
      </div>

      <div className="pointer-events-none relative z-[1] flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-blue">
              {product.category.name}
            </p>
            <h3 className="font-heading mt-0.5 line-clamp-2 text-base font-semibold text-slate-900 transition-colors group-hover:text-brand-blue">
              {product.name}
            </h3>
          </div>
          {rating > 0 && (
            <span className="flex shrink-0 items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-500">
          {product.shortDescription}
        </p>

        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="truncate text-xs text-slate-400">{product.company.name}</p>
          {priceLabel && (
            <p className="text-sm font-semibold text-slate-800">{priceLabel}</p>
          )}
        </div>
      </div>
    </article>
  );
}
