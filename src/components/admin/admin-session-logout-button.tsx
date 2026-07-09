"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminForceLogoutSession } from "@/actions/admin-session.actions";

export function AdminSessionLogoutButton({ sessionId }: { sessionId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await adminForceLogoutSession(sessionId);
          if ("error" in result) {
            toast.error(result.error);
            return;
          }
          toast.success("Session revoked");
        });
      }}
    >
      Force logout
    </Button>
  );
}
