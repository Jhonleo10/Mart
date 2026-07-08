"use client";

import { useState } from "react";
import { toast } from "sonner";
import { logoutAllDevicesAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

export function UserProfileLogoutButton() {
  const { confirm, confirmDialog } = useConfirmDialog();
  const [loading, setLoading] = useState(false);

  async function handleLogoutAll() {
    const ok = await confirm({
      title: "Sign out from all devices?",
      description:
        "You will be signed out everywhere. You will need to sign in again on each device.",
      confirmLabel: "Sign out everywhere",
      variant: "warning",
    });
    if (!ok) return;

    setLoading(true);
    try {
      await logoutAllDevicesAction();
    } catch {
      toast.error("Could not sign out from all devices");
      setLoading(false);
    }
  }

  return (
    <>
      {confirmDialog}
      <Button type="button" variant="outline" size="sm" disabled={loading} onClick={handleLogoutAll}>
        {loading ? "Signing out..." : "Sign out from all devices"}
      </Button>
    </>
  );
}
