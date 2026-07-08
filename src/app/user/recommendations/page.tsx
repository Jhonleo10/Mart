import { redirect } from "next/navigation";
import Link from "next/link";
import { getProductBookDemoPath } from "@/lib/product-public-url";
import { auth } from "@/lib/auth";
import { getRecommendationsForUser } from "@/lib/intelligence/recommendation-engine";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";
import { ModernProductCard } from "@/components/products/modern-product-card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export default async function UserRecommendationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { recommendations, hasProfile, source } = await getRecommendationsForUser(
    session.user.id,
    12,
  );

  const pageTitle =
    source === "profile"
      ? "Your recommendations"
      : source === "behavioral"
        ? "Suggested for you"
        : "Trending software";

  const pageDescription =
    source === "profile"
      ? "Scored by industry fit, features, budget, reviews, and vendor trust — powered by our in-house engine."
      : source === "behavioral"
        ? "Picks based on categories from your saved products and demo requests. Build a requirement profile for full match scores."
        : "Popular marketplace picks. Build your requirement profile to unlock personalized match scores.";

  return (
    <div className="dash-page-enter space-y-6">
      <DashboardPageHeader title={pageTitle} description={pageDescription} />

      {!hasProfile && (
        <div className="discovery-glass rounded-2xl border border-brand-blue/15 bg-brand-blue/[0.04] p-5">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-blue">
            <Sparkles className="h-4 w-4" />
            Unlock personalized match scores
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Smart Search and For You work best after you complete the requirement builder once.
          </p>
          <Link href="/user/requirements" className="mt-3 inline-block">
            <Button size="sm" className="gap-1.5 bg-gradient-brand">
              Build requirements <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {recommendations.length === 0 ? (
        <div className="discovery-glass rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-sm text-slate-500">No products to show yet. Try Smart Search or build your requirements.</p>
          <Link href="/user/discover" className="mt-4 inline-block">
            <Button variant="outline">Explore software</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {recommendations.map((rec) => (
            <div
              key={rec.productId}
              className="discovery-glass rounded-2xl border border-slate-200/80 p-5 sm:p-6"
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                <div>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {rec.profileScored ? (
                      <span className="rounded-full bg-gradient-brand px-3 py-1 text-sm font-bold text-white">
                        {rec.matchScore}% Match
                      </span>
                    ) : rec.matchLabel ? (
                      <span className="rounded-full bg-slate-700 px-3 py-1 text-sm font-bold text-white">
                        {rec.matchLabel}
                      </span>
                    ) : null}
                    <span className="text-xs text-slate-500">{rec.categoryName}</span>
                  </div>
                  <ModernProductCard
                    product={{
                      id: rec.productId,
                      slug: rec.slug,
                      name: rec.name,
                      shortDescription: rec.shortDescription,
                      pricingModel: rec.pricingModel,
                      price: rec.price,
                      company: { name: rec.companyName, slug: "", logo: rec.companyLogo, status: "APPROVED" },
                      category: { name: rec.categoryName },
                      images: rec.imageUrl ? [{ url: rec.imageUrl }] : [],
                      matchScore: rec.profileScored ? rec.matchScore : undefined,
                      matchLabel: rec.matchLabel,
                    }}
                  />
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-slate-800">Why this software?</h4>
                    <ul className="mt-2 space-y-1 text-slate-600">
                      {rec.whyThis.map((w) => (
                        <li key={w}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-green-dark">Pros</h4>
                    <ul className="mt-1 space-y-0.5 text-slate-600">
                      {rec.pros.map((p) => (
                        <li key={p}>+ {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-500">Cons</h4>
                    <ul className="mt-1 space-y-0.5 text-slate-500">
                      {rec.cons.map((c) => (
                        <li key={c}>− {c}</li>
                      ))}
                    </ul>
                  </div>
                  {rec.alternatives.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-800">Best alternatives</h4>
                      <ul className="mt-1 space-y-1">
                        {rec.alternatives.map((alt) => (
                          <li key={alt.id}>
                            <Link href={getProductBookDemoPath(alt.slug)} className="text-brand-blue hover:underline">
                              {alt.name}
                              {rec.profileScored ? ` (${alt.matchScore}%)` : ""}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link href="/user/discover">
        <Button variant="outline" className="gap-1.5">
          Explore more <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
