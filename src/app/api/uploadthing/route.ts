import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";
import { getUploadthingToken } from "@/lib/uploadthing-env";

// Let UploadThing read UPLOADTHING_TOKEN from env at request time.
// Do not pass `token: undefined` from module scope — that blocks env fallback.
const uploadthingToken = getUploadthingToken();

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  ...(uploadthingToken ? { config: { token: uploadthingToken } } : {}),
});
