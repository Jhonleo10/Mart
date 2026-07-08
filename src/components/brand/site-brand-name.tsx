import { cn } from "@/lib/utils";
import { splitSiteName } from "@/lib/site-config.shared";

export function SiteBrandName({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const { lead, accent } = splitSiteName(name);

  if (!accent) {
    return <span className={className}>{lead}</span>;
  }

  return (
    <span className={className}>
      {lead} <span className="text-gradient">{accent}</span>
    </span>
  );
}
