import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { companyRepository } from "@/repositories/company.repository";
import { productRepository } from "@/repositories/product.repository";
import { categoryRepository } from "@/repositories/notification.repository";
import { ProductEditForm } from "@/components/forms/product-edit-form";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") redirect("/login");

  const { id } = await params;
  const company = await companyRepository.findByUserId(session.user.id);
  const product = await productRepository.findById(id);

  if (!product || product.companyId !== company?.id) notFound();

  const categories = await categoryRepository.list();

  return (
    <div className="animate-in fade-in">
      <DashboardPageHeader
        title={`Edit ${product.name}`}
        description="Update product details, screenshots, and features"
      />
      <ProductEditForm
        productId={product.id}
        categories={categories}
        defaultValues={{
          name: product.name,
          shortDescription: product.shortDescription,
          fullDescription: product.fullDescription,
          categoryId: product.categoryId,
          pricingModel: product.pricingModel,
          price: product.price ?? undefined,
          features: product.features,
          websiteUrl: product.websiteUrl ?? "",
          demoUrl: product.demoUrl ?? "",
          supportEmail: product.supportEmail ?? "",
          tags: product.tags.map((t) => t.tag.name),
          images: product.images.map((i) => i.url),
          status: product.status,
        }}
      />
    </div>
  );
}
