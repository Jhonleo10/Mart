import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
