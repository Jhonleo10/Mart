import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { getProductPublicPath } from "@/lib/product-public-url";
import { cn } from "@/lib/utils";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  viewCount: number;
  images: { url: string }[];
  landingPage: {
    status: string;
    publishedAt: Date | null;
    seoTitle: string | null;
  } | null;
};

export function ProductSeoLandingHub({
  products,
  hasSeoAccess,
  requiredPlan,
}: {
  products: ProductRow[];
  hasSeoAccess: boolean;
  requiredPlan: string;
}) {
  const publishedCount = products.filter((p) => p.landingPage?.status === "PUBLISHED").length;

  return (
    <div className="space-y-6">
      {!hasSeoAccess ? (
        <DashboardPanel className="border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Upgrade required</p>
              <h3 className="font-heading mt-1 text-lg font-semibold text-slate-900">
                Product SEO landing pages
              </h3>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                Create standalone, search-optimized landing pages for each product — separate from the
                marketplace listing. Available on the {requiredPlan} plan and above.
              </p>
            </div>
            <Link href="/company/settings">
              <Button size="sm">View plans</Button>
            </Link>
          </div>
        </DashboardPanel>
      ) : (
        <DashboardPanel className="overflow-hidden border-brand-green/20 bg-gradient-to-br from-brand-green/[0.06] via-white to-brand-blue/[0.04] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-green-dark">
                <Sparkles className="h-3.5 w-3.5" />
                Product SEO
              </p>
              <h3 className="font-heading mt-1 text-lg font-semibold text-slate-900">
                {publishedCount} of {products.length} product{products.length === 1 ? "" : "s"} live
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Each product gets its own SEO landing at{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/product/your-slug</code>
              </p>
            </div>
            <Link href="/company/products/new">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add product
              </Button>
            </Link>
          </div>
        </DashboardPanel>
      )}

      {products.length === 0 ? (
        <DashboardPanel className="p-8 text-center sm:p-12">
          <Sparkles className="mx-auto h-10 w-10 text-brand-blue/40" />
          <h3 className="font-heading mt-4 text-lg font-semibold text-slate-900">No products yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            Add a product first, then build its SEO landing page.
          </p>
          <Link href="/company/products/new" className="mt-4 inline-block">
            <Button>Create your first product</Button>
          </Link>
        </DashboardPanel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const isPublished = product.landingPage?.status === "PUBLISHED";
            const isProductLive = product.status === "PUBLISHED";
            const thumb = product.images[0]?.url;

            return (
              <DashboardPanel key={product.id} className="flex flex-col overflow-hidden p-0">
                <div className="relative h-36 bg-gradient-to-br from-slate-100 to-slate-50">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={product.name}
                      fill
                      className="object-cover opacity-90"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Sparkles className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="truncate font-heading text-sm font-bold text-white">{product.name}</p>
                    <p className="text-xs text-white/80">{product.viewCount} views</p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        isProductLive
                          ? "bg-brand-green/10 text-brand-green-dark"
                          : "bg-amber-100 text-amber-800",
                      )}
                    >
                      {isProductLive ? "Product live" : product.status.replace("_", " ")}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        isPublished
                          ? "bg-brand-blue/10 text-brand-blue"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      SEO {isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  {product.landingPage?.seoTitle ? (
                    <p className="mb-3 line-clamp-2 text-xs text-slate-500">{product.landingPage.seoTitle}</p>
                  ) : (
                    <p className="mb-3 text-xs text-slate-400">No SEO title set yet</p>
                  )}

                  <div className="mt-auto flex flex-wrap gap-2">
                    <Link href={`/company/products/${product.id}/landing`} className="flex-1">
                      <Button type="button" size="sm" variant="outline" className="w-full gap-1">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit landing
                      </Button>
                    </Link>
                    {isProductLive && (
                      <Link href={getProductPublicPath(product.slug)} target="_blank">
                        <Button type="button" size="sm" variant="ghost" className="gap-1">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Preview
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </DashboardPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}
