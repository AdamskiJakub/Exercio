"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { AuthHeader } from "@/components/ui/auth-header";
import { LegalCheckbox } from "@/components/ui/legal-checkbox";

interface RegisterFormProps {
  intent: "client" | "instructor";
}

const roleConfig = {
  instructor: {
    titleSuffix: "instructorRole",
    subtitle: "instructorRoleDesc",
    buttonGradient:
      "bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
    switchHref: "/register/client",
    switchKey: "registerAsClientInstead",
    switchColor: "text-violet-400 hover:text-violet-300",
  },
  client: {
    titleSuffix: "clientRole",
    subtitle: "clientRoleDesc",
    buttonGradient:
      "bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700",
    switchHref: "/register/instructor",
    switchKey: "areYouInstructor",
    switchColor: "text-orange-400 hover:text-orange-300",
  },
} as const;

export default function RegisterForm({ intent }: RegisterFormProps) {
  const t = useTranslations("auth");
  const { form, isLoading, error, onSubmit } = useRegisterForm({ intent });
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const isInstructor = intent === "instructor";
  const config = roleConfig[intent];
  const agreeToTerms = watch("agreeToTerms");

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full">
        <AuthHeader
          title={`${t("createAccount")} - ${t(config.titleSuffix)}`}
          subtitle={t(config.subtitle)}
        />

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-6">
          {/* Form */}
          <form
            className="space-y-6"
            onSubmit={onSubmit}
            noValidate
            aria-label={t("createAccount")}
          >
            {error && (
              <div
                className="rounded-lg bg-red-500/10 border border-red-500/50 p-4"
                role="alert"
              >
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
                  autoComplete="given-name"
                  {...register("firstName")}
                  placeholder={t("firstNamePlaceholder")}
                  aria-invalid={errors.firstName ? "true" : "false"}
                  aria-describedby={
                    errors.firstName ? "firstName-error" : undefined
                  }
                />
                {errors.firstName && (
                  <p
                    id="firstName-error"
                    className="text-sm text-red-500"
                    role="alert"
                  >
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
                  autoComplete="family-name"
                  {...register("lastName")}
                  placeholder={t("lastNamePlaceholder")}
                  aria-invalid={errors.lastName ? "true" : "false"}
                  aria-describedby={
                    errors.lastName ? "lastName-error" : undefined
                  }
                />
                {errors.lastName && (
                  <p
                    id="lastName-error"
                    className="text-sm text-red-500"
                    role="alert"
                  >
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
                  autoComplete="email"
                  {...register("email")}
                  placeholder={t("emailPlaceholder")}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    className="text-sm text-red-500"
                    role="alert"
                  >
                    {errors.email.message as string}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {t("phone")}{" "}
                  {isInstructor ? (
                    <span className="text-red-400">*</span>
                  ) : (
                    <span className="text-gray-500 font-normal">
                      ({t("phoneHint")})
                    </span>
                  )}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  {...register("phone")}
                  placeholder="123456789"
                  aria-invalid={errors.phone ? "true" : "false"}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                {errors.phone && (
                  <p
                    id="phone-error"
                    className="text-sm text-red-500"
                    role="alert"
                  >
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
                  autoComplete="new-password"
                  {...register("password")}
                  placeholder={t("passwordHint")}
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                />
                {errors.password && (
                  <p
                    id="password-error"
                    className="text-sm text-red-500"
                    role="alert"
                  >
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
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                  aria-describedby={
                    errors.confirmPassword ? "confirmPassword-error" : undefined
                  }
                />
                {errors.confirmPassword && (
                  <p
                    id="confirmPassword-error"
                    className="text-sm text-red-500"
                    role="alert"
                  >
                    {errors.confirmPassword.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Legal Checkbox */}
            <LegalCheckbox
              checked={!!agreeToTerms}
              onChange={(checked) =>
                setValue("agreeToTerms", checked, { shouldValidate: true })
              }
              error={errors.agreeToTerms?.message as string | undefined}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-semibold ${config.buttonGradient}`}
            >
              {isLoading ? t("creatingAccount") : t("createAccount")}
            </Button>
          </form>

          {/* Social Login Buttons - BELOW FORM */}
          <div className="mt-6">
            <SocialLoginButtons />
          </div>

          {/* Footer links */}
          <div className="text-center mt-6 space-y-3">
            <Link
              href={config.switchHref}
              className={`text-sm transition-colors block ${config.switchColor}`}
            >
              {t(config.switchKey)}
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
