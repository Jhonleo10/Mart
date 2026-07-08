import { redirect } from "next/navigation";

/** Legacy SEO landing hub — products are browsed on the public marketplace. */
export default function CompanyLandingRedirectPage() {
  redirect("/company/products");
}
