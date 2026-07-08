/**
 * Node.js Auth.js entry point.
 * Re-exported from @/auth/node for backward compatibility.
 */
export {
  auth,
  handlers,
  signIn,
  signOut,
  requireAuth,
  requireRole,
  logoutAllDevices,
} from "@/auth/node";
