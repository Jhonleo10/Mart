import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";
import { UserProfileForm } from "@/components/user/user-profile-form";

export default async function UserProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, role: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="dash-page-enter animate-in fade-in">
      <DashboardPageHeader
        title="My Profile"
        description="Manage your account, contact details, and security settings"
      />
      <UserProfileForm
        user={{
          name: user.name ?? "",
          email: user.email,
          phone: user.phone ?? "",
          role: user.role,
        }}
      />
    </div>
  );
}
