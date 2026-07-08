import type { Prisma } from "@prisma/client";
import Fuse from "fuse.js";
import { prisma } from "@/lib/prisma";
import type { IntelligenceProduct, ParsedSearchQuery, SmartSearchResult, UserRequirements } from "@/lib/intelligence/types";
import { CATEGORY_ALIASES, expandSearchTerms, normalizeToken } from "@/lib/intelligence/synonyms";
import { enrichParsedSearch } from "@/lib/intelligence/requirement-search";
import { computeFinalScore, computeScoreBreakdown } from "@/lib/intelligence/scoring";

const PRODUCT_INCLUDE = {
  company: { select: { name: true, slug: true, logo: true, status: true, industry: true } },
  category: { select: { name: true, slug: true } },
  images: { take: 1, orderBy: { order: "asc" as const } },
  reviews: { select: { rating: true, comment: true } },
  tags: { include: { tag: { select: { name: true, slug: true } } } },
};

/** Parse natural language queries like "CRM under 5000 with WhatsApp" */
export function parseSearchQuery(raw: string): ParsedSearchQuery {
  const normalized = raw.toLowerCase().trim();
  const terms = expandSearchTerms(normalized);

  let maxPrice: number | undefined;
  let minPrice: number | undefined;

  const underMatch = normalized.match(/(?:under|below|less than|max|upto|up to)\s*[₹$]?\s*(\d[\d,]*)/i);
  const overMatch = normalized.match(/(?:over|above|more than|min)\s*[₹$]?\s*(\d[\d,]*)/i);
  if (underMatch) maxPrice = Number(underMatch[1].replace(/,/g, ""));
  if (overMatch) minPrice = Number(overMatch[1].replace(/,/g, ""));

  const featureHints: string[] = [];
  const integrationHints: string[] = [];
  const featureKeywords = ["whatsapp", "api", "mobile", "sso", "analytics", "automation", "billing"];
  for (const kw of featureKeywords) {
    if (normalized.includes(kw)) {
      if (["whatsapp", "api"].includes(kw)) integrationHints.push(kw);
      else featureHints.push(kw);
    }
  }

  let categoryHint: string | undefined;
  for (const [alias, slug] of Object.entries(CATEGORY_ALIASES)) {
    if (normalized.includes(alias)) {
      categoryHint = slug;
      break;
    }
  }

  return { raw, terms, maxPrice, minPrice, categoryHint, featureHints, integrationHints };
}

function buildSearchDocument(p: IntelligenceProduct): string {
  const tagNames = p.tags?.map((t) => t.tag.name) ?? [];
  return [
    p.name,
    p.shortDescription,
    p.fullDescription,
    p.category.name,
    p.category.slug,
    p.company.name,
    p.company.industry,
    p.pricingModel,
    ...p.features,
    ...p.integrations,
    ...p.suitableFor,
    ...tagNames,
    ...(p.reviews?.map((r) => r.comment).filter(Boolean) as string[]),
  ]
    .join(" ")
    .toLowerCase();
}

function relevanceScore(
  product: IntelligenceProduct,
  parsed: ParsedSearchQuery,
  fuseScore?: number,
  requirements?: UserRequirements,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = fuseScore != null ? Math.max(0, 100 - fuseScore) : 40;
  const doc = buildSearchDocument(product);

  for (const term of parsed.terms) {
    if (doc.includes(term)) {
      score += 8;
      if (reasons.length < 3) reasons.push(`Matches "${term}"`);
    }
  }

  if (parsed.maxPrice != null && product.price != null) {
    if (product.price <= parsed.maxPrice) {
      score += 15;
      reasons.push(`Within ₹${parsed.maxPrice.toLocaleString()} budget`);
    } else score -= 10;
  }

  if (parsed.categoryHint && product.category.slug.includes(parsed.categoryHint)) {
    score += 20;
    reasons.push(`Category: ${product.category.name}`);
  }

  for (const hint of parsed.featureHints) {
    if (product.features.some((f) => normalizeToken(f).includes(hint))) {
      score += 12;
      reasons.push(`Includes ${hint} capability`);
    }
  }

  for (const hint of parsed.integrationHints) {
    if (
      product.integrations.some((i) => normalizeToken(i).includes(hint)) ||
      product.features.some((f) => normalizeToken(f).includes(hint))
    ) {
      score += 14;
      reasons.push(`Supports ${hint}`);
    }
  }

  if (requirements && Object.keys(requirements).length > 0) {
    const breakdown = computeScoreBreakdown(requirements, product);
    const profileScore = computeFinalScore(breakdown);
    const hasQuery = parsed.raw.trim().length > 0;
    score = hasQuery
      ? Math.round(score * 0.55 + profileScore * 0.45)
      : profileScore;

    if (breakdown.industryMatch >= 80 && reasons.length < 4) {
      reasons.push(`Fits your ${requirements.industry ?? "industry"} profile`);
    }
    if (breakdown.featureMatch >= 75 && reasons.length < 4) {
      reasons.push("Matches your required features");
    }
    if (breakdown.budgetMatch >= 90 && reasons.length < 4) {
      reasons.push("Within your requirement budget");
    }
  }

  const avg =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;
  score += avg * 3 + Math.min(10, Math.log10(product.viewCount + 1) * 4);

  return { score: Math.min(100, Math.round(score)), reasons: reasons.slice(0, 4) };
}

