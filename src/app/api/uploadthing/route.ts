import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";
import { getUploadthingToken } from "@/lib/uploadthing-env";

const token = getUploadthingToken();

if (!token && process.env.NODE_ENV === "development") {
  console.warn(
    "[uploadthing] Missing UPLOADTHING_TOKEN — company/product image uploads will fail until configured.",
  );
}

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: { token },
});
