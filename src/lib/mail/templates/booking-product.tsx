import { EmailLayout, appUrl } from "../layout";
import type { BookingEmailDetails } from "../types";
import {
  EmailBadge,
  EmailClosing,
  EmailDetailCard,
  EmailDetailRow,
  EmailGreeting,
  EmailHighlight,
  EmailParagraph,
} from "../components";

export function BookingConfirmationEmail(details: BookingEmailDetails) {
  return (
    <EmailLayout
      preview={`Demo request submitted for ${details.productName}`}
      title="Demo Request Submitted"
      subtitle="Your request has been sent to the vendor for review."
      ctaLabel="View My Bookings"
      ctaHref={appUrl("/user/bookings")}
    >
      <EmailBadge tone="green">Booking Confirmed</EmailBadge>
      <EmailGreeting name={details.leadName} />
      <EmailParagraph>
        Your demo request has been submitted successfully. The vendor will review your
        request and may reach out to schedule a live demonstration.
      </EmailParagraph>
      <EmailDetailCard title="Request Details">
        <EmailDetailRow label="Product" value={details.productName} />
        <EmailDetailRow label="Vendor" value={details.companyName} />
        {details.preferredDate ? (
          <EmailDetailRow label="Preferred date" value={details.preferredDate} />
        ) : null}
        {details.preferredTime ? (
          <EmailDetailRow label="Preferred time" value={details.preferredTime} />
        ) : null}
      </EmailDetailCard>
      <EmailHighlight>
        You will receive a separate email when a meeting is scheduled. Track all your
        bookings from your dashboard.
      </EmailHighlight>
      <EmailClosing />
    </EmailLayout>
  );
}

export function BookingStatusUpdateEmail(
  details: BookingEmailDetails & { status: "CONTACTED" | "CLOSED" },
) {
  const isContacted = details.status === "CONTACTED";
  return (
    <EmailLayout
      preview={`Booking update for ${details.productName}`}
      title={isContacted ? "Vendor Will Contact You" : "Demo Request Closed"}
      subtitle={
        isContacted
          ? "The vendor has acknowledged your demo request."
          : "Your demo request has been marked as closed."
      }
      ctaLabel="View My Bookings"
      ctaHref={appUrl("/user/bookings")}
    >
      <EmailBadge tone={isContacted ? "blue" : "neutral"}>
        {isContacted ? "Contacted" : "Closed"}
      </EmailBadge>
      <EmailGreeting name={details.leadName} />
      <EmailParagraph>
        Your demo request for <strong>{details.productName}</strong> with{" "}
        <strong>{details.companyName}</strong> has been updated.
      </EmailParagraph>
      <EmailDetailCard title="Booking Status">
        <EmailDetailRow label="Product" value={details.productName} />
        <EmailDetailRow label="Vendor" value={details.companyName} />
        <EmailDetailRow
          label="Status"
          value={isContacted ? "Vendor will contact you" : "Closed"}
        />
      </EmailDetailCard>
      {isContacted ? (
        <EmailHighlight tone="green">
          The vendor has marked your request as contacted. Expect to hear from them
          shortly regarding next steps or a scheduled demo.
        </EmailHighlight>
      ) : (
        <EmailHighlight tone="neutral">
          This demo request is now closed. You can submit a new request anytime from the
          product page if you would like to reconnect with the vendor.
        </EmailHighlight>
      )}
      <EmailClosing />
    </EmailLayout>
  );
}

export function ProductApprovedEmail({ productName }: { productName: string }) {
  return (
    <EmailLayout
      preview={`${productName} is now live on Genius Mart`}
      title="Product Approved"
      subtitle="Your listing is now visible to buyers on the marketplace."
      ctaLabel="Manage Products"
      ctaHref={appUrl("/company/products")}
    >
      <EmailBadge tone="green">Live on Marketplace</EmailBadge>
      <EmailParagraph>
        Great news! Your product has been reviewed and approved by our team. It is now
        live and discoverable by buyers across Genius Mart.
      </EmailParagraph>
      <EmailDetailCard title="Product Details">
        <EmailDetailRow label="Product" value={productName} />
        <EmailDetailRow label="Status" value="Published" />
      </EmailDetailCard>
      <EmailHighlight tone="green">
        Buyers can now view your product, compare features, and book demos directly from
        your listing page.
      </EmailHighlight>
      <EmailClosing />
    </EmailLayout>
  );
}

export function ProductRejectedEmail({
  productName,
  note,
}: {
  productName: string;
  note?: string;
  supportEmail?: string;
}) {
  return (
    <EmailLayout
      preview="Product review update from Genius Mart"
      title="Product Not Approved"
      subtitle="Your listing requires changes before it can go live."
    >
      <EmailBadge tone="warning">Review Update</EmailBadge>
      <EmailParagraph>
        Thank you for submitting your product for review. Unfortunately, we are unable to
        approve your listing at this time.
      </EmailParagraph>
      <EmailDetailCard title="Product Details">
        <EmailDetailRow label="Product" value={productName} />
        <EmailDetailRow label="Status" value="Not approved" />
        {note ? <EmailDetailRow label="Reason" value={note} /> : null}
      </EmailDetailCard>
      <EmailHighlight tone="neutral">
        Please review the feedback above, update your product listing, and resubmit for
        approval. Our support team is available if you need assistance.
      </EmailHighlight>
      <EmailClosing />
    </EmailLayout>
  );
}