/** PostgreSQL pg_trgm similarity search — graceful fallback if extension missing */
export async function trgmSearchIds(query: string, limit = 50): Promise<string[]> {
  try {
    const rows = await prisma.$queryRaw<{ id: string; sim: number }[]>`
      SELECT p.id,
        GREATEST(
          similarity(p.name, ${query}),
          similarity(p."shortDescription", ${query}),
          similarity(COALESCE(array_to_string(p.features, ' '), ''), ${query})
        ) AS sim
      FROM "Product" p
      INNER JOIN "Company" c ON c.id = p."companyId"
      WHERE p.status = 'PUBLISHED' AND c.status = 'APPROVED'
        AND (
          p.name % ${query}
          OR p."shortDescription" % ${query}
          OR similarity(p.name, ${query}) > 0.15
        )
      ORDER BY sim DESC
      LIMIT ${limit}
    `;
    return rows.map((r) => r.id);
  } catch {
    return [];
  }
}

function mergeUniqueProducts(...lists: IntelligenceProduct[][]): IntelligenceProduct[] {
  const seen = new Set<string>();
  const merged: IntelligenceProduct[] = [];
  for (const list of lists) {
    for (const product of list) {
      if (seen.has(product.id)) continue;
      seen.add(product.id);
      merged.push(product);
    }
  }
  return merged;
}

function buildKeywordClauses(query: string, terms: string[]): Prisma.ProductWhereInput[] {
  const clauses: Prisma.ProductWhereInput[] = [];
  const needles = new Set<string>();

  const raw = query.trim();
  if (raw.length >= 2) needles.add(raw);

  for (const term of terms) {
    if (term.length >= 2 && !/^\d+$/.test(term)) needles.add(term);
  }

  for (const needle of needles) {
    clauses.push(
      { name: { contains: needle, mode: "insensitive" } },
      { shortDescription: { contains: needle, mode: "insensitive" } },
      { fullDescription: { contains: needle, mode: "insensitive" } },
      { category: { name: { contains: needle, mode: "insensitive" } } },
      { category: { slug: { contains: needle, mode: "insensitive" } } },
      { company: { name: { contains: needle, mode: "insensitive" } } },
      { company: { industry: { contains: needle, mode: "insensitive" } } },
      { features: { has: needle } },
      { integrations: { has: needle } },
      { suitableFor: { has: needle } },
      { tags: { some: { tag: { name: { contains: needle, mode: "insensitive" } } } } },
    );
  }

  return clauses;
}

function keywordMatchProducts(
  products: IntelligenceProduct[],
  query: string,
  terms: string[],
): IntelligenceProduct[] {
  const needles = new Set<string>();
  const raw = query.trim().toLowerCase();
  if (raw.length >= 2) needles.add(raw);
  for (const term of terms) {
    if (term.length >= 2) needles.add(term.toLowerCase());
  }

  return products.filter((product) => {
    const doc = buildSearchDocument(product);
    return [...needles].some((needle) => doc.includes(needle));
  });
}

async function fetchSearchCandidates(
  where: Prisma.ProductWhereInput,
  query: string,
  parsed: ParsedSearchQuery,
  trgmIds: string[],
  sort?: string,
): Promise<IntelligenceProduct[]> {
  const orderBy =
    sort === "latest"
      ? { createdAt: "desc" as const }
      : { viewCount: "desc" as const };

  const trimmed = query.trim();

  if (!trimmed) {
    return prisma.product.findMany({
      where,
      take: 120,
      orderBy,
      include: PRODUCT_INCLUDE,
    }) as Promise<IntelligenceProduct[]>;
  }

  const keywordClauses = buildKeywordClauses(trimmed, parsed.terms);
  const keywordWhere: Prisma.ProductWhereInput =
    keywordClauses.length > 0 ? { ...where, OR: keywordClauses } : where;

  const [keywordHits, trgmHits, popularPool] = await Promise.all([
    keywordClauses.length > 0
      ? (prisma.product.findMany({
          where: keywordWhere,
          take: 120,
          orderBy,
          include: PRODUCT_INCLUDE,
        }) as Promise<IntelligenceProduct[]>)
      : Promise.resolve([] as IntelligenceProduct[]),
    trgmIds.length > 0
      ? (prisma.product.findMany({
          where: { ...where, id: { in: trgmIds } },
          take: 120,
          orderBy,
          include: PRODUCT_INCLUDE,
        }) as Promise<IntelligenceProduct[]>)
      : Promise.resolve([] as IntelligenceProduct[]),
    trimmed
      ? Promise.resolve([] as IntelligenceProduct[])
      : (prisma.product.findMany({
          where,
          take: 120,
          orderBy,
          include: PRODUCT_INCLUDE,
        }) as Promise<IntelligenceProduct[]>),
  ]);

  const merged = mergeUniqueProducts(keywordHits, trgmHits, popularPool);
  if (trimmed && merged.length === 0) {
    return prisma.product.findMany({
      where,
      take: 120,
      orderBy,
      include: PRODUCT_INCLUDE,
    }) as Promise<IntelligenceProduct[]>;
  }
  return merged;
}

