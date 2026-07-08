import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";
import { validateUploadFile } from "@/lib/security/upload";

const f = createUploadthing();

export const ourFileRouter = {
  companyLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user || session.user.role !== "COMPANY") {
        throw new Error("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const check = validateUploadFile({
        type: file.type,
        size: file.size,
        name: file.name,
      });
      if (!check.valid) throw new Error(check.error);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  productImages: f({ image: { maxFileSize: "4MB", maxFileCount: 5 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user || session.user.role !== "COMPANY") {
        throw new Error("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const check = validateUploadFile({
        type: file.type,
        size: file.size,
        name: file.name,
      });
      if (!check.valid) throw new Error(check.error);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
