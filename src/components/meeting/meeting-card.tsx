import Link from "next/link";
import { getProductBookDemoPath } from "@/lib/product-public-url";
import { resolveMeetingLink } from "@/lib/meetings/meeting-link";
import {
  formatCountdown,
  isMeetingUpcoming,
} from "@/lib/meetings/meeting-window";
import {
  Calendar,
  Clock,
  Download,
  ExternalLink,
  MessageSquare,
  Video,
} from "lucide-react";
import { MeetingStatusBadge } from "./meeting-status";
import { MeetingActions } from "./meeting-actions";
import { MeetingReviewDisplay } from "./meeting-review-display";
import { buildGoogleCalendarUrl } from "@/lib/meetings/ics";
import { cn } from "@/lib/utils";
import type { MeetingProvider, MeetingStatus } from "@prisma/client";

export interface MeetingCardData {
  id: string;
  status: MeetingStatus;
  scheduledAt: Date;
  durationMinutes: number;
  timezone: string;
  meetingLink?: string | null;
  googleMeetLink?: string | null;
  meetingProvider?: MeetingProvider | null;
  notes?: string | null;
  feedback?: string | null;
  feedbackRating?: number | null;
  booking: {
    id: string;
    name: string;
    email: string;
    phone: string;
    product?: { name: string; slug?: string } | null;
    company: { name: string };
  };
}

function formatScheduled(date: Date, timezone: string) {
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  });
}

function formatDateOnly(date: Date, timezone: string) {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: timezone,
  });
}

function formatTimeOnly(date: Date, timezone: string) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  });
}

export function MeetingCard({
  meeting,
  role,
  showCustomer = false,
  variant = "list",
}: {
  meeting: MeetingCardData;
  role: "USER" | "COMPANY" | "ADMIN";
  showCustomer?: boolean;
  variant?: "list" | "detail";
}) {
  const now = new Date();
  const productName = meeting.booking.product?.name ?? "Product Demo";
  const joinLink = resolveMeetingLink(meeting);
  const canJoin = meeting.status === "SCHEDULED" && Boolean(joinLink);
  const upcoming = isMeetingUpcoming(meeting.scheduledAt, meeting.status, now);
  const countdown = upcoming ? formatCountdown(meeting.scheduledAt, now) : null;
  const needsReview =
    role === "USER" &&
    meeting.status === "COMPLETED" &&
    !meeting.feedback &&
    Boolean(meeting.booking.product);
  const gcalUrl = buildGoogleCalendarUrl({
    title: `${productName} — Demo`,
    description: joinLink ? `Join: ${joinLink}` : "",
    start: meeting.scheduledAt,
    end: new Date(meeting.scheduledAt.getTime() + meeting.durationMinutes * 60 * 1000),
    location: joinLink ?? undefined,
  });

  const isBuyerUpcoming = role === "USER" && upcoming;

  return (
    <article
      className={cn(
        "buyer-card-hover overflow-hidden rounded-2xl border bg-white shadow-sm transition-all",
        isBuyerUpcoming
          ? "border-brand-blue/20 bg-gradient-to-br from-white via-brand-blue/[0.03] to-brand-green/[0.02]"
          : "border-slate-200/80",
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="min-w-0 flex-1">
          {isBuyerUpcoming ? (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-blue">
                Upcoming Meeting
              </span>
              {countdown ? (
                <span className="rounded-full bg-brand-green/10 px-2.5 py-0.5 text-[10px] font-semibold text-brand-green-dark">
                  {countdown}
                </span>
              ) : null}
            </div>
          ) : null}

          {meeting.booking.product?.slug ? (
            <Link
              href={getProductBookDemoPath(meeting.booking.product.slug)}
              className="font-heading text-lg font-semibold text-brand-blue transition hover:text-brand-blue-dark"
            >
              {productName}
            </Link>
          ) : (
            <p className="font-heading text-lg font-semibold text-slate-900">{productName}</p>
          )}
          <p className="mt-0.5 text-sm text-slate-500">{meeting.booking.company.name}</p>

          {showCustomer ? (
            <p className="mt-2 text-sm text-slate-600">
              {meeting.booking.name} · {meeting.booking.email}
            </p>
          ) : null}

          <div
            className={cn(
              "mt-4 grid gap-3 sm:grid-cols-2",
              isBuyerUpcoming && "rounded-xl border border-slate-100 bg-white/80 p-3",
            )}
          >
            <div className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                <Calendar className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Date</p>
                <p className="font-medium">{formatDateOnly(meeting.scheduledAt, meeting.timezone)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green-dark">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Time</p>
                <p className="font-medium">
                  {formatTimeOnly(meeting.scheduledAt, meeting.timezone)} · {meeting.durationMinutes} min
                </p>
                <p className="text-xs text-slate-400">{meeting.timezone}</p>
              </div>
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-400 sm:hidden">
            {formatScheduled(meeting.scheduledAt, meeting.timezone)}
          </p>

          {meeting.notes ? (
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <span className="font-medium text-slate-700">Notes:</span> {meeting.notes}
            </p>
          ) : null}

          {canJoin ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={joinLink!}
                target="_blank"
                rel="noopener noreferrer"
                className="buyer-pill inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-green to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-green/20 transition hover:opacity-95"
              >
                <Video className="h-4 w-4" />
                Join Meeting
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={`/api/meetings/${meeting.id}/ics`}
                className="buyer-pill inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                ICS
              </a>
              <a
                href={gcalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="buyer-pill inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                Google Calendar
              </a>
            </div>
          ) : null}

          {needsReview ? (
            <Link
              href={`/user/meetings/${meeting.id}`}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Leave your review
            </Link>
          ) : null}

          {variant === "list" && meeting.feedback && meeting.feedbackRating ? (
            <div className="mt-3">
              <MeetingReviewDisplay
                rating={meeting.feedbackRating}
                feedback={meeting.feedback}
                role={role}
              />
            </div>
          ) : null}

          {role === "USER" ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
              <Link
                href={`/user/meetings/${meeting.id}`}
                className="text-xs font-semibold text-brand-blue hover:underline"
              >
                View details
              </Link>
              <MeetingActions
                meetingId={meeting.id}
                status={meeting.status}
                role={role}
                scheduledAt={meeting.scheduledAt.toISOString()}
                timezone={meeting.timezone}
                durationMinutes={meeting.durationMinutes}
              />
            </div>
          ) : role === "COMPANY" ? (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <MeetingActions
                meetingId={meeting.id}
                status={meeting.status}
                role={role}
                scheduledAt={meeting.scheduledAt.toISOString()}
                timezone={meeting.timezone}
                durationMinutes={meeting.durationMinutes}
              />
            </div>
          ) : null}
        </div>

        <div className="shrink-0 self-start sm:pt-1">
          <MeetingStatusBadge status={meeting.status} />
        </div>
      </div>
    </article>
  );
}
