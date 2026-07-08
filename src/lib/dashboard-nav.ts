import type { IconName } from "@/components/icons/icon-mapper";

export interface NavItem {
  href: string;
  label: string;
  iconName: IconName;
}

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", iconName: "LayoutDashboard" },
  { href: "/admin/companies", label: "Companies", iconName: "Building2" },
  { href: "/admin/products", label: "Products", iconName: "Package" },
  { href: "/admin/users", label: "Users", iconName: "Users" },
  { href: "/admin/payments", label: "Payments", iconName: "CreditCard" },
  { href: "/admin/analytics", label: "Analytics", iconName: "BarChart3" },
  { href: "/admin/activity", label: "Activity", iconName: "Activity" },
  { href: "/admin/pricing", label: "Pricing", iconName: "IndianRupee" },
  { href: "/admin/settings", label: "Settings", iconName: "Settings" },
];

export const COMPANY_NAV: NavItem[] = [
  { href: "/company/dashboard", label: "Dashboard", iconName: "LayoutDashboard" },
  { href: "/company/products", label: "Products", iconName: "Package" },
  { href: "/company/availability", label: "Availability", iconName: "Calendar" },
  { href: "/company/leads", label: "Leads", iconName: "Users" },
  { href: "/company/meetings", label: "Meetings", iconName: "Video" },
  { href: "/company/analytics", label: "Analytics", iconName: "BarChart3" },
  { href: "/company/ai", label: "AI Intelligence", iconName: "Sparkles" },
  { href: "/company/settings", label: "Settings", iconName: "Settings" },
];

export const USER_NAV: NavItem[] = [
  { href: "/user/dashboard", label: "Home", iconName: "LayoutDashboard" },
  { href: "/user/discover", label: "Smart Search", iconName: "Search" },
  { href: "/user/requirements", label: "Requirements", iconName: "Sparkles" },
  { href: "/user/recommendations", label: "For You", iconName: "BarChart3" },
  { href: "/user/bookings", label: "Bookings", iconName: "Package" },
  { href: "/user/meetings", label: "Meetings", iconName: "Video" },
  { href: "/user/wishlist", label: "Saved", iconName: "Heart" },
  { href: "/user/profile", label: "Profile", iconName: "Settings" },
];
