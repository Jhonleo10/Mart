import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateAverageRating } from "@/lib/utils";
import { formatProductPriceLabel } from "@/lib/product-price";
import { getProductBookDemoPath } from "@/lib/product-public-url";
import { Star } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    pricingModel: string;
    price: number | null;
    viewCount: number;
    company: { name: string; slug: string; logo: string | null };
    category: { name: string };
    images: { url: string }[];
    reviews?: { rating: number }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const rating = product.reviews
    ? calculateAverageRating(product.reviews.map((r) => r.rating))
    : 0;
  const imageUrl = product.images[0]?.url;
  const priceLabel = formatProductPriceLabel(product.price);

  return (
    <Link href={getProductBookDemoPath(product.slug)} className="group block min-w-0">
      <Card className="h-full overflow-hidden">
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-blue/10 to-brand-green/10">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-heading text-4xl font-bold text-brand-blue/30">
                {product.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge className="backdrop-blur-md">{product.category.name}</Badge>
          </div>
        </div>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading line-clamp-2 min-w-0 flex-1 text-base font-semibold text-slate-900 transition-colors group-hover:text-brand-blue sm:text-lg">
              {product.name}
            </h3>
            {rating > 0 && (
              <span className="flex shrink-0 items-center gap-1 text-xs text-slate-500">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {rating.toFixed(1)}
              </span>
            )}
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
            {product.shortDescription}
          </p>
          <div className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-400">
            <span className="truncate">{product.company.name}</span>
            {priceLabel && (
              <span className="shrink-0 rounded-full bg-brand-green/10 px-2 py-0.5 font-semibold text-brand-green-dark">
                {priceLabel}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
