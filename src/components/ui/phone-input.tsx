"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { FIELD_LIMITS } from "@/lib/validations/fields";
import {
  applyPhoneValidity,
  handlePhoneInput,
  PHONE_INPUT_PATTERN,
  sanitizePhoneInput,
} from "@/lib/validations/phone-input";

type PhoneInputProps = React.ComponentProps<typeof Input> & {
  minDigits?: number;
  phoneLabel?: string;
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      onInput,
      onChange,
      onBlur,
      required,
      minDigits = FIELD_LIMITS.phone.exact,
      phoneLabel = "Phone",
      type: _type,
      inputMode,
      pattern,
      maxLength,
      ...props
    },
    ref,
  ) => (
    <Input
      ref={ref}
      type="tel"
      inputMode={inputMode ?? "tel"}
      autoComplete="tel"
      pattern={pattern ?? PHONE_INPUT_PATTERN}
      maxLength={maxLength ?? FIELD_LIMITS.phone.max}
      required={required}
      onInput={(e) => {
        handlePhoneInput(e);
        applyPhoneValidity(e.currentTarget, { required, label: phoneLabel });
        onInput?.(e);
      }}
      onChange={(e) => {
        const cleaned = sanitizePhoneInput(e.target.value);
        if (cleaned !== e.target.value) {
          e.target.value = cleaned;
        }
        onChange?.({
          ...e,
          target: { ...e.target, value: cleaned },
          currentTarget: { ...e.currentTarget, value: cleaned },
        });
      }}
      onBlur={(e) => {
        applyPhoneValidity(e.currentTarget, { required, label: phoneLabel });
        onBlur?.(e);
      }}
      {...props}
    />
  ),
);
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
