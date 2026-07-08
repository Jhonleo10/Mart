import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { meetingRepository } from "@/repositories/meeting.repository";
import { MeetingCard } from "@/components/meeting/meeting-card";
import { MeetingFeedbackForm } from "@/components/meeting/meeting-feedback-form";
import { MeetingReviewDisplay } from "@/components/meeting/meeting-review-display";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserMeetingDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const meeting = await meetingRepository.findById(id);
  if (!meeting || meeting.booking.userId !== session.user.id) {
    redirect("/user/meetings");
  }

  return (
    <div className="dash-page-enter animate-in fade-in max-w-3xl">
      <DashboardPageHeader title="Meeting Details" description="Join link, calendar, and feedback" />
      <MeetingCard meeting={meeting} role="USER" variant="detail" />
      {meeting.status === "COMPLETED" && !meeting.feedback ? (
        <DashboardPanel className="mt-4 p-5">
          <h3 className="font-semibold text-slate-900">Rate your demo experience</h3>
          <p className="mt-1 text-sm text-slate-500">
            Your 5-star rating and review will be published on{" "}
            <strong>{meeting.booking.product?.name ?? "the product"}</strong> to help other buyers.
          </p>
          <MeetingFeedbackForm
            meetingId={meeting.id}
            productName={meeting.booking.product?.name}
          />
        </DashboardPanel>
      ) : null}
      {meeting.feedback && meeting.feedbackRating ? (
        <DashboardPanel className="mt-4 p-5">
          <h3 className="font-semibold text-slate-900">Review published</h3>
          <MeetingReviewDisplay
            rating={meeting.feedbackRating}
            feedback={meeting.feedback}
            role="USER"
          />
        </DashboardPanel>
      ) : null}
    </div>
  );
}
