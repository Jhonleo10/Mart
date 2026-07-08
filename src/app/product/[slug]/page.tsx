import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Canonical public product page is the marketplace book/detail view. */
export default async function ProductSlugRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/book/${slug}`);
}
