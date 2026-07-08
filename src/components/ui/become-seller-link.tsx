import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AUTH_PATHS } from "@/lib/auth-paths";
import { cn } from "@/lib/utils";

interface BecomeSellerLinkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const sizeClasses = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function BecomeSellerLink({
  className,
  size = "sm",
  showIcon = true,
}: BecomeSellerLinkProps) {
  return (
    <Link
      href={AUTH_PATHS.companyRegister}
      className={cn("become-seller-gradient group", sizeClasses[size], className)}
    >
      <span className="become-seller-gradient-text font-semibold">Become a Seller</span>
      {showIcon ? (
        <Sparkles className="h-3.5 w-3.5 text-brand-green opacity-70 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
      ) : null}
    </Link>
  );
}
