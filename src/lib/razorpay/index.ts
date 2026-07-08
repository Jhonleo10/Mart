import Razorpay from "razorpay";
import crypto from "crypto";
import { settingsRepository } from "@/repositories/settings.repository";

export type RazorpayCredentials = {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
};

export async function getRazorpayCredentials(): Promise<RazorpayCredentials> {
  const settings = await settingsRepository.getRazorpay();
  return {
    keyId: settings.keyId || process.env.RAZORPAY_KEY_ID || "",
    keySecret: settings.keySecret || process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: settings.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || "",
  };
}

export async function getRazorpayClient() {
  const creds = await getRazorpayCredentials();
  if (!creds.keyId || !creds.keySecret) return null;
  return new Razorpay({
    key_id: creds.keyId,
    key_secret: creds.keySecret,
  });
}

export async function createRazorpayOrder(
  amount: number,
  receipt: string,
  notes?: Record<string, string>,
) {
  const client = await getRazorpayClient();
  if (!client) {
    throw new Error("Razorpay is not configured");
  }

  return client.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt,
    notes,
  });
}

export function verifyPaymentSignatureWithSecret(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string,
): boolean {
  if (!secret) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

export function verifyWebhookSignatureWithSecret(body: string, signature: string, secret: string): boolean {
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

export async function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): Promise<boolean> {
  const creds = await getRazorpayCredentials();
  return verifyPaymentSignatureWithSecret(orderId, paymentId, signature, creds.keySecret);
}

export async function verifyWebhookSignature(body: string, signature: string): Promise<boolean> {
  const creds = await getRazorpayCredentials();
  return verifyWebhookSignatureWithSecret(body, signature, creds.webhookSecret);
}

export const REGISTRATION_FEE = Number(process.env.REGISTRATION_FEE ?? 4999);
