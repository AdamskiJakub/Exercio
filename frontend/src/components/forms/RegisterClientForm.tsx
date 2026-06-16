"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useRegisterClientForm } from "@/hooks/useRegisterClientForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { AuthHeader } from "@/components/ui/auth-header";

export default function RegisterClientForm() {
  const t = useTranslations("auth");
  const { form, isLoading, error, onSubmit } = useRegisterClientForm();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full">
        <AuthHeader
          title={`${t("createAccount")} - ${t("clientRole")}`}
          subtitle={t("clientRoleDesc")}
        />

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-6">
          {/* Form */}
          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  {t("firstName")} <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  {...register("firstName")}
                  placeholder={t("firstNamePlaceholder")}
                  aria-invalid={errors.firstName ? "true" : "false"}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">
                    {errors.firstName.message as string}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  {t("lastName")} <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  {...register("lastName")}
                  placeholder={t("lastNamePlaceholder")}
                  aria-invalid={errors.lastName ? "true" : "false"}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">
                    {errors.lastName.message as string}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  {t("email")} <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder={t("emailPlaceholder")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">
                    {errors.email.message as string}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {t("phone")}{" "}
                  <span className="text-gray-500 font-normal">
                    ({t("phoneHint")})
                  </span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  placeholder="123456789"
                  aria-invalid={errors.phone ? "true" : "false"}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">
                    {errors.phone.message as string}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  {t("password")} <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder={t("passwordHint")}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message as string}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("confirmPassword")} <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-linear-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600"
            >
              {isLoading ? t("creatingAccount") : t("createAccount")}
            </Button>
          </form>

          {/* Social Login Buttons - BELOW FORM */}
          <div className="mt-6">
            <SocialLoginButtons />
          </div>

          {/* Footer links - BELOW OAUTH BUTTONS */}
          <div className="text-center mt-6 space-y-3">
            <Link
              href="/register/instructor"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors block"
            >
              {t("areYouInstructor")}
            </Link>
            <p className="text-sm text-slate-400">
              {t("haveAccount")}{" "}
              <Link
                href="/login"
                className="font-medium text-orange-500 hover:text-orange-400 transition-colors"
              >
                {t("loginLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
