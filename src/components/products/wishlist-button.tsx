"use client";



import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Heart } from "lucide-react";

import { toast } from "sonner";

import { toggleWishlist } from "@/actions/user.actions";

import { useWishlist } from "@/components/products/wishlist-context";

import { cn } from "@/lib/utils";



export function WishlistButton({

  productId,

  compact,

  saved: savedProp,

}: {

  productId: string;

  compact?: boolean;

  saved?: boolean;

}) {

  const router = useRouter();

  const wishlist = useWishlist();

  const contextSaved = wishlist?.isSaved(productId);

  const saved = savedProp ?? contextSaved ?? false;

  const [optimisticSaved, setOptimisticSaved] = useState<boolean | null>(null);

  const isSaved = optimisticSaved ?? saved;

  const [pending, startTransition] = useTransition();



  function handleClick(e: React.MouseEvent) {

    e.preventDefault();

    e.stopPropagation();

    startTransition(async () => {

      const nextSaved = !isSaved;

      setOptimisticSaved(nextSaved);

      const result = await toggleWishlist(productId);

      if ("error" in result) {

        setOptimisticSaved(null);

        toast.error(result.error);

        return;

      }

      const added = result.data?.added ?? nextSaved;

      wishlist?.setSaved(productId, added);

      setOptimisticSaved(null);

      toast.success(added ? "Saved to wishlist" : "Removed from saved");

      router.refresh();

    });

  }



  return (

    <button

      type="button"

      onClick={handleClick}

      disabled={pending}

      title={isSaved ? "Remove from saved" : "Save product"}

      className={cn(

        "inline-flex items-center justify-center rounded-lg border transition-colors",

        compact ? "h-8 w-8" : "gap-1 px-2 py-1 text-[11px] font-semibold",

        isSaved

          ? "border-brand-green/30 bg-brand-green/10 text-brand-green"

          : "border-slate-200 bg-white text-slate-500 hover:border-brand-green/30 hover:text-brand-green",

      )}

    >

      <Heart className={cn("h-3.5 w-3.5", isSaved && "fill-brand-green")} />

      {!compact && (isSaved ? "Saved" : "Save")}

    </button>

  );

}

