"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { submitMeetingFeedbackAction } from "@/actions/meeting.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StarRatingInput } from "@/components/ui/star-rating";
import { getValidatedForm } from "@/lib/validations/form-submit";
import { FIELD_LIMITS } from "@/lib/validations/fields";

export function MeetingFeedbackForm({
  meetingId,
  productName,
}: {
  meetingId: string;
  productName?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = getValidatedForm(e);
    if (!form) return;

    if (rating < 1) {
      toast.error("Please select a star rating");
      return;
    }

    setLoading(true);
    const formData = new FormData(form);
    formData.set("meetingId", meetingId);
    formData.set("rating", String(rating));
    const result = await submitMeetingFeedbackAction(formData);
    setLoading(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Thank you! Your review has been published.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <Label>Your rating</Label>
        <div className="mt-2">
          <StarRatingInput value={rating} onChange={setRating} disabled={loading} />
        </div>
      </div>
      <div>
        <Label htmlFor="feedback">Your review</Label>
        <textarea
          id="feedback"
          name="feedback"
          required
          minLength={FIELD_LIMITS.feedback.min}
          maxLength={FIELD_LIMITS.feedback.max}
          rows={4}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          placeholder={
            productName
              ? `Share your experience with ${productName} — what went well and what could improve?`
              : "Share your experience — what went well and what could improve?"
          }
        />
        <p className="mt-1 text-xs text-slate-400">Minimum 10 characters. Your review will appear on the product page.</p>
      </div>
      <Button type="submit" size="sm" disabled={loading || rating < 1}>
        {loading ? "Publishing review..." : "Publish review"}
      </Button>
    </form>
  );
}
