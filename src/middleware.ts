import { edgeAuthMiddleware } from "@/auth/edge";

/**
 * Route protection middleware.
 *
 * Uses the Edge-safe Auth.js config (no Prisma/providers) with the stable
 * Node.js middleware runtime (Next.js 15.5+) to avoid Edge/jose bundling
 * limitations while keeping auth logic isolated from database code.
 */
export default edgeAuthMiddleware;

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
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-user",
    "/verify-company",
  ],
};
