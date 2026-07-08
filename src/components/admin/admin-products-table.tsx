"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Package, ShieldCheck } from "lucide-react";
import {
  AdminFeaturedProductButton,
  AdminRejectProductButton,
  AdminUnverifyProductButton,
  AdminVerifyProductButton,
} from "@/components/admin/admin-product-review-buttons";
import { AdminMetricCell } from "@/components/admin/admin-metric-cell";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  status: string;
  adminVerified: boolean;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  imageUrl: string | null;
  company: { name: string };
  category: { name: string };
};

function ProductThumb({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  return (
    <div className="admin-product-thumb flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-blue/10 to-brand-green/10 ring-1 ring-brand-blue/10">
      {imageUrl ? (
        <Image src={imageUrl} alt={name} width={48} height={48} className="h-full w-full object-cover" />
      ) : (
        <Package className="h-5 w-5 text-brand-blue/60" />
      )}
    </div>
  );
}

export function AdminProductsTable({ products }: { products: AdminProductRow[] }) {
  return (
    <table className="admin-table admin-table-premium admin-table-products admin-table-products-v2">
      <thead>
        <tr>
          <th className="w-[4.5rem] text-center">Image</th>
          <th>Product</th>
          <th>Company</th>
          <th>Category</th>
          <th className="text-center">Views</th>
          <th>Status</th>
          <th className="text-center">Verified</th>
          <th className="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} className="admin-table-row admin-table-row-premium">
            <td className="text-center align-middle">
              <div className="flex justify-center">
                <ProductThumb name={product.name} imageUrl={product.imageUrl} />
              </div>
            </td>
            <td className="align-middle">
              <div className="min-w-0 max-w-[16rem]">
                <p className="truncate font-heading text-sm font-bold text-slate-900">{product.name}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{product.shortDescription}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/products/${product.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-blue hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Live
                  </Link>
                  <span className="text-[10px] text-slate-400">{formatDate(product.createdAt)}</span>
                </div>
              </div>
            </td>
            <td className="align-middle text-sm font-medium text-slate-700">{product.company.name}</td>
            <td className="align-middle">
              <span className="admin-category-chip">{product.category.name}</span>
            </td>
            <td className="align-middle text-center">
              <AdminMetricCell value={product.viewCount} tone="blue" />
            </td>
            <td className="align-middle">
              <StatusBadge status={product.status} />
            </td>
            <td className="align-middle text-center">
              {product.adminVerified ? (
                <span className="admin-verified-chip inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              ) : (
                <span className="text-xs text-slate-400">—</span>
              )}
            </td>
            <td className="align-middle">
              <div className="admin-product-actions flex flex-wrap items-center justify-center gap-1.5">
                {product.status === "PUBLISHED" && !product.adminVerified && (
                  <AdminVerifyProductButton productId={product.id} productName={product.name} compact />
                )}
                {product.status === "PUBLISHED" && product.adminVerified && (
                  <AdminUnverifyProductButton productId={product.id} productName={product.name} compact />
                )}
                {product.status === "PUBLISHED" && (
                  <AdminFeaturedProductButton
                    productId={product.id}
                    productName={product.name}
                    featured={product.featured}
                    compact
                  />
                )}
                {product.status === "PUBLISHED" && (
                  <AdminRejectProductButton productId={product.id} productName={product.name} compact />
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
