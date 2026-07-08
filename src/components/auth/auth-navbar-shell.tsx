import { getSiteConfig } from "@/lib/site-config";
import { AuthNavbar } from "@/components/auth/auth-navbar";

export async function AuthNavbarShell() {
  const site = await getSiteConfig();
  return <AuthNavbar siteName={site.name} logoAlt={site.logoAlt} />;
}
