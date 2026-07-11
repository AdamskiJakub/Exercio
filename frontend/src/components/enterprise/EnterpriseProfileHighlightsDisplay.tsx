"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getHighlightIcon } from "@/constants/enterprise";
import type { HighlightItem } from "@/types/enterprise";

interface EnterpriseProfileHighlightsDisplayProps {
  highlights: HighlightItem[];
}

export function EnterpriseProfileHighlightsDisplay({
  highlights,
}: EnterpriseProfileHighlightsDisplayProps) {
  const t = useTranslations("EnterpriseProfile");

  if (!highlights || highlights.length === 0) return null;

  return (
    <section
      id="why-us"
      aria-labelledby="whyus-heading"
      className="scroll-mt-24"
    >
      <h2
        id="whyus-heading"
        className="text-2xl font-bold text-white flex items-center gap-2 mb-6"
      >
        <Sparkles className="w-6 h-6 text-emerald-500" aria-hidden="true" />
        {t("whyUs")}
      </h2>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        role="list"
        aria-label={t("whyUs")}
      >
        {highlights.map((item, index) => {
          const Icon = getHighlightIcon(item.label);
          return (
            <Card
              key={index}
              className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-all duration-300 p-6"
              role="listitem"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-emerald-500" aria-hidden="true" />
              </div>
              <p className="text-lg font-bold text-white mb-1">{item.value}</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {item.label}
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
