import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Cloud,
  Globe,
  Lock,
  MessageSquare,
  Shield,
  Smartphone,
  Star,
  Tag,
  Zap,
} from "lucide-react";
import { BookingForm } from "@/components/forms/booking-form";
import { ProductImageCarousel } from "@/components/products/product-image-carousel";
import { ExpandableText } from "@/components/ui/expandable-text";
import { calculateAverageRating, cn } from "@/lib/utils";
import { previewList } from "@/lib/product-preview";
import { formatProductPriceLabel } from "@/lib/product-price";

type BookDemoProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  pricingModel: string;
  price: number | null;
  companyId: string;
  features: string[];
  integrations: string[];
  deploymentTypes: string[];
  securityFeatures: string[];
  suitableFor: string[];
  businessSizes: string[];
  hasMobileApp: boolean;
  hasApiAccess: boolean;
  websiteUrl: string | null;
  adminVerified: boolean;
  company: {
    name: string;
    logo: string | null;
    status: string;
    industry: string | null;
    description: string | null;
  };
  category: { name: string; slug: string };
  images: { url: string; alt?: string | null }[];
  tags: { tag: { name: string } }[];
  industries: { industry: { name: string } }[];
  reviews: { rating: number; comment: string | null; user: { name: string | null } }[];
};

const DEMO_BENEFITS = [
  { icon: Calendar, text: "Pick a date & time that works for your team" },
  { icon: MessageSquare, text: "Tell the vendor what you want to see in the session" },
  { icon: CheckCircle2, text: "Get email confirmation and track status in your dashboard" }
];

