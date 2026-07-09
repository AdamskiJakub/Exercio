"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface EnterpriseProfileFaqProps {
  faq: FaqItem[];
  onAdd: () => void;
  onUpdate: (
    index: number,
    field: "question" | "answer",
    value: string,
  ) => void;
  onRemove: (index: number) => void;
}

export function EnterpriseProfileFaq({
  faq,
  onAdd,
  onUpdate,
  onRemove,
}: EnterpriseProfileFaqProps) {
  const t = useTranslations("Dashboard.enterprise");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">{t("faq")}</h3>
      </div>

      <div className="space-y-4">
        {faq.map((item, index) => (
          <div
            key={index}
            className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-slate-400">
                #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                aria-label={t("removeFaqItem")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-slate-400">
                {t("faqQuestion")}
              </Label>
              <Input
                value={item.question}
                onChange={(e) => onUpdate(index, "question", e.target.value)}
                placeholder={t("faqQuestion")}
                className="bg-slate-900/50 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-slate-400">{t("faqAnswer")}</Label>
              <Textarea
                value={item.answer}
                onChange={(e) => onUpdate(index, "answer", e.target.value)}
                placeholder={t("faqAnswer")}
                rows={3}
                className="bg-slate-900/50 border-slate-700 text-white resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        onClick={onAdd}
        className="bg-emerald-600 hover:bg-emerald-500 text-white w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        {t("addFaqItem")}
      </Button>
    </div>
  );
}
