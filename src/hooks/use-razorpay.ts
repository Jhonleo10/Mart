"use client";

import { useCallback, useEffect, useState } from "react";

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function isRazorpayReady(): boolean {
  return typeof window !== "undefined" && typeof window.Razorpay !== "undefined";
}

let loadPromise: Promise<boolean> | null = null;

function loadRazorpayScript(): Promise<boolean> {
  if (isRazorpayReady()) return Promise.resolve(true);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const finish = (ok: boolean) => {
      if (!ok) loadPromise = null;
      resolve(ok);
    };

    const existing = document.querySelector(
      `script[src="${RAZORPAY_SRC}"]`,
    ) as HTMLScriptElement | null;

    if (existing) {
      if (existing.dataset.loaded === "true" || isRazorpayReady()) {
        finish(true);
        return;
      }

      existing.addEventListener("load", () => finish(isRazorpayReady()), { once: true });
      existing.addEventListener("error", () => finish(false), { once: true });

      const poll = window.setInterval(() => {
        if (isRazorpayReady()) {
          window.clearInterval(poll);
          finish(true);
        }
      }, 80);

      window.setTimeout(() => {
        window.clearInterval(poll);
        if (!isRazorpayReady()) finish(false);
      }, 8000);
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SRC;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      finish(isRazorpayReady());
    };
    script.onerror = () => finish(false);
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** Reliable Razorpay checkout.js loader (Next.js Script onLoad is often missed on client nav). */
export function useRazorpayScript(preload = true) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(preload);

  useEffect(() => {
    if (!preload) return;

    let cancelled = false;

    loadRazorpayScript().then((ok) => {
      if (!cancelled) {
        setReady(ok);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [preload]);

  const ensureReady = useCallback(async () => {
    if (isRazorpayReady()) {
      setReady(true);
      setLoading(false);
      return true;
    }

    setLoading(true);
    const ok = await loadRazorpayScript();
    setReady(ok);
    setLoading(false);
    return ok;
  }, []);

  return { ready: ready || isRazorpayReady(), loading, ensureReady };
}
