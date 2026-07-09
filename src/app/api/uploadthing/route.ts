import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const runtime = "nodejs";

// SDK reads UPLOADTHING_TOKEN from process.env at request time.
// instrumentation.ts normalizes the token before routes load.
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
