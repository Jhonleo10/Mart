import { FIELD_LIMITS, PASSWORD_HINT, EMAIL_HINT, PHONE_HINT } from "./fields";
import { emailValidityMessage } from "./email-phone";
import { phoneValidityMessage } from "./phone-input";

const PASSWORD_RULES = [
  { test: (v: string) => v.length >= FIELD_LIMITS.password.min, message: "Password must be at least 8 characters" },
  { test: (v: string) => /[A-Z]/.test(v), message: "Password must contain an uppercase letter" },
  { test: (v: string) => /[a-z]/.test(v), message: "Password must contain a lowercase letter" },
  { test: (v: string) => /[0-9]/.test(v), message: "Password must contain a number" },
  { test: (v: string) => /[^A-Za-z0-9]/.test(v), message: "Password must contain a special character" },
] as const;

export function validatePasswordComplexity(password: string): string | null {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) return rule.message;
  }
  return null;
}

export function validatePasswordMatch(password: string, confirmPassword: string): string | null {
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
}

export function validateEmail(email: string): string | null {
  return emailValidityMessage(email, { required: true, label: "Email" });
}

export function validatePhone(phone: string, required = true): string | null {
  return phoneValidityMessage(phone, { required, label: "Phone" });
}

export function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) return `${label} is required`;
  return null;
}

export { PASSWORD_HINT, EMAIL_HINT, PHONE_HINT, FIELD_LIMITS };
