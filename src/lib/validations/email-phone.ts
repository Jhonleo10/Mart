import { FIELD_LIMITS } from "./fields";

export const EMAIL_MUST_START_LOWERCASE = "Email must start with a lowercase letter";
export const EMAIL_INVALID = "Enter a valid email address";
export const PHONE_EXACT_TEN_DIGITS = "Phone number must be exactly 10 digits";
export const PHONE_INVALID_CHARS =
  "Phone number can only contain digits, +, spaces, (), ., and -";

/** Strip formatting and optional +91 / leading 0 country prefixes. */
export function normalizePhoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function hasExactPhoneDigits(value: string): boolean {
  return normalizePhoneDigits(value).length === FIELD_LIMITS.phone.exact;
}

export function emailStartsWithLowercase(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && /^[a-z]/.test(trimmed);
}

export function isValidEmailFormat(value: string): boolean {
  const trimmed = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function emailValidityMessage(
  value: string,
  options: { required?: boolean; label?: string } = {},
): string | null {
  const { required = false, label = "Email" } = options;
  const trimmed = value.trim();

  if (!trimmed) {
    return required ? `${label} is required` : null;
  }
  if (trimmed.length > FIELD_LIMITS.email.max) {
    return `${label} must be at most ${FIELD_LIMITS.email.max} characters`;
  }
  if (!emailStartsWithLowercase(trimmed)) {
    return EMAIL_MUST_START_LOWERCASE;
  }
  if (!isValidEmailFormat(trimmed)) {
    return EMAIL_INVALID;
  }
  return null;
}

export function normalizeEmailInput(value: string): string {
  return value.trim().toLowerCase();
}
