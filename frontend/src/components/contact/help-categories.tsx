"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { User, Dumbbell, Handshake, HelpCircle } from "lucide-react";

import { fadeInUp } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface HelpCategoriesProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

const CATEGORIES = [
  {
    key: "client",
    icon: User,
    color: "text-blue-400",
    bgGlow: "bg-blue-500/10",
    borderGlow: "group-hover:border-blue-400/30",
  },
  {
    key: "trainer",
    icon: Dumbbell,
    color: "text-orange-400",
    bgGlow: "bg-orange-500/10",
    borderGlow: "group-hover:border-orange-400/30",
  },
  {
    key: "partner",
    icon: Handshake,
    color: "text-green-400",
    bgGlow: "bg-green-500/10",
    borderGlow: "group-hover:border-green-400/30",
  },
  {
    key: "other",
    icon: HelpCircle,
    color: "text-purple-400",
    bgGlow: "bg-purple-500/10",
    borderGlow: "group-hover:border-purple-400/30",
  },
] as const;

export function HelpCategories({
  onSelectCategory,
  selectedCategory,
}: HelpCategoriesProps) {
  const t = useTranslations("Contact");

  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="w-full max-w-5xl mx-auto px-4 md:px-6"
    >
      {/* Section label */}
      <div className="text-center mb-6">
        <p className="text-sm text-white uppercase tracking-wider font-medium">
          {t("selectCategory")}
        </p>
      </div>

      {/* Mobile: horizontal scroll with snap; Desktop: grid */}
      <div
        role="radiogroup"
        aria-label={t("selectCategory")}
        className="flex md:grid md:grid-cols-4 gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 md:overflow-visible md:pb-0"
      >
        {CATEGORIES.map((category, index) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.key;

          return (
            <motion.button
              key={category.key}
              variants={fadeInUp}
              custom={index}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => onSelectCategory(category.key)}
              aria-pressed={isSelected}
              className={cn(
                "group relative flex flex-col items-center p-6 md:p-8 rounded-xl border-2 transition-all duration-300 cursor-pointer text-left shrink-0 snap-start",
                "bg-slate-900/50 backdrop-blur-sm",
                "w-[75vw] md:w-auto",
                isSelected
                  ? "border-orange-500/50 bg-orange-500/5"
                  : "border-slate-700/50 hover:border-slate-600",
                category.borderGlow,
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "mb-4 p-3 rounded-lg transition-colors duration-300",
                  category.bgGlow,
                  isSelected && "bg-orange-500/10",
                )}
              >
                <Icon
                  className={cn(
                    "size-8 transition-colors duration-300",
                    isSelected ? "text-orange-500" : category.color,
                  )}
                />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2">
                {t(`categories.${category.key}.title`)}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t(`categories.${category.key}.description`)}
              </p>

              {/* Topics list */}
              <ul className="mt-4 space-y-1.5 w-full">
                {(["topic1", "topic2", "topic3"] as const).map((topic) => (
                  <li
                    key={topic}
                    className="text-xs text-slate-400 flex items-center gap-2"
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full shrink-0",
                        isSelected ? "bg-orange-500" : "bg-slate-500",
                      )}
                    />
                    {t(`categories.${category.key}.${topic}`)}
                  </li>
                ))}
              </ul>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 h-1 w-12 bg-linear-to-r from-orange-500 to-red-500 rounded-full" />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
