"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RegistrationSuccessDialogProps {
  open: boolean;
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export function RegistrationSuccessDialog({
  open,
  title,
  message,
  actionLabel,
  onAction,
}: RegistrationSuccessDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-success-title"
        className="w-full max-w-md animate-in zoom-in-95 rounded-2xl border border-white/60 bg-white p-6 shadow-2xl"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/10">
          <CheckCircle2 className="h-8 w-8 text-brand-green" />
        </div>
        <h2 id="registration-success-title" className="mt-4 text-center text-xl font-bold text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">{message}</p>
        <Button className="mt-6 h-11 w-full font-semibold" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
