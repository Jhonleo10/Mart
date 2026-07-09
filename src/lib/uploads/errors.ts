/** Map upload errors to actionable user-facing messages. */
export function mapUploadError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "Upload failed";

  const lower = message.toLowerCase();

  if (lower.includes("invalid token") || lower.includes("missing token")) {
    return "UploadThing is not configured. Set UPLOADTHING_TOKEN in Vercel (V7 token, no quotes) and redeploy.";
  }

  if (lower.includes("unauthorized") || lower.includes("401")) {
    return "Sign in as a company account to upload images.";
  }

  if (lower.includes("forbidden") || lower.includes("403")) {
    return "Your account does not have permission to upload files.";
  }

  if (lower.includes("file is too large") || lower.includes("exceeds") || lower.includes("too large")) {
    return "File is too large. Maximum size is 4 MB.";
  }

  if (lower.includes("invalid file type") || lower.includes("invalid file extension")) {
    return "Invalid file type. Allowed: JPG, PNG, WebP.";
  }

  if (lower.includes("network") || lower.includes("failed to fetch") || lower.includes("fetch failed")) {
    return "Network error while uploading. Check your connection and try again.";
  }

  if (lower.includes("not available in production") || lower.includes("uploadthing")) {
    return message;
  }

  if (lower.includes("no url returned")) {
    return "Upload completed but no image URL was returned. Please try again.";
  }

  return message || "Unexpected upload error. Please try again.";
}
