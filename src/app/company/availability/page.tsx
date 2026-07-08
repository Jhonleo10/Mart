import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { AUTH_PATHS } from "@/lib/auth-paths";
import { companyRepository } from "@/repositories/company.repository";
import { bookingTimeSlotRepository } from "@/repositories/booking-time-slot.repository";
import { companyAvailabilityRepository } from "@/repositories/company-availability.repository";
import {
  CompanyAvailabilityForm,
  type DateScheduleSummary,
} from "@/components/company/company-availability-form";
import { CompanyBookingSlotsForm } from "@/components/company/company-booking-slots-form";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";
import { parseDateOnly, formatDateInput } from "@/lib/date-utils";
import type { BookingStatus } from "@prisma/client";
import { AlertTriangle } from "lucide-react";

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ["NEW", "CONTACTED", "QUALIFIED"];
const OVERVIEW_DAYS = 21;

function buildDateSummaries(
  fromDate: Date,
  rawAvailability: Awaited<ReturnType<typeof companyAvailabilityRepository.listByCompany>>,
): DateScheduleSummary[] {
  const summaries: DateScheduleSummary[] = [];
  const grouped = new Map<string, { open: number; booked: number }>();

  for (const entry of rawAvailability) {
    const key = formatDateInput(entry.date);
    const current = grouped.get(key) ?? { open: 0, booked: 0 };
    current.open += 1;
    if (
      entry.booking &&
      ACTIVE_BOOKING_STATUSES.includes(entry.booking.status as BookingStatus)
    ) {
      current.booked += 1;
    }
    grouped.set(key, current);
  }

  for (let i = 0; i < OVERVIEW_DAYS; i++) {
    const d = new Date(fromDate);
    d.setUTCDate(d.getUTCDate() + i);
    const key = formatDateInput(d);
    const stats = grouped.get(key) ?? { open: 0, booked: 0 };
    summaries.push({
      date: key,
      openCount: stats.open,
      bookedCount: stats.booked,
    });
  }

  return summaries;
}

export default async function CompanyAvailabilityPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") redirect("/login");

  const company = await companyRepository.findByUserId(session.user.id);
  if (!company) redirect(AUTH_PATHS.companyRegister);
  if (company.status !== "APPROVED") redirect("/company/dashboard");

  const today = parseDateOnly(new Date().toISOString().slice(0, 10));
  const [allSlots, configuredSlots, selectedRows, rawAvailability, upcomingCount] =
    await Promise.all([
      bookingTimeSlotRepository.listAll(),
      bookingTimeSlotRepository.listByCompany(company.id),
      bookingTimeSlotRepository.listSelectedIds(company.id),
      companyAvailabilityRepository.listByCompany(company.id, today),
      companyAvailabilityRepository.countUpcoming(company.id, today),
    ]);

  const upcomingAvailability = rawAvailability.map((entry) => ({
    id: entry.id,
    date: entry.date,
    slotId: entry.bookingTimeSlotId,
    bookingTimeSlot: { label: entry.bookingTimeSlot.label },
    isBooked: Boolean(
      entry.booking && ACTIVE_BOOKING_STATUSES.includes(entry.booking.status as BookingStatus),
    ),
  }));

  const dateSummaries = buildDateSummaries(today, rawAvailability);
  const hasConfiguredSlots = configuredSlots.length > 0;
  const needsAvailability = hasConfiguredSlots && upcomingCount === 0;

  return (
    <div className="animate-in fade-in space-y-6">
      <DashboardPageHeader
        title="Demo Availability"
        description="Open or close specific dates and time slots. Buyers only see slots you mark as available."
      />

      {needsAvailability && (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium">No upcoming demo slots scheduled</p>
            <p className="mt-1 text-amber-800/90">
              Buyers cannot book demos until you open at least one date below.{" "}
              <Link href="#schedule" className="font-medium underline">
                Schedule availability
              </Link>
            </p>
          </div>
        </div>
      )}

      {allSlots.length > 0 ? (
        <CompanyBookingSlotsForm
          allSlots={allSlots}
          selectedSlotIds={selectedRows.map((row) => row.bookingTimeSlotId)}
        />
      ) : null}

      <div id="schedule">
        <CompanyAvailabilityForm
          configuredSlots={configuredSlots}
          upcomingAvailability={upcomingAvailability}
          dateSummaries={dateSummaries}
        />
      </div>
    </div>
  );
}
