"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  approveProduct,
  rejectProduct,
  toggleProductFeatured,
  unverifyProduct,
} from "@/actions/product.actions";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { BadgeCheck, ShieldOff, Star, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

type BtnProps = {
  productId: string;
  productName: string;
  compact?: boolean;
};

export function AdminVerifyProductButton({ productId, productName, compact }: BtnProps) {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    const ok = await confirm({
      title: `Grant verified badge to "${productName}"?`,
      description:
        "This product is already live on the marketplace. The verified badge highlights admin-reviewed quality.",
      confirmLabel: "Grant verified badge",
      variant: "default",
    });
    if (!ok) return;

    setLoading(true);
    const result = await approveProduct(productId);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("Verified badge granted");
    router.refresh();
  }

  return (
    <>
      {confirmDialog}
      <Button
        type="button"
        size="sm"
        variant="green"
        disabled={loading}
        className={cn("gap-1", compact && "admin-action-chip admin-action-chip-verify h-8 px-2.5")}
        onClick={handleVerify}
        title="Grant verified badge"
      >
        <BadgeCheck className="h-3.5 w-3.5" />
        {!compact && (loading ? "Saving..." : "Verify")}
      </Button>
    </>
  );
}

export function AdminUnverifyProductButton({ productId, productName, compact }: BtnProps) {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [loading, setLoading] = useState(false);

  async function handleUnverify() {
    const ok = await confirm({
      title: `Remove verified badge from "${productName}"?`,
      description: "The product stays live — only the admin verified badge is removed.",
      confirmLabel: "Remove badge",
      variant: "warning",
    });
    if (!ok) return;

    setLoading(true);
    const result = await unverifyProduct(productId);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("Verified badge removed");
    router.refresh();
  }

  return (
    <>
      {confirmDialog}
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={loading}
        className={cn("gap-1", compact && "admin-action-chip h-8 px-2.5")}
        onClick={handleUnverify}
        title="Remove verified badge"
      >
        <ShieldOff className="h-3.5 w-3.5" />
        {!compact && (loading ? "Saving..." : "Unverify")}
      </Button>
    </>
  );
}

export function AdminRejectProductButton({ productId, productName, compact }: BtnProps) {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [loading, setLoading] = useState(false);

  async function handleReject() {
    const ok = await confirm({
      title: `Unpublish "${productName}"?`,
      description: "This removes the product from the public marketplace. The vendor will be notified.",
      confirmLabel: "Unpublish",
      variant: "destructive",
    });
    if (!ok) return;

    setLoading(true);
    const result = await rejectProduct(productId);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("Product unpublished");
    router.refresh();
  }

  return (
    <>
      {confirmDialog}
      <Button
        type="button"
        size="sm"
        variant="destructive"
        disabled={loading}
        className={cn("gap-1", compact && "admin-action-chip admin-action-chip-danger h-8 px-2.5")}
        onClick={handleReject}
        title="Unpublish product"
      >
        <Ban className="h-3.5 w-3.5" />
        {!compact && (loading ? "Saving..." : "Unpublish")}
      </Button>
    </>
  );
}

export function AdminFeaturedProductButton({
  productId,
  productName,
  featured,
  compact,
}: BtnProps & { featured: boolean }) {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const ok = await confirm({
      title: featured ? `Remove "${productName}" from featured?` : `Feature "${productName}"?`,
      description: featured
        ? "This product will no longer appear in featured sections on the homepage."
        : "This product will be highlighted in featured marketplace sections.",
      confirmLabel: featured ? "Remove featured" : "Mark featured",
      variant: featured ? "warning" : "default",
    });
    if (!ok) return;

    setLoading(true);
    const result = await toggleProductFeatured(productId);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success(featured ? "Removed from featured" : "Marked as featured");
    router.refresh();
  }

  return (
    <>
      {confirmDialog}
      <Button
        type="button"
        size="sm"
        variant={featured ? "outline" : "default"}
        disabled={loading}
        className={cn("gap-1", compact && "admin-action-chip admin-action-chip-feature h-8 px-2.5")}
        onClick={handleToggle}
        title={featured ? "Remove from featured" : "Mark as featured"}
      >
        <Star className={cn("h-3.5 w-3.5", featured && "fill-amber-400 text-amber-400")} />
        {!compact && (loading ? "Saving..." : featured ? "Unfeature" : "Feature")}
      </Button>
    </>
  );
}

/** @deprecated Use AdminVerifyProductButton */
export const AdminApproveProductButton = AdminVerifyProductButton;
