import { auth } from "@/auth/node";

/**
 * Route protection middleware — Node.js runtime with full UserSession validation
 * via the Node Auth.js JWT callback (database-backed, per-browser HttpOnly cookie).
 */
export default auth;

export const config = {
  runtime: "nodejs",
  matcher: [
    "/admin/:path*",
    "/company/:path*",
    "/user/:path*",
    "/products",
    "/products/:path*",
    "/product/:path*",
    "/book/:path*",
    "/software/:path*",
    "/industry/:path*",
    "/compare/:path*",
    "/api/admin/:path*",
    "/api/meetings/:path*",
    "/api/intelligence/:path*",
    "/api/google/:path*",
    "/api/upload",
    "/api/uploadthing/:path*",
    "/api/analytics/:path*",
  ],
};
