/** Truncate text to roughly `ratio` of length, ending on a word boundary. */
export function previewText(text: string, ratio = 0.5): { preview: string; isTruncated: boolean } {
  const trimmed = text.trim();
  if (!trimmed) return { preview: "", isTruncated: false };

  const target = Math.max(120, Math.floor(trimmed.length * ratio));
  if (trimmed.length <= target + 80) {
    return { preview: trimmed, isTruncated: false };
  }

  const slice = trimmed.slice(0, target);
  const lastSpace = slice.lastIndexOf(" ");
  const preview = (lastSpace > target * 0.7 ? slice.slice(0, lastSpace) : slice).trimEnd() + "…";
  return { preview, isTruncated: true };
}

/** Show roughly half of a list for public product overview pages. */
export function previewList<T>(items: T[], ratio = 0.5): { visible: T[]; hiddenCount: number } {
  if (items.length <= 2) return { visible: items, hiddenCount: 0 };
  const visibleCount = Math.max(2, Math.ceil(items.length * ratio));
  if (visibleCount >= items.length) return { visible: items, hiddenCount: 0 };
  return { visible: items.slice(0, visibleCount), hiddenCount: items.length - visibleCount };
}
