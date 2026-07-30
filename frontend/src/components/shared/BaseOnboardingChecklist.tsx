"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { scrollToSection } from "@/lib/utils/scroll";

export interface ChecklistItem {
  key: string;
  labelKey: string;
  href: string;
  sectionId?: string;
  isComplete: boolean;
}

type ColorScheme = "orange" | "emerald";

interface BaseOnboardingChecklistProps {
  items: ChecklistItem[];
  translationsNamespace: string;
  colorScheme: ColorScheme;
  hideWhenComplete?: boolean;
  recentAccountDays?: number;
  createdAt?: string;
  hideChevronOnComplete?: boolean;
}

const colorConfig: Record<
  ColorScheme,
  {
    border: string;
    bg: string;
    text: string;
    completedBg: string;
    completedHover: string;
    stroke: string;
    ring: string;
  }
> = {
  orange: {
    border: "border-orange-500/20",
    bg: "bg-orange-900/20",
    text: "text-orange-400",
    completedBg: "bg-orange-500/5",
    completedHover: "hover:bg-orange-500/10",
    stroke: "rgb(251 146 60)",
    ring: "text-orange-400",
  },
  emerald: {
    border: "border-emerald-500/20",
    bg: "bg-emerald-900/20",
    text: "text-emerald-400",
    completedBg: "bg-emerald-500/5",
    completedHover: "hover:bg-emerald-500/10",
    stroke: "rgb(52 211 153)",
    ring: "text-emerald-400",
  },
};

export function BaseOnboardingChecklist({
  items,
  translationsNamespace,
  colorScheme,
  hideWhenComplete = true,
  recentAccountDays,
  createdAt,
  hideChevronOnComplete = false,
}: BaseOnboardingChecklistProps) {
  const t = useTranslations(translationsNamespace);
  const pathname = usePathname();
  const colors = colorConfig[colorScheme];

  const completedCount = items.filter((item) => item.isComplete).length;
  const totalCount = items.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  const isFullyComplete = completedCount === totalCount;

  if (hideWhenComplete && isFullyComplete) {
    return null;
  }

  if (recentAccountDays && createdAt) {
    const accountAgeDays =
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (accountAgeDays > recentAccountDays) {
      return null;
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${colors.bg} ${colors.border} border rounded-xl p-6 space-y-4`}
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
                stroke={colors.stroke}
                strokeWidth="3"
                strokeDasharray={`${progress * 0.873} 87.3`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <span
              className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${colors.ring}`}
            >
              {progress}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const href = item.sectionId
              ? `${item.href}?scrollTo=${item.sectionId}`
              : item.href;
            const isClickable = !!item.sectionId;
            const commonClasses = `flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
              item.isComplete
                ? `${colors.completedBg} ${colors.completedHover}`
                : "bg-slate-800/30 hover:bg-slate-800/50"
            }`;

            // Items without sectionId are non-clickable status indicators (e.g. "publish profile")
            if (!isClickable) {
              return (
                <div
                  key={item.key}
                  className={`${commonClasses} cursor-default`}
                >
                  {item.isComplete ? (
                    <CheckCircle2
                      className={`w-5 h-5 ${colors.ring} shrink-0`}
                      aria-hidden="true"
                    />
                  ) : (
                    <Circle
                      className="w-5 h-5 text-slate-500 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`text-sm flex-1 ${
                      item.isComplete ? "text-slate-300" : "text-slate-200"
                    }`}
                  >
                    {t(item.labelKey)}
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.key}
                href={href}
                aria-label={t(item.labelKey)}
                onClick={(e) => {
                  if (item.sectionId && pathname.includes(item.href)) {
                    e.preventDefault();
                    scrollToSection(item.sectionId);
                  }
                }}
                className={commonClasses}
              >
                {item.isComplete ? (
                  <CheckCircle2
                    className={`w-5 h-5 ${colors.ring} shrink-0`}
                    aria-hidden="true"
                  />
                ) : (
                  <Circle
                    className="w-5 h-5 text-slate-500 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`text-sm flex-1 ${
                    item.isComplete ? "text-slate-300" : "text-slate-200"
                  }`}
                >
                  {t(item.labelKey)}
                </span>
                {(!item.isComplete || !hideChevronOnComplete) && (
                  <ChevronRight
                    className="w-4 h-4 text-slate-500 shrink-0"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
