import { FIELD_LIMITS } from "./fields";
import {
  hasExactPhoneDigits,
  normalizePhoneDigits,
  PHONE_EXACT_TEN_DIGITS,
  PHONE_INVALID_CHARS,
} from "./email-phone";

/** Allowed characters in phone fields — digits, +, spaces, (), ., - */
export const PHONE_INPUT_PATTERN = "[+\\d\\s().-]*";

const PHONE_CHAR_REGEX = /[^+\d\s().-]/g;

export { normalizePhoneDigits };

export function sanitizePhoneInput(value: string): string {
  const cleaned = value.replace(PHONE_CHAR_REGEX, "");
  const digits = normalizePhoneDigits(cleaned);
  if (digits.length <= FIELD_LIMITS.phone.exact) {
    return cleaned;
  }
  return digits.slice(0, FIELD_LIMITS.phone.exact);
}

export function hasInvalidPhoneCharacters(value: string): boolean {
  return /[^+\d\s().-]/.test(value);
}

export function getPhoneDigitCount(value: string): number {
  return normalizePhoneDigits(value).length;
}

export function phoneValidityMessage(
  value: string,
  options: { required?: boolean; label?: string } = {},
): string | null {
  const { required = false, label = "Phone" } = options;
  const trimmed = value.trim();

  if (!trimmed) {
    return required ? `${label} is required` : null;
  }
  if (hasInvalidPhoneCharacters(trimmed)) {
    return PHONE_INVALID_CHARS;
  }
  if (!hasExactPhoneDigits(trimmed)) {
    return PHONE_EXACT_TEN_DIGITS;
  }
  if (trimmed.length > FIELD_LIMITS.phone.max) {
    return `${label} must be at most ${FIELD_LIMITS.phone.max} characters`;
  }
  return null;
}

export function applyPhoneValidity(
  input: HTMLInputElement,
  options?: { required?: boolean; label?: string },
) {
  const message = phoneValidityMessage(input.value, options);
  input.setCustomValidity(message ?? "");
  return message;
}

export function handlePhoneInput(event: React.FormEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  const cleaned = sanitizePhoneInput(input.value);
  if (cleaned !== input.value) {
    input.value = cleaned;
  }
  const digits = normalizePhoneDigits(cleaned);
  if (digits.length > FIELD_LIMITS.phone.exact) {
    input.value = digits.slice(0, FIELD_LIMITS.phone.exact);
  }
}
