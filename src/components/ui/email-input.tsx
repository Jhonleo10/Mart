"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { FIELD_LIMITS } from "@/lib/validations/fields";
import { normalizeEmailInput } from "@/lib/validations/email-phone";

type EmailInputProps = React.ComponentProps<typeof Input>;

const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ onBlur, onChange, type: _type, maxLength, ...props }, ref) => (
    <Input
      ref={ref}
      type="email"
      autoComplete="email"
      maxLength={maxLength ?? FIELD_LIMITS.email.max}
      {...props}
      onChange={onChange}
      onBlur={(e) => {
        const normalized = normalizeEmailInput(e.target.value);
        if (normalized !== e.target.value) {
          e.target.value = normalized;
        }
        onBlur?.(e);
      }}
    />
  ),
);

EmailInput.displayName = "EmailInput";

export { EmailInput };
