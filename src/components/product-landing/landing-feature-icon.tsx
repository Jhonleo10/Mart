import {
  BarChart3,
  Globe,
  Layers,
  Lock,
  Shield,
  Sparkles,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Zap,
  Shield,
  Layers,
  BarChart3,
  Users,
  Globe,
  Lock,
  Sparkles,
};

export function LandingFeatureIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Zap;
  return <Icon className={className} />;
}
