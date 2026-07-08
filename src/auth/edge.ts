import NextAuth from "next-auth";
import { authConfig } from "@/auth/config";
import { edgeCallbacks } from "@/auth/callbacks";

/**
 * Edge-safe Auth.js instance for middleware ONLY.
 *
 * - No Prisma
 * - No database adapters
 * - No credential providers
 * - No Node.js-only APIs
 */
const edgeAuth = NextAuth({
  ...authConfig,
  callbacks: edgeCallbacks,
});

export const { auth: edgeAuthMiddleware } = edgeAuth;
