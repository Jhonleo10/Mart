import { productRepository } from "@/repositories/product.repository";
import { categoryRepository } from "@/repositories/notification.repository";
import { AdminProductsTable } from "@/components/admin/admin-products-table";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/kanban-card";
import { AdminPagination, ADMIN_PAGE_SIZE } from "@/components/admin/admin-pagination";
import { AdminTableExportButtons } from "@/components/admin/admin-table-export-buttons";
import { AdminTableShell } from "@/components/admin/admin-table-shell";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import type { ProductStatus } from "@prisma/client";
import { Package } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; category?: string; verified?: string; page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const status = params.status as ProductStatus | undefined;
  const verified = params.verified as "true" | "false" | undefined;
  const categories = await categoryRepository.list();
  const filterParams = {
    q: params.q,
    status: params.status,
    category: params.category,
    verified: params.verified,
  };

  const [products, total] = await productRepository.adminList({
    page,
    limit: ADMIN_PAGE_SIZE,
    status: status || undefined,
    verified: verified || undefined,
    q: params.q,
    categoryId: params.category,
  });

  const rows = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    status: product.status,
    adminVerified: product.adminVerified,
    featured: product.featured,
    viewCount: product.viewCount,
    createdAt: product.createdAt.toISOString(),
    imageUrl: product.images[0]?.url ?? null,
    company: { name: product.company.name },
    category: { name: product.category.name },
  }));

  return (
    <div className="admin-page dash-page-enter space-y-5">
      <AdminPageHeader
        title="Manage Products"
        description="Products go live instantly when vendors create them. Grant the verified badge as a quality add-on."
      />

      <AdminFilterBar
        compact
        basePath="/admin/products"
        values={filterParams}
        resultCount={total}
        resultLabel="products"
        fields={[
          {
            name: "q",
            type: "search",
            label: "Search",
            placeholder: "Search product or company...",
          },
          {
            name: "verified",
            type: "select",
            label: "Verified badge",
            options: [
              { value: "false", label: "Awaiting verification" },
              { value: "true", label: "Verified" },
            ],
          },
          {
            name: "status",
            type: "select",
            label: "Status",
            options: [
              { value: "PUBLISHED", label: "Published" },
              { value: "REJECTED", label: "Unpublished" },
              { value: "DRAFT", label: "Draft" },
            ],
          },
          {
            name: "category",
            type: "select",
            label: "Category",
            options: categories.map((c) => ({ value: c.id, label: c.name })),
          },
        ]}
      />

      <AdminTableShell
        title="Product catalog"
        description="Live listings, verified badges, and featured spotlight controls"
        action={<AdminTableExportButtons entity="products" searchParams={filterParams} />}
        isEmpty={products.length === 0}
        empty={
          <DashboardEmptyState
            icon={Package}
            title="No products found"
            description="No products match your filters."
          />
        }
        footer={
          <AdminPagination
            total={total}
            page={page}
            basePath="/admin/products"
            searchParams={filterParams}
          />
        }
      >
        <AdminProductsTable products={rows} />
      </AdminTableShell>
    </div>
  );
}
