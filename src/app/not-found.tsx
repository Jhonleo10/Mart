import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="safe-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-blue">404</p>
      <h1 className="font-heading mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Page not found</h1>
      <p className="mt-3 max-w-md text-slate-600">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    </div>
  );
}
