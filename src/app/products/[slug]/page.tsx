import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Marketplace detail view redirects to the book-demo flow for buyers. */
export default async function ProductMarketplaceRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/book/${slug}`);
}
