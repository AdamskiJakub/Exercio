import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import {
  createLoginSchema,
  type LoginFormData,
} from "@/lib/validations/login-form";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { normalizeApiError } from "@/lib/utils/error-handlers";
import { useQueryClient } from "@tanstack/react-query";

export function useLoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailForVerification, setEmailForVerification] = useState<
    string | null
  >(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(t)),
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    setEmailForVerification(null);
    // Clear any previous manual errors
    form.clearErrors();

    try {
      // Fetch CSRF token before login - backend sets x-csrf-token cookie (non-httpOnly).
      // The axios interceptor in api.ts reads this cookie and adds X-CSRF-Token header
      // to POST/PUT/PATCH/DELETE requests automatically when no Authorization header is present.
      await apiClient.get("/auth/csrf-token");

      const response = await apiClient.post("/auth/login", data);
      const { user } = response.data;

      queryClient.clear();
      setAuth(user);
      router.push("/dashboard");
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message;
      if (backendMessage === "Please verify your email before logging in") {
        setEmailForVerification(data.email);
        setError(t("verifyEmailRequired"));
      } else {
        const errorMessage =
          backendMessage === "Invalid credentials"
            ? t("loginFailed")
            : normalizeApiError(err, t("loginFailed"));
        setError(errorMessage);
      }

      // Set errors on both fields since we don't know which one is wrong
      form.setError("email", {
        type: "manual",
        message: "", // Don't show duplicate message, server error box will show it
      });
      form.setError("password", {
        type: "manual",
        message: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    error,
    emailForVerification,
    onSubmit: form.handleSubmit(onSubmit),
    clearServerError: () => {
      setError(null);
      setEmailForVerification(null);
      form.clearErrors(["email", "password"]);
    },
  };
}
