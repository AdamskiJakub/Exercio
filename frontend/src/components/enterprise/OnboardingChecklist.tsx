"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { EnterpriseProfile } from "@/types/enterprise";

interface OnboardingChecklistProps {
  profile: EnterpriseProfile;
}

interface ChecklistItem {
  key: string;
  labelKey: string;
  href: string;
  isComplete: boolean;
}

export function OnboardingChecklist({ profile }: OnboardingChecklistProps) {
  const t = useTranslations("Dashboard.enterprise");

  const items: ChecklistItem[] = [
    {
      key: "description",
      labelKey: "onboardingDescription",
      href: "/dashboard/enterprise/profile",
      isComplete:
        !!profile.shortDescription && profile.shortDescription.length > 0,
    },
    {
      key: "logo",
      labelKey: "onboardingLogo",
      href: "/dashboard/enterprise/profile",
      isComplete: !!profile.logoUrl,
    },
    {
      key: "gallery",
      labelKey: "onboardingGallery",
      href: "/dashboard/enterprise/profile",
      isComplete: (profile.gallery?.length ?? 0) > 0,
    },
    {
      key: "instructors",
      labelKey: "onboardingInstructors",
      href: "/dashboard/enterprise/instructors",
      isComplete: (profile.instructors?.length ?? 0) > 0,
    },
    {
      key: "news",
      labelKey: "onboardingNews",
      href: "/dashboard/enterprise/news",
      isComplete: (profile.news?.length ?? 0) > 0,
    },
    {
      key: "publish",
      labelKey: "onboardingPublish",
      href: "/dashboard/enterprise/profile",
      isComplete: profile.status === "ACTIVE",
    },
  ];

  const completedCount = items.filter((item) => item.isComplete).length;
  const totalCount = items.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  const isFullyComplete = completedCount === totalCount;

  // Don't show if everything is done
  if (isFullyComplete) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {t("onboardingTitle")}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {t("onboardingSubtitle", {
                completed: completedCount,
                total: totalCount,
              })}
            </p>
          </div>
          <div className="relative w-14 h-14">
            <svg
              className="w-14 h-14 -rotate-90"
              viewBox="0 0 36 36"
              role="img"
              aria-label={t("onboardingProgress", {
                completed: completedCount,
                total: totalCount,
              })}
            >
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="rgb(51 65 85)"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="rgb(52 211 153)"
                strokeWidth="3"
                strokeDasharray={`${progress * 0.873} 87.3`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-emerald-400">
              {progress}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                item.isComplete
                  ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                  : "bg-slate-800/30 hover:bg-slate-800/50"
              }`}
            >
              {item.isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500 shrink-0" />
              )}
              <span
                className={`text-sm flex-1 ${
                  item.isComplete
                    ? "text-slate-300 line-through decoration-emerald-500/30"
                    : "text-slate-200"
                }`}
              >
                {t(item.labelKey)}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
            </Link>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
