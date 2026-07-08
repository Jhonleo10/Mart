"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  publishProductLanding,
  restoreProductLandingVersion,
  saveProductLandingDraft,
} from "@/actions/product-landing.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LandingSectionId, ProductLandingConfig } from "@/lib/product-landing/types";
import { LANDING_SECTION_IDS } from "@/lib/product-landing/types";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  GripVertical,
  Loader2,
  Save,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SECTION_LABELS: Record<LandingSectionId, string> = {
  hero: "Hero",
  trustedBy: "Trusted By",
  overview: "Overview",
  features: "Features",
  gallery: "Gallery",
  industries: "Industries",
  pricing: "Pricing",
  comparison: "Comparison",
  testimonials: "Testimonials",
  faqs: "FAQs",
  cta: "Call to Action",
  relatedProducts: "Related Products",
  footer: "Footer",
};

export function ProductLandingEditor({
  productId,
  productSlug,
  productName,
  initialConfig,
  landingStatus,
  versions,
  hasSeoAccess,
  requiredPlan,
}: {
  productId: string;
  productSlug: string;
  productName: string;
  initialConfig: ProductLandingConfig;
  landingStatus: string;
  versions: { id: string; label: string | null; createdAt: string }[];
  hasSeoAccess: boolean;
  requiredPlan: string;
}) {
  const router = useRouter();
  const [config, setConfig] = useState<ProductLandingConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<"sections" | "seo" | "theme">("sections");
  const [expanded, setExpanded] = useState<LandingSectionId>("hero");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const updateConfig = useCallback((updater: (c: ProductLandingConfig) => ProductLandingConfig) => {
    setConfig((c) => updater(c));
  }, []);

  const toggleSection = (id: LandingSectionId) => {
    updateConfig((c) => {
      const section = c.sections[id];
      if (!section || !("enabled" in section)) return c;
      return {
        ...c,
        sections: { ...c.sections, [id]: { ...section, enabled: !section.enabled } },
      };
    });
  };

  const moveSection = (id: LandingSectionId, dir: -1 | 1) => {
    updateConfig((c) => {
      const order = [...c.sectionOrder];
      const idx = order.indexOf(id);
      const next = idx + dir;
      if (next < 0 || next >= order.length) return c;
      [order[idx], order[next]] = [order[next]!, order[idx]!];
      return { ...c, sectionOrder: order };
    });
  };

  const isEnabled = (id: LandingSectionId) => {
    const s = config.sections[id];
    return s && "enabled" in s ? s.enabled : false;
  };

  async function handleSaveDraft() {
    setSaving(true);
    const result = await saveProductLandingDraft(productId, JSON.stringify(config));
    setSaving(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Draft saved");
  }

  async function handlePublish() {
    setPublishing(true);
    const result = await publishProductLanding(productId, JSON.stringify(config));
    setPublishing(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Landing page published");
    router.refresh();
  }

  async function handleRestore(versionId: string) {
    const result = await restoreProductLandingVersion(productId, versionId);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Version restored");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {!hasSeoAccess ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
          <p className="font-semibold">Publishing requires {requiredPlan} plan</p>
          <p className="mt-1 text-amber-800/90">
            You can customize and save drafts. Upgrade to publish your product SEO landing page live.
          </p>
          <Link href="/company/settings" className="mt-2 inline-block font-medium underline">
            View plans
          </Link>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
        <div>
          <h2 className="font-heading text-lg font-semibold text-slate-900">{productName}</h2>
          <p className="text-sm text-slate-500">
            Status:{" "}
            <span className={landingStatus === "PUBLISHED" ? "text-brand-green" : "text-amber-600"}>
              {landingStatus === "PUBLISHED" ? "Published" : "Draft"}
            </span>
            {" · "}
            <a
              href={`/product/${productSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-blue hover:underline"
            >
              /product/{productSlug}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/product/${productSlug}`} target="_blank">
            <Button type="button" variant="outline" size="sm">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </Link>
          <Button type="button" variant="outline" size="sm" onClick={handleSaveDraft} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save draft
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handlePublish}
            disabled={publishing || !hasSeoAccess}
            title={!hasSeoAccess ? `Requires ${requiredPlan} plan` : undefined}
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Publish
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {(["sections", "seo", "theme"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium capitalize",
              activeTab === tab
                ? "border-b-2 border-brand-blue text-brand-blue"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "sections" && (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-2 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Section order</p>
            {config.sectionOrder.map((id) => (
              <div
                key={id}
                className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2"
              >
                <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                <button
                  type="button"
                  onClick={() => setExpanded(id)}
                  className={cn(
                    "min-w-0 flex-1 truncate text-left text-sm font-medium",
                    expanded === id ? "text-brand-blue" : "text-slate-700",
                  )}
                >
                  {SECTION_LABELS[id]}
                </button>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={isEnabled(id)}
                    onChange={() => toggleSection(id)}
                    className="rounded"
                  />
                  On
                </label>
                <button type="button" onClick={() => moveSection(id, -1)} className="p-1 text-slate-400 hover:text-slate-700">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => moveSection(id, 1)} className="p-1 text-slate-400 hover:text-slate-700">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 lg:col-span-3">
            <h3 className="font-heading font-semibold text-slate-900">{SECTION_LABELS[expanded]}</h3>

            {expanded === "hero" && (
              <div className="space-y-4">
                <div>
                  <Label>Tagline</Label>
                  <Input
                    className="mt-1"
                    value={config.sections.hero.tagline}
                    onChange={(e) =>
                      updateConfig((c) => ({
                        ...c,
                        sections: { ...c.sections, hero: { ...c.sections.hero, tagline: e.target.value } },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Short description</Label>
                  <Textarea
                    className="mt-1"
                    rows={3}
                    value={config.sections.hero.shortDescription}
                    onChange={(e) =>
                      updateConfig((c) => ({
                        ...c,
                        sections: {
                          ...c.sections,
                          hero: { ...c.sections.hero, shortDescription: e.target.value },
                        },
                      }))
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Primary CTA</Label>
                    <Input
                      className="mt-1"
                      value={config.sections.hero.primaryCtaLabel}
                      onChange={(e) =>
                        updateConfig((c) => ({
                          ...c,
                          sections: {
                            ...c.sections,
                            hero: { ...c.sections.hero, primaryCtaLabel: e.target.value },
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Secondary CTA</Label>
                    <Input
                      className="mt-1"
                      value={config.sections.hero.secondaryCtaLabel}
                      onChange={(e) =>
                        updateConfig((c) => ({
                          ...c,
                          sections: {
                            ...c.sections,
                            hero: { ...c.sections.hero, secondaryCtaLabel: e.target.value },
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {expanded === "overview" && (
              <div className="space-y-4">
                <div>
                  <Label>Detailed description</Label>
                  <Textarea
                    className="mt-1"
                    rows={5}
                    value={config.sections.overview.detailedDescription}
                    onChange={(e) =>
                      updateConfig((c) => ({
                        ...c,
                        sections: {
                          ...c.sections,
                          overview: { ...c.sections.overview, detailedDescription: e.target.value },
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Why choose (one per line)</Label>
                  <Textarea
                    className="mt-1"
                    rows={4}
                    value={config.sections.overview.keyBenefits.join("\n")}
                    onChange={(e) =>
                      updateConfig((c) => ({
                        ...c,
                        sections: {
                          ...c.sections,
                          overview: {
                            ...c.sections.overview,
                            keyBenefits: e.target.value.split("\n").filter(Boolean),
                          },
                        },
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {expanded === "features" && (
              <div className="space-y-3">
                {config.sections.features.items.map((item, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 p-3 space-y-2">
                    <Input
                      placeholder="Feature title"
                      value={item.title}
                      onChange={(e) => {
                        const items = [...config.sections.features.items];
                        items[i] = { ...items[i]!, title: e.target.value };
                        updateConfig((c) => ({
                          ...c,
                          sections: { ...c.sections, features: { ...c.sections.features, items } },
                        }));
                      }}
                    />
                    <Textarea
                      placeholder="Description"
                      rows={2}
                      value={item.description}
                      onChange={(e) => {
                        const items = [...config.sections.features.items];
                        items[i] = { ...items[i]!, description: e.target.value };
                        updateConfig((c) => ({
                          ...c,
                          sections: { ...c.sections, features: { ...c.sections.features, items } },
                        }));
                      }}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateConfig((c) => ({
                      ...c,
                      sections: {
                        ...c.sections,
                        features: {
                          ...c.sections.features,
                          items: [
                            ...c.sections.features.items,
                            { icon: "Zap", title: "New feature", description: "" },
                          ],
                        },
                      },
                    }))
                  }
                >
                  Add feature
                </Button>
              </div>
            )}

            {expanded === "faqs" && (
              <div className="space-y-3">
                {config.sections.faqs.items.map((item, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 p-3 space-y-2">
                    <Input
                      placeholder="Question"
                      value={item.question}
                      onChange={(e) => {
                        const items = [...config.sections.faqs.items];
                        items[i] = { ...items[i]!, question: e.target.value };
                        updateConfig((c) => ({
                          ...c,
                          sections: { ...c.sections, faqs: { ...c.sections.faqs, items } },
                        }));
                      }}
                    />
                    <Textarea
                      placeholder="Answer"
                      rows={2}
                      value={item.answer}
                      onChange={(e) => {
                        const items = [...config.sections.faqs.items];
                        items[i] = { ...items[i]!, answer: e.target.value };
                        updateConfig((c) => ({
                          ...c,
                          sections: { ...c.sections, faqs: { ...c.sections.faqs, items } },
                        }));
                      }}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateConfig((c) => ({
                      ...c,
                      sections: {
                        ...c.sections,
                        faqs: {
                          ...c.sections.faqs,
                          items: [...c.sections.faqs.items, { question: "", answer: "" }],
                        },
                      },
                    }))
                  }
                >
                  Add FAQ
                </Button>
              </div>
            )}

            {expanded === "cta" && (
              <div className="space-y-4">
                <div>
                  <Label>Headline</Label>
                  <Input
                    className="mt-1"
                    value={config.sections.cta.headline}
                    onChange={(e) =>
                      updateConfig((c) => ({
                        ...c,
                        sections: {
                          ...c.sections,
                          cta: { ...c.sections.cta, headline: e.target.value },
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Subheadline</Label>
                  <Textarea
                    className="mt-1"
                    rows={2}
                    value={config.sections.cta.subheadline}
                    onChange={(e) =>
                      updateConfig((c) => ({
                        ...c,
                        sections: {
                          ...c.sections,
                          cta: { ...c.sections.cta, subheadline: e.target.value },
                        },
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {!["hero", "overview", "features", "faqs", "cta"].includes(expanded) && (
              <p className="text-sm text-slate-500">
                Toggle this section on/off and reorder it. Content for &ldquo;{SECTION_LABELS[expanded]}&rdquo; is
                auto-generated from your product data. Advanced editing for this section is coming soon.
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === "seo" && (
        <div className="max-w-2xl space-y-4 rounded-2xl border border-slate-100 bg-white p-6">
          {(
            [
              ["title", "SEO Title"],
              ["description", "Meta Description"],
              ["focusKeywords", "Focus Keywords"],
              ["ogTitle", "Open Graph Title"],
              ["ogDescription", "Open Graph Description"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <Label>{label}</Label>
              {key === "description" || key === "ogDescription" ? (
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={config.seo[key]}
                  onChange={(e) =>
                    updateConfig((c) => ({ ...c, seo: { ...c.seo, [key]: e.target.value } }))
                  }
                />
              ) : (
                <Input
                  className="mt-1"
                  value={config.seo[key]}
                  onChange={(e) =>
                    updateConfig((c) => ({ ...c, seo: { ...c.seo, [key]: e.target.value } }))
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "theme" && (
        <div className="max-w-2xl space-y-4 rounded-2xl border border-slate-100 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {(
              [
                ["primaryColor", "Primary"],
                ["secondaryColor", "Secondary"],
                ["accentColor", "Accent"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input
                  type="color"
                  className="mt-1 h-10 w-full"
                  value={config.theme[key]}
                  onChange={(e) =>
                    updateConfig((c) => ({
                      ...c,
                      theme: { ...c.theme, [key]: e.target.value },
                    }))
                  }
                />
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Button style</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
                value={config.theme.buttonStyle}
                onChange={(e) =>
                  updateConfig((c) => ({
                    ...c,
                    theme: {
                      ...c.theme,
                      buttonStyle: e.target.value as ProductLandingConfig["theme"]["buttonStyle"],
                    },
                  }))
                }
              >
                <option value="rounded">Rounded</option>
                <option value="pill">Pill</option>
                <option value="square">Square</option>
              </select>
            </div>
            <div>
              <Label>Font</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
                value={config.theme.fontFamily}
                onChange={(e) =>
                  updateConfig((c) => ({
                    ...c,
                    theme: {
                      ...c.theme,
                      fontFamily: e.target.value as ProductLandingConfig["theme"]["fontFamily"],
                    },
                  }))
                }
              >
                <option value="plus-jakarta">Plus Jakarta Sans</option>
                <option value="dm-sans">DM Sans</option>
                <option value="inter">Inter</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {versions.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="font-heading text-sm font-semibold text-slate-900">Version history</h3>
          <ul className="mt-3 space-y-2">
            {versions.map((v) => (
              <li key={v.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {v.label ?? "Snapshot"} · {new Date(v.createdAt).toLocaleString()}
                </span>
                <Button type="button" variant="outline" size="sm" onClick={() => handleRestore(v.id)}>
                  Restore
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
