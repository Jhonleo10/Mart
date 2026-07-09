import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleActionError, AppError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { saveLocalImage, type UploadFolder } from "@/lib/uploads/local";
import { uploadLog } from "@/lib/uploads/logger";

export const runtime = "nodejs";

const ALLOWED_FOLDERS = new Set<UploadFolder>(["products", "companies"]);

export async function POST(request: Request) {
  try {
    if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
      throw new AppError(
        "Local file uploads are disabled in production. Images are uploaded via UploadThing.",
        503,
      );
    }

    const session = await auth();
    if (!session?.user) {
      throw new AppError("Unauthorized — sign in to upload.", 401);
    }

    if (session.user.role !== "COMPANY" && session.user.role !== "ADMIN") {
      throw new AppError("Forbidden — company account required.", 403);
    }

    const limit = await rateLimit(session.user.id, "api");
    if (!limit.success) {
      throw new AppError("Too many upload attempts. Please wait a moment.", 429);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "products");

    if (!(file instanceof File)) {
      throw new AppError("No file provided", 400);
    }

    if (!ALLOWED_FOLDERS.has(folder as UploadFolder)) {
      throw new AppError("Invalid upload folder", 400);
    }

    const url = await saveLocalImage(file, folder as UploadFolder);
    uploadLog("api", "info", "local upload ok", { folder, userId: session.user.id });
    return NextResponse.json({ success: true, url });
  } catch (error) {
    uploadLog("api", "error", "local upload failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    const result = handleActionError(error);
    const status = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(result, { status });
  }
}
