"use client";

import Link from "next/link";
import { Building2, Package, ArrowRight } from "lucide-react";
import { ApproveCompanyButton } from "@/components/admin/approve-company-button";
import { RejectCompanyButton } from "@/components/admin/reject-company-button";
import { formatRelativeTime } from "@/lib/utils";
import { formatPlanLabel } from "@/lib/dashboard-themes";

type PendingCompany = {
  id: string;
  name: string;
  slug: string;
  ownerName: string | null;
  industry: string | null;
  createdAt: Date;
  selectedPlan: string | null;
};

type PendingProduct = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  company: { name: string; slug: string };
};

export function AdminApprovalQueue({
  companies,
  products,
}: {
  companies: PendingCompany[];
  products: PendingProduct[];
}) {
  const total = companies.length + products.length;

  if (total === 0) {
    return (
      <div className="dash-panel text-center">
        <p className="py-8 text-sm text-slate-500">All approvals are up to date.</p>
      </div>
    );
  }

  return (
    <div className="dash-panel space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold text-slate-800">Approval queue</h3>
        <span className="rounded-full bg-brand-blue/15 px-2.5 py-0.5 text-xs font-bold text-brand-blue">
          {total} pending
        </span>
      </div>

      {companies.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Building2 className="h-3.5 w-3.5" />
            Companies
          </p>
          <ul className="space-y-2">
            {companies.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {c.ownerName ?? "Owner"} · {c.industry ?? "Software"} ·{" "}
                    {formatPlanLabel(c.selectedPlan)} · {formatRelativeTime(c.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <ApproveCompanyButton companyId={c.id} />
                  <RejectCompanyButton companyId={c.id} />
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/admin/companies?status=PENDING"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
          >
            View all companies <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {products.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Package className="h-3.5 w-3.5" />
            Products awaiting verified badge
          </p>
          <ul className="space-y-2">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">
                    {p.company.name} · {formatRelativeTime(p.createdAt)}
                  </p>
                </div>
                <Link
                  href={`/admin/products?verified=false`}
                  className="text-xs font-semibold text-brand-blue hover:underline"
                >
                  Grant badge
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/admin/products?verified=false"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
          >
            View all products <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
