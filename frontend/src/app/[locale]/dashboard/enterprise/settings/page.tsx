"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useMyEnterpriseProfile } from "@/hooks/useEnterpriseProfile";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BottomNavBar } from "@/components/ui/bottom-nav-bar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { User, Lock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { useUpdatePassword } from "@/hooks/useUpdatePassword";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { createStrongPasswordSchema } from "@/lib/validations/schemas/auth-base";
import { SubscriptionInfo } from "@/components/enterprise/SubscriptionInfo";

export default function EnterpriseSettingsPage() {
  const t = useTranslations("Dashboard.enterprise");
  const tSettings = useTranslations("Dashboard.settings");
  const tAuth = useTranslations("auth");
  const { isChecking, user } = useAuthGuard({ requireAuth: true });
  const { data: profile, isLoading: profileLoading } = useMyEnterpriseProfile();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const updateUserMutation = useUpdateUser();
  const updatePasswordMutation = useUpdatePassword();
  const deleteAccountMutation = useDeleteAccount();

  if (isChecking || !user || profileLoading) {
    return <LoadingSpinner />;
  }

  if (user.role !== "ENTERPRISE") {
    return (
      <div className="min-h-screen bg-slate-900 p-4 md:p-8 flex items-center justify-center">
        <p className="text-slate-400 text-lg">{t("noAccess")}</p>
      </div>
    );
  }

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await updateUserMutation.mutateAsync({
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
      });

      toast.success(tSettings("successUpdate"));
    } catch (error: any) {
      toast.error(tSettings("errorUpdate"), {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setPasswordErrors({ newPassword: "", confirmPassword: "" });

    const passwordSchema = createStrongPasswordSchema(tAuth);

    try {
      passwordSchema.parse(passwordForm.newPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues[0].message;
        setPasswordErrors((prev) => ({ ...prev, newPassword: errorMessage }));
        toast.error(errorMessage);
        return;
      }
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      const errorMessage = tSettings("passwordMismatch");
      setPasswordErrors((prev) => ({ ...prev, confirmPassword: errorMessage }));
      toast.error(errorMessage);
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success(tSettings("successPassword"));

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(tSettings("errorPassword"), {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountMutation.mutateAsync();
      toast.success(tSettings("successDelete"));
    } catch (error: any) {
      toast.error(tSettings("errorDelete"), {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const isSubscribed = profile?.subscriptionStatus === "ACTIVE";
  const subscriptionExpiry = profile?.subscriptionExpiresAt
    ? new Date(profile.subscriptionExpiresAt).toLocaleDateString()
    : null;

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {t("subscriptionInfo")}
            </h1>
            <p className="text-slate-400 text-base">
              {t("subscriptionDescription")}
            </p>
          </div>
        </div>

        {/* Subscription Info */}
        <SubscriptionInfo
          isSubscribed={isSubscribed}
          subscriptionExpiry={subscriptionExpiry}
          instructorCount={profile?.instructors?.length || 0}
        />

        {/* Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <User className="w-5 h-5 text-blue-500" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-semibold text-white">
              {tSettings("personalInfo")}
            </h2>
          </div>

          <form onSubmit={handleUpdateUser} noValidate className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-base font-medium">
                  {tSettings("firstName")}
                </Label>
                <Input
                  type="text"
                  name="firstName"
                  id="firstName"
                  defaultValue={user.firstName || ""}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-base font-medium">
                  {tSettings("lastName")}
                </Label>
                <Input
                  type="text"
                  name="lastName"
                  id="lastName"
                  defaultValue={user.lastName || ""}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">
                {tSettings("email")}
              </Label>
              <Input
                type="email"
                name="email"
                id="email"
                defaultValue={user.email}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-medium">
                {tSettings("phone")}
              </Label>
              <Input
                type="tel"
                name="phone"
                id="phone"
                defaultValue={user.phone || ""}
                placeholder={tSettings("phonePlaceholder")}
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={updateUserMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white h-11 px-8 py-2.5 text-base font-semibold"
            >
              {updateUserMutation.isPending
                ? tSettings("saving")
                : tSettings("saveChanges")}
            </Button>
          </form>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Lock className="w-5 h-5 text-purple-500" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-semibold text-white">
              {tSettings("security")}
            </h2>
          </div>

          <form
            onSubmit={handleUpdatePassword}
            noValidate
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className="text-base font-medium"
              >
                {tSettings("currentPassword")}
              </Label>
              <Input
                type="password"
                id="currentPassword"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-base font-medium">
                {tSettings("newPassword")}
              </Label>
              <Input
                type="password"
                id="newPassword"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  });
                  if (passwordErrors.newPassword) {
                    setPasswordErrors((prev) => ({ ...prev, newPassword: "" }));
                  }
                }}
                aria-invalid={passwordErrors.newPassword ? "true" : "false"}
                aria-describedby={
                  passwordErrors.newPassword
                    ? "new-password-error"
                    : "new-password-hint"
                }
                required
                minLength={8}
                className="h-11"
              />
              {passwordErrors.newPassword && (
                <p
                  id="new-password-error"
                  className="text-sm text-red-500"
                  role="alert"
                >
                  {passwordErrors.newPassword}
                </p>
              )}
              {!passwordErrors.newPassword && (
                <p
                  id="new-password-hint"
                  className="text-sm text-slate-400 leading-relaxed"
                >
                  Min 8 znaków, wielkie i małe litery, cyfry oraz znaki
                  specjalne (@$!%*?&)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-base font-medium"
              >
                {tSettings("confirmPassword")}
              </Label>
              <Input
                type="password"
                id="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  });
                  if (passwordErrors.confirmPassword) {
                    setPasswordErrors((prev) => ({
                      ...prev,
                      confirmPassword: "",
                    }));
                  }
                }}
                aria-invalid={passwordErrors.confirmPassword ? "true" : "false"}
                aria-describedby={
                  passwordErrors.confirmPassword
                    ? "confirm-password-error"
                    : undefined
                }
                required
                minLength={8}
                className="h-11"
              />
              {passwordErrors.confirmPassword && (
                <p
                  id="confirm-password-error"
                  className="text-sm text-red-500"
                  role="alert"
                >
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={updatePasswordMutation.isPending}
              className="bg-purple-500 hover:bg-purple-600 text-white h-11 px-8 py-2.5 text-base font-semibold"
            >
              {updatePasswordMutation.isPending
                ? tSettings("updating")
                : tSettings("updatePassword")}
            </Button>
          </form>
        </motion.div>

        {/* Delete Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-500/10 backdrop-blur-sm border border-red-500/50 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle
                className="w-5 h-5 text-red-500"
                aria-hidden="true"
              />
            </div>
            <h2 className="text-2xl font-semibold text-red-400">
              {tSettings("dangerZone")}
            </h2>
          </div>

          <p className="text-slate-300 text-base mb-4">
            {tSettings("deleteAccountDescription")}
          </p>

          {!showDeleteConfirm ? (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-500 hover:bg-red-600 text-white h-11 px-8 py-2.5 text-base font-semibold"
            >
              {tSettings("deleteAccountButton")}
            </Button>
          ) : (
            <div
              className="space-y-4"
              role="alertdialog"
              aria-label={tSettings("deleteAccountConfirm")}
            >
              <p className="text-red-400 font-medium text-base">
                {tSettings("deleteAccountConfirm")}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-white h-11 px-8 py-2.5 text-base font-semibold"
                  aria-label={tSettings("cancelDelete") || "Cancel deletion"}
                >
                  {tSettings("cancel")}
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white h-11 px-8 py-2.5 text-base font-semibold"
                  aria-label={tSettings("confirmDelete")}
                >
                  {tSettings("confirmDelete")}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <BottomNavBar
        backText={tSettings("backToDashboard")}
        backHref="/dashboard"
      />
    </div>
  );
}
