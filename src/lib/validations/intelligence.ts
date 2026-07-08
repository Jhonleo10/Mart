import { z } from "zod";

const businessSizeSchema = z.enum(["solo", "small", "medium", "enterprise"]);

export const userRequirementsSchema = z.object({
  industry: z.string().max(120).optional(),
  businessSize: z.union([businessSizeSchema, z.string().max(50)]).optional(),
  budgetMax: z.number().int().min(0).max(100_000_000).optional(),
  requiredFeatures: z.array(z.string().max(120)).max(30).optional(),
  preferredIntegrations: z.array(z.string().max(120)).max(30).optional(),
  companyType: z.string().max(120).optional(),
  deploymentPreference: z.enum(["cloud", "on_premise", "hybrid", "any"]).or(z.string().max(50)).optional(),
  country: z.string().max(80).optional(),
});

export const intelligenceSearchQuerySchema = z.object({
  q: z.string().max(200).default(""),
  page: z.coerce.number().int().min(1).max(100).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  category: z.string().max(80).optional(),
  sort: z.string().max(40).optional(),
});

export type UserRequirementsInput = z.infer<typeof userRequirementsSchema>;
