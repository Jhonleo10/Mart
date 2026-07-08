import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { fulfillCapturedPayment, markPaymentFailed } from "@/lib/payment/fulfill-payment";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!(await verifyWebhookSignature(body, signature))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: Record<string, string> } } };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (event.event === "payment.captured") {
    const paymentEntity = event.payload?.payment?.entity;
    if (!paymentEntity?.order_id || !paymentEntity?.id) {
      return NextResponse.json({ error: "Invalid payment payload" }, { status: 400 });
    }
    const checkoutSignature = paymentEntity.signature ?? "";
    await fulfillCapturedPayment(
      paymentEntity.order_id,
      paymentEntity.id,
      checkoutSignature,
      "webhook",
    );
  }

  if (event.event === "payment.failed") {
    const paymentEntity = event.payload?.payment?.entity;
    if (paymentEntity?.order_id) {
      await markPaymentFailed(paymentEntity.order_id);
    }
  }

  return NextResponse.json({ received: true });
}
