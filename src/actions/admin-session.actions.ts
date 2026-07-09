"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { auditLog } from "@/lib/security/audit";
import { handleActionError } from "@/lib/errors";
import { userSessionService } from "@/services/user-session.service";
import type { ActionResult } from "@/lib/action-types";

export async function adminForceLogoutSession(sessionId: string): Promise<ActionResult> {
  try {
    const session = await requireRole("ADMIN");
    await userSessionService.adminForceLogout(sessionId);
    await auditLog({
      userId: session.user.id,
      action: "ADMIN_FORCE_LOGOUT",
      entityType: "UserSession",
      entityId: sessionId,
    });
    revalidatePath("/admin/sessions");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
