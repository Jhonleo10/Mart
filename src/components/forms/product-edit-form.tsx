"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProduct } from "@/actions/product.actions";
import { EMAIL_HINT } from "@/lib/validations/fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailInput } from "@/components/ui/email-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  VisualShowcaseField,
  createDefaultShowcaseSlots,
  hasShowcaseImage,
  showcaseUrls,
  type ShowcaseSlot,
} from "@/components/forms/visual-showcase-field";
import type { PricingModel, ProductStatus } from "@prisma/client";

interface ProductEditFormProps {
  productId: string;
  categories: { id: string; name: string }[];
  defaultValues: {
    name: string;
    shortDescription: string;
    fullDescription: string;
    categoryId: string;
    pricingModel: PricingModel;
    price?: number;
    features: string[];
    websiteUrl: string;
    demoUrl: string;
    supportEmail: string;
    tags: string[];
    images: string[];
    status: ProductStatus;
  };
}

export function ProductEditForm({ productId, categories, defaultValues }: ProductEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState(
    defaultValues.features.length > 0 ? defaultValues.features : [""],
  );
  const [showcaseSlots, setShowcaseSlots] = useState<ShowcaseSlot[]>(() =>
    createDefaultShowcaseSlots(2, defaultValues.images),
  );

  async function submit(asDraft: boolean) {
    if (!hasShowcaseImage(showcaseSlots)) {
      toast.error("Please upload at least one product screenshot.");
      return;
    }

    if (showcaseSlots.some((s) => s.uploading)) {
      toast.error("Please wait for image uploads to finish.");
      return;
    }

    setLoading(true);
    try {
      const form = document.getElementById("product-edit-form") as HTMLFormElement;
      const formData = new FormData(form);
      features.filter(Boolean).forEach((f) => formData.append("features", f));
      defaultValues.tags.forEach((t) => formData.append("tags", t));
      showcaseUrls(showcaseSlots).forEach((url) => formData.append("images", url));

      const result = await updateProduct(productId, formData, { asDraft });
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(asDraft ? "Draft saved" : "Product updated");
      router.push("/company/products");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id="product-edit-form" className="mx-auto max-w-3xl space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" name="name" defaultValue={defaultValues.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shortDescription">Short Description</Label>
          <Input
            id="shortDescription"
            name="shortDescription"
            defaultValue={defaultValues.shortDescription}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fullDescription">Full Description</Label>
          <Textarea
            id="fullDescription"
            name="fullDescription"
            rows={6}
            defaultValue={defaultValues.fullDescription}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={defaultValues.categoryId}
              className="flex h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              step="1"
              placeholder="Optional — shown on listing"
              defaultValue={defaultValues.price ?? ""}
            />
            <p className="text-xs text-slate-400">Billing model is discussed during demos, not shown publicly.</p>
            <input type="hidden" name="pricingModel" value={defaultValues.pricingModel} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input id="websiteUrl" name="websiteUrl" defaultValue={defaultValues.websiteUrl} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demoUrl">Demo URL</Label>
            <Input id="demoUrl" name="demoUrl" defaultValue={defaultValues.demoUrl} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="supportEmail">Support Email</Label>
          <EmailInput id="supportEmail" name="supportEmail" defaultValue={defaultValues.supportEmail} placeholder="help@acme.com" />
          <p className="text-[11px] text-slate-400">{EMAIL_HINT}</p>
        </div>
        <div className="space-y-2">
          <Label>Features</Label>
          {features.map((f, i) => (
            <Input
              key={i}
              value={f}
              onChange={(e) => {
                const next = [...features];
                next[i] = e.target.value;
                setFeatures(next);
              }}
              placeholder={`Feature ${i + 1}`}
            />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setFeatures([...features, ""])}>
            Add feature
          </Button>
        </div>
        <p className="text-xs text-slate-500">Status: {defaultValues.status}</p>
      </div>

      <VisualShowcaseField
        slots={showcaseSlots}
        onChange={setShowcaseSlots}
        minSlots={2}
        uploadFolder="products"
      />

      <div className="flex flex-wrap gap-3">
        <Button type="button" disabled={loading} onClick={() => submit(false)}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Submit"}
        </Button>
        <Button type="button" variant="outline" disabled={loading} onClick={() => submit(true)}>
          Save as Draft
        </Button>
      </div>
    </form>
  );
}
