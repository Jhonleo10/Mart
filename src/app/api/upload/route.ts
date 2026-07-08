import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleActionError, AppError } from "@/lib/errors";
import { saveLocalImage, type UploadFolder } from "@/lib/uploads/local";

const ALLOWED_FOLDERS = new Set<UploadFolder>(["products", "companies"]);

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AppError("Unauthorized", 401);
    }

    if (session.user.role !== "COMPANY" && session.user.role !== "ADMIN") {
      throw new AppError("Forbidden", 403);
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
    return NextResponse.json({ success: true, url });
  } catch (error) {
    const result = handleActionError(error);
    const status = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(result, { status });
  }
}
