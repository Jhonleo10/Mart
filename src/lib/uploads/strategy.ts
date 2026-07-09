/**
 * Local `public/uploads` writes only work in local dev.
 * On Vercel (and any non-localhost host) use UploadThing / cloud URLs.
 */
export function preferLocalFileUploads(): boolean {
  if (process.env.VERCEL === "1") return false;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1";
  }

  return process.env.NODE_ENV === "development";
}
