"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api";
import { useTranslations } from "next-intl";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const t = useTranslations("auth");
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double execution (StrictMode or back-navigation)
    if (processedRef.current) return;
    processedRef.current = true;

    const success = searchParams.get("success");

    // GUARD: If user is already authenticated (e.g. came here via back button),
    // replace history entry and redirect to dashboard immediately
    const currentState = useAuthStore.getState();
    if (currentState.isAuthenticated && currentState.user) {
      const locale = window.location.pathname.split("/")[1];
      window.location.replace(`/${locale}/dashboard`);
      return;
    }

    if (success === "true") {
      apiClient
        .get("/auth/me")
        .then((response) => {
          setAuth(response.data);

          // Check if user had intent before OAuth
          const oauthIntent = sessionStorage.getItem("oauthIntent");
          sessionStorage.removeItem("oauthIntent");

          if (oauthIntent === "instructor") {
            // Use window.location.replace to REPLACE history entry
            // This prevents the back button from returning to this page
            const locale = window.location.pathname.split("/")[1];
            window.location.replace(`/${locale}/onboarding/instructor`);
          } else {
            // Use replace instead of push to avoid leaving callback in history
            const locale = window.location.pathname.split("/")[1];
            window.location.replace(
              `${window.location.origin}/${locale}/dashboard`,
            );
          }
        })
        .catch((error) => {
          console.error("OAuth callback error:", error);
          router.push({ pathname: "/login", query: { error: "oauth_failed" } });
        });
    } else {
      router.push({ pathname: "/login", query: { error: "oauth_cancelled" } });
    }
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
        <p className="text-slate-300 text-lg">{t("completingAuth")}</p>
      </div>
    </div>
  );
}
