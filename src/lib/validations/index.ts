import { z } from "zod";
import { FIELD_LIMITS } from "./fields";
import {
  emailStartsWithLowercase,
  isValidEmailFormat,
  EMAIL_MUST_START_LOWERCASE,
  EMAIL_INVALID,
  hasExactPhoneDigits,
  PHONE_EXACT_TEN_DIGITS,
  PHONE_INVALID_CHARS,
} from "./email-phone";

const emailField = (label = "Email") =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(FIELD_LIMITS.email.max, `${label} must be at most ${FIELD_LIMITS.email.max} characters`)
    .refine(emailStartsWithLowercase, EMAIL_MUST_START_LOWERCASE)
    .email(EMAIL_INVALID);

const optionalEmailField = (label = "Email") =>
  z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? "" : val),
    z.union([z.literal(""), emailField(label)]),
  );

const phoneField = (label = "Phone") =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(FIELD_LIMITS.phone.max, `${label} must be at most ${FIELD_LIMITS.phone.max} characters`)
    .regex(/^[+]?[\d\s().-]+$/, PHONE_INVALID_CHARS)
    .refine(hasExactPhoneDigits, PHONE_EXACT_TEN_DIGITS);

const optionalPhoneField = z.preprocess(
  (val) => (typeof val === "string" && val.trim() === "" ? "" : val),
  z.union([z.literal(""), phoneField("Phone")]),
);

function extractEmailAddress(value: string): string {
  const match = value.match(/<([^>]+)>/);
  return (match ? match[1] : value).trim();
}

const smtpFromEmailField = z
  .string()
  .trim()
  .min(3, "From email is required")
  .max(200)
  .refine((val) => {
    const emailPart = extractEmailAddress(val);
    return emailStartsWithLowercase(emailPart) && isValidEmailFormat(emailPart);
  }, `From address must contain a valid email that starts with a lowercase letter`);

const websiteField = z.union([
  z.literal(""),
  z.string().trim().url("Enter a valid website URL (include https://)"),
]);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain a number")
  .regex(/[^A-Za-z0-9]/, "Must contain a special character");

export const loginSchema = z.object({
  email: emailField("Email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(FIELD_LIMITS.name.min, "Full name must be at least 2 characters")
      .max(FIELD_LIMITS.name.max, "Full name must be at most 100 characters"),
    email: emailField("Email"),
    phone: phoneField("Phone"),
    password: passwordSchema,
    confirmPassword: z.string().min(8, "Please confirm your password"),
    role: z.enum(["USER", "COMPANY"]).default("USER"),
    terms: z
      .union([z.literal("on"), z.literal("true"), z.literal("1")])
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.terms === "on" || data.terms === "true" || data.terms === "1", {
    message: "You must accept the Terms of Service and Privacy Policy",
    path: ["terms"],
  });

const companyRegisterFields = z.object({
  companyName: z
    .string()
    .trim()
    .min(FIELD_LIMITS.companyName.min, "Company name must be at least 2 characters")
    .max(FIELD_LIMITS.companyName.max, "Company name must be at most 120 characters"),
  ownerName: z
    .string()
    .trim()
    .min(FIELD_LIMITS.ownerName.min, "Owner name must be at least 2 characters")
    .max(FIELD_LIMITS.ownerName.max, "Owner name must be at most 100 characters"),
  email: emailField("Email"),
  phone: phoneField("Phone"),
  website: websiteField,
  industry: z
    .string()
    .trim()
    .min(FIELD_LIMITS.industry.min, "Industry must be at least 2 characters")
    .max(FIELD_LIMITS.industry.max, "Industry must be at most 100 characters"),
  password: passwordSchema,
  confirmPassword: z.string().min(8, "Please confirm your password"),
  terms: z
    .union([z.literal("on"), z.literal("true"), z.literal("1")])
    .optional(),
});

export const companyRegisterStep1Schema = companyRegisterFields.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  },
);

export const companyRegisterSchema = companyRegisterFields
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.terms === "on" || data.terms === "true" || data.terms === "1", {
    message: "You must accept the Terms of Service and Privacy Policy",
    path: ["terms"],
  });

export const adminRegisterSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: emailField("Email"),
  password: passwordSchema,
  bootstrapSecret: z.string().min(16, "Bootstrap key is required"),
});

export const adminNoteSchema = z
  .string()
  .min(10, "Please provide at least 10 characters")
  .max(2000, "Note must be at most 2000 characters");

