import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { wishlistRepository } from "@/repositories/wishlist.repository";
import { ModernProductCard } from "@/components/products/modern-product-card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";

export default async function UserSavedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const saved = await wishlistRepository.listByUser(session.user.id);

  return (
    <div className="dash-page-enter animate-in fade-in">
      <DashboardPageHeader
        title="Saved"
        description="Software you've saved for later"
      />

      {saved.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map(({ product }) => (
            <ModernProductCard
              key={product.id}
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                shortDescription: product.shortDescription,
                pricingModel: product.pricingModel,
                price: product.price,
                company: {
                  name: product.company.name,
                  slug: product.company.slug,
                  logo: product.company.logo,
                  status: product.company.status,
                },
                category: product.category,
                images: product.images,
                reviews: [],
                adminVerified: product.adminVerified,
              }}
            />
          ))}
        </div>
      ) : (
        <DashboardPanel className="p-12 text-center text-slate-500">
          Nothing saved yet.{" "}
          <Link href="/user/discover" className="font-medium text-brand-blue hover:underline">
            Explore software
          </Link>
        </DashboardPanel>
      )}
    </div>
  );
}
