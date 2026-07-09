/** Shared upload limits — keep in sync with UploadThing router + security/upload.ts */
export const UPLOAD_MAX_FILE_COUNT = 10;
export const UPLOAD_MAX_FILE_SIZE_MB = 4;
export const UPLOAD_MAX_BYTES = UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;
export const UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp";
