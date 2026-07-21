"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FIELD_LIMITS, EMAIL_HINT } from "@/lib/validations/fields";
import { normalizeEmailInput } from "@/lib/validations/email-phone";
import { productSchema } from "@/lib/validations";
import { getValidatedForm, parseFormWithSchema } from "@/lib/validations/form-submit";
import { createProduct } from "@/actions/product.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailInput } from "@/components/ui/email-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  Globe,
  Loader2,
  Mail,
  PackagePlus,
  Plus,
  Star,
  Tag,
  Layers,
  Layout,
  MousePointer2,
  Zap,
  X,
} from "lucide-react";
import {
  VisualShowcaseField,
  createDefaultShowcaseSlots,
  hasShowcaseImage,
  showcaseUrls,
  type ShowcaseSlot,
} from "@/components/forms/visual-showcase-field";
import { clearFormDraft } from "@/lib/form-prefill";
import { cn } from "@/lib/utils";

const EMPTY_FIELDS = {
  name: "",
  shortDescription: "",
  fullDescription: "",
  websiteUrl: "",
  demoUrl: "",
  supportEmail: "",
  categoryId: "",
  price: "",
};

export function ProductForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState(["", "", ""]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showcaseSlots, setShowcaseSlots] = useState<ShowcaseSlot[]>(() =>
    createDefaultShowcaseSlots(2),
  );

  useEffect(() => {
    clearFormDraft("product-new");
  }, []);

  function setField(name: keyof typeof EMPTY_FIELDS, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }
  /* ── Tag helpers ────────────────────────────────────────────────── */
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validateAll(): boolean {
    const errors: Record<string, string> = {};

    if (!fields.name.trim() || fields.name.trim().length < 2) {
      errors.name = "Product name is required (min 2 characters)";
    }
    if (!fields.shortDescription.trim() || fields.shortDescription.trim().length < 10) {
      errors.shortDescription = "Short description required (min 10 characters)";
    }
    if (!fields.fullDescription.trim() || fields.fullDescription.trim().length < 50) {
      errors.fullDescription = "Full description required (min 50 characters)";
    }
    if (!fields.categoryId) {
      errors.categoryId = "Category is required";
    }
    if (!hasShowcaseImage(showcaseSlots)) {
      errors.images = "Upload at least one product screenshot";
    }
    if (showcaseSlots.some((s) => s.uploading)) {
      errors.images = "Please wait for image uploads to finish";
    }
    const validFeatures = features.filter(Boolean);
    if (validFeatures.length === 0) {
      errors.features = "At least one feature is required";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0]!;
      const el = document.getElementById(`field-${firstErrorField}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
      return false;
    }
    return true;
  }

  /* ── Submit ─────────────────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setFieldErrors({});

    const form = getValidatedForm(e);
    if (!form) return;

    if (!validateAll()) return;

    const formData = new FormData(form);
    features.filter(Boolean).forEach((f) => formData.append("features", f));
    tags.forEach((t) => formData.append("tags", t));
    showcaseUrls(showcaseSlots).forEach((url) => formData.append("images", url));

    const parsed = parseFormWithSchema(productSchema, formData);
    if (!parsed.success) {
      toast.error(parsed.error);
      return;
    }

    setLoading(true);
    try {
      const result = await createProduct(formData);
      if (result && "error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Product submitted for review!");
      setFields(EMPTY_FIELDS);
      setFeatures(["", "", ""]);
      setTags([]);
      setTagInput("");
      setFieldErrors({});
      setShowcaseSlots(createDefaultShowcaseSlots(2));
      router.push("/company/products");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const isBusy = loading;

  return (    <form onSubmit={handleSubmit} className="relative mx-auto max-w-full">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* ── MAIN CONTENT (Left) ────────────────────────────────── */}
        <div className="space-y-8 lg:col-span-8">

          {/* 1. Basic Identity */}
          <div className="group rounded-3xl border border-slate-200 bg-white p-1 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-4 rounded-t-[22px] bg-slate-50 px-8 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-4 ring-brand-blue/5">
                <PackagePlus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-none">Product Identity</h2>
                <p className="mt-1.5 text-sm text-slate-500 font-medium">How your product will be seen by everyone</p>
              </div>
            </div>

            <div className="space-y-6 p-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2" id="field-name">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Product Title
                  </Label>
                  <Input
                    name="name"
                    id="name"
                    value={fields.name}
                    onChange={(e) => { setField("name", e.target.value); setFieldErrors((prev) => { const next = { ...prev }; delete next.name; return next; }); }}
                    required
                    className={`h-12 rounded-2xl bg-slate-50/50 px-4 text-slate-900 transition-all focus:bg-white focus:ring-4 focus:ring-brand-blue/5 ${fieldErrors.name ? "border-red-400 ring-2 ring-red-200" : "border-slate-200"}`}
                    placeholder="e.g. Acme CRM"
                  />
                  {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
                </div>
                <div className="space-y-2" id="field-shortDescription">
                  <Label htmlFor="shortDescription" className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Catchy Tagline
                  </Label>
                  <Input
                    name="shortDescription"
                    id="shortDescription"
                    value={fields.shortDescription}
                    onChange={(e) => { setField("shortDescription", e.target.value); setFieldErrors((prev) => { const next = { ...prev }; delete next.shortDescription; return next; }); }}
                    required
                    className={`h-12 rounded-2xl bg-slate-50/50 px-4 text-slate-900 transition-all focus:bg-white focus:ring-4 focus:ring-brand-blue/5 ${fieldErrors.shortDescription ? "border-red-400 ring-2 ring-red-200" : "border-slate-200"}`}
                    placeholder="The only CRM you'll ever need"
                  />
                  {fieldErrors.shortDescription && <p className="text-xs text-red-600 mt-1">{fieldErrors.shortDescription}</p>}
                </div>
              </div>

              <div className="space-y-2" id="field-fullDescription">
                <Label htmlFor="fullDescription" className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Detailed Story
                </Label>
                <Textarea
                  name="fullDescription"
                  id="fullDescription"
                  value={fields.fullDescription}
                  onChange={(e) => { setField("fullDescription", e.target.value); setFieldErrors((prev) => { const next = { ...prev }; delete next.fullDescription; return next; }); }}
                  required
                  rows={8}
                  className={`rounded-2xl bg-slate-50/50 p-4 text-slate-900 transition-all focus:bg-white focus:ring-4 focus:ring-brand-blue/5 ${fieldErrors.fullDescription ? "border-red-400 ring-2 ring-red-200" : "border-slate-200"}`}
                  placeholder="Tell the world why your product is amazing..."
                />
                {fieldErrors.fullDescription && <p className="text-xs text-red-600 mt-1">{fieldErrors.fullDescription}</p>}
              </div>
            </div>
          </div>

          <div id="field-images">
            <VisualShowcaseField
              slots={showcaseSlots}
              onChange={setShowcaseSlots}
              minSlots={2}
              uploadFolder="products"
            />
            {fieldErrors.images && <p className="text-xs text-red-600 mt-2">{fieldErrors.images}</p>}
          </div>

          {/* 3. Global Reach (Links) */}
          <div className="group rounded-3xl border border-slate-200 bg-white p-1 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-4 rounded-t-[22px] bg-emerald-50/50 px-8 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-none">Global Presence</h2>
                <p className="mt-1.5 text-sm text-slate-500 font-medium">Connect with your users directly</p>
              </div>
            </div>

            <div className="grid gap-8 p-8 md:grid-cols-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Layout className="h-4 w-4 text-emerald-600" />
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Website</Label>
                </div>
                <Input
                  name="websiteUrl"
                  id="websiteUrl"
                  value={fields.websiteUrl}
                  onChange={(e) => setField("websiteUrl", e.target.value)}
                  type="url"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 px-4 text-sm focus:bg-white"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MousePointer2 className="h-4 w-4 text-emerald-600" />
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Demo App</Label>
                </div>
                <Input
                  name="demoUrl"
                  id="demoUrl"
                  value={fields.demoUrl}
                  onChange={(e) => setField("demoUrl", e.target.value)}
                  type="url"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 px-4 text-sm focus:bg-white"
                  placeholder="https://app.demo.com"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-emerald-600" />
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Support</Label>
                </div>
                <EmailInput
                  name="supportEmail"
                  id="supportEmail"
                  value={fields.supportEmail}
                  onChange={(e) => setField("supportEmail", e.target.value)}
                  onBlur={(e) => setField("supportEmail", normalizeEmailInput(e.target.value))}
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 px-4 text-sm focus:bg-white"
                  placeholder="help@acme.com"
                />
                <p className="mt-1 text-[11px] text-slate-400">{EMAIL_HINT}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── SIDEBAR (Right) ────────────────────────────────────── */}
        <aside className="space-y-8 lg:col-span-4">

          {/* Action Box */}
          <div className="sticky top-8 space-y-8">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-1 shadow-xl ring-1 ring-slate-900/5">
              <div className="bg-slate-900 p-8 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  Launch Rocket <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </h3>
                <p className="mt-2 text-sm text-slate-400 font-medium">Ready to showcase your creation to the world?</p>
              </div>

              <div className="space-y-4 p-8">
                <div className="space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                    <span>Validation Status</span>
                    <span className="text-brand-blue">Live Check</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" /> Identity Completed
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                      <div className={cn("h-1.5 w-1.5 rounded-full", hasShowcaseImage(showcaseSlots) ? "bg-green-500" : "bg-slate-300")} />
                      {showcaseUrls(showcaseSlots).length} Images Selected
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isBusy}
                  className="w-full h-14 rounded-2xl bg-brand-blue text-base font-bold shadow-lg shadow-brand-blue/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing...</>
                  ) : (
                    "Publish Product"
                  )}
                </Button>

                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Estimated review: 24 Hours
                </p>
              </div>
            </div>

            {/* Categorization */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-4 mb-5">
                <Layers className="h-4 w-4 text-brand-blue" /> Classification
              </h3>

              <div className="space-y-6">
                <div className="space-y-2" id="field-categoryId">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Industry Segment</Label>
                  <select
                    name="categoryId"
                    id="categoryId"
                    value={fields.categoryId}
                    onChange={(e) => { setField("categoryId", e.target.value); setFieldErrors((prev) => { const next = { ...prev }; delete next.categoryId; return next; }); }}
                    required
                    className={`flex h-12 w-full rounded-2xl bg-slate-50/50 px-4 text-sm font-medium text-slate-800 transition-all focus:bg-white focus:ring-4 focus:ring-brand-blue/5 ${fieldErrors.categoryId ? "border-red-400 ring-2 ring-red-200" : "border border-slate-200"}`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {fieldErrors.categoryId && <p className="text-xs text-red-600 mt-1">{fieldErrors.categoryId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Price (₹)
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    value={fields.price}
                    onChange={(e) => setField("price", e.target.value)}
                    type="number"
                    min={0}
                    step="1"
                    className="flex h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium text-slate-800 transition-all focus:bg-white focus:ring-4 focus:ring-brand-blue/5"
                    placeholder="e.g. 4999 — optional"
                  />
                  <p className="text-[11px] text-slate-400">
                    Shown on your listing. Billing model details are covered in the demo.
                  </p>
                  <input type="hidden" name="pricingModel" value="SUBSCRIPTION" />
                </div>
              </div>
            </div>

            {/* Value Points */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" id="field-features">
              <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-4 mb-5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> Core Features
              </h3>
              {fieldErrors.features && <p className="text-xs text-red-600 mb-3">{fieldErrors.features}</p>}

              <div className="space-y-3">
                {features.map((f, i) => (
                  <div key={i} className="group/feat flex items-center gap-3">
                    <input
                      value={f}
                      onChange={(e) => {
                        const n = [...features];
                        n[i] = e.target.value;
                        setFeatures(n);
                      }}
                      placeholder={`Feature ${i + 1}`}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-medium focus:bg-white transition-all ring-inset focus:ring-2 focus:ring-brand-blue/10"
                    />
                    {features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFeatures(features.filter((_, j) => j !== i))}
                        className="opacity-0 group-hover/feat:opacity-100 text-slate-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFeatures([...features, ""])}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-xs font-bold text-slate-400 hover:border-brand-blue/40 hover:text-brand-blue/60 transition-all"
                >
                  <Plus className="h-4 w-4" /> Add Highlight
                </button>
              </div>
            </div>

            {/* Smart Tags */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-4 mb-5">
                <Tag className="h-4 w-4 text-slate-400" /> Search Optimization
              </h3>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Keywords..."
                  className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-xs px-3 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="h-10 rounded-xl bg-slate-900 px-4 text-[10px] font-black uppercase tracking-tighter text-white"
                >
                  Apply
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors">
                    #{t}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setTags(tags.filter(x => x !== t))} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
