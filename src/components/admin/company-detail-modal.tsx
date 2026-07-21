"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  Building2,
  ExternalLink,
  Globe,
  Mail,
  Package,
  Phone,
  ShieldCheck,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VendorHealthMeter } from "@/components/admin/vendor-health-badge";
import { formatDate } from "@/lib/utils";

export interface AdminCompanyRow {
  id: string;
  name: string;
  slug: string;
  ownerName: string | null;
  website: string | null;
  description: string | null;
  industry: string | null;
  contactEmail: string;
  contactPhone: string | null;
  logo: string | null;
  status: string;
  paymentVerified: boolean;
  adminApproved: boolean;
  selectedPlan: string | null;
  rejectionNote: string | null;
  createdAt: string;
  updatedAt: string;
  productCount: number;
  leadCount: number;
  healthScore?: number;
  healthLabel?: string;
  owner: {
    name: string | null;
    email: string;
  };
}

interface CompanyDetailModalProps {
  company: AdminCompanyRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone = "blue",
}: {
  icon: typeof Package;
  label: string;
  value: string | number;
  tone?: "blue" | "green" | "amber";
}) {
  return (
    <div className={`admin-company-stat admin-company-stat-${tone}`}>
      <Icon className="h-4 w-4 shrink-0 opacity-80" />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
        <p className="font-heading text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}

export function CompanyDetailModal({ company, open, onOpenChange }: CompanyDetailModalProps) {
  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-company-modal max-w-2xl gap-0 overflow-hidden border-0 p-0 shadow-2xl [&>button]:hidden">
        <DialogTitle className="sr-only">{company.name} details</DialogTitle>

        <div className="admin-company-modal-hero relative overflow-hidden px-6 pb-8 pt-6 text-white">
          <div className="admin-company-modal-glow" aria-hidden />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative flex items-start gap-4">
            <div className="admin-company-modal-avatar">
              {company.logo ? (
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={72}
                  height={72}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-heading text-2xl font-bold">{company.name.charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                {company.industry ?? "Software vendor"}
              </p>
              <h2 className="font-heading mt-1 text-2xl font-bold leading-tight">{company.name}</h2>
              <p className="mt-1 text-sm text-white/80">
                Joined {formatDate(company.createdAt)} · {company.owner.name ?? company.ownerName ?? "Owner"}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={company.status} />
                {company.paymentVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm">
                    <ShieldCheck className="h-3 w-3" />
                    Paid
                  </span>
                )}
              </div>
            </div>
            {company.healthScore != null && company.healthLabel && (
              <div className="hidden shrink-0 rounded-2xl bg-white/10 p-3 backdrop-blur-sm sm:block">
                <VendorHealthMeter score={company.healthScore} label={company.healthLabel} />
              </div>
            )}
          </div>
        </div>

        <div className="max-h-[55vh] space-y-5 overflow-y-auto bg-white p-6 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile icon={Package} label="Products" value={company.productCount} tone="blue" />
            <StatTile icon={TrendingUp} label="Leads" value={company.leadCount} tone="green" />
            <StatTile
              icon={Activity}
              label="Health"
              value={company.healthScore ?? "—"}
              tone="amber"
            />
            <StatTile icon={Building2} label="Plan" value={company.selectedPlan ?? "—"} tone="blue" />
          </div>

          {company.description && (
            <p className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-600">
              {company.description}
            </p>
          )}

          <div className="admin-company-detail-grid grid gap-3 sm:grid-cols-2">
            <div className="admin-company-detail-item">
              <User className="h-4 w-4 text-brand-blue" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Owner</p>
                <p className="text-sm font-medium text-slate-800">
                  {company.ownerName ?? company.owner.name ?? "—"}
                </p>
                <p className="text-xs text-slate-500">{company.owner.email}</p>
              </div>
            </div>
            <div className="admin-company-detail-item">
              <Mail className="h-4 w-4 text-brand-blue" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Contact</p>
                <p className="break-all text-sm font-medium text-slate-800">{company.contactEmail}</p>
              </div>
            </div>
            {company.contactPhone && (
              <div className="admin-company-detail-item">
                <Phone className="h-4 w-4 text-brand-blue" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Phone</p>
                  <p className="text-sm font-medium text-slate-800">{company.contactPhone}</p>
                </div>
              </div>
            )}
            {company.website && (
              <div className="admin-company-detail-item">
                <Globe className="h-4 w-4 text-brand-blue" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Website</p>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-brand-blue hover:underline"
                  >
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              </div>
            )}
          </div>

          {company.rejectionNote && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-red-500">Rejection note</p>
              <p className="mt-1 text-sm text-red-700">{company.rejectionNote}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <Link href={`/companies/${company.slug}`} target="_blank">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="h-4 w-4" />
                Public profile
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CompanyAvatar({
  name,
  logo,
  size = "md",
}: {
  name: string;
  logo: string | null;
  size?: "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "h-11 w-11 text-base" : "h-10 w-10 text-sm";

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-blue/15 to-brand-green/10 font-heading font-bold text-brand-blue ${sizeClass}`}
    >
      {logo ? (
        <Image src={logo} alt={name} width={44} height={44} className="h-full w-full object-cover" />
      ) : (
        <span>{name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}
