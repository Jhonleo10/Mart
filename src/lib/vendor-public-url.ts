import { getProductBookDemoPath } from "@/lib/product-public-url";

export type VendorPublicUrlContext = {
  slug: string;
};

/** Canonical marketplace profile path for a vendor. */
export function getVendorPublicPath(company: VendorPublicUrlContext): string {
  return `/companies/${company.slug}`;
}

/** Public product detail page (overview + book demo). */
export function getPrimaryProductPublicPath(slug: string): string {
  return getProductBookDemoPath(slug);
}
