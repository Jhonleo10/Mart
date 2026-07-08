import { redirect } from "next/navigation";

export default function CompanyRegisterPaymentPage() {
  redirect("/company/settings?tab=plan");
}
