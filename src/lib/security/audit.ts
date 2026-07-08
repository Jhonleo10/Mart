import { headers } from "next/headers";
import { auditLogRepository } from "@/repositories/audit-log.repository";

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "LOGOUT_ALL_DEVICES"
  | "USER_REGISTERED"
  | "PRODUCT_CREATED"
  | "PRODUCT_UPDATED"
  | "PRODUCT_DELETED"
  | "PRODUCT_APPROVED"
  | "PRODUCT_REJECTED"
  | "COMPANY_APPROVED"
  | "COMPANY_REJECTED"
  | "COMPANY_PROFILE_SAVED"
  | "PAYMENT_SUCCESS"
  | "USER_ROLE_CHANGED"
  | "LOGIN_FAILED"
  | "ACCOUNT_LOCKED";

interface AuditParams {
  userId?: string;
  action: AuditAction | string;
  entityType: string;
  entityId?: string;
  metadata?: object;
}

export async function auditLog(params: AuditParams) {
  const headerStore = await headers();
  const ipAddress =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    undefined;
  const userAgent = headerStore.get("user-agent") ?? undefined;

  return auditLogRepository.create({
    userId: params.userId,
    action: params.action,
    entity: params.entityType,
    entityId: params.entityId,
    metadata: params.metadata,
    ipAddress,
    userAgent,
  });
}
