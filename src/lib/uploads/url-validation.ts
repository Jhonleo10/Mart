/**
 * Server-safe stored image URL validation.
 * Production (Vercel): cloud URLs only — never /uploads/ or data: URLs.
 */
export function isAllowedStoredImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith("data:")) return false;

  if (trimmed.startsWith("/uploads/")) {
    return process.env.VERCEL !== "1" && process.env.NODE_ENV === "development";
  }

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return false;
  }

  return isAllowedRemoteImageHost(trimmed);
}

/** Client-safe check for pasted / preview URLs in forms. */
export function isValidImageRef(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith("/uploads/")) {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      return host === "localhost" || host === "127.0.0.1";
    }
    return process.env.NODE_ENV === "development";
  }

  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

function isAllowedRemoteImageHost(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host === "utfs.io" || host.endsWith(".utfs.io")) return true;
    if (host === "ufs.sh" || host.endsWith(".ufs.sh")) return true;
    if (host === "uploadthing.com" || host.endsWith(".uploadthing.com")) return true;

    if (host === "images.unsplash.com" || host === "placehold.co") return true;

    if (process.env.NODE_ENV === "development") {
      if (host === "localhost" || host === "127.0.0.1") return true;
      if (parsed.protocol === "https:" || parsed.protocol === "http:") return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function storedImageUrlMessage(): string {
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    return "Each image must be a valid https URL (UploadThing / utfs.io / ufs.sh)";
  }
  return "Each image must be a valid URL, /uploads/ path, or cloud image link";
}
