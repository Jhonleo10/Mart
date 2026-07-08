import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { validateUploadFile } from "@/lib/security/upload";
import { AppError } from "@/lib/errors";

export type UploadFolder = "products" | "companies";

export async function saveLocalImage(file: File, folder: UploadFolder): Promise<string> {
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

  return `/uploads/${folder}/${uniqueName}`;
}

export async function saveLocalImages(files: File[], folder: UploadFolder): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    try {
      urls.push(await saveLocalImage(file, folder));
    } catch {
      // skip invalid entries
    }
  }
  return urls;
}
