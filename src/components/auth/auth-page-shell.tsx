import { AuthRoleTabs, type AuthTab } from "@/components/auth/auth-role-tabs";
import { cn } from "@/lib/utils";

interface AuthPageShellProps {
  children: React.ReactNode;
  badge?: string;
  badgeTone?: "blue" | "green";
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
  activeTab?: AuthTab;
  compact?: boolean;
  fitViewport?: boolean;
  centerHeader?: boolean;
  onSubtitleClick?: () => void;
}

export function AuthPageShell({
  children,
  badge,
  badgeTone = "blue",
  title,
  subtitle,
  footer,
  activeTab = "login",
  compact = false,
  fitViewport = false,
  centerHeader = false,
  onSubtitleClick,
}: AuthPageShellProps) {
  const badgeClass =
    badgeTone === "green" ? "auth-screen-badge-green" : "auth-screen-badge-blue";

  return (
    <div className={cn("auth-screen", fitViewport && "auth-screen-fit")}>
      <div className="auth-screen-mesh" aria-hidden />

      <div className="auth-screen-main auth-screen-main-centered">
        <div
          className={cn(
            "auth-screen-card auth-screen-card-v2",
            compact && "auth-screen-card-compact",
            fitViewport && "auth-screen-card-fit",
          )}
        >
          {activeTab !== "verify" ? <AuthRoleTabs active={activeTab} /> : null}

          <div className={cn("auth-screen-card-header", centerHeader && "auth-screen-card-header-center")}>
            {badge ? <span className={`auth-screen-badge ${badgeClass}`}>{badge}</span> : null}
            <h1 className="font-heading text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
            <p
              className={cn("mt-0.5 text-sm text-slate-500", onSubtitleClick && "cursor-default select-none")}
              onClick={onSubtitleClick}
            >
              {subtitle}
            </p>
          </div>

          {children}

          {footer ? <div className="auth-screen-footer">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
