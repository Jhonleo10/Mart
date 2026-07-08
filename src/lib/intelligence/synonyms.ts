/** Zero-cost synonym map for natural-language search expansion */
export const SEARCH_SYNONYMS: Record<string, string[]> = {
  crm: ["customer relationship", "sales pipeline", "lead management", "contacts"],
  erp: ["enterprise resource", "inventory", "accounting", "operations"],
  hrms: ["human resources", "payroll", "attendance", "hr software"],
  whatsapp: ["whatsapp business", "messaging", "chat"],
  api: ["rest api", "webhook", "integration"],
  cloud: ["saas", "hosted", "online"],
  onpremise: ["on premise", "on-premise", "self hosted", "self-hosted"],
  mobile: ["ios", "android", "app"],
  security: ["sso", "encryption", "gdpr", "compliance"],
  analytics: ["reporting", "dashboard", "bi", "insights"],
  marketing: ["email marketing", "campaigns", "automation"],
  support: ["helpdesk", "ticketing", "customer support"],
  billing: ["invoicing", "payments", "subscription billing"],
  project: ["project management", "tasks", "kanban"],
};

export const CATEGORY_ALIASES: Record<string, string> = {
  crm: "crm-software",
  "customer relationship": "crm-software",
  erp: "erp-software",
  hrms: "hrms-software",
  hr: "hrms-software",
  accounting: "accounting-software",
  billing: "billing-software",
  invoicing: "billing-software",
  analytics: "analytics",
  security: "security",
  marketing: "marketing-automation",
};

export function expandSearchTerms(query: string): string[] {
  const normalized = query.toLowerCase().trim();
  const words = normalized.split(/\s+/).filter(Boolean);
  const expanded = new Set<string>(words);

  for (const word of words) {
    const syns = SEARCH_SYNONYMS[word];
    if (syns) syns.forEach((s) => expanded.add(s));
    for (const [key, values] of Object.entries(SEARCH_SYNONYMS)) {
      if (values.some((v) => normalized.includes(v))) expanded.add(key);
    }
  }

  return [...expanded];
}

export function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim();
}
