import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyUserForm } from "./verify-user-form";

export const metadata: Metadata = {
  title: "Verify Email | Genius Mart",
  description: "Verify your email with the one-time code sent to your inbox.",
  robots: { index: false, follow: false },
};

export default function VerifyUserPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
          Loading...
        </div>
      }
    >
      <VerifyUserForm />
    </Suspense>
  );
}
