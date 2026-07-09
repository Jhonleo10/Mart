import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";
import { UPLOAD_MAX_FILE_COUNT } from "@/lib/uploads/constants";
import { uploadLog } from "@/lib/uploads/logger";

const f = createUploadthing();

/** Don't block the client on server callback — return ufsUrl as soon as storage upload completes. */
const routeOptions = { awaitServerData: false as const };

function assertCanUpload(userId: string, role: string | undefined): { userId: string } {
  if (!role || (role !== "COMPANY" && role !== "ADMIN")) {
    throw new Error("Unauthorized — company account required to upload images.");
  }
  return { userId };
}

export const ourFileRouter = {
  companyLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } }, routeOptions)
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new Error("Unauthorized — sign in to upload.");
      return assertCanUpload(session.user.id, session.user.role);
    })
    .onUploadComplete(async ({ metadata, file }) => {
      uploadLog("uploadthing", "info", "companyLogo uploaded", {
        userId: metadata.userId,
        size: file.size,
      });
      return { uploadedBy: metadata.userId, url: file.ufsUrl || file.url };
    }),

  productImages: f(
    { image: { maxFileSize: "4MB", maxFileCount: UPLOAD_MAX_FILE_COUNT } },
    routeOptions,
  )
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new Error("Unauthorized — sign in to upload.");
      return assertCanUpload(session.user.id, session.user.role);
    })
    .onUploadComplete(async ({ metadata, file }) => {
      uploadLog("uploadthing", "info", "productImages uploaded", {
        userId: metadata.userId,
        size: file.size,
      });
      return { uploadedBy: metadata.userId, url: file.ufsUrl || file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
