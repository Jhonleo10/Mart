import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PendingApprovalsCard({ count }: { count: number }) {
  return (
    <div className="dash-panel">
      <h3 className="font-heading text-sm font-semibold text-slate-800">Pending Approvals</h3>
      {count === 0 ? (
        <div className="mt-6 flex flex-col items-center py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/10">
            <CheckCircle2 className="h-6 w-6 text-brand-green" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-700">All clear!</p>
          <p className="mt-1 text-xs text-slate-400">No pending approvals</p>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-3xl font-bold text-brand-blue">{count}</p>
          <p className="mt-1 text-sm text-slate-500">items need your review</p>
          <Link href="/admin/companies" className="mt-4 block">
            <Button size="sm" className="w-full">
              Review now
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export function QuickActionsCard({
  actions,
}: {
  actions: { label: string; href: string; icon?: React.ReactNode }[];
}) {
  return (
    <div className="dash-panel">
      <h3 className="font-heading text-sm font-semibold text-slate-800">Quick Actions</h3>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="h-full">
            <div className="group flex h-full items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition-all duration-200 hover:border-brand-blue/25 hover:bg-white hover:shadow-md hover:shadow-brand-blue/5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue/5 text-brand-blue shadow-sm ring-1 ring-brand-blue/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white group-hover:ring-transparent group-hover:shadow-md group-hover:shadow-brand-blue/20">
                {action.icon ?? <Package className="h-4 w-4" />}
              </div>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-blue">
                {action.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
