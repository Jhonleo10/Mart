import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AUTH_PATHS } from "@/lib/auth-paths";

export default async function VerifyCompanyPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Approval Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p>
            Company accounts are reviewed by our admin team after registration. You will
            receive an email when your seller account is activated.
          </p>
          <p>After approval, sign in from the login page to access your company dashboard.</p>
          <Button asChild className="w-full">
            <Link href={AUTH_PATHS.login}>Go to Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={AUTH_PATHS.companyRegister}>Register as Seller</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