export function ProductBookDemoView({
  product,
  isLoggedIn,
  userDefaults,
}: {
  product: BookDemoProduct;
  isLoggedIn: boolean;
  userDefaults?: { name?: string; email?: string; phone?: string };
}) {
  const rating =
    product.reviews.length > 0
      ? calculateAverageRating(product.reviews.map((r) => r.rating))
      : 0;
  const featureTags = product.tags.map((t) => t.tag.name).slice(0, 8);
  const descriptionFull = product.fullDescription || product.shortDescription;
  const { visible: visibleFeatures, hiddenCount: hiddenFeatures } = previewList(product.features, 0.5);
  const { visible: visibleIntegrations, hiddenCount: hiddenIntegrations } = previewList(
    product.integrations,
    0.5,
  );
  const { visible: visibleSecurity, hiddenCount: hiddenSecurity } = previewList(
    product.securityFeatures,
    0.5,
  );
  const topReviews = product.reviews.slice(0, 3);
  const returnUrl = `/book/${product.slug}`;
  const priceLabel = formatProductPriceLabel(product.price);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="safe-container py-6 sm:py-10">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-blue"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to marketplace
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-5 lg:gap-10">
          {/* Product overview — ~50% of full listing */}
          <div className="space-y-6 lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <ProductImageCarousel
                images={product.images}
                productName={product.name}
                categoryBadge={
                  <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-blue backdrop-blur">
                    {product.category.name}
                  </div>
                }
              />

              <div className="p-5 sm:p-7">
                <h1 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
                  {product.name}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    {product.company.logo ? (
                      <Image
                        src={product.company.logo}
                        alt=""
                        width={22}
                        height={22}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-4 w-4 text-slate-400" />
                    )}
                    {product.company.name}
                  </span>
                  {product.adminVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-2.5 py-0.5 text-xs font-medium text-brand-green-dark">
                      <Shield className="h-3 w-3" />
                      Verified vendor
                    </span>
                  )}
                  {rating > 0 && (
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {rating.toFixed(1)}
                      <span className="text-slate-400">({product.reviews.length})</span>
                    </span>
                  )}
                </div>

                <p className="mt-4 text-base font-medium text-slate-700">{product.shortDescription}</p>

                {priceLabel && (
                  <div className="mt-4">
                    <span className="rounded-xl bg-slate-900 px-4 py-2 text-lg font-bold text-white">
                      {priceLabel}
                    </span>
                    <p className="mt-2 text-xs text-slate-400">
                      Full pricing details discussed during your demo.
                    </p>
                  </div>
                )}

                {featureTags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {featureTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md bg-brand-blue/5 px-2 py-1 text-xs font-medium text-brand-blue"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Overview sections */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7">
              <h2 className="font-heading text-lg font-semibold text-slate-900">About this product</h2>
              <ExpandableText text={descriptionFull} className="mt-3" maxChars={400} />
            </div>

            {visibleFeatures.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7">
                <h2 className="font-heading text-lg font-semibold text-slate-900">Key features</h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {visibleFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {hiddenFeatures > 0 && (
                  <p className="mt-3 text-xs font-medium text-brand-blue">
                    +{hiddenFeatures} more features — book a demo to explore the full list
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {(product.deploymentTypes.length > 0 || product.hasMobileApp || product.hasApiAccess) && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
                  <h3 className="font-heading text-sm font-semibold text-slate-900">Deployment & access</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {product.deploymentTypes.map((d) => (
                      <li key={d} className="flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-brand-blue" />
                        {d}
                      </li>
                    ))}
                    {product.hasMobileApp && (
                      <li className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-brand-blue" />
                        Mobile app available
                      </li>
                    )}
                    {product.hasApiAccess && (
                      <li className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-brand-blue" />
                        API access
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {visibleIntegrations.length > 0 && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
                  <h3 className="font-heading text-sm font-semibold text-slate-900">Integrations</h3>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {visibleIntegrations.map((i) => (
                      <span key={i} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {i}
                      </span>
                    ))}
                  </div>
                  {hiddenIntegrations > 0 && (
                    <p className="mt-2 text-xs text-slate-400">+{hiddenIntegrations} more</p>
                  )}
                </div>
              )}
            </div>

            {visibleSecurity.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7">
                <h2 className="font-heading flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Lock className="h-5 w-5 text-brand-blue" />
                  Security & compliance
                </h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {visibleSecurity.map((s) => (
                    <li key={s} className="flex items-center gap-2 text-sm text-slate-600">
                      <Shield className="h-4 w-4 text-brand-green" />
                      {s}
                    </li>
                  ))}
                </ul>
                {hiddenSecurity > 0 && (
                  <p className="mt-3 text-xs text-slate-400">+{hiddenSecurity} more security features</p>
                )}
              </div>
            )}

            {(product.suitableFor.length > 0 || product.industries.length > 0) && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7">
                <h2 className="font-heading text-lg font-semibold text-slate-900">Best for</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.industries.map(({ industry }) => (
                    <span
                      key={industry.name}
                      className="rounded-full bg-brand-blue/5 px-3 py-1 text-xs font-medium text-brand-blue"
                    >
                      {industry.name}
                    </span>
                  ))}
                  {product.suitableFor.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                  {product.businessSizes.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-brand-green/5 px-3 py-1 text-xs font-medium text-brand-green-dark"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {topReviews.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7">
                <h2 className="font-heading text-lg font-semibold text-slate-900">Buyer reviews</h2>
                <div className="mt-4 space-y-4">
                  {topReviews.map((review, i) => (
                    <div key={i} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star
                              key={s}
                              className={cn(
                                "h-3.5 w-3.5",
                                s < review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200",
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-slate-500">
                          {review.user.name ?? "Verified buyer"}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-2 line-clamp-3 text-sm text-slate-600">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
                {product.reviews.length > 3 && (
                  <p className="mt-3 text-xs text-slate-400">
                    Showing 3 of {product.reviews.length} reviews
                  </p>
                )}
              </div>
            )}

            {product.websiteUrl && (
              <p className="text-sm text-slate-500">
                <Globe className="mr-1 inline h-4 w-4" />
                Vendor website available after demo booking confirmation.
              </p>
            )}

          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-2">
            <div className="space-y-5 lg:sticky lg:top-24">
              <div className="buyer-glass-panel overflow-hidden rounded-2xl border border-brand-blue/15 bg-gradient-to-br from-white via-brand-blue/[0.03] to-brand-green/[0.04] p-5 shadow-md sm:p-6">
                <div className="mb-1 h-1 w-16 rounded-full bg-gradient-brand" />
                <h2 className="font-heading text-xl font-bold text-slate-900">Book a live demo</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Like checkout — browse freely, sign in only when you are ready to schedule with{" "}
                  {product.company.name}.
                </p>

                {!isLoggedIn && (
                  <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <p className="font-medium">Sign in required to book</p>
                    <p className="mt-0.5 text-xs text-amber-800/80">
                      Create a free buyer account — no payment needed for demo requests.
                    </p>
                  </div>
                )}

                <BookingForm
                  productId={product.id}
                  companyId={product.companyId}
                  className="mt-6"
                  isLoggedIn={isLoggedIn}
                  defaultValues={userDefaults}
                  returnUrl={returnUrl}
                />
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5">
                <h3 className="font-heading text-sm font-semibold text-slate-900">What happens next?</h3>
                <ul className="mt-4 space-y-3">
                  {DEMO_BENEFITS.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex gap-3 text-sm text-slate-600">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                        <Icon className="h-4 w-4 text-brand-blue" />
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              {product.company.description && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
                  <h3 className="font-heading text-sm font-semibold text-slate-900">About {product.company.name}</h3>
                  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-600">
                    {product.company.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
