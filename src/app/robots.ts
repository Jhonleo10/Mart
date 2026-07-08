import type { MetadataRoute } from "next";
import { resolveAppBaseUrl } from "@/lib/app-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = await resolveAppBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/company/", "/user/", "/api/", "/verify-user", "/verify-company"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
