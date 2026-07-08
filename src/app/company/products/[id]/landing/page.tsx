import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { companyRepository } from "@/repositories/company.repository";
import { productRepository } from "@/repositories/product.repository";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Legacy per-product SEO editor — product details live on the public book page. */
export default async function ProductLandingEditorRedirect({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") redirect("/login");

  const { id } = await params;
  const company = await companyRepository.findByUserId(session.user.id);
  const product = await productRepository.findById(id);
  if (!company || !product || product.companyId !== company.id) {
    redirect("/company/products");
  }

  redirect(`/company/products/${id}/edit`);
}
