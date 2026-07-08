"use server";

import {
  registerUser as registerUserImpl,
  registerAdmin as registerAdminImpl,
  completeCompanyRegistration as completeCompanyRegistrationImpl,
  registerCompany as registerCompanyImpl,
} from "@/actions/auth-registration.actions";
import {
  verifyCompanyEmail as verifyCompanyEmailImpl,
  verifyUserOtp as verifyUserOtpImpl,
  resendUserOtp as resendUserOtpImpl,
  getOtpVerificationStatus as getOtpVerificationStatusImpl,
} from "@/actions/auth-otp.actions";
import {
  loginUser as loginUserImpl,
  signOutAction as signOutActionImpl,
  logoutAllDevicesAction as logoutAllDevicesActionImpl,
  requestPasswordReset as requestPasswordResetImpl,
  resetPassword as resetPasswordImpl,
} from "@/actions/auth-session.actions";
import type { ActionResult } from "@/lib/action-types";

export async function registerUser(
  formData: FormData,
): Promise<ActionResult<{ email: string; requiresVerification: boolean }>> {
  return registerUserImpl(formData);
}

export async function registerAdmin(
  formData: FormData,
): Promise<ActionResult<{ email: string }>> {
  return registerAdminImpl(formData);
}

export async function completeCompanyRegistration(data: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  planId: string;
}): Promise<ActionResult<{ email: string }>> {
  return completeCompanyRegistrationImpl(data);
}

export async function registerCompany(
  formData: FormData,
): Promise<ActionResult<{ email: string; requiresVerification: boolean }>> {
  return registerCompanyImpl(formData);
}

export async function verifyCompanyEmail(
  token: string,
): Promise<ActionResult<{ redirectTo: string }>> {
  return verifyCompanyEmailImpl(token);
}

export async function verifyUserOtp(formData: FormData): Promise<ActionResult> {
  return verifyUserOtpImpl(formData);
}

export async function resendUserOtp(email: string): Promise<ActionResult> {
  return resendUserOtpImpl(email);
}

export async function getOtpVerificationStatus(email: string) {
  return getOtpVerificationStatusImpl(email);
}

export async function loginUser(
  formData: FormData,
): Promise<ActionResult<{ role: string; redirectTo: string }>> {
  return loginUserImpl(formData);
}

export async function signOutAction() {
  return signOutActionImpl();
}

export async function logoutAllDevicesAction() {
  return logoutAllDevicesActionImpl();
}

export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
  return requestPasswordResetImpl(formData);
}

export async function resetPassword(formData: FormData): Promise<ActionResult> {
  return resetPasswordImpl(formData);
}
