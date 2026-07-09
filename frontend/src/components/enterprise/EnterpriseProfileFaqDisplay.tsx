"use client";

import { useTranslations } from "next-intl";
import { MessageSquare, ChevronDown } from "lucide-react";
import type { FaqItem } from "@/types/enterprise";

interface EnterpriseProfileFaqDisplayProps {
  faq: FaqItem[];
}

export function EnterpriseProfileFaqDisplay({
  faq,
}: EnterpriseProfileFaqDisplayProps) {
  const t = useTranslations("EnterpriseProfile");

  if (!faq || faq.length === 0) return null;

  return (
    <section aria-labelledby="faq-heading" className="scroll-mt-24">
      <h2
        id="faq-heading"
        className="text-2xl font-bold text-white flex items-center gap-2 mb-6"
      >
        <MessageSquare
          className="w-6 h-6 text-emerald-500"
          aria-hidden="true"
        />
        {t("faq")}
      </h2>
      <div className="space-y-3 max-w-3xl">
        {faq.map((item, index) => (
          <details
            key={index}
            className="group bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors"
          >
            <summary className="flex items-center justify-between px-5 py-4 text-white font-medium cursor-pointer hover:bg-slate-800/50 transition-colors list-none">
              <span>{item.question}</span>
              <ChevronDown
                className="w-4 h-4 text-slate-300 group-open:rotate-180 transition-transform shrink-0"
                aria-hidden="true"
              />
            </summary>
            <div className="px-5 pb-4 text-slate-300 text-sm leading-relaxed">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
