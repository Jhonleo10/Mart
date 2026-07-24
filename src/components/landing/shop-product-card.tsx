import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Building2, ShieldCheck, Sparkles, Star } from "lucide-react";
import { cn, calculateAverageRating } from "@/lib/utils";
import { formatProductPriceLabel } from "@/lib/product-price";
import { getProductBookDemoPath } from "@/lib/product-public-url";

export type ShopProductCardData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  price: number | null;
  company: { name: string };
  category: { name: string };
  images: { url: string }[];
  reviews?: { rating: number }[];
  featured?: boolean;
  adminVerified?: boolean;
};

function ProductImage({
  product,
  className,
  sizes,
}: {
  product: ShopProductCardData;
  className?: string;
  sizes?: string;
}) {
  const imageUrl = product.images[0]?.url;
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={product.name}
        fill
        className={className}
        sizes={sizes ?? "(max-width: 640px) 90vw, 360px"}
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-blue/15 via-white to-brand-green/10">
      <span className="font-heading text-6xl font-black text-brand-blue/20">{product.name.charAt(0)}</span>
    </div>
  );
}

/** Large spotlight card for the first featured product */
export function ShopHeroProductCard({ product }: { product: ShopProductCardData }) {
  const rating = product.reviews
    ? calculateAverageRating(product.reviews.map((r) => r.rating))
    : 0;
  const priceLabel = formatProductPriceLabel(product.price);
  const href = getProductBookDemoPath(product.slug);

  return (
    <Link href={href} className="shop-hero-card group block overflow-hidden rounded-2xl">
      <div className="shop-hero-card-inner">
        <div className="shop-hero-card-visual relative min-h-[220px] overflow-hidden sm:min-h-[280px] lg:min-h-0 lg:w-[52%]">
          <ProductImage
            product={product}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-slate-900/20 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="shop-pill shop-pill-glass">
              <Sparkles className="h-3 w-3" />
              Editor&apos;s pick
            </span>
            <span className="shop-pill shop-pill-category">{product.category.name}</span>
          </div>
        </div>

        <div className="shop-hero-card-body flex flex-1 flex-col justify-center p-6 sm:p-8 lg:p-10">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand-blue">
            <Building2 className="h-3.5 w-3.5" />
            {product.company.name}
          </p>
          <h3 className="font-heading mt-2 text-2xl font-bold text-slate-900 transition-colors group-hover:text-brand-blue sm:text-3xl">
            {product.name}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            {product.shortDescription}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {priceLabel && (
              <span className="shop-price-tag shop-price-tag-lg">{priceLabel}</span>
            )}
            {rating > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-800 ring-1 ring-amber-100">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {rating.toFixed(1)}
              </span>
            )}
          </div>

          <span className="shop-hero-cta mt-8 inline-flex w-fit items-center gap-2 text-sm font-bold text-white">
            Explore product
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ShopProductCard({
  product,
  index = 0,
  layout = "carousel",
}: {
  product: ShopProductCardData;
  index?: number;
  layout?: "carousel" | "grid";
}) {
  const rating = product.reviews
    ? calculateAverageRating(product.reviews.map((r) => r.rating))
    : 0;
  const priceLabel = formatProductPriceLabel(product.price);
  const href = getProductBookDemoPath(product.slug);

  return (
    <article
      className={cn(
        "shop-card group relative flex h-full flex-col overflow-hidden rounded-2xl",
        layout === "carousel"
          ? "min-w-[min(100%,280px)] max-w-[300px] shrink-0 snap-center sm:min-w-[300px]"
          : "w-full min-w-0",
      )}
    >
      <span className="shop-card-index" aria-hidden>
        {String(index + 1).padStart(2, "0")}
      </span>

      <Link href={href} className="shop-card-frame flex flex-1 flex-col">
        <div className="relative aspect-[5/4] overflow-hidden">
          <ProductImage
            product={product}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/25 to-transparent" />

          <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
            <span className="shop-pill shop-pill-glass text-[10px]">{product.category.name}</span>
            <div className="flex flex-col items-end gap-1">
              {product.adminVerified && (
                <span className="shop-pill shop-pill-verified inline-flex items-center gap-1 text-[10px]">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
              {product.featured && (
                <span className="shop-pill shop-pill-featured text-[10px]">Featured</span>
              )}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-heading line-clamp-2 text-lg font-bold leading-snug text-white">
              {product.name}
            </h3>
            <p className="mt-1 truncate text-xs font-medium text-white/70">{product.company.name}</p>
          </div>
        </div>

        <div className="shop-card-footer flex flex-1 flex-col border-x border-b border-slate-200/80 bg-white/95 p-4 backdrop-blur-sm">
          <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-slate-500">
            {product.shortDescription}
          </p>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <div className="min-w-0">
              {priceLabel ? (
                <span className="shop-price-tag">{priceLabel}</span>
              ) : (
                <span className="text-[11px] font-medium text-slate-400">Demo for pricing</span>
              )}
              {rating > 0 && (
                <span className="ml-2 inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-700">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {rating.toFixed(1)}
                </span>
              )}
            </div>
            <span className="shop-card-more">
              More
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
