import type { ZodError } from "zod";

export function firstZodError(error: ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}

export function isTermsAccepted(formData: FormData): boolean {
  const value = formData.get("terms");
  return value === "on" || value === "true" || value === "1";
}

export function requireTermsAccepted(formData: FormData): void {
  if (!isTermsAccepted(formData)) {
    throw new Error("You must accept the Terms of Service and Privacy Policy");
  }
}
