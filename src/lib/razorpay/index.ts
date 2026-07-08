import Razorpay from "razorpay";
import crypto from "crypto";
import { settingsRepository } from "@/repositories/settings.repository";
import { isDatabaseConfigured } from "@/lib/db/is-database-configured";

export type RazorpayCredentials = {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
};

/** Env-only credentials — safe for public pages and build. */
export function getRazorpayCredentialsFromEnv(): RazorpayCredentials {
  return {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  };
}

export async function getRazorpayCredentials(): Promise<RazorpayCredentials> {
  const fromEnv = getRazorpayCredentialsFromEnv();
  if (!isDatabaseConfigured()) {
    return fromEnv;
  }

  const settings = await settingsRepository.getRazorpay();
  return {
    keyId: settings.keyId || fromEnv.keyId,
    keySecret: settings.keySecret || fromEnv.keySecret,
    webhookSecret: settings.webhookSecret || fromEnv.webhookSecret,
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
