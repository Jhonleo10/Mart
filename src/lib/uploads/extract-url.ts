/** Minimal UploadThing client file shape (v7). */
export type UploadThingFileResult = {
  ufsUrl?: string | null;
  url?: string | null;
  appUrl?: string | null;
  serverData?: { url?: string | null } | null;
};

/** Extract a public image URL from an UploadThing client response object. */
export function extractUploadUrl(file: UploadThingFileResult | null | undefined): string | undefined {
  if (!file) return undefined;

  if (file.ufsUrl?.trim()) return file.ufsUrl.trim();
  if (file.url?.trim()) return file.url.trim();
  if (file.appUrl?.trim()) return file.appUrl.trim();

  const fromServer = file.serverData?.url;
  if (typeof fromServer === "string" && fromServer.trim()) return fromServer.trim();

  return undefined;
}
