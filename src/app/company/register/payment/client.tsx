"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Script from "next/script";
import { createPlanOrder, verifyPlanPayment } from "@/actions/payment.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { PricingPlan } from "@/lib/settings/defaults";

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => { open: () => void };
    }
}

export function CompanyPaymentClient({ plans }: { plans: PricingPlan[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(
        plans.find((p) => p.highlighted)?.id ?? plans[0]?.id ?? "",
    );

    const availablePlans = plans.filter(p => p.razorpayEnabled && p.priceAmount);

    async function handlePayment() {
        if (!selectedPlanId) {
            toast.error("Please select a plan");
            return;
        }

        setLoading(true);
        const result = await createPlanOrder(selectedPlanId);
        setLoading(false);

        if ((result && "error" in result) || !result.data) {
            toast.error(("error" in result && result.error) || "Failed to create order");
            return;
        }

        const { orderId, amount, keyId } = result.data;

        const options = {
            key: keyId,
            amount: amount * 100,
            currency: "INR",
            name: "Genius Mart",
            description: "Seller Plan Registration",
            order_id: orderId,
            handler: async (response: {
                razorpay_order_id: string;
                razorpay_payment_id: string;
                razorpay_signature: string;
            }) => {
                const verify = await verifyPlanPayment({
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                    planId: selectedPlanId,
                });

                if (verify && "error" in verify) {
                    toast.error(verify.error);
                    return;
                }

                toast.success("Payment successful! Please complete your company profile.");
                router.push("/company/settings?tab=plan");
                router.refresh();
            },
            theme: { color: "#0076df" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    }

    return (
        <>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                onLoad={() => setScriptLoaded(true)}
            />
            <div className="mx-auto max-w-lg px-4 py-12">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Your Seller Plan</CardTitle>
                        <CardDescription>
                            Choose a plan to continue with your company registration.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Inline Plan Selector */}
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            {availablePlans.map((plan) => (
                                <button
                                    key={plan.id}
                                    type="button"
                                    disabled={loading}
                                    onClick={() => setSelectedPlanId(plan.id)}
                                    className={`rounded-xl border p-3 text-left transition-all ${selectedPlanId === plan.id
                                            ? "border-brand-green bg-brand-green/10 ring-2 ring-brand-green/25"
                                            : "border-slate-200 bg-slate-50/80 hover:border-brand-blue/30"
                                        }`}
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-semibold text-slate-900">{plan.name}</span>
                                        <span className="text-xs font-bold text-brand-green">
                                            {plan.price}
                                            <span className="font-normal text-slate-500">/{plan.period}</span>
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <Button
                            className="w-full"
                            onClick={handlePayment}
                            disabled={loading || !scriptLoaded}
                        >
                            {loading ? "Processing..." : "Pay with Razorpay"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
