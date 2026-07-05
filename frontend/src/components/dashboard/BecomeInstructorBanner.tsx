"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const BANNER_DISMISS_KEY = "become_instructor_banner_dismissed";
const BANNER_DISMISS_DAYS = 30;

function isBannerDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(BANNER_DISMISS_KEY);
  if (!stored) return false;
  try {
    const dismissedAt = parseInt(stored, 10);
    const now = Date.now();
    const diffDays = (now - dismissedAt) / (1000 * 60 * 60 * 24);
    return diffDays < BANNER_DISMISS_DAYS;
  } catch {
    return false;
  }
}

function dismissBanner() {
  localStorage.setItem(BANNER_DISMISS_KEY, String(Date.now()));
}

export function BecomeInstructorBanner() {
  const t = useTranslations("Dashboard.client");
  const { user } = useAuthStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show for CLIENT role and if not dismissed
    if (user?.role === "CLIENT" && !isBannerDismissed()) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [user?.role]);

  // Re-check when role changes (e.g. after become-instructor)
  useEffect(() => {
    if (user?.role !== "CLIENT") {
      setVisible(false);
    }
  }, [user?.role]);

  if (!visible) return null;

  const handleDismiss = () => {
    dismissBanner();
    setVisible(false);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-linear-to-br from-indigo-950/60 via-purple-950/40 to-slate-950/60 shadow-lg shadow-indigo-500/5">
      {/* Subtle glow effect */}
      <div className="pointer-events-none absolute -inset-1 bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl" />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 sm:pr-14">
        {/* Close button — top-right */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-white/60 hover:text-white transition-colors cursor-pointer z-10"
          aria-label={t("dismissBanner")}
        >
          <X className="size-5" />
        </button>

        {/* Left: Icon + Text */}
        <div className="flex items-start gap-4 md:items-center min-w-0 md:max-w-[60%]">
          <div className="size-12 rounded-xl border border-indigo-500/20 bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="size-6 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-base sm:text-lg">
              {t("becomeInstructorBannerTitle")}
            </h3>
            <p className="text-slate-400 text-sm sm:text-base mt-1 leading-relaxed">
              {t("becomeInstructorBannerDesc")}
            </p>
          </div>
        </div>

        {/* Right: CTA Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/onboarding/instructor">
            <Button variant="premium" size="xl" className="cursor-pointer">
              🚀 {t("becomeInstructor")}
            </Button>
          </Link>
          <Link href="/contact#faq">
            <Button variant="premium" size="xl" className="cursor-pointer">
              {t("learnMore")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
