"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  getCookieConsent,
  saveCookieConsent,
} from "@/lib/utils/cookie-consent";

type BannerView = "main" | "details";

export function CookieBanner() {
  const t = useTranslations("CookieBanner");
  const [visible, setVisible] = useState(false);
  const [view, setView] = useState<BannerView>("main");
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent.accepted) {
      // Small delay for animation
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    saveCookieConsent(true, {
      functional: true,
      analytics: true,
      marketing: true,
    });
    setVisible(false);
  };

  const handleAcceptNecessary = () => {
    saveCookieConsent(true, {
      functional: false,
      analytics: false,
      marketing: false,
    });
    setVisible(false);
  };

  const handleSavePreferences = () => {
    saveCookieConsent(true, {
      functional,
      analytics,
      marketing,
    });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
      className="fixed bottom-0 left-0 right-0 z-100 p-3 sm:p-4 md:p-6"
    >
      <div className="mx-auto max-w-7xl">
        <div className="relative bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden animate-in slide-in-from-bottom duration-500">
          <div className="p-4 sm:p-6 md:p-8">
            {view === "main" ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    {t("title")}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-400">
                    {t("description")}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Button
                    onClick={handleAcceptAll}
                    size="lg"
                    className="bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-base px-8 py-6 order-1 sm:order-1"
                  >
                    {t("acceptAll")}
                  </Button>

                  <Button
                    onClick={handleAcceptNecessary}
                    variant="outline"
                    size="lg"
                    className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white text-base px-6 py-6 order-3 sm:order-2"
                  >
                    {t("acceptNecessary")}
                  </Button>

                  <Button
                    onClick={() => setView("details")}
                    variant="outline"
                    size="lg"
                    className="border-slate-700 bg-slate-800/50 text-orange-500 hover:bg-slate-800 hover:text-orange-400 text-base px-6 py-6 order-2 sm:order-3"
                  >
                    {t("customize")}
                  </Button>
                </div>

                {/* Footer links */}
                <p className="text-xs text-slate-500">
                  <Link
                    href="/privacy"
                    className="hover:text-slate-300 underline underline-offset-2 transition-colors"
                  >
                    {t("privacyPolicy")}
                  </Link>
                  {" | "}
                  <Link
                    href="/cookies"
                    className="hover:text-slate-300 underline underline-offset-2 transition-colors"
                  >
                    {t("cookiePolicy")}
                  </Link>
                </p>
              </div>
            ) : (
              <div className="space-y-5 sm:space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {t("customizeTitle")}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-400">
                      {t("customizeDescription")}
                    </p>
                  </div>
                  <button
                    onClick={() => setView("main")}
                    className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                    aria-label={t("back")}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  {/* Necessary - always enabled */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500 flex items-center justify-center shrink-0">
                          <svg
                            className="w-3 h-3 text-orange-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {t("categories.necessary")}
                        </span>
                        <span className="text-xs text-slate-500 italic">
                          ({t("alwaysActive")})
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1.5 ml-6">
                        {t("categories.necessaryDesc")}
                      </p>
                    </div>
                  </div>

                  {/* Functional */}
                  <CookieCategoryToggle
                    label={t("categories.functional")}
                    description={t("categories.functionalDesc")}
                    checked={functional}
                    onChange={setFunctional}
                  />

                  {/* Analytics */}
                  <CookieCategoryToggle
                    label={t("categories.analytics")}
                    description={t("categories.analyticsDesc")}
                    checked={analytics}
                    onChange={setAnalytics}
                  />

                  {/* Marketing */}
                  <CookieCategoryToggle
                    label={t("categories.marketing")}
                    description={t("categories.marketingDesc")}
                    checked={marketing}
                    onChange={setMarketing}
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Button
                    onClick={handleSavePreferences}
                    size="lg"
                    className="bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-base px-8 py-6 order-1"
                  >
                    {t("savePreferences")}
                  </Button>

                  <Button
                    onClick={handleAcceptAll}
                    variant="outline"
                    size="lg"
                    className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white text-base px-6 py-6 order-2"
                  >
                    {t("acceptAll")}
                  </Button>
                </div>

                <p className="text-xs text-slate-500">
                  <Link
                    href="/privacy"
                    className="hover:text-slate-300 underline underline-offset-2 transition-colors"
                  >
                    {t("privacyPolicy")}
                  </Link>
                  {" | "}
                  <Link
                    href="/cookies"
                    className="hover:text-slate-300 underline underline-offset-2 transition-colors"
                  >
                    {t("cookiePolicy")}
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CookieCategoryToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white group-hover:text-orange-500 transition-colors">
            {label}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
          {description}
        </p>
      </div>
      <div className="relative shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-6 rounded-full bg-slate-700 peer-checked:bg-orange-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
      </div>
    </label>
  );
}
