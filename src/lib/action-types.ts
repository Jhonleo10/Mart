import type { PricingModel } from "@prisma/client";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { error: string };

export interface ProductSearchParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  company?: string;
  industry?: string;
  pricingModel?: PricingModel | string;
  minPrice?: number;
  maxPrice?: number;
  tag?: string;
  sort?: "popular" | "latest" | "trending" | "featured";
  featured?: boolean;
}
