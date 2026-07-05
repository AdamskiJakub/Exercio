"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  createRegisterSchema,
  type RegisterFormData,
} from "@/lib/validations/register-form";
import { apiClient } from "@/lib/api";
import { normalizeApiError } from "@/lib/utils/error-handlers";
import { generateUsernameFromEmail } from "@/lib/utils/username-generator";

interface UseRegisterFormOptions {
  intent: "client" | "instructor";
}

export function useRegisterForm({ intent }: UseRegisterFormOptions) {
  const t = useTranslations("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(createRegisterSchema(t, intent)),
    mode: "onSubmit",
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { confirmPassword, ...registerData } = data;

      // Auto-generate username from email with proper validation
      const username = generateUsernameFromEmail(registerData.email);

      const locale = window.location.pathname.split("/")[1];

      await apiClient.post(`/auth/register?lang=${locale}`, {
        ...registerData,
        username,
        role: intent === "instructor" ? "INSTRUCTOR" : undefined,
      });

      // Save signup intent before redirecting to verify-email
      sessionStorage.setItem("signupIntent", intent);

      window.location.href = `/${locale}/verify-email?email=${encodeURIComponent(registerData.email)}`;
    } catch (err: any) {
      if (err.response?.status === 409) {
        const conflictMessage = err.response?.data?.message;
        setError(
          conflictMessage
            ? `${t("registrationFailed")}: ${conflictMessage}`
            : t("registrationFailed"),
        );
      } else {
        setError(normalizeApiError(err, t("registrationFailed")));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    error,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
