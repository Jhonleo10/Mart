"use client";

import { useEffect, useRef } from "react";

export function ComparisonViewBeacon({
  productAId,
  productBId,
  slug,
}: {
  productAId: string;
  productBId: string;
  slug: string;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    void fetch("/api/analytics/comparison-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productAId, productBId, slug }),
      keepalive: true,
    }).catch(() => {
      // Non-blocking analytics
    });
  }, [productAId, productBId, slug]);

  return null;
}
