"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, Search } from "lucide-react";
import { markNotificationRead, markAllNotificationsRead } from "@/actions/user.actions";
import { cn } from "@/lib/utils";

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export function DashboardNotifications({
  initialNotifications,
}: {
  initialNotifications: DashboardNotification[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialNotifications);
  const [pending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((n) => !n.read).length;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    });
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 text-slate-500 transition-colors hover:bg-slate-50 hover:text-brand-blue"
      >
        <Bell className="h-3.5 w-3.5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-blue px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-[60] mt-2 w-[min(100vw-2rem,20rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                disabled={pending}
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-brand-blue hover:underline"
              >
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet</p>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "border-b border-slate-50 px-4 py-3 last:border-0",
                    !n.read && "bg-brand-blue/[0.03]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.message}</p>
                      {n.link ? (
                        <Link
                          href={n.link}
                          onClick={() => {
                            if (!n.read) handleMarkRead(n.id);
                            setOpen(false);
                          }}
                          className="mt-1 inline-block text-xs font-medium text-brand-blue hover:underline"
                        >
                          View
                        </Link>
                      ) : null}
                    </div>
                    {!n.read ? (
                      <button
                        type="button"
                        title="Mark as read"
                        disabled={pending}
                        onClick={() => handleMarkRead(n.id)}
                        className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-brand-blue"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardSearchInput({ searchPath = "/user/discover" }: { searchPath?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`${searchPath}?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="hidden items-center gap-2 sm:flex">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-1.5">
        <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search software…"
          className="w-36 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400 lg:w-48"
        />
      </div>
    </form>
  );
}
