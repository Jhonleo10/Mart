import { phoneValidityMessage } from "./phone-input";

export function validatePhoneValue(phone: string, required = true, label = "Phone"): string | null {
  return phoneValidityMessage(phone, { required, label });
}

export function validateWebsiteValue(website: string, required = false): string | null {
  const trimmed = website.trim();
  if (!trimmed) return required ? "Website is required" : null;
  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) {
      return "Website must start with http:// or https://";
    }
    return null;
  } catch {
    return "Enter a valid website URL (e.g. https://example.com)";
  }
}
