import { Suspense } from "react";
import LoginForm from "./login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
