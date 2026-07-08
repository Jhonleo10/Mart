"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KeyRound, LogOut, Mail, Phone, Shield, UserRound } from "lucide-react";
import { changeUserPassword, updateUserProfile } from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { UserProfileLogoutButton } from "@/components/user/user-profile-logout-button";
import { getValidatedForm, parseFormWithSchema } from "@/lib/validations/form-submit";
import { passwordChangeSchema, userProfileUpdateSchema } from "@/lib/validations";
import { FIELD_LIMITS, PHONE_HINT } from "@/lib/validations/fields";

interface UserProfileFormProps {
  user: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserProfileForm({ user }: UserProfileFormProps) {
  const router = useRouter();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = getValidatedForm(e);
    if (!form) return;

    const formData = new FormData(form);
    const parsed = parseFormWithSchema(userProfileUpdateSchema, formData);
    if (!parsed.success) {
      toast.error(parsed.error);
      return;
    }

    setProfileLoading(true);
    const result = await updateUserProfile(formData);
    setProfileLoading(false);

    if (result && "error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("Profile updated");
    router.refresh();
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = getValidatedForm(e);
    if (!form) return;

    const formData = new FormData(form);
    const parsed = passwordChangeSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid password");
      return;
    }

    setPasswordLoading(true);
    const result = await changeUserPassword(formData);
    setPasswordLoading(false);

    if (result && "error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("Password updated");
    form.reset();
  }

  return (
    <div className="buyer-profile-shell">
      <div className="buyer-profile-hero overflow-hidden rounded-2xl border border-brand-blue/15 bg-gradient-to-br from-brand-blue/[0.08] via-white to-brand-green/[0.06] p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-xl font-bold text-white shadow-md shadow-brand-blue/20">
            {initials(user.name) || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {user.email}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-semibold text-brand-blue ring-1 ring-brand-blue/15">
              <Shield className="h-3 w-3" />
              {user.role} account
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="buyer-glass-panel rounded-2xl border border-slate-200/80 p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
              <UserRound className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-heading font-semibold text-slate-900">Account details</h3>
              <p className="text-xs text-slate-500">Used for bookings and demo requests</p>
            </div>
          </div>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={user.name}
                required
                minLength={2}
                maxLength={FIELD_LIMITS.name?.max ?? 100}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled className="mt-1.5 bg-slate-50" />
              <p className="mt-1 text-xs text-slate-400">Email cannot be changed here.</p>
            </div>
            <div>
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Phone
              </Label>
              <PhoneInput
                id="phone"
                name="phone"
                defaultValue={user.phone}
                placeholder="9876543210"
                maxLength={FIELD_LIMITS.phone.exact}
                className="mt-1.5"
              />
              <p className="mt-1 text-[11px] text-slate-400">{PHONE_HINT}</p>
            </div>
            <Button type="submit" disabled={profileLoading} className="bg-gradient-brand">
              {profileLoading ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </section>

        <section className="buyer-glass-panel rounded-2xl border border-slate-200/80 p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <KeyRound className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-heading font-semibold text-slate-900">Change password</h3>
              <p className="text-xs text-slate-500">Keep your account secure</p>
            </div>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="mt-1.5"
              />
            </div>
            <Button type="submit" variant="outline" disabled={passwordLoading}>
              {passwordLoading ? "Updating..." : "Update password"}
            </Button>
          </form>
        </section>
      </div>

      <section className="buyer-glass-panel mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <LogOut className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-heading font-semibold text-slate-900">Sign out</h3>
            <p className="text-xs text-slate-500">End your current session on this device</p>
          </div>
        </div>
        <UserProfileLogoutButton />
      </section>
    </div>
  );
}
