export const LANDING_SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "products", label: "Software" },
  { id: "about", label: "Enterprise" },
  { id: "benefits", label: "Why Us" },
  { id: "companies", label: "Vendors" },
  { id: "how-it-works", label: "How It Works" },
  { id: "pricing", label: "Pricing" },
  { id: "contact", label: "Contact" },
] as const;

export function landingHref(sectionId: string) {
  if (sectionId === "products") return "/products";
  return `/#${sectionId}`;
}

export function formatStatCount(count: number): string {
  if (count >= 1000) return `${Math.floor(count / 1000)}k+`;
  return `${count}+`;
}

export const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Browse Products",
    description: "Explore verified software across CRM, ERP, HRMS, and more by category.",
    icon: "search" as const,
  },
  {
    step: "02",
    title: "Compare Solutions",
    description: "Shortlist products, read reviews, and save favorites to your wishlist.",
    icon: "layers" as const,
  },
  {
    step: "03",
    title: "Book a Demo",
    description: "Request demos directly from vendors and track responses in your dashboard.",
    icon: "calendar" as const,
  },
  {
    step: "04",
    title: "Grow Together",
    description: "Vendors list products, manage leads, and scale visibility on the marketplace.",
    icon: "trending" as const,
  },
];

export const ABOUT_FEATURES = [
  {
    title: "Verified Vendors",
    description: "Every software company passes admin review before going live.",
  },
  {
    title: "Smart Search",
    description: "Filter by category, pricing model, and features to find the right fit.",
  },
  {
    title: "Demo Booking",
    description: "One-click demo requests connect buyers with qualified vendor leads.",
  },
  {
    title: "Secure Platform",
    description: "Role-based access, encrypted auth, and enterprise-grade security.",
  },
];

export const CATEGORY_TAGS = [
  "Accounting",
  "CRM",
  "E-commerce",
  "ERP",
  "HRMS",
  "Analytics",
  "Security",
  "Marketing",
];
