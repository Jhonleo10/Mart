import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";
import { getUploadthingToken, syncUploadthingEnv } from "@/lib/uploadthing-env";
import { resolveAppBaseUrl } from "@/lib/app-url";
import { uploadLog } from "@/lib/uploads/logger";

export const runtime = "nodejs";

async function handleUploadthing(req: NextRequest, method: "GET" | "POST") {
  syncUploadthingEnv();
  const token = getUploadthingToken();

  if (!token) {
    uploadLog("uploadthing", "error", "missing or invalid UPLOADTHING_TOKEN");
    return NextResponse.json(
      {
        error:
          "UPLOADTHING_TOKEN is missing or invalid. Set the V7 token in Vercel (no quotes) and redeploy.",
      },
      { status: 503 },
    );
  }

  const baseUrl = await resolveAppBaseUrl();
  const handlers = createRouteHandler({
    router: ourFileRouter,
    config: {
      token,
      callbackUrl: `${baseUrl}/api/uploadthing`,
    },
  });

  return method === "GET" ? handlers.GET(req) : handlers.POST(req);
}

export async function GET(req: NextRequest) {
  return handleUploadthing(req, "GET");
}

export async function POST(req: NextRequest) {
  return handleUploadthing(req, "POST");
}
