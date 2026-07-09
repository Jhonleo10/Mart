/**
 * Local `public/uploads` only on localhost dev.
 * Production / Vercel always uses UploadThing.
 */
export function preferLocalFileUploads(): boolean {
  if (process.env.VERCEL === "1") return false;
  if (process.env.NODE_ENV === "production") return false;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1";
  }

  return process.env.NODE_ENV === "development";
}

export function usesCloudUploads(): boolean {
  return !preferLocalFileUploads();
}
