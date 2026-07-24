"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { saveRequirementProfile } from "@/actions/intelligence.actions";
import type { UserRequirements } from "@/lib/intelligence/types";
import {
  BUDGET_PRESETS,
  buildRequirementSearchQuery,
  computeRequirementCompleteness,
  getRequirementSummaryChips,
  validateRequirementStep,
  type RequirementStepId,
} from "@/lib/intelligence/requirement-search";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Search,
  Sparkles,
  Target,
} from "lucide-react";

const STEPS: { id: RequirementStepId; title: string; subtitle: string; optional?: boolean }[] = [
  { id: "industry", title: "Industry", subtitle: "What sector is your business in?" },
  { id: "size", title: "Business size", subtitle: "How large is your team?" },
  { id: "budget", title: "Budget", subtitle: "Monthly software budget (INR)" },
  { id: "features", title: "Must-have features", subtitle: "Capabilities you cannot compromise on" },
  { id: "integrations", title: "Integrations", subtitle: "Tools you already use (optional)", optional: true },
  { id: "deployment", title: "Deployment", subtitle: "Hosting preference (optional)", optional: true },
  { id: "country", title: "Country", subtitle: "Where is your business based? (optional)", optional: true },
];

const INDUSTRIES = [
  "Retail",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Education",
  "SaaS",
  "Logistics",
  "Real Estate",
  "Hospitality",
  "Other",
];
const SIZES = [
  { value: "solo", label: "Solo / Freelancer" },
  { value: "small", label: "2–50 employees" },
  { value: "medium", label: "51–500 employees" },
  { value: "enterprise", label: "500+ employees" },
];
const FEATURE_OPTIONS = [
  "CRM",
  "Analytics",
  "Automation",
  "WhatsApp",
  "API",
  "Mobile App",
  "Invoicing",
  "Reporting",
  "SSO",
  "Multi-user",
  "Inventory",
  "Support Desk",
  "Payroll",
  "Project Management",
];
const INTEGRATION_OPTIONS = [
  "WhatsApp",
  "Slack",
  "Zapier",
  "Google Workspace",
  "Microsoft 365",
  "Razorpay",
  "Salesforce",
];
const COMPANY_TYPES = ["Startup", "SMB", "Enterprise", "Agency", "Non-profit", "Other"];
const DEPLOYMENT_OPTIONS = [
  { value: "cloud", label: "Cloud / SaaS" },
  { value: "on_premise", label: "On-premise" },
  { value: "hybrid", label: "Hybrid" },
  { value: "any", label: "No preference" },
];

const COUNTRIES = [
  "IN", "US", "GB", "CA", "AU", "DE", "FR", "SG", "AE", "NL",
  "BR", "ZA", "JP", "CN", "KR", "SE", "CH", "IT", "ES", "NZ",
];

function RequirementPreview({ data }: { data: UserRequirements }) {
  const query = buildRequirementSearchQuery(data);
  const chips = getRequirementSummaryChips(data);
  const completeness = computeRequirementCompleteness(data);

  return (
    <aside className="requirement-preview rounded-2xl border border-brand-blue/15 bg-gradient-to-br from-brand-blue/[0.04] to-white p-4 sm:p-5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-blue">
        <Target className="h-3.5 w-3.5" />
        Search profile preview
      </p>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Profile strength</span>
          <span className="font-semibold text-slate-700">{completeness}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-brand transition-all duration-300"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      {chips.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600"
            >
              {chip}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs text-slate-500">Selections will shape your smart search query.</p>
      )}

      <div className="mt-4 rounded-xl border border-slate-200/80 bg-white/90 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Smart search query</p>
        <p className="mt-1 text-sm font-medium text-slate-800">
          {query || "Complete industry, budget & features to generate a query"}
        </p>
      </div>
    </aside>
  );
}

