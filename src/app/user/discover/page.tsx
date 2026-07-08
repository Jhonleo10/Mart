import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getRequirementProfile } from "@/actions/intelligence.actions";
import {
  buildRequirementSearchQuery,
  getRequirementSummaryChips,
  profileToRequirements,
} from "@/lib/intelligence/requirement-search";
import UserDiscoverPage from "./discover-client";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await getRequirementProfile();
  const requirements = profile ? profileToRequirements(profile) : null;

  return (
    <Suspense fallback={<div className="discovery-skeleton h-96 rounded-2xl" />}>
      <UserDiscoverPage
        hasRequirements={Boolean(profile)}
        requirementChips={requirements ? getRequirementSummaryChips(requirements) : []}
        suggestedQuery={requirements ? buildRequirementSearchQuery(requirements) : ""}
      />
    </Suspense>
  );
}
