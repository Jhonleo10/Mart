const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function validateImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const ext = parsed.pathname.slice(parsed.pathname.lastIndexOf(".")).toLowerCase();
    return ALLOWED_EXTENSIONS.has(ext) || parsed.hostname.includes("utfs.io") || parsed.hostname.endsWith(".ufs.sh");
  } catch {
    return false;
  }
}

export function validateUploadFile(file: { type: string; size: number; name: string }): {
  valid: boolean;
  error?: string;
} {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: "Invalid file type. Allowed: JPG, PNG, WEBP" };
  }

  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: "Invalid file extension" };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { valid: false, error: "File exceeds 5 MB limit" };
  }

  return { valid: true };
}
