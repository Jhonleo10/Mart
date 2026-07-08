export interface PricingPlan {
  id: string;
  name: string;
  audience: string;
  price: string;
  priceAmount: number | null;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted: boolean;
  active: boolean;
  accent: "blue" | "green";
  razorpayEnabled: boolean;
}

export interface SmtpSettings {
  apiKey: string;
  fromEmail: string;
}

export interface RazorpaySettings {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  registrationFee: number;
}

export interface GeneralSettings {
  supportEmail: string;
  siteName: string;
}

export const DEFAULT_PRICING_PLANS: PricingPlan[] = [
  {
    id: "vendor-basic",
    name: "Basic",
    audience: "For Vendors",
    price: "₹4,999",
    priceAmount: 4999,
    period: "one-time registration",
    description: "Get listed and start receiving demo requests from qualified buyers.",
    features: [
      "Company profile & branding",
      "List up to 5 products",
      "Lead inbox & demo bookings",
      "Demo availability scheduling",
      "Basic analytics dashboard",
    ],
    cta: "Pay & Register",
    href: "/seller/register",
    highlighted: false,
    active: true,
    accent: "blue",
    razorpayEnabled: true,
  },
  {
    id: "vendor-growth",
    name: "Growth",
    audience: "For Growing Vendors",
    price: "₹12,999",
    priceAmount: 12999,
    period: "per year",
    description: "Boost visibility with featured placement and deeper analytics.",
    features: [
      "Everything in Basic",
      "List up to 15 products",
      "Trending Products Engine",
      "Advanced lead analytics",
    ],
    cta: "Subscribe Now",
    href: "/seller/register",
    highlighted: true,
    active: true,
    accent: "green",
    razorpayEnabled: true,
  },
  {
    id: "vendor-pro",
    name: "Pro",
    audience: "For Scale-Up Vendors",
    price: "₹24,999",
    priceAmount: 24999,
    period: "per year",
    description: "Unlimited listings plus AI-powered marketing intelligence.",
    features: [
      "Everything in Growth",
      "Unlimited product listings",
      "Pro homepage spotlight carousel (up to 3 products)",
      "AI Product Marketing Assistant",
      "AI Audience Intelligence",
      "AI Competitor Analysis",
      "AI Growth Dashboard",
      "Priority support",
    ],
    cta: "Subscribe Now",
    href: "/seller/register",
    highlighted: false,
    active: true,
    accent: "blue",
    razorpayEnabled: true,
  },
];

/** Free buyer plan — managed in admin pricing, hidden from vendor homepage cards. */
export const EXPLORER_PLAN: PricingPlan = {
  id: "explorer",
  name: "Explorer",
  audience: "For Businesses",
  price: "Free",
  priceAmount: null,
  period: "forever",
  description: "Browse the marketplace publicly — sign in only to book demos.",
  features: [
    "Browse all published products",
    "View product details & comparisons",
    "Book product demos (sign in required)",
    "Save wishlist & track bookings",
  ],
  cta: "Register Free",
  href: "/register",
  highlighted: false,
  active: true,
  accent: "blue",
  razorpayEnabled: false,
};

/** All built-in plans merged into admin pricing (includes buyer + legacy vendor tiers). */
export const ALL_DEFAULT_PRICING_PLANS: PricingPlan[] = [
  ...DEFAULT_PRICING_PLANS,
  EXPLORER_PLAN,
  {
    id: "company-starter",
    name: "Company Starter",
    audience: "For Vendors",
    price: "₹4,999",
    priceAmount: 4999,
    period: "one-time registration",
    description: "Legacy registration tier — use Basic plan instead.",
    features: [
      "Company profile & branding",
      "List up to 5 products",
      "Lead inbox & notifications",
      "Basic analytics dashboard",
    ],
    cta: "Pay & Register",
    href: "/seller/register",
    highlighted: false,
    active: false,
    accent: "blue",
    razorpayEnabled: true,
  },
  {
    id: "professional",
    name: "Professional",
    audience: "For Growing Vendors",
    price: "₹14,999",
    priceAmount: 14999,
    period: "per year",
    description: "Legacy tier — use Growth or Pro instead.",
    features: [
      "Priority product listings",
      "Advanced lead analytics",
      "Featured company badge",
      "Dedicated support channel",
    ],
    cta: "Subscribe Now",
    href: "/seller/register",
    highlighted: false,
    active: false,
    accent: "green",
    razorpayEnabled: true,
  },
];

export const DEFAULT_SMTP: SmtpSettings = {
  apiKey: "",
  fromEmail: "Genius Mart <onboarding@resend.dev>",
};

export const DEFAULT_RAZORPAY: RazorpaySettings = {
  keyId: "",
  keySecret: "",
  webhookSecret: "",
  registrationFee: 4999,
};

export const DEFAULT_GENERAL: GeneralSettings = {
  supportEmail: "support@digitalgeniusmart.com",
  siteName: "Genius Mart",
};

/** Plan IDs treated as one-time seller registration (not subscription renewal). */
export const SELLER_REGISTRATION_PLAN_IDS = new Set([
  "vendor-basic",
  "company-starter",
]);
