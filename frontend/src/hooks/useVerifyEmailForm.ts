"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import {
  createVerifyEmailSchema,
  type VerifyEmailFormData,
} from "@/lib/validations/verify-email";

export function useVerifyEmailForm(initialEmail?: string) {
  const t = useTranslations("auth");
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(createVerifyEmailSchema(t)),
    mode: "onSubmit",
    defaultValues: {
      email: initialEmail || "",
    },
  });

  const emailValue = form.watch("email");

  const onSubmit = async (data: VerifyEmailFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(
        `/auth/verify-email?lang=${locale}`,
        {
          email: data.email,
          code: data.code,
        },
      );

      const result = response.data;

      // Auto-login: save user data to auth store
      if (result.user) {
        setAuth(result.user);
      }

      setSuccess(true);

      // Check if user registered as instructor — redirect to profile edit
      const signupIntent = sessionStorage.getItem("signupIntent");
      sessionStorage.removeItem("signupIntent");

      // Redirect after 2 seconds
      setTimeout(() => {
        queryClient.clear();
        const locale = window.location.pathname.split("/")[1];
        if (signupIntent === "instructor") {
          window.location.href = `/${locale}/dashboard/profile/edit`;
        } else {
          window.location.href = `/${locale}/dashboard`;
        }
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || t("verificationFailed");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!emailValue) {
      setError(t("emailRequired"));
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      await apiClient.post(`/auth/send-verification?lang=${locale}`, {
        email: emailValue,
      });

      toast.success(t("codeResent"));
    } catch (err) {
      setError(t("resendFailed"));
    } finally {
      setIsResending(false);
    }
  };

  return {
    form,
    isLoading,
    error,
    success,
    isResending,
    emailValue,
    onSubmit: form.handleSubmit(onSubmit),
    handleResendCode,
  };
}
