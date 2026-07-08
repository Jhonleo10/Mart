/** Shared field limits — keep in sync with Zod schemas in index.ts */
export const FIELD_LIMITS = {
  name: { min: 2, max: 100 },
  companyName: { min: 2, max: 120 },
  ownerName: { min: 2, max: 100 },
  email: { max: 254 },
  phone: { min: 10, max: 20, exact: 10 },
  password: { min: 8, max: 128 },
  description: { min: 20, max: 5000 },
  shortDescription: { min: 10, max: 200 },
  fullDescription: { min: 50, max: 10000 },
  productName: { min: 2, max: 120 },
  industry: { min: 2, max: 100 },
  subject: { min: 3, max: 200 },
  contactMessage: { min: 10, max: 2000 },
  bookingMessage: { max: 1000 },
  adminNote: { min: 10, max: 2000 },
  feedback: { min: 10, max: 2000 },
  otp: { length: 6 },
} as const;

export const PASSWORD_HINT =
  "8+ characters with uppercase, lowercase, number, and special character";

export const EMAIL_HINT = "Must start with a lowercase letter (e.g. you@company.com)";

export const PHONE_HINT = "Enter a 10-digit mobile number";
