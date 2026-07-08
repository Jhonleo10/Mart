"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from "lucide-react";
import { savePricingPlans } from "@/actions/settings.actions";
import type { PricingPlan } from "@/lib/settings/defaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

function createPlanFromTemplate(source?: PricingPlan): PricingPlan {
  const base = source ?? {
    id: "vendor-basic",
    name: "Basic",
    audience: "For Vendors",
    price: "₹4,999",
    priceAmount: 4999,
    period: "one-time registration",
    description: "",
    features: [],
    cta: "Pay & Register",
    href: "/seller/register",
    highlighted: false,
    active: true,
    accent: "blue" as const,
    razorpayEnabled: true,
  };

  return {
    ...base,
    id: `custom-${Date.now()}`,
    name: `${base.name} Copy`,
    highlighted: false,
    active: false,
  };
}

export function PricingAdminForm({ initialPlans }: { initialPlans: PricingPlan[] }) {
  const { confirm, confirmDialog } = useConfirmDialog();
  const [plans, setPlans] = useState(initialPlans);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialPlans.map((p) => [p.id, p.active !== false])),
  );
  const [showInactive, setShowInactive] = useState(true);

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [plans]);

  const visiblePlans = showInactive
    ? sortedPlans
    : sortedPlans.filter((p) => p.active !== false);

  function updatePlan(index: number, field: keyof PricingPlan, value: PricingPlan[keyof PricingPlan]) {
    setPlans((current) =>
      current.map((plan, i) => {
        if (i !== index) return plan;
        const next = { ...plan, [field]: value };
        if (field === "priceAmount" && typeof value === "number") {
          next.price = `₹${value.toLocaleString("en-IN")}`;
        }
        return next;
      }),
    );
  }

  function updatePlanById(planId: string, field: keyof PricingPlan, value: PricingPlan[keyof PricingPlan]) {
    setPlans((current) =>
      current.map((plan) => {
        if (plan.id !== planId) return plan;
        const next = { ...plan, [field]: value };
        if (field === "priceAmount" && typeof value === "number") {
          next.price = `₹${value.toLocaleString("en-IN")}`;
        }
        return next;
      }),
    );
  }

  function updateFeatures(planId: string, value: string) {
    const features = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    updatePlanById(planId, "features", features);
  }

  function addPlan() {
    const template = plans.find((p) => p.id === "vendor-growth") ?? plans[0];
    const next = createPlanFromTemplate(template);
    setPlans((current) => [...current, next]);
    setExpanded((e) => ({ ...e, [next.id]: true }));
  }

  function duplicatePlan(plan: PricingPlan) {
    const next = createPlanFromTemplate(plan);
    setPlans((current) => [...current, next]);
    setExpanded((e) => ({ ...e, [next.id]: true }));
  }

  async function removePlan(planId: string, planName: string) {
    const ok = await confirm({
      title: `Remove "${planName}"?`,
      description: "This plan will be removed from pricing management. Save to apply changes site-wide.",
      confirmLabel: "Remove plan",
      variant: "destructive",
    });
    if (!ok) return;
    setPlans((current) => current.filter((p) => p.id !== planId));
  }

  async function handleSave() {
    const ids = plans.map((p) => p.id.trim()).filter(Boolean);
    if (ids.length !== new Set(ids).size) {
      toast.error("Each plan must have a unique ID");
      return;
    }

    const ok = await confirm({
      title: "Save pricing plans?",
      description: "Homepage pricing and seller registration will be updated with these plans.",
      confirmLabel: "Save all plans",
      variant: "warning",
    });
    if (!ok) return;

    setSaving(true);
    const result = await savePricingPlans(plans);
    setSaving(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("Pricing plans saved — homepage and seller registration updated.");
  }

  return (
    <div className="space-y-4">
      {confirmDialog}
      <div className="admin-pricing-toolbar dash-panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {plans.filter((p) => p.active !== false).length} active · {plans.length} total plans
          </p>
          <p className="text-xs text-slate-500">Inactive plans stay in admin but hide from the public site</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Show inactive
          </label>
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addPlan}>
            <Plus className="h-3.5 w-3.5" />
            Add plan
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm" variant="outline">
            {saving ? "Saving..." : "Quick save"}
          </Button>
        </div>
      </div>

      {visiblePlans.map((plan) => {
        const index = plans.findIndex((p) => p.id === plan.id);
        const isOpen = expanded[plan.id] ?? false;

        return (
          <div
            key={plan.id}
            className={cn(
              "admin-pricing-card dash-panel overflow-hidden",
              plan.active === false && "opacity-80",
            )}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-slate-50/80 sm:p-5"
              onClick={() => setExpanded((e) => ({ ...e, [plan.id]: !isOpen }))}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading truncate text-base font-semibold text-slate-900">
                    {plan.name}
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                    {plan.id}
                  </span>
                  {plan.active === false && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                      Inactive
                    </span>
                  )}
                  {plan.highlighted && (
                    <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-[10px] font-semibold text-brand-green-dark">
                      Highlighted
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-slate-500">
                  {plan.price} · {plan.period}
                </p>
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 shrink-0 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
              )}
            </button>

            {isOpen && (
              <div className="border-t border-slate-100 p-4 sm:p-5">
                <div className="mb-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Plan ID (unique slug)</Label>
                    <Input
                      value={plan.id}
                      onChange={(e) => updatePlan(index, "id", e.target.value.trim())}
                    />
                  </div>
                  <div>
                    <Label>Accent</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                      value={plan.accent}
                      onChange={(e) =>
                        updatePlan(index, "accent", e.target.value as PricingPlan["accent"])
                      }
                    >
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={plan.name}
                        onChange={(e) => updatePlan(index, "name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Audience</Label>
                      <Input
                        value={plan.audience}
                        onChange={(e) => updatePlan(index, "audience", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Display price</Label>
                        <Input
                          value={plan.price}
                          onChange={(e) => updatePlan(index, "price", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Amount (INR)</Label>
                        <Input
                          type="number"
                          value={plan.priceAmount ?? ""}
                          onChange={(e) =>
                            updatePlan(
                              index,
                              "priceAmount",
                              e.target.value ? Number(e.target.value) : null,
                            )
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Period</Label>
                      <Input
                        value={plan.period}
                        onChange={(e) => updatePlan(index, "period", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        rows={3}
                        value={plan.description}
                        onChange={(e) => updatePlan(index, "description", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Features (one per line)</Label>
                      <Textarea
                        rows={5}
                        value={plan.features.join("\n")}
                        onChange={(e) => updateFeatures(plan.id, e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>CTA label</Label>
                        <Input
                          value={plan.cta}
                          onChange={(e) => updatePlan(index, "cta", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>CTA href</Label>
                        <Input
                          value={plan.href}
                          onChange={(e) => updatePlan(index, "href", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={plan.active}
                        onChange={(e) => updatePlan(index, "active", e.target.checked)}
                      />
                      Active on site
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={plan.highlighted}
                        onChange={(e) => updatePlan(index, "highlighted", e.target.checked)}
                      />
                      Highlighted
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={plan.razorpayEnabled}
                        onChange={(e) => updatePlan(index, "razorpayEnabled", e.target.checked)}
                      />
                      Razorpay checkout
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => duplicatePlan(plan)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Duplicate
                    </Button>
                    {!["vendor-basic", "vendor-growth", "vendor-pro"].includes(plan.id) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1 text-red-600 hover:text-red-700"
                        onClick={() => removePlan(plan.id, plan.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="admin-pricing-sticky-bar">
        <div>
          <p className="text-sm font-semibold text-slate-800">Ready to publish pricing changes?</p>
          <p className="text-xs text-slate-500">Updates homepage pricing and seller registration instantly after save.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg" className="min-w-[10rem]">
          {saving ? "Saving..." : "Save all plans"}
        </Button>
      </div>
    </div>
  );
}
