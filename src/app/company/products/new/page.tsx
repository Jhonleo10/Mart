import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { companyRepository } from "@/repositories/company.repository";
import { productRepository } from "@/repositories/product.repository";
import { categoryRepository } from "@/repositories/notification.repository";
import { ProductForm } from "@/components/forms/product-form";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";
import { Button } from "@/components/ui/button";
import { getCompanyEffectivePlan, productLimitForPlan } from "@/lib/plans/company-plan";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") redirect("/login");

  const company = await companyRepository.findByUserId(session.user.id);
  if (!company || company.status !== "APPROVED") redirect("/company/dashboard");

  const plan = getCompanyEffectivePlan(company);
  const productLimit = productLimitForPlan(plan);
  const currentCount = await productRepository.listByCompany(company.id).then((p) => p.length);

  if (productLimit !== null && currentCount >= productLimit) {
    return (
      <div className="animate-in fade-in">
        <DashboardPageHeader
          title="Product limit reached"
          description={`Your ${plan ?? "current"} plan allows up to ${productLimit} products.`}
        />
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-medium">Upgrade to list more software</p>
          <p className="mt-2">
            Growth plan supports 15 products. Pro plan supports unlimited listings plus AI tools.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/company/settings">
              <Button>View plans & upgrade</Button>
            </Link>
            <Link href="/company/products">
              <Button variant="outline">Back to products</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categories = await categoryRepository.list();

  return (
    <div className="animate-in fade-in">
      <DashboardPageHeader
        title="Add New Product"
        description={
          productLimit !== null
            ? `${currentCount + 1} of ${productLimit} product slots on your plan`
            : "Unlimited listings on your plan"
        }
      />
      <ProductForm categories={categories} />
    </div>
  );
}
