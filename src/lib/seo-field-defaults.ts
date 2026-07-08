/** Ensure SEO fields meet validation rules used by landing save actions. */

export function ensureMetaTitle(value: string | null | undefined, companyName: string): string {
  const raw = (value?.trim() || `${companyName} — Software Vendor`).slice(0, 70);
  if (raw.length >= 10) return raw;
  return `${companyName} Software`.slice(0, 70);
}

export function ensureMetaDescription(
  value: string | null | undefined,
  companyName: string,
  description?: string | null,
): string {
  const base = (
    value?.trim() ||
    description?.trim() ||
    `Discover software products by ${companyName}. Book demos and compare solutions on Genius Mart.`
  ).slice(0, 160);

  if (base.length >= 40) return base;

  const padded = `${base} Explore verified software, book demos, and grow with ${companyName}.`;
  return padded.slice(0, 160);
}
