"use client";

import { useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { apiClient } from "@/lib/api";

function ActivateForm() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(t("activationInvalidToken"));
      return;
    }

    if (password.length < 8) {
      setError(t("passwordMinLength"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post("/enterprise/activate", {
        token,
        password,
      });
      setSuccess(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        t("activationError");
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <Card className="bg-slate-900/50 border-slate-800 p-8 text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
          {t("activationInvalidLink")}
        </h2>
        <p className="text-slate-400 mb-6">{t("activationInvalidLinkDesc")}</p>
        <Link href="/">
          <Button variant="primary">{t("goHome")}</Button>
        </Link>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="bg-slate-900/50 border-slate-800 p-8 text-center max-w-md mx-auto">
        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">
          {t("activationSuccess")}
        </h2>
        <p className="text-slate-200 text-lg mb-6">
          {t("activationSuccessDesc")}
        </p>
        <Link href="/login">
          <Button
            variant="premium"
            size="lg"
            className="from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            {t("goToLogin")}
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800 p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <KeyRound className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">{t("activationTitle")}</h2>
        <p className="text-slate-400 text-sm mt-1">{t("activationSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">
            {t("password")}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-white pr-10"
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white">
            {t("confirmPassword")}
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-white pr-10"
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 cursor-pointer"
              tabIndex={-1}
            >
              {showConfirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-3">
            <p className="text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-base"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {t("activating")}
            </>
          ) : (
            t("activateAccount")
          )}
        </Button>
      </form>
    </Card>
  );
}

export default function ActivatePage() {
  const t = useTranslations("auth");

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center py-16 px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Suspense
          fallback={
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            </div>
          }
        >
          <ActivateForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
