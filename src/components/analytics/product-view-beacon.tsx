"use client";

import { useEffect, useRef } from "react";

export function ProductViewBeacon({ productId }: { productId: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || !productId) return;
    sent.current = true;

    void fetch("/api/analytics/product-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
      keepalive: true,
    }).catch(() => {
      // Non-blocking analytics — ignore client-side failures
    });
  }, [productId]);

  return null;
}
