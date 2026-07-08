"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmVariant = "default" | "destructive" | "warning";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

const VARIANT_META: Record<
  ConfirmVariant,
  {
    icon: typeof CheckCircle2;
    label: string;
    shell: string;
    ring: string;
    orb: string;
    accent: string;
    confirmBtn: string;
  }
> = {
  default: {
    icon: Sparkles,
    label: "Confirm action",
    shell: "confirm-dialog-shell--default",
    ring: "confirm-dialog-ring--default",
    orb: "confirm-dialog-orb--default",
    accent: "from-brand-blue/20 via-brand-blue/5 to-brand-green/15",
    confirmBtn: "confirm-dialog-btn--default",
  },
  destructive: {
    icon: AlertTriangle,
    label: "Irreversible",
    shell: "confirm-dialog-shell--destructive",
    ring: "confirm-dialog-ring--destructive",
    orb: "confirm-dialog-orb--destructive",
    accent: "from-red-500/20 via-rose-400/10 to-orange-400/10",
    confirmBtn: "confirm-dialog-btn--destructive",
  },
  warning: {
    icon: ShieldAlert,
    label: "Proceed carefully",
    shell: "confirm-dialog-shell--warning",
    ring: "confirm-dialog-ring--warning",
    orb: "confirm-dialog-orb--warning",
    accent: "from-amber-500/25 via-amber-400/10 to-yellow-300/10",
    confirmBtn: "confirm-dialog-btn--warning",
  },
};

export function ConfirmDialogUI({
  open,
  options,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const variant = options.variant ?? "default";
  const meta = VARIANT_META[variant];
  const Icon = meta.icon;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="confirm-dialog-content max-w-[min(100%,24rem)] gap-0 overflow-hidden border-0 bg-transparent p-0 shadow-none max-h-none">
        <div className={cn("confirm-dialog-shell", meta.shell)}>
          <div className={cn("confirm-dialog-orb", meta.orb)} aria-hidden />
          <div className={cn("confirm-dialog-orb confirm-dialog-orb--secondary", meta.orb)} aria-hidden />

          <div className="confirm-dialog-card">
            <div
              className={cn(
                "confirm-dialog-card-accent absolute inset-0 bg-gradient-to-br opacity-80",
                meta.accent,
              )}
              aria-hidden
            />

            <button
              type="button"
              onClick={onCancel}
              className="confirm-dialog-close"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="confirm-dialog-body relative z-10 flex flex-col items-center text-center">
              <div className={cn("confirm-dialog-icon-wrap", meta.ring)}>
                <div className="confirm-dialog-icon-ring confirm-dialog-icon-ring--outer" aria-hidden />
                <div className="confirm-dialog-icon-ring confirm-dialog-icon-ring--inner" aria-hidden />
                <div className="confirm-dialog-icon-inner">
                  <Icon className="h-6 w-6" strokeWidth={2.2} />
                </div>
              </div>

              <p className="confirm-dialog-eyebrow">{meta.label}</p>
              <DialogTitle className={cn("confirm-dialog-title", `confirm-dialog-title--${variant}`)}>
                {options.title}
              </DialogTitle>
              {options.description ? (
                <DialogDescription className="confirm-dialog-description">
                  {options.description}
                </DialogDescription>
              ) : null}
            </div>

            <div className="confirm-dialog-actions relative z-10">
              <Button
                type="button"
                variant="ghost"
                className="confirm-dialog-btn-cancel"
                onClick={onCancel}
              >
                {options.cancelLabel ?? "Not now"}
              </Button>
              <Button
                type="button"
                className={cn("confirm-dialog-btn-confirm", meta.confirmBtn)}
                onClick={onConfirm}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4 opacity-90" />
                {options.confirmLabel ?? "Yes, continue"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
