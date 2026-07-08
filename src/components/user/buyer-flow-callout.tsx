import Link from "next/link";
import { Calendar, Video } from "lucide-react";

export function BuyerFlowCallout({ className = "" }: { className?: string }) {
  return (
    <div
      className={`discovery-glass rounded-2xl border border-slate-200/80 bg-white/80 p-4 sm:p-5 ${className}`}
    >
      <p className="text-sm font-semibold text-slate-800">Bookings vs Meetings</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
          <div>
            <p className="text-xs font-semibold text-slate-800">
              <Link href="/user/bookings" className="hover:text-brand-blue">
                My Bookings
              </Link>
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Demo requests you submitted — track status while the vendor reviews.
            </p>
          </div>
        </div>
        <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
          <Video className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-dark" />
          <div>
            <p className="text-xs font-semibold text-slate-800">
              <Link href="/user/meetings" className="hover:text-brand-green-dark">
                My Meetings
              </Link>
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Confirmed calls with join links — appears after the vendor schedules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
