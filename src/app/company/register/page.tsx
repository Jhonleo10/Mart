import { redirect } from "next/navigation";

/** Legacy step-2 registration — company details live in Settings now. */
export default function CompanyRegisterPage() {
  redirect("/company/settings?tab=profile");
}
