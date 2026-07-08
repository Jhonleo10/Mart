"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProduct } from "@/actions/product.actions";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const ok = await confirm({
      title: `Delete "${productName}"?`,
      description:
        "This permanently removes the product and its listings. Bookings and history tied to this product may be affected.",
      confirmLabel: "Delete product",
      variant: "destructive",
    });
    if (!ok) return;

    setLoading(true);
    const result = await deleteProduct(productId);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("Product deleted");
    router.refresh();
  }

  return (
    <>
      {confirmDialog}
      <Button type="button" size="sm" variant="destructive" disabled={loading} onClick={handleDelete}>
        {loading ? "Deleting..." : "Delete"}
      </Button>
    </>
  );
}
