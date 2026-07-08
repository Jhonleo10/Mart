import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { companyRepository } from "@/repositories/company.repository";
import { productRepository } from "@/repositories/product.repository";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteProductButton } from "@/components/company/delete-product-button";
import {
  getCompanyEffectivePlan,
  getCompanySpotlightUsage,
  productLimitForPlan,
  formatProductLimit,
} from "@/lib/plans/company-plan";
import { ProductSpotlightButton } from "@/components/company/product-spotlight-button";
import { DashboardDataTable } from "@/components/dashboard/dashboard-data-table";
import { CompanyChipFilters } from "@/components/company/company-chip-filters";
import {
  DashboardPagination,
  DASHBOARD_PAGE_SIZE,
} from "@/components/dashboard/dashboard-pagination";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function CompanyProductsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") redirect("/login");

  const company = await companyRepository.findByUserId(session.user.id);
  if (!company || company.status !== "APPROVED") redirect("/company/dashboard");

  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const status = params.status as ProductStatus | undefined;
  const filterParams = { q: params.q, status: params.status };

  const [products, total] = await productRepository.listByCompanyPaginated(company.id, {
    page,
    limit: DASHBOARD_PAGE_SIZE,
    q: params.q,
    status: status || undefined,
  });

  const plan = getCompanyEffectivePlan(company);
  const productLimit = productLimitForPlan(plan);
  const allCompanyProducts = await productRepository.listByCompany(company.id);
  const totalProducts = allCompanyProducts.length;
  const atProductLimit = productLimit !== null && totalProducts >= productLimit;
  const spotlightCount = allCompanyProducts.filter(
    (p) => p.featured && p.status === "PUBLISHED",
  ).length;
  const spotlight = getCompanySpotlightUsage(company, spotlightCount);

  const statusCounts = {
    PUBLISHED: allCompanyProducts.filter((p) => p.status === "PUBLISHED").length,
    AWAITING_VERIFY: allCompanyProducts.filter(
      (p) => p.status === "PUBLISHED" && !p.adminVerified,
    ).length,
    DRAFT: allCompanyProducts.filter((p) => p.status === "DRAFT").length,
    REJECTED: allCompanyProducts.filter((p) => p.status === "REJECTED").length,
  };

  return (
    <div className="dash-page-enter animate-in fade-in company-products-page">
      <div className="company-products-hero mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
        <div>
          <p className="company-panel-eyebrow text-brand-blue">Catalog</p>
          <h1 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl">Product Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Products go live immediately — earn the verified badge after admin review
          </p>
        </div>
        <Link href={atProductLimit ? "/company/settings?tab=plan" : "/company/products/new"}>
          <Button className="gap-2 shadow-md shadow-brand-blue/15" variant={atProductLimit ? "outline" : "default"}>
            <Plus className="h-4 w-4" />
            {atProductLimit ? "Upgrade to add more" : "Add Product"}
          </Button>
        </Link>
      </div>

      <div className="company-usage-strip mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-brand-blue/15 bg-gradient-to-r from-brand-blue/[0.06] to-brand-green/[0.06] px-4 py-3 text-sm">
        <span className="font-semibold text-slate-800">
          {totalProducts}
          {productLimit !== null ? ` / ${productLimit}` : " products · unlimited"}
        </span>
        {plan && <span className="text-slate-500">{formatProductLimit(plan)} on {plan}</span>}
        {spotlight.limit > 0 ? (
          <span className={cn("text-slate-500", spotlight.atLimit && "font-medium text-amber-700")}>
            · Spotlight {spotlight.used}/{spotlight.limit}
            {spotlight.atLimit ? " (full)" : ` · ${spotlight.remaining} free`}
          </span>
        ) : (
          <Link href="/company/settings?tab=plan" className="text-brand-blue hover:underline">
            · Upgrade to Pro for spotlight
          </Link>
        )}
      </div>

      {atProductLimit && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Plan limit reached ({productLimit} products). Upgrade in Settings → Plan & limits.
        </div>
      )}

      <CompanyChipFilters
        basePath="/company/products"
        chipParam="status"
        activeChip={params.status}
        searchValue={params.q}
        searchPlaceholder="Search products..."
        resultCount={total}
        resultLabel="products"
        title="Product catalog"
        chips={[
          { value: "PUBLISHED", label: "Live", count: statusCounts.PUBLISHED, tone: "green" },
          { value: "DRAFT", label: "Draft", count: statusCounts.DRAFT, tone: "slate" },
          { value: "REJECTED", label: "Unpublished", count: statusCounts.REJECTED, tone: "violet" },
        ]}
      />

      {statusCounts.AWAITING_VERIFY > 0 && (
        <p className="mt-2 text-xs font-medium text-amber-700">
          {statusCounts.AWAITING_VERIFY} live listing{statusCounts.AWAITING_VERIFY === 1 ? "" : "s"} awaiting admin verified badge
        </p>
      )}

      <div className="mt-4">
        <DashboardDataTable
          className="company-themed-table"
          isEmpty={products.length === 0}
          emptyMessage="No products match your filters."
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Views</th>
              <th>Leads</th>
              <th>Spotlight</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="cell-strong max-w-[200px] truncate">{product.name}</td>
                <td>{product.category.name}</td>
                <td>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={product.status} />
                    {product.status === "PUBLISHED" && product.adminVerified && (
                      <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-green-dark">
                        Verified
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="company-table-metric">{product.viewCount}</span>
                </td>
                <td>
                  <span className="company-table-metric company-table-metric-green">
                    {product._count.bookings}
                  </span>
                </td>
                <td>
                  {product.status === "PUBLISHED" ? (
                    <ProductSpotlightButton
                      productId={product.id}
                      featured={product.featured}
                      canUse={spotlight.canUse}
                      atLimit={spotlight.atLimit}
                      remaining={spotlight.remaining}
                      limit={spotlight.limit}
                    />
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/company/products/${product.id}/edit`}>
                      <Button type="button" size="sm" variant="outline">
                        Edit
                      </Button>
                    </Link>
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </DashboardDataTable>
      </div>

      <DashboardPagination
        total={total}
        page={page}
        basePath="/company/products"
        searchParams={filterParams}
      />
    </div>
  );
}
