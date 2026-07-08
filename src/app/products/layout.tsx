import { CatalogProviders } from "@/components/products/catalog-providers";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <CatalogProviders>{children}</CatalogProviders>;
}
