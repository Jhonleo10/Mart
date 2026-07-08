import slugify from "slugify";
import { prisma } from "@/lib/prisma";

export function createSlug(text: string) {
  return slugify(text, { lower: true, strict: true });
}

export async function createUniqueSlug(
  text: string,
  model: "product" | "company",
  excludeId?: string,
) {
  const base = createSlug(text);
  let slug = base;
  let counter = 1;

  while (true) {
    const existing =
      model === "product"
        ? await prisma.product.findFirst({
            where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
          })
        : await prisma.company.findFirst({
            where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
          });

    if (!existing) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
}
