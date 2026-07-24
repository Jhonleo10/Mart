"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialogUI } from "@/components/ui/confirm-dialog";
import { signOutAction } from "@/actions/auth.actions";

interface LogoutButtonProps {
  variant?: "outline" | "ghost" | "default";
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({
  variant = "outline",
  size = "sm",
  className,
  children,
}: LogoutButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    await signOutAction();
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children ?? "Sign Out"}
      </Button>
      <ConfirmDialogUI
        open={open}
        options={{
          title: "Sign Out",
          description: "Are you sure you want to sign out?",
          confirmLabel: pending ? "Signing out…" : "Sign Out",
          cancelLabel: "Cancel",
          variant: "default",
        }}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
