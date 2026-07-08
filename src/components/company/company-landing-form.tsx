"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { saveCompanyLandingSettings } from "@/actions/company-landing.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Sparkles } from "lucide-react";

export function CompanyLandingForm({
  companySlug,
  hasAccess,
  requiredPlan,
  defaultValues,
}: {
  companySlug: string;
  hasAccess: boolean;
  requiredPlan: string;
  defaultValues: {
    metaTitle: string;
    metaDescription: string;
    seoTagline: string;
    landingEnabled: boolean;
    primaryColor: string;
    accentColor: string;
    heroHeadline: string;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [metaTitle, setMetaTitle] = useState(defaultValues.metaTitle);
  const [metaDescription, setMetaDescription] = useState(defaultValues.metaDescription);

  if (!hasAccess) {
    return (
      <div className="rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-6 text-sm">
        <div className="flex items-center gap-2 font-medium text-slate-900">
          <Sparkles className="h-5 w-5 text-brand-blue" />
          Upgrade to unlock SEO landing page
        </div>
        <p className="mt-2 text-slate-600">
          The SEO vendor landing page is available on the <strong>{requiredPlan}</strong> plan and
          above. Upgrade to publish a dedicated page at{" "}
          <code className="rounded bg-white px-1">/vendor/{companySlug}</code>.
        </p>
        <Link href="/company/settings" className="mt-4 inline-block">
          <Button size="sm">View plans</Button>
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (metaTitle.trim().length < 10) {
      toast.error("Meta title should be at least 10 characters");
      return;
    }
    if (metaDescription.trim().length < 40) {
      toast.error("Meta description should be at least 40 characters");
      return;
    }

    setLoading(true);
    const result = await saveCompanyLandingSettings(new FormData(e.currentTarget));
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("SEO landing page saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-base font-semibold text-slate-900">
              Vendor SEO landing page
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Standalone page at <code className="rounded bg-slate-100 px-1">/vendor/{companySlug}</code>.
              Product pages use <code className="rounded bg-slate-100 px-1">/product/[slug]</code> — customize
              each under Products → Landing.
            </p>
            <a
              href={`/vendor/${companySlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline"
            >
              Preview vendor landing
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="landingEnabled"
              value="true"
              defaultChecked={defaultValues.landingEnabled}
              className="h-4 w-4 rounded border-slate-300 text-brand-green"
            />
            Publish landing page
          </label>
        </div>

        <div>
          <Label htmlFor="heroHeadline">Hero headline (optional)</Label>
          <Input
            id="heroHeadline"
            name="heroHeadline"
            defaultValue={defaultValues.heroHeadline}
            placeholder="Override the main headline on your landing page"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="seoTagline">Hero tagline</Label>
          <Input
            id="seoTagline"
            name="seoTagline"
            defaultValue={defaultValues.seoTagline}
            placeholder="e.g. CRM built for growing Indian businesses"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="metaTitle">
            Meta title (SEO) <span className="text-slate-400">({metaTitle.length}/70, min 10)</span>
          </Label>
          <Input
            id="metaTitle"
            name="metaTitle"
            required
            maxLength={70}
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="metaDescription">
            Meta description (SEO){" "}
            <span className="text-slate-400">({metaDescription.length}/160, min 40)</span>
          </Label>
          <Textarea
            id="metaDescription"
            name="metaDescription"
            required
            maxLength={160}
            rows={3}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm">
        <h3 className="font-heading text-base font-semibold text-slate-900">Brand theme</h3>
        <p className="mt-1 text-sm text-slate-500">Colors used on your standalone vendor landing page.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="primaryColor">Primary color</Label>
            <Input
              id="primaryColor"
              name="primaryColor"
              type="color"
              defaultValue={defaultValues.primaryColor}
              className="mt-1.5 h-10 w-full cursor-pointer"
            />
          </div>
          <div>
            <Label htmlFor="accentColor">Accent color</Label>
            <Input
              id="accentColor"
              name="accentColor"
              type="color"
              defaultValue={defaultValues.accentColor}
              className="mt-1.5 h-10 w-full cursor-pointer"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save landing page"}
      </Button>
    </form>
  );
}
