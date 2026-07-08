export type DashboardVariant = "admin" | "company" | "user";

const shared = {
  shellBg: "",
  sidebarBg: "bg-white border-slate-200/80",
  sidebarBorder: "border-slate-100",
  sidebarText: "text-slate-800",
  sidebarMuted: "text-slate-500",
  inactiveNav:
    "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
  logoGradient: "bg-gradient-brand",
  topBarBg: "border-slate-200/80 bg-white/75",
};

export const DASHBOARD_THEMES: Record<
  DashboardVariant,
  {
    shellBg: string;
    sidebarBg: string;
    sidebarBorder: string;
    sidebarText: string;
    sidebarMuted: string;
    activeNav: string;
    inactiveNav: string;
    logoGradient: string;
    roleLabelColor: string;
    topBarBg: string;
    accentName: string;
    accentColor: string;
  }
> = {
  admin: {
    ...shared,
    activeNav:
      "bg-gradient-brand text-white shadow-sm shadow-brand-blue/20",
    roleLabelColor: "text-brand-blue",
    accentName: "Admin",
    accentColor: "brand-blue",
  },
  company: {
    ...shared,
    activeNav:
      "bg-gradient-to-r from-brand-green to-emerald-500 text-white shadow-sm shadow-brand-green/20",
    roleLabelColor: "text-brand-green",
    accentName: "Vendor",
    accentColor: "brand-green",
  },
  user: {
    ...shared,
    activeNav:
      "bg-gradient-to-r from-brand-blue to-sky-500 text-white shadow-sm shadow-brand-blue/15",
    roleLabelColor: "text-brand-blue",
    accentName: "Buyer",
    accentColor: "brand-blue",
  },
};

export function formatPlanLabel(plan: string | null | undefined): string {
  if (!plan) return "Free";
  switch (plan) {
    case "BASIC":
      return "Basic";
    case "GROWTH":
      return "Growth";
    case "PROFESSIONAL":
      return "Pro";
    case "ENTERPRISE":
      return "Enterprise";
    default:
      return plan;
  }
}
