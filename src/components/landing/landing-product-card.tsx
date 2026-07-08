import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calculateAverageRating } from "@/lib/utils";
import { getProductBookDemoPath } from "@/lib/product-public-url";

interface LandingProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    pricingModel: string;
    company: { name: string };
    category: { name: string };
    images: { url: string }[];
    reviews?: { rating: number }[];
  };
}

export function LandingProductCard({ product }: LandingProductCardProps) {
  const rating = product.reviews
    ? calculateAverageRating(product.reviews.map((r) => r.rating))
    : 0;
  const imageUrl = product.images[0]?.url;

  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:gap-5 sm:p-5">
      <div className="relative mx-auto h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue/10 to-brand-green/10 sm:mx-0 sm:h-24 sm:w-24">
        {imageUrl ? (
          <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="96px" />
        ) : (
          <div className="flex h-full items-center justify-center font-heading text-2xl font-bold text-brand-blue/40">
            {product.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="mt-4 min-w-0 flex-1 text-center sm:mt-0 sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <h3 className="font-heading text-base font-semibold text-slate-900 sm:text-lg">
            {product.name}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {product.category.name}
          </Badge>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{product.shortDescription}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 sm:justify-start">
          <span>{product.company.name}</span>
          {rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <Link href={getProductBookDemoPath(product.slug)} className="mt-4 shrink-0 sm:mt-0">
        <Button size="sm" className="w-full gap-1 sm:w-auto">
          View Details
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  );
}
