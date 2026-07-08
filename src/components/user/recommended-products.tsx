import { ProductCard } from "@/components/products/product-card";
import { CompareButton } from "@/components/compare/compare-button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

type Product = {
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

export function RecommendedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-blue">
            <Sparkles className="h-3.5 w-3.5" />
            For you
          </p>
          <h2 className="font-heading text-lg font-semibold text-slate-900">Recommended products</h2>
          <p className="text-sm text-slate-500">Based on your wishlist and booking history</p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
        >
          Explore all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />
            <div className="absolute right-3 top-3 z-10">
              <CompareButton product={product} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
