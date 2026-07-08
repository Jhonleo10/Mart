export const ADMIN_UNLOCK_STORAGE_KEY = "dgm-admin-unlock";
export const ADMIN_UNLOCK_QUERY = "staff";
export const ADMIN_UNLOCK_VALUE = "genius";
export const ADMIN_BOOTSTRAP_DEFAULT = "genius-mart-admin";

export function isAdminRegistrationUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_UNLOCK_STORAGE_KEY) === "1";
}

export function unlockAdminRegistration(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ADMIN_UNLOCK_STORAGE_KEY, "1");
}