export function RequirementWizard({ initial, onClose }: { initial?: UserRequirements | null; onClose?: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [customFeature, setCustomFeature] = useState("");
  const [customIntegration, setCustomIntegration] = useState("");
  const [data, setData] = useState<UserRequirements>({
    industry: initial?.industry ?? "",
    businessSize: initial?.businessSize ?? "",
    budgetMax: initial?.budgetMax ?? 10000,
    requiredFeatures: initial?.requiredFeatures ?? [],
    preferredIntegrations: initial?.preferredIntegrations ?? [],
    deploymentPreference: initial?.deploymentPreference ?? "any",
    companyType: initial?.companyType ?? "",
    country: initial?.country ?? "IN",
  });

  const currentStep = STEPS[step]!;
  const stepError = useMemo(
    () => validateRequirementStep(currentStep.id, data),
    [currentStep.id, data],
  );

  function toggleList(key: "requiredFeatures" | "preferredIntegrations", value: string) {
    setData((prev) => {
      const list = prev[key] ?? [];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...prev, [key]: next };
    });
  }

  function addCustomItem(key: "requiredFeatures" | "preferredIntegrations", raw: string, clear: () => void) {
    const value = raw.trim();
    if (!value) return;
    setData((prev) => {
      const list = prev[key] ?? [];
      if (list.includes(value)) return prev;
      return { ...prev, [key]: [...list, value] };
    });
    clear();
  }

  function goNext() {
    if (stepError && !currentStep.optional) {
      toast.error(stepError);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function submit(mode: "search" | "recommendations") {
    const blocking = STEPS.filter((s) => !s.optional).map((s) => validateRequirementStep(s.id, data)).find(Boolean);
    if (blocking) {
      toast.error(blocking);
      return;
    }

    startTransition(async () => {
      try {
        await saveRequirementProfile(data);
        toast.success("Requirements saved — smart search is now personalized");
        onClose?.();
        const query = buildRequirementSearchQuery(data);
        if (mode === "search") {
          router.push(query ? `/user/discover?q=${encodeURIComponent(query)}` : "/user/discover");
        } else {
          router.push("/user/recommendations");
        }
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save requirements");
      }
    });
  }

  const isLast = step === STEPS.length - 1;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_280px]">
      <div className="discovery-glass rounded-2xl border border-slate-200/80 p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-blue" />
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900">Requirement Builder</h2>
              <p className="text-xs text-slate-500">
                Step {step + 1} of {STEPS.length}
                {currentStep.optional ? " · optional" : ""}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {computeRequirementCompleteness(data)}% ready
          </span>
        </div>

        <div className="mb-6 flex gap-1">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => i < step && setStep(i)}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= step ? "bg-gradient-brand" : "bg-slate-200",
                i < step && "cursor-pointer",
              )}
              aria-label={`Go to ${s.title}`}
            />
          ))}
        </div>

        <h3 className="font-heading text-xl font-semibold text-slate-900">{currentStep.title}</h3>
        <p className="mt-1 text-sm text-slate-500">{currentStep.subtitle}</p>

        <div className="mt-6 min-h-[220px]">
          {step === 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => setData((d) => ({ ...d, industry: ind }))}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                    data.industry === ind
                      ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                      : "border-slate-200 hover:border-brand-blue/30",
                  )}
                >
                  {ind}
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                {SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setData((d) => ({ ...d, businessSize: s.value }))}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all",
                      data.businessSize === s.value
                        ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                        : "border-slate-200 hover:border-brand-blue/30",
                    )}
                  >
                    {s.label}
                    {data.businessSize === s.value && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Company type (optional)
                </p>
                <div className="flex flex-wrap gap-2">
                  {COMPANY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, companyType: type }))}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                        data.companyType === type
                          ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                          : "border-slate-200 text-slate-600 hover:border-brand-blue/30",
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {BUDGET_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setData((d) => ({ ...d, budgetMax: preset.value }))}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-bold transition-all",
                      data.budgetMax === preset.value
                        ? "border-brand-blue bg-brand-blue text-white"
                        : "border-slate-200 text-slate-600 hover:border-brand-blue/30",
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={500}
                max={1000000}
                step={1000}
                value={data.budgetMax ?? 10000}
                onChange={(e) => setData((d) => ({ ...d, budgetMax: Number(e.target.value) }))}
                className="w-full accent-brand-blue"
              />
              <div className="flex items-center justify-center gap-3">
                <p className="text-center font-heading text-2xl font-bold text-slate-900">
                  ₹{(data.budgetMax ?? 10000).toLocaleString()}
                  <span className="text-sm font-normal text-slate-500"> / month max</span>
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Or enter custom amount
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={500}
                      max={10000000}
                      placeholder="50000"
                      value={data.budgetMax ?? ""}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        setData((d) => ({ ...d, budgetMax: val ?? 500 }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {FEATURE_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleList("requiredFeatures", f)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                      data.requiredFeatures?.includes(f)
                        ? "border-brand-green bg-brand-green/10 text-brand-green-dark"
                        : "border-slate-200 text-slate-600 hover:border-brand-green/30",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={customFeature}
                  onChange={(e) => setCustomFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomItem("requiredFeatures", customFeature, () => setCustomFeature(""));
                    }
                  }}
                  placeholder="Add custom feature..."
                  className="h-10 rounded-xl"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addCustomItem("requiredFeatures", customFeature, () => setCustomFeature(""))}
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {INTEGRATION_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleList("preferredIntegrations", f)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                      data.preferredIntegrations?.includes(f)
                        ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                        : "border-slate-200 text-slate-600 hover:border-brand-blue/30",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={customIntegration}
                  onChange={(e) => setCustomIntegration(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomItem("preferredIntegrations", customIntegration, () =>
                        setCustomIntegration(""),
                      );
                    }
                  }}
                  placeholder="Add custom integration..."
                  className="h-10 rounded-xl"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    addCustomItem("preferredIntegrations", customIntegration, () =>
                      setCustomIntegration(""),
                    )
                  }
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-2">
              {DEPLOYMENT_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setData((prev) => ({ ...prev, deploymentPreference: d.value }))}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all",
                    data.deploymentPreference === d.value
                      ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                      : "border-slate-200 hover:border-brand-blue/30",
                  )}
                >
                  {d.label}
                  {data.deploymentPreference === d.value && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Select your country</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {COUNTRIES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setData((d) => ({ ...d, country: code }))}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                      data.country === code
                        ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                        : "border-slate-200 text-slate-600 hover:border-brand-blue/30",
                    )}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {stepError && !currentStep.optional ? (
          <p className="mt-3 text-xs font-medium text-amber-700">{stepError}</p>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {isLast ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => submit("recommendations")}
              >
                <Sparkles className="h-4 w-4" />
                Scored list
              </Button>
              <Button type="button" disabled={pending} onClick={() => submit("search")} className="gap-1.5">
                <Search className="h-4 w-4" />
                {pending ? "Saving…" : "Search with profile"}
              </Button>
            </div>
          ) : (
            <Button type="button" onClick={goNext}>
              {currentStep.optional ? "Skip" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="hidden lg:block">
        <RequirementPreview data={data} />
      </div>

      <div className="lg:hidden">
        <RequirementPreview data={data} />
      </div>
    </div>
  );
}
