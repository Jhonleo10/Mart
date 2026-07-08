import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { bookingRepository } from "@/repositories/booking.repository";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DashboardFilterBar } from "@/components/dashboard/dashboard-filter-bar";
import { DashboardPagination, DASHBOARD_PAGE_SIZE } from "@/components/dashboard/dashboard-pagination";
import { BuyerFlowCallout } from "@/components/user/buyer-flow-callout";
import { Calendar, Clock, ExternalLink, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProductBookDemoPath } from "@/lib/product-public-url";
import type { BookingStatus } from "@prisma/client";
import { resolveMeetingLink } from "@/lib/meetings/meeting-link";

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function UserBookingsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const status = params.status as BookingStatus | undefined;
  const filterParams = { status: params.status };

  const [bookings, total] = await bookingRepository.listByUserPaginated(session.user.id, {
    page,
    limit: DASHBOARD_PAGE_SIZE,
    status: status || undefined,
  });

  return (
    <div className="dash-page-enter animate-in fade-in">
      <DashboardPageHeader
        title="My Bookings"
        description="Demo requests you submitted — vendors review these before confirming a meeting."
      />

      <BuyerFlowCallout className="mb-4" />

      <DashboardFilterBar
        basePath="/user/bookings"
        values={filterParams}
        resultCount={total}
        resultLabel="bookings"
        fields={[
          {
            name: "status",
            type: "select",
            label: "Status",
            options: [
              { value: "NEW", label: "New" },
              { value: "CONTACTED", label: "Contacted" },
              { value: "QUALIFIED", label: "Qualified" },
              { value: "CONVERTED", label: "Converted" },
              { value: "CLOSED", label: "Closed" },
            ],
          },
        ]}
      />

      <div className="mt-4 space-y-4">
        {bookings.map((booking) => (
          <DashboardPanel key={booking.id} className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {booking.product ? (
                  <>
                    <Link
                      href={getProductBookDemoPath(booking.product.slug)}
                      className="font-semibold text-brand-blue hover:text-brand-blue-dark"
                    >
                      {booking.product.name}
                    </Link>
                    <p className="text-sm text-slate-500">{booking.product.company.name}</p>
                  </>
                ) : (
                  <p className="font-semibold text-slate-900">Vendor inquiry</p>
                )}
                {(booking.preferredDate || booking.preferredTime) && (
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                    {booking.preferredDate && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(booking.preferredDate)}
                      </span>
                    )}
                    {booking.preferredTime && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {booking.preferredTime}
                      </span>
                    )}
                  </div>
                )}
                {(() => {
                  const joinLink = booking.demoMeeting
                    ? resolveMeetingLink(booking.demoMeeting)
                    : booking.meetingLink;
                  const showJoin =
                    joinLink &&
                    (booking.demoMeeting?.status === "SCHEDULED" || booking.status === "CONTACTED");
                  return showJoin ? (
                    <a
                      href={joinLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-green/10 px-3 py-2 text-sm font-medium text-brand-green hover:bg-brand-green/20"
                    >
                      <Video className="h-4 w-4" />
                      Join Meeting
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null;
                })()}
                {booking.demoMeeting ? (
                  <Link
                    href={`/user/meetings/${booking.demoMeeting.id}`}
                    className="mt-2 block text-xs text-brand-blue hover:underline"
                  >
                    View meeting details
                  </Link>
                ) : null}
                <p className="mt-2 text-xs text-slate-400">Booked {formatDate(booking.createdAt)}</p>
              </div>
              <StatusBadge status={booking.status} />
            </div>
          </DashboardPanel>
        ))}
        {bookings.length === 0 && (
          <DashboardPanel className="p-12 text-center text-slate-500">
            <p>No bookings match your filters.</p>
            <Link href="/user/discover" className="mt-3 inline-block">
              <Button variant="outline">Discover software</Button>
            </Link>
          </DashboardPanel>
        )}
      </div>

      <DashboardPagination
        total={total}
        page={page}
        basePath="/user/bookings"
        searchParams={filterParams}
      />
    </div>
  );
}
