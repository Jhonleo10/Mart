"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { disconnectGoogleCalendarAction } from "@/actions/meeting.actions";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { Calendar, Link2, Unlink } from "lucide-react";

interface GoogleCalendarConnectProps {
  connected: boolean;
  googleEmail?: string | null;
  configured: boolean;
}

export function GoogleCalendarConnect({
  connected,
  googleEmail,
  configured,
}: GoogleCalendarConnectProps) {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [loading, setLoading] = useState(false);

  async function handleDisconnect() {
    const ok = await confirm({
      title: "Disconnect Google Calendar?",
      description:
        "Automatic Google Meet scheduling will stop. Existing meetings are not deleted from your calendar.",
      confirmLabel: "Disconnect",
      variant: "warning",
    });
    if (!ok) return;

    setLoading(true);
    try {
      const result = await disconnectGoogleCalendarAction();
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Google Calendar disconnected");
      router.refresh();
    } catch (error) {
      console.error("[google-disconnect]", error);
      toast.error("Could not disconnect Google Calendar. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!configured) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
        Google Calendar is not configured on this server. Add GOOGLE_CLIENT_ID and
        GOOGLE_CLIENT_SECRET to enable Meet scheduling.
      </div>
    );
  }

  return (
    <>
      {confirmDialog}
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Calendar className="h-5 w-5 text-brand-blue" />
              Google Calendar
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Connect your Google account to auto-create Google Meet links, or schedule with Teams,
              Zoom, or any custom meeting URL from Company → Leads.
            </p>
            {connected && googleEmail ? (
              <p className="mt-2 text-sm text-brand-green">
                Connected as <strong>{googleEmail}</strong>
              </p>
            ) : null}
          </div>
          {connected ? (
            <Button variant="outline" size="sm" disabled={loading} onClick={handleDisconnect}>
              <Unlink className="mr-1.5 h-3.5 w-3.5" />
              {loading ? "..." : "Disconnect"}
            </Button>
          ) : (
            <Button size="sm" asChild>
              <a href="/api/google/calendar/connect">
                <Link2 className="mr-1.5 h-3.5 w-3.5" />
                Connect Google
              </a>
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
