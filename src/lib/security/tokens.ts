import { randomBytes, randomInt } from "crypto";

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

export function tokenExpiry(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function otpExpiry(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function resetTokenExpiry(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}