export const verifyOtpSchema = z.object({
  email: emailField("Email"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const companyProfileSchema = z.object({
  name: z.string().min(2, "Company name is required").max(120),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  industry: z.string().min(2, "Industry is required").max(100),
  contactEmail: emailField("Contact email"),
  contactPhone: phoneField("Contact phone"),
  logo: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) =>
        !val ||
        val.startsWith("http://") ||
        val.startsWith("https://") ||
        val.startsWith("/uploads/"),
      "Invalid logo URL",
    ),
});

function coerceStringArray(val: unknown): string[] {
  if (val === null || val === undefined) return [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === "string") return val.trim() ? [val.trim()] : [];
  return [];
}

const productImageArray = z
  .array(
    z.string().min(1).refine(
      (url) =>
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("data:image/") ||
        url.startsWith("/uploads/"),
      { message: "Each image must be a valid URL or uploaded image" },
    ),
  )
  .min(1, "At least one screenshot required");

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required").max(120),
  shortDescription: z.string().min(10, "Short description required").max(200),
  fullDescription: z.string().min(50, "Full description required").max(10000),
  categoryId: z.string().min(1, "Category is required"),
  pricingModel: z.enum([
    "FREE",
    "FREEMIUM",
    "SUBSCRIPTION",
    "ONE_TIME",
    "CUSTOM",
  ]),
  price: z.coerce.number().min(0).optional(),
  features: z.preprocess(
    coerceStringArray,
    z.array(z.string().min(1).max(200)).min(1, "At least one feature required"),
  ),
  websiteUrl: z.string().url("Website URL must start with https://").optional().or(z.literal("")),
  demoUrl: z.string().url("Demo URL must start with https://").optional().or(z.literal("")),
  supportEmail: optionalEmailField("Support email"),
  tags: z.preprocess(coerceStringArray, z.array(z.string()).optional()),
  images: z.preprocess(coerceStringArray, productImageArray),
});

/** Relaxed validation for saving incomplete product drafts */
export const productDraftSchema = z.object({
  name: z.string().min(2, "Product name is required").max(120),
  shortDescription: z.string().max(200).optional().or(z.literal("")),
  fullDescription: z.string().max(10000).optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  pricingModel: z.enum([
    "FREE",
    "FREEMIUM",
    "SUBSCRIPTION",
    "ONE_TIME",
    "CUSTOM",
  ]),
  price: z.coerce.number().min(0).optional(),
  features: z.preprocess(coerceStringArray, z.array(z.string().max(200)).optional()),
  websiteUrl: z.string().url("Website URL must start with https://").optional().or(z.literal("")),
  demoUrl: z.string().url("Demo URL must start with https://").optional().or(z.literal("")),
  supportEmail: optionalEmailField("Support email"),
  tags: z.preprocess(coerceStringArray, z.array(z.string()).optional()),
  images: z
    .preprocess(
      coerceStringArray,
      z.array(
        z.string().min(1).refine(
          (url) =>
            url.startsWith("http://") ||
            url.startsWith("https://") ||
            url.startsWith("data:image/") ||
            url.startsWith("/uploads/"),
          { message: "Each image must be a valid URL or uploaded image" },
        ),
      ),
    )
    .optional(),
});

export const bookingSchema = z.object({
  productId: z.string().min(1),
  name: z
    .string()
    .trim()
    .min(FIELD_LIMITS.name.min, "Full name must be at least 2 characters")
    .max(FIELD_LIMITS.name.max, "Full name must be at most 100 characters"),
  email: emailField("Email"),
  phone: phoneField("Phone"),
  preferredDate: z.string().min(1, "Please select a date"),
  preferredTime: z.string().min(1, "Please select a time slot"),
  message: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z
      .string()
      .max(
        FIELD_LIMITS.bookingMessage.max,
        `Message must be at most ${FIELD_LIMITS.bookingMessage.max} characters`,
      )
      .optional(),
  ),
});

export const pricingPlanSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(120),
  audience: z.string().max(200),
  price: z.string().max(40),
  priceAmount: z.number().int().min(0).nullable(),
  period: z.string().max(40),
  description: z.string().max(500),
  features: z.array(z.string().max(200)).max(30),
  cta: z.string().max(80),
  href: z.string().max(200),
  highlighted: z.boolean(),
  active: z.boolean(),
  accent: z.enum(["blue", "green"]),
  razorpayEnabled: z.boolean(),
});

export const pricingPlansSchema = z
  .array(pricingPlanSchema)
  .min(1, "At least one plan is required")
  .refine((plans) => new Set(plans.map((p) => p.id)).size === plans.length, {
    message: "Each plan must have a unique ID",
  });

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
});

export const userProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  phone: optionalPhoneField,
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailField("Email"),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: emailField("Email"),
  subject: z.string().min(3, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export const contactVendorSchema = z.object({
  companyId: z.string().min(1),
  name: z.string().min(2, "Name is required").max(100),
  email: emailField("Email"),
  phone: phoneField("Phone"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export const generalSettingsSchema = z.object({
  siteName: z.string().min(1).max(120),
  supportEmail: emailField("Support email"),
});

export const smtpSettingsInputSchema = z.object({
  fromEmail: smtpFromEmailField,
  apiKey: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
