import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
  variant?: "light" | "dark";
}

const sizes = {
  sm: { box: "h-9 w-9 sm:h-10 sm:w-10", text: "text-sm sm:text-base", img: 40 },
  md: { box: "h-11 w-11 sm:h-12 sm:w-12", text: "text-base sm:text-lg", img: 48 },
  lg: { box: "h-14 w-14 sm:h-16 sm:w-16", text: "text-xl sm:text-2xl", img: 64 },
};

export function BrandLogo({
  showText = true,
  size = "sm",
  className,
  href = "/",
  variant = "light",
}: BrandLogoProps) {
  const s = sizes[size];
  const content = (
    <>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105",
          s.box,
        )}
      >
        <Image
          src={BRAND.logoSrc}
          alt={BRAND.logoAlt}
          width={s.img}
          height={s.img}
          className="h-full w-full object-contain object-center"
          priority
        />
      </div>
      {showText && (
        <span
          className={cn(
            "font-heading min-w-0 font-bold tracking-tight",
            s.text,
            variant === "light" ? "text-slate-900" : "text-white",
          )}
        >
          <span className="text-brand-blue">Genius</span>{" "}
          <span className="text-brand-green">Mart</span>
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("flex min-w-0 items-center gap-2 sm:gap-2.5", className)}>
        {content}
      </Link>
    );
  }

  return <div className={cn("flex min-w-0 items-center gap-2 sm:gap-2.5", className)}>{content}</div>;
}
