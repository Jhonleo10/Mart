import type { ProductLandingPage } from "@prisma/client";
import { buildDefaultLandingConfig, parseLandingConfig } from "./defaults";
import type { ProductLandingConfig } from "./types";

type ProductWithRelations = Parameters<typeof buildDefaultLandingConfig>[0];

export function resolvePublishedLandingConfig(
  product: ProductWithRelations,
  landingPage: ProductLandingPage | null,
): ProductLandingConfig {
  const defaults = buildDefaultLandingConfig(product);

  if (!landingPage || landingPage.status !== "PUBLISHED") {
    return defaults;
  }

  const published = parseLandingConfig({
    sectionOrder: landingPage.sectionOrder,
    sections: landingPage.sections,
    theme: landingPage.theme,
    seo: {
      title: landingPage.seoTitle ?? defaults.seo.title,
      description: landingPage.seoDescription ?? defaults.seo.description,
      focusKeywords: landingPage.focusKeywords ?? defaults.seo.focusKeywords,
      canonicalUrl: landingPage.canonicalUrl ?? undefined,
      ogTitle: landingPage.ogTitle ?? defaults.seo.ogTitle,
      ogDescription: landingPage.ogDescription ?? defaults.seo.ogDescription,
      ogImage: landingPage.ogImage ?? defaults.seo.ogImage,
    },
  });

  if (!published) return defaults;

  return mergeLandingWithProduct(published, defaults);
}

export function resolveDraftLandingConfig(
  product: ProductWithRelations,
  landingPage: ProductLandingPage | null,
): ProductLandingConfig {
  const published = resolvePublishedLandingConfig(product, landingPage);
  if (!landingPage?.draftSections) return published;

  const draft = parseLandingConfig({
    sectionOrder: landingPage.draftSectionOrder ?? landingPage.sectionOrder,
    sections: landingPage.draftSections,
    theme: landingPage.draftTheme ?? landingPage.theme,
    seo: published.seo,
  });

  return draft ? mergeLandingWithProduct(draft, published) : published;
}

/** Keep product-derived gallery/images in sync when URLs empty in stored config. */
function mergeLandingWithProduct(
  config: ProductLandingConfig,
  defaults: ProductLandingConfig,
): ProductLandingConfig {
  return {
    ...config,
    sections: {
      ...config.sections,
      hero: {
        ...defaults.sections.hero,
        ...config.sections.hero,
        heroImageUrl: config.sections.hero.heroImageUrl ?? defaults.sections.hero.heroImageUrl,
        logoUrl: config.sections.hero.logoUrl ?? defaults.sections.hero.logoUrl,
      },
      gallery: {
        ...config.sections.gallery,
        images:
          config.sections.gallery.images.length > 0
            ? config.sections.gallery.images
            : defaults.sections.gallery.images,
      },
    },
    seo: { ...defaults.seo, ...config.seo },
  };
}
