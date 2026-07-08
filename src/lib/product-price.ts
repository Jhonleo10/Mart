/** Public-facing price label — pricing model is discussed in demo, not shown. */
export function formatProductPriceLabel(price: number | null | undefined): string | null {
  if (price != null && !Number.isNaN(price) && price > 0) {
    return `₹${price.toLocaleString("en-IN")}`;
  }
  return null;
}

export function formatProductPriceOrDemoNote(price: number | null | undefined): string {
  return formatProductPriceLabel(price) ?? "Discuss in demo";
}
