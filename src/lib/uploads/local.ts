import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { validateUploadFile } from "@/lib/security/upload";
import { AppError } from "@/lib/errors";
import { preferLocalFileUploads } from "@/lib/uploads/strategy";
import { uploadLog } from "@/lib/uploads/logger";

export type UploadFolder = "products" | "companies";

function assertLocalUploadAllowed(): void {
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    throw new AppError(
      "Local file uploads are disabled in production. Use UploadThing (UPLOADTHING_TOKEN).",
      503,
    );
  }
  if (!preferLocalFileUploads()) {
    throw new AppError("Local uploads are only available on localhost during development.", 503);
  }
}

export async function saveLocalImage(file: File, folder: UploadFolder): Promise<string> {
  assertLocalUploadAllowed();

  if (!file.name || file.size === 0) {
    throw new AppError("Empty file", 400);
  }

  const check = validateUploadFile({
    type: file.type,
    size: file.size,
    name: file.name,
  });
  if (!check.valid) {
    throw new AppError(check.error ?? "Invalid file", 400);
  }

  const uploadDir = join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${safeName}`;
  const bytes = await file.arrayBuffer();
  await writeFile(join(uploadDir, uniqueName), Buffer.from(bytes));

  const url = `/uploads/${folder}/${uniqueName}`;
  uploadLog("local", "info", "saved file", { folder, bytes: file.size });
  return url;
}
