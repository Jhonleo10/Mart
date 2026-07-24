import Link from "next/link";
import { Sparkles, ArrowRight, Star, TrendingUp, Clock, Building2 } from "lucide-react";
import { SmartSearchBar } from "@/components/intelligence/smart-search-bar";
import { ModernProductCard } from "@/components/products/modern-product-card";
import { Button } from "@/components/ui/button";
import { BuyerFlowCallout } from "@/components/user/buyer-flow-callout";
import type { ProductRecommendation, RecommendationSource } from "@/lib/intelligence/types";

interface DiscoveryHubProps {
  userName: string;
  recommendations: ProductRecommendation[];
  trending: Array<{
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
    features: string[];
  }>;
  categories: { id: string; name: string; slug: string; _count?: { products: number } }[];
  recentlyViewed: Array<{
    product: {
      id: string;
      slug: string;
      name: string;
      shortDescription: string;
      pricingModel: string;
      price: number | null;
      features: string[];
      company: { name: string; slug: string; logo: string | null; status?: string };
      category: { name: string };
      images: { url: string }[];
      reviews?: { rating: number }[];
    };
  }>;
  topRated: ProductRecommendation[];
  newLaunches: Array<{
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
    features: string[];
  }>;
  hasRequirements: boolean;
  recommendationSource?: RecommendationSource;
}

function SectionHeader({
  title,
  href,
  icon: Icon,
}: {
  title: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-slate-900">
        {Icon && <Icon className="h-4 w-4 text-brand-blue" />}
        {title}
      </h2>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

export function DiscoveryHub({
  userName,
  recommendations,
  trending,
  categories,
  recentlyViewed,
  topRated,
  newLaunches,
  hasRequirements,
  recommendationSource = "popular",
}: DiscoveryHubProps) {
  const firstName = userName.split(" ")[0] ?? "there";
  const recommendationTitle =
    recommendationSource === "profile"
      ? "Recommended for you"
      : recommendationSource === "behavioral"
        ? "Suggested for you"
        : "Trending picks";

  return (
    <div className="discovery-hub space-y-8 pb-8">
      <section className="discovery-hero relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-brand-blue/[0.03] to-brand-green/[0.04] p-6 shadow-sm sm:p-8">
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">Discovery Lounge</p>
          <h1 className="font-heading mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Your intelligent software consultant — search naturally, build requirements, and get scored recommendations.
          </p>
          <div className="mt-5 max-w-2xl">
            <SmartSearchBar large />
          </div>
        </div>
      </section>

      <BuyerFlowCallout />

      {!hasRequirements && (
        <section className="discovery-glass flex flex-col items-start justify-between gap-4 rounded-2xl border border-brand-blue/15 bg-brand-blue/[0.04] p-5 sm:flex-row sm:items-center">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-blue">
              <Sparkles className="h-4 w-4" />
              Get personalized match scores
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Build your profile once — smart search and recommendations will rank products to your needs.
            </p>
          </div>
          <Link href="/user/requirements">
            <Button className="bg-gradient-brand gap-1.5">
              Build requirements <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>
      )}

      {recommendations.length > 0 && (
        <section>
          <SectionHeader title={recommendationTitle} href="/user/recommendations" icon={Sparkles} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recommendations.slice(0, 3).map((p) => (
              <ModernProductCard
                key={p.productId}
                product={{
                  id: p.productId,
                  slug: p.slug,
                  name: p.name,
                  shortDescription: p.shortDescription,
                  pricingModel: p.pricingModel,
                  price: p.price,
                  company: { name: p.companyName, slug: p.companySlug, logo: p.companyLogo, status: "APPROVED" },
                  category: { name: p.categoryName },
                  images: p.imageUrl ? [{ url: p.imageUrl }] : [],
                  reviews: Array.from({ length: p.reviewCount }, () => ({ rating: p.avgRating })),
                  matchScore: p.profileScored ? p.matchScore : undefined,
                  matchLabel: p.matchLabel,
                }}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="Trending software" href="/user/discover?sort=popular" icon={TrendingUp} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {trending.slice(0, 4).map((p) => (
            <ModernProductCard
              key={p.id}
              product={{
                ...p,
                company: { ...p.company, status: "APPROVED" },
                featureTags: p.features.slice(0, 3),
              }}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <SectionHeader title="Top rated" icon={Star} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {topRated.slice(0, 4).map((p) => (
              <ModernProductCard
                key={p.productId}
                product={{
                  id: p.productId,
                  slug: p.slug,
                  name: p.name,
                  shortDescription: p.shortDescription,
                  pricingModel: p.pricingModel,
                  price: p.price,
                  company: { name: p.companyName, slug: p.companySlug, logo: p.companyLogo, status: "APPROVED" },
                  category: { name: p.categoryName },
                  images: p.imageUrl ? [{ url: p.imageUrl }] : [],
                  matchScore: p.profileScored ? p.matchScore : undefined,
                  matchLabel: p.matchLabel,
                }}
              />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Popular categories" />
          <div className="space-y-2">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={`/user/discover?category=${cat.slug}`}
                className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm transition-colors hover:border-brand-blue/25 hover:bg-brand-blue/[0.02]"
              >
                <span className="font-medium text-slate-800">{cat.name}</span>
                <span className="text-xs text-slate-400">{cat._count?.products ?? 0} products</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {recentlyViewed.length > 0 && (
        <section>
          <SectionHeader title="Recently viewed" icon={Clock} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyViewed.map((rv) => (
              <ModernProductCard
                key={rv.product.id}
                product={{
                  ...rv.product,
                  company: { ...rv.product.company, status: "APPROVED" },
                  featureTags: rv.product.features.slice(0, 2),
                }}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="New launches" href="/user/discover?sort=latest" icon={Building2} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newLaunches.slice(0, 3).map((p) => (
            <ModernProductCard
              key={p.id}
              product={{
                ...p,
                company: { ...p.company, status: "APPROVED" },
                featureTags: p.features.slice(0, 3),
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
