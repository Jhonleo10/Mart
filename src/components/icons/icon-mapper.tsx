import {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  CreditCard,
  BarChart3,
  IndianRupee,
  Settings,
  Heart,
  Calendar,
  Activity,
  Search,
  Sparkles,
  Video,
  Shield,
  Target,
  type LucideIcon,
} from "lucide-react";

type IconName =
  | "LayoutDashboard"
  | "Building2"
  | "Package"
  | "Users"
  | "CreditCard"
  | "BarChart3"
  | "IndianRupee"
  | "Settings"
  | "Heart"
  | "Calendar"
  | "Activity"
  | "Search"
  | "Sparkles"
  | "Video"
  | "Shield"
  | "Target";

const ICON_MAP: Record<IconName, LucideIcon> = {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  CreditCard,
  BarChart3,
  IndianRupee,
  Settings,
  Heart,
  Calendar,
  Activity,
  Search,
  Sparkles,
  Video,
  Shield,
  Target,
};

export type { IconName };

export function IconRenderer({
  iconName,
  className,
}: {
  iconName: IconName;
  className?: string;
}) {
  const Icon = ICON_MAP[iconName];
  if (!Icon) return null;
  return <Icon className={className} />;
}

export function getIcon(iconName: IconName): LucideIcon | null {
  return ICON_MAP[iconName] || null;
}
