import { sendMail, getAdminEmails } from "./send";
import { CompanyRegisteredEmail } from "./templates/company-registered";
import { CompanyVerificationEmail } from "./templates/company-verification";
import { CompanyPendingApprovalEmail } from "./templates/company-pending-approval";
import { CompanyApprovedEmail } from "./templates/company-approved";
import { CompanyRejectedEmail } from "./templates/company-rejected";
import { UserOtpEmail } from "./templates/user-otp";
import { UserWelcomeEmail } from "./templates/user-welcome";
import { AdminNewUserEmail } from "./templates/admin-new-user";
import { AdminNewCompanyEmail } from "./templates/admin-new-company";
import { LeadNotificationEmail } from "./templates/lead-notification";
import { ForgotPasswordEmail } from "./templates/forgot-password";
import { PasswordChangedEmail } from "./templates/password-changed";
import {
  BookingConfirmationEmail,
  BookingStatusUpdateEmail,
  ProductApprovedEmail,
  ProductRejectedEmail,
} from "./templates/booking-product";
import { ContactInquiryEmail } from "./templates/contact-inquiry";
import { ContactConfirmationEmail } from "./templates/contact-confirmation";
import type { BookingEmailDetails } from "./types";

export const mailService = {
  async companyRegistered(to: string, ownerName: string, companyName: string) {
    return sendMail({
      to,
      subject: "Registration Successful — Account Activation Pending",
      template: "CompanyRegisteredEmail",
      react: CompanyRegisteredEmail({ ownerName, companyName }),
    });
  },

  async companyVerification(
    to: string,
    ownerName: string,
    companyName: string,
    token: string,
  ) {
    return sendMail({
      to,
      subject: "Verify Your Company Account",
      template: "CompanyVerificationEmail",
      react: CompanyVerificationEmail({ ownerName, companyName, token }),
    });
  },

  async companyPendingApproval(to: string, ownerName: string, companyName: string) {
    return sendMail({
      to,
      subject: "Registration Submitted Successfully",
      template: "CompanyPendingApprovalEmail",
      react: CompanyPendingApprovalEmail({ ownerName, companyName }),
    });
  },

  async companyApproved(to: string, ownerName: string, companyName: string) {
    return sendMail({
      to,
      subject: "Your Account Has Been Verified",
      template: "CompanyApprovedEmail",
      react: CompanyApprovedEmail({ ownerName, companyName }),
    });
  },

  async companyRejected(
    to: string,
    ownerName: string,
    companyName: string,
    note?: string,
  ) {
    return sendMail({
      to,
      subject: "Company Registration Update",
      template: "CompanyRejectedEmail",
      react: CompanyRejectedEmail({ ownerName, companyName, note }),
    });
  },

  async userOtp(to: string, name: string, otp: string) {
    return sendMail({
      to,
      subject: "Verify Your Email Address",
      template: "UserOtpEmail",
      react: UserOtpEmail({ name, otp }),
    });
  },

  async userWelcome(to: string, name: string) {
    return sendMail({
      to,
      subject: "Welcome to Genius Mart",
      template: "UserWelcomeEmail",
      react: UserWelcomeEmail({ name }),
    });
  },

  async adminNewUser(name: string, email: string, phone?: string | null) {
    const admins = await getAdminEmails();
    const registeredAt = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    await Promise.all(
      admins.map((to) =>
        sendMail({
          to,
          subject: "New User Registered Successfully",
          template: "AdminNewUserEmail",
          react: AdminNewUserEmail({ name, email, phone, registeredAt }),
        }),
      ),
    );
  },

  async adminNewCompany(data: {
    companyName: string;
    ownerName: string;
    email: string;
    phone?: string | null;
    website?: string | null;
    industry?: string | null;
    plan?: string | null;
  }) {
    const admins = await getAdminEmails();
    await Promise.all(
      admins.map((to) =>
        sendMail({
          to,
          subject: "New Company Registration — Review Required",
          template: "AdminNewCompanyEmail",
          react: AdminNewCompanyEmail(data),
        }),
      ),
    );
  },

  async newLead(to: string, details: BookingEmailDetails) {
    return sendMail({
      to,
      subject: `New Lead Received — ${details.productName}`,
      template: "LeadNotificationEmail",
      react: LeadNotificationEmail({
        productName: details.productName,
        leadName: details.leadName,
        leadEmail: details.leadEmail,
        leadPhone: details.leadPhone,
        preferredDate: details.preferredDate,
        preferredTime: details.preferredTime,
        message: details.message,
      }),
    });
  },

  async forgotPassword(to: string, name: string, token: string) {
    return sendMail({
      to,
      subject: "Reset Your Password",
      template: "ForgotPasswordEmail",
      react: ForgotPasswordEmail({ name, token }),
    });
  },

  async passwordChanged(to: string, name: string) {
    return sendMail({
      to,
      subject: "Password Changed Successfully",
      template: "PasswordChangedEmail",
      react: PasswordChangedEmail({ name }),
    });
  },

  async paymentSuccess(to: string, _amount: number, ownerName: string, companyName: string) {
    return this.companyPendingApproval(to, ownerName, companyName);
  },

  async registrationSuccess(to: string, name: string) {
    return this.userWelcome(to, name);
  },

  async bookingConfirmation(to: string, details: BookingEmailDetails) {
    return sendMail({
      to,
      subject: `Demo Request Confirmed — ${details.productName}`,
      template: "BookingConfirmationEmail",
      react: BookingConfirmationEmail(details),
    });
  },

  async bookingStatusUpdate(
    to: string,
    details: BookingEmailDetails & { status: "CONTACTED" | "CLOSED" },
  ) {
    return sendMail({
      to,
      subject:
        details.status === "CONTACTED"
          ? `${details.companyName} has received your demo request`
          : `Demo request closed — ${details.productName}`,
      template: "BookingStatusUpdateEmail",
      react: BookingStatusUpdateEmail(details),
    });
  },

  async productApproved(to: string, productName: string) {
    return sendMail({
      to,
      subject: "Product Published",
      template: "ProductApprovedEmail",
      react: ProductApprovedEmail({ productName }),
    });
  },

  async productRejected(
    to: string,
    productName: string,
    note?: string,
    supportEmail?: string,
  ) {
    return sendMail({
      to,
      subject: "Product Review Update — Action Required",
      template: "ProductRejectedEmail",
      react: ProductRejectedEmail({ productName, note, supportEmail }),
    });
  },

  async contactInquiry(
    to: string,
    data: { name: string; email: string; subject: string; message: string },
  ) {
    return sendMail({
      to,
      subject: `Contact: ${data.subject}`,
      template: "ContactInquiryEmail",
      react: ContactInquiryEmail(data),
      metadata: { email: data.email },
    });
  },

  async contactConfirmation(
    to: string,
    data: { name: string; subject: string; message: string },
  ) {
    return sendMail({
      to,
      subject: "We received your message — Genius Mart",
      template: "ContactConfirmationEmail",
      react: ContactConfirmationEmail(data),
    });
  },
};

export const emailService = mailService;
