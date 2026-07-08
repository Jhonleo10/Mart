"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock, Loader2, MessageSquare, UserRound } from "lucide-react";
import { createBooking } from "@/actions/booking.actions";
import { getAvailableBookingSlots, getNextBookableDate } from "@/actions/company-availability.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailInput } from "@/components/ui/email-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { BookDemoDatePicker } from "@/components/ui/book-demo-date-picker";
import { AuthFormField } from "@/components/ui/auth-form-field";
import { AUTH_PATHS, loginWithCallback, registerWithCallback } from "@/lib/auth-paths";
import { minBookableDate } from "@/lib/date-utils";
import { FIELD_LIMITS, EMAIL_HINT, PHONE_HINT } from "@/lib/validations/fields";
import { bookingSchema } from "@/lib/validations";
import { getValidatedForm } from "@/lib/validations/form-submit";
import type { BookingSlotWithStatus } from "@/lib/booking-time-slots";
import { cn } from "@/lib/utils";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useZodFormErrors } from "@/hooks/use-zod-form-errors";

interface BookingFormProps {
  productId: string;
  companyId: string;
  className?: string;
  isLoggedIn: boolean;
  returnUrl?: string;
  defaultValues?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export function BookingForm({
  productId,
  companyId,
  className,
  isLoggedIn,
  returnUrl,
  defaultValues,
}: BookingFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { confirm, confirmDialog } = useConfirmDialog();
  const { fieldError, validateAll, validateField } = useZodFormErrors(bookingSchema);

  const [preferredDate, setPreferredDate] = useState(minBookableDate());
  const [preferredTime, setPreferredTime] = useState("");
  const [slots, setSlots] = useState<BookingSlotWithStatus[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initializingDate, setInitializingDate] = useState(isLoggedIn);

  function blurField(fieldName: string) {
    const form = formRef.current;
    if (form) validateField(form, fieldName);
  }

  function buildFormData(form: HTMLFormElement): FormData {
    const formData = new FormData(form);
    formData.set("productId", productId);
    formData.set("preferredDate", preferredDate);
    formData.set("preferredTime", preferredTime);
    return formData;
  }

  useEffect(() => {
    if (!isLoggedIn) {
      setInitializingDate(false);
      return;
    }

    let cancelled = false;
    void getNextBookableDate(companyId).then(({ date }) => {
      if (!cancelled && date) setPreferredDate(date);
      if (!cancelled) setInitializingDate(false);
    });

    return () => {
      cancelled = true;
    };
  }, [companyId, isLoggedIn]);

  async function loadSlots(date: string) {
    setLoadingSlots(true);
    const result = await getAvailableBookingSlots(companyId, date);
    setSlots(result.slots);
    setPreferredTime((current) =>
      result.slots.some((slot) => slot.value === current && slot.status === "available")
        ? current
        : "",
    );
    setLoadingSlots(false);
    if ("error" in result && result.error) toast.error(result.error);
  }

  useEffect(() => {
    if (!isLoggedIn || !preferredDate || initializingDate) {
      if (!isLoggedIn) {
        setSlots([]);
        setPreferredTime("");
      }
      return;
    }

    let cancelled = false;
    void loadSlots(preferredDate).then(() => {
      if (cancelled) return;
    });

    const interval = setInterval(() => {
      if (!cancelled) void loadSlots(preferredDate);
    }, 20000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [companyId, preferredDate, isLoggedIn, initializingDate]);

  useEffect(() => {
    if (preferredTime && formRef.current) {
      validateField(formRef.current, "preferredTime");
    }
  }, [preferredTime, validateField]);

  const availableCount = slots.filter((slot) => slot.status === "available").length;
  const pastOnlyDay =
    slots.length > 0 && availableCount === 0 && slots.every((slot) => slot.status === "past");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = getValidatedForm(e);
    if (!form) return;

    if (!isLoggedIn) {
      toast.error("Please sign in as a buyer to book a demo");
      return;
    }

    const formData = buildFormData(form);
    if (!validateAll(formData)) return;

    const ok = await confirm({
      title: "Confirm demo booking?",
      description: "Your request will be sent to the vendor with your selected date and time slot.",
      confirmLabel: "Book demo",
      variant: "default",
    });
    if (!ok) return;

    setSubmitting(true);
    const result = await createBooking(formData);
    setSubmitting(false);

    if ("error" in result) {
      toast.error(result.error);
      if (preferredDate) void loadSlots(preferredDate);
      return;
    }

    toast.success("Demo request submitted! Track status under My Bookings.");
    router.push("/user/bookings");
    router.refresh();
  }

  if (!isLoggedIn) {
    const loginHref = returnUrl ? loginWithCallback(returnUrl) : AUTH_PATHS.login;
    const registerHref = returnUrl ? registerWithCallback(returnUrl) : AUTH_PATHS.userRegister;

    return (
      <div className={cn("rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-4 text-sm", className)}>
        <p className="font-medium text-slate-800">Sign in to book a demo</p>
        <p className="mt-1 text-slate-600">
          Browse products freely — create a free buyer account to schedule demos with verified vendors.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={loginHref}>
            <Button size="sm">Sign in to book</Button>
          </Link>
          <Link href={registerHref}>
            <Button size="sm" variant="outline">
              Create free account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn("space-y-5", className)}
      noValidate
    >
      {confirmDialog}
      <input type="hidden" name="productId" value={productId} />

      <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
            <UserRound className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Your details</h3>
            <p className="text-xs text-slate-500">How the vendor can reach you</p>
          </div>
        </div>

        <div className="space-y-4">
          <AuthFormField label="Full name" htmlFor="booking-name" error={fieldError("name")}>
            <Input
              id="booking-name"
              name="name"
              required
              minLength={FIELD_LIMITS.name.min}
              maxLength={FIELD_LIMITS.name.max}
              defaultValue={defaultValues?.name}
              placeholder="John Doe"
              className={cn(fieldError("name") && "border-red-500")}
              aria-invalid={!!fieldError("name")}
              onBlur={() => blurField("name")}
            />
          </AuthFormField>

          <AuthFormField label="Email" htmlFor="booking-email" error={fieldError("email")}>
            {defaultValues?.email ? (
              <>
                <Input
                  id="booking-email"
                  type="email"
                  value={defaultValues.email}
                  readOnly
                  className="bg-slate-50"
                />
                <input type="hidden" name="email" value={defaultValues.email} />
              </>
            ) : (
              <EmailInput
                id="booking-email"
                name="email"
                required
                defaultValue={defaultValues?.email}
                placeholder="you@company.com"
                className={cn(fieldError("email") && "border-red-500")}
                aria-invalid={!!fieldError("email")}
                onBlur={() => blurField("email")}
              />
            )}
            <p className="text-[11px] text-slate-400">{EMAIL_HINT}</p>
          </AuthFormField>

          <AuthFormField label="Phone" htmlFor="booking-phone" error={fieldError("phone")}>
            <PhoneInput
              id="booking-phone"
              name="phone"
              required
              minDigits={FIELD_LIMITS.phone.exact}
              maxLength={FIELD_LIMITS.phone.exact}
              defaultValue={defaultValues?.phone}
              placeholder="9876543210"
              className={cn(fieldError("phone") && "border-red-500")}
              aria-invalid={!!fieldError("phone")}
              onBlur={() => blurField("phone")}
            />
            <p className="text-[11px] text-slate-400">{PHONE_HINT}</p>
          </AuthFormField>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-blue/15 bg-gradient-to-br from-brand-blue/[0.04] to-brand-green/[0.04] p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green/15 text-brand-green-dark">
            <CalendarClock className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Pick date & time</h3>
            <p className="text-xs text-slate-500">Choose when you would like the live demo</p>
          </div>
        </div>

        <AuthFormField
          label="Preferred date"
          htmlFor="booking-date"
          error={fieldError("preferredDate")}
        >
          <BookDemoDatePicker
            value={preferredDate}
            onChange={(date) => {
              setPreferredDate(date);
              blurField("preferredDate");
            }}
            min={minBookableDate()}
          />
          <input type="hidden" name="preferredDate" value={preferredDate} />
        </AuthFormField>

        <AuthFormField
          label="Time slot"
          htmlFor="booking-time-slot"
          error={fieldError("preferredTime")}
          className="mt-4"
        >
          {loadingSlots && slots.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading available slots…
            </p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-amber-700">
              No slots available on this date. Try another day or contact the vendor directly.
            </p>
          ) : pastOnlyDay ? (
            <p className="text-sm text-amber-700">
              All slots on this date have passed. Pick a future date above to see open times.
            </p>
          ) : (
            <div id="booking-time-slot" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((slot) => {
                const isPast = slot.status === "past";
                const isBooked = slot.status === "booked";
                const isDisabled = isPast || isBooked;
                const isSelected = preferredTime === slot.value;

                return (
                  <button
                    key={slot.availabilityId ?? slot.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setPreferredTime(slot.value)}
                    className={cn(
                      "buyer-pill rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                      isDisabled && "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400",
                      !isDisabled &&
                        isSelected &&
                        "border-brand-green/50 bg-brand-green/15 text-slate-900 shadow-sm ring-2 ring-brand-green/25",
                      !isDisabled &&
                        !isSelected &&
                        "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-brand-blue/30 hover:bg-brand-blue/5 hover:shadow-sm",
                    )}
                  >
                    <span className="font-medium">{slot.label}</span>
                    <span
                      className={cn(
                        "mt-0.5 block text-xs",
                        isDisabled ? "text-slate-400" : isSelected ? "text-brand-green-dark" : "text-slate-500",
                      )}
                    >
                      {isPast ? "Unavailable" : isBooked ? "Booked" : isSelected ? "Selected" : "Available"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <input type="hidden" name="preferredTime" value={preferredTime} />
        </AuthFormField>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <MessageSquare className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Demo notes</h3>
            <p className="text-xs text-slate-500">Optional — tell the vendor what to cover</p>
          </div>
        </div>

        <AuthFormField
          label="Message (optional)"
          htmlFor="booking-message"
          error={fieldError("message")}
        >
          <Textarea
            id="booking-message"
            name="message"
            rows={3}
            maxLength={FIELD_LIMITS.bookingMessage.max}
            placeholder="Tell the vendor what you'd like to see in the demo"
            className={cn(fieldError("message") && "border-red-500")}
            aria-invalid={!!fieldError("message")}
            onBlur={() => blurField("message")}
          />
        </AuthFormField>
      </section>

      <Button
        type="submit"
        className="w-full bg-gradient-brand py-6 text-base font-semibold shadow-md shadow-brand-blue/15 transition hover:opacity-95"
        disabled={submitting || loadingSlots || initializingDate || availableCount === 0 || !preferredTime}
      >
        {submitting ? "Booking..." : "Book live demo"}
      </Button>
    </form>
  );
}
