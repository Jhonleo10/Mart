import type { SubscriptionPlan } from "@prisma/client";



import { vendorHasFeature } from "@/lib/plans/vendor-features";



export interface CompanySetupInput {

  id: string;

  slug: string;

  description: string | null;

  logo: string | null;

  products: { id: string; status: string }[];

  publishedCount: number;

  hasAvailability: boolean;

  plan: SubscriptionPlan | null;

}



export interface SetupStep {

  id: string;

  label: string;

  done: boolean;

  href: string;

  optional?: boolean;

}



export function buildCompanySetupSteps(company: CompanySetupInput): SetupStep[] {

  const profileDone =

    Boolean(company.description && company.description.length >= 20) && Boolean(company.logo);

  const hasProduct = company.products.length > 0;

  const hasPublished = company.publishedCount > 0;



  return [

    {

      id: "profile",

      label: "Complete company profile",

      done: profileDone,

      href: "/company/settings",

    },

    {

      id: "product",

      label: "Add your first product",

      done: hasProduct,

      href: "/company/products/new",

    },

    {

      id: "published",

      label: "Get a product published",

      done: hasPublished,

      href: "/company/products",

    },

    {

      id: "availability",

      label: "Set demo availability",

      done: company.hasAvailability,

      href: "/company/availability",

    },

  ];

}



export function setupProgress(steps: SetupStep[]): number {

  const required = steps.filter((s) => !s.optional);

  if (required.length === 0) return 100;

  const done = required.filter((s) => s.done).length;

  return Math.round((done / required.length) * 100);

}

