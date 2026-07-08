/** Canonical public product page (marketplace detail + book demo). */
export function getProductPublicPath(slug: string): string {
  return `/book/${slug}`;
}

/** Buyer flow: book a demo with product overview. */
export function getProductBookDemoPath(slug: string): string {
  return `/book/${slug}`;
}
