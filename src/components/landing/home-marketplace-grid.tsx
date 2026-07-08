"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ShopProductCard, type ShopProductCardData } from "@/components/landing/shop-product-card";
import { Button } from "@/components/ui/button";

/** 3 columns × 4 rows on desktop */
export const MARKETPLACE_GRID_INITIAL_COUNT = 12;

export function HomeMarketplaceGrid({ products }: { products: ShopProductCardData[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = products.length > MARKETPLACE_GRID_INITIAL_COUNT;
  const visibleProducts = expanded
    ? products
    : products.slice(0, MARKETPLACE_GRID_INITIAL_COUNT);
  const remainingCount = products.length - MARKETPLACE_GRID_INITIAL_COUNT;

  return (
    <>
      <div className="shop-grid grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((product, i) => (
          <div key={product.id} className="shop-grid-item min-w-0">
            <ShopProductCard product={product} index={i} layout="grid" />
          </div>
        ))}
      </div>

      {hasMore && !expanded ? (
        <div className="mt-10 flex justify-center">
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="shop-marketplace-more-btn gap-2 rounded-full border-brand-blue/25 bg-white/90 px-8 font-semibold text-brand-blue shadow-sm hover:border-brand-blue/40 hover:bg-brand-blue/5"
            onClick={() => setExpanded(true)}
          >
            More products
            <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-bold">
              +{remainingCount}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </>
  );
}
