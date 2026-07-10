"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const MESSAGES: Record<string, { type: "success" | "error"; text: string }> = {
  connected: {
    type: "success",
    text: "Google Calendar connected. You can schedule Meet demos from Leads.",
  },
  error: {
    type: "error",
    text: "Google Calendar connection failed. Check OAuth credentials and redirect URI, then try again.",
  },
  invalid: {
    type: "error",
    text: "Google connection expired or was invalid. Please try Connect Google again.",
  },
  denied: {
    type: "error",
    text: "Google access was denied. Allow calendar permissions to enable Meet scheduling.",
  },
  not_configured: {
    type: "error",
    text: "Google Calendar is not configured on this server. Contact support.",
  },
};

export function GoogleConnectToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const status = searchParams.get("google");
    if (!status) return;

    const message = MESSAGES[status];
    if (message) {
      if (message.type === "success") toast.success(message.text);
      else toast.error(message.text);
    }

    const next = new URLSearchParams(searchParams.toString());
    next.delete("google");
    const qs = next.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname);
  }, [searchParams, router]);

  return null;
}
