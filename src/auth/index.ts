/**
 * Auth.js module — production architecture entry points.
 *
 * - `@/auth/config`     — Edge-safe shared config
 * - `@/auth/callbacks`  — Edge-safe + shared route protection
 * - `@/auth/providers`  — Node.js credential provider (Prisma)
 * - `@/auth/edge`       — Middleware-only Auth.js instance
 * - `@/auth/node`       — Full Auth.js (Prisma adapter, DB callbacks)
 * - `@/lib/auth`        — Backward-compatible re-export of node auth
 */

export { authConfig } from "./config";
export { edgeCallbacks, authorizedCallback } from "./callbacks";
export { edgeAuthMiddleware } from "./edge";
export {
  auth,
  handlers,
  signIn,
  signOut,
  requireAuth,
  requireRole,
  logoutAllDevices,
} from "./node";
