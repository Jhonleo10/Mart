"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import type { PricingPlan } from "@/lib/settings/defaults";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlanCheckoutButtonProps {
  plan: PricingPlan;
  className?: string;
}

export function PlanCheckoutButton({ plan, className }: PlanCheckoutButtonProps) {
  const isGreen = plan.accent === "green";

  return (
    <Link href={plan.href} className={cn("block", className)}>
      <Button
        className={cn("w-full", isGreen && "bg-brand-green hover:bg-brand-green-dark")}
        variant={isGreen ? "default" : plan.highlighted ? "default" : "outline"}
      >
        Subscribe Now
      </Button>
    </Link>
  );
}