export async function smartSearch(params: {
  q: string;
  page?: number;
  limit?: number;
  category?: string;
  sort?: string;
  requirements?: UserRequirements;
}): Promise<{
  results: SmartSearchResult[];
  total: number;
  parsed: ParsedSearchQuery;
  requirementApplied: boolean;
  suggestedQuery?: string;
}> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const baseParsed = parseSearchQuery(params.q);
  const parsed = enrichParsedSearch(baseParsed, params.requirements);
  const requirementApplied = Boolean(params.requirements && Object.keys(params.requirements).length > 0);

  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    company: { status: "APPROVED" },
  };

  if (params.category) where.category = { slug: params.category };
  else if (parsed.categoryHint) {
    where.category = {
      OR: [
        { slug: { contains: parsed.categoryHint, mode: "insensitive" } },
        { name: { contains: parsed.categoryHint, mode: "insensitive" } },
      ],
    };
  }

  if (parsed.maxPrice != null || parsed.minPrice != null) {
    where.price = {};
    if (parsed.maxPrice != null) where.price.lte = parsed.maxPrice;
    if (parsed.minPrice != null) where.price.gte = parsed.minPrice;
  }

  const trgmIds = params.q.trim() ? await trgmSearchIds(params.q.trim(), 80) : [];

  const products = await fetchSearchCandidates(
    where,
    params.q,
    parsed,
    trgmIds,
    params.sort,
  );

  const fuse = new Fuse(products, {
    keys: [
      { name: "name", weight: 0.3 },
      { name: "shortDescription", weight: 0.2 },
      { name: "fullDescription", weight: 0.08 },
      { name: "category.name", weight: 0.12 },
      { name: "company.name", weight: 0.08 },
      { name: "company.industry", weight: 0.06 },
      { name: "features", weight: 0.1 },
      { name: "integrations", weight: 0.08 },
      { name: "suitableFor", weight: 0.06 },
      { name: "tags.tag.name", weight: 0.06 },
    ],
    threshold: 0.5,
    ignoreLocation: true,
    includeScore: true,
  });

  const trimmedQuery = params.q.trim();
  const effectiveQuery = trimmedQuery || (requirementApplied ? parsed.terms.slice(0, 6).join(" ") : "");

  let fuseResults = effectiveQuery
    ? fuse.search(effectiveQuery)
    : products.map((item) => ({ item, score: 0 }));

  if (effectiveQuery && fuseResults.length === 0) {
    const keywordHits = keywordMatchProducts(products, effectiveQuery, parsed.terms);
    fuseResults = keywordHits.map((item) => ({ item, score: 0.35 }));
  }

  const scored: SmartSearchResult[] = fuseResults.map(({ item, score }) => {
    const { score: rel, reasons } = relevanceScore(
      item,
      parsed,
      (score ?? 0) * 100,
      params.requirements,
    );
    const avg =
      item.reviews.length > 0
        ? item.reviews.reduce((s, r) => s + r.rating, 0) / item.reviews.length
        : 0;
    return {
      id: item.id,
      slug: item.slug,
      name: item.name,
      shortDescription: item.shortDescription,
      categoryName: item.category.name,
      companyName: item.company.name,
      companySlug: item.company.slug,
      companyLogo: item.company.logo,
      price: item.price,
      pricingModel: item.pricingModel,
      imageUrl: item.images[0]?.url ?? null,
      avgRating: Math.round(avg * 10) / 10,
      reviewCount: item.reviews.length,
      relevanceScore: rel,
      matchReasons: reasons.length > 0 ? reasons : ["Relevant to your search"],
    };
  });

  const createdAtMap = new Map(products.map((p) => [p.id, p.createdAt.getTime()]));

  scored.sort((a, b) => {
    if (params.sort === "popular") {
      return b.reviewCount - a.reviewCount || b.relevanceScore - a.relevanceScore;
    }
    if (params.sort === "latest") {
      return (createdAtMap.get(b.id) ?? 0) - (createdAtMap.get(a.id) ?? 0);
    }
    return b.relevanceScore - a.relevanceScore;
  });

  const total = scored.length;
  const start = (page - 1) * limit;
  const { buildRequirementSearchQuery } = await import("@/lib/intelligence/requirement-search");
  return {
    results: scored.slice(start, start + limit),
    total,
    parsed,
    requirementApplied,
    suggestedQuery: params.requirements ? buildRequirementSearchQuery(params.requirements) : undefined,
  };
}
