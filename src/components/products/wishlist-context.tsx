"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface WishlistContextValue {
  savedIds: Set<string>;
  isSaved: (productId: string) => boolean;
  setSaved: (productId: string, saved: boolean) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({
  initialIds,
  children,
}: {
  initialIds: string[];
  children: React.ReactNode;
}) {
  const [savedIds, setSavedIds] = useState(() => new Set(initialIds));

  const setSaved = useCallback((productId: string, saved: boolean) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (saved) next.add(productId);
      else next.delete(productId);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      savedIds,
      isSaved: (productId: string) => savedIds.has(productId),
      setSaved,
    }),
    [savedIds, setSaved],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
