"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Star, Plus, X } from "lucide-react";

interface Highlight {
  label: string;
  value: string;
}

interface EnterpriseProfileHighlightsProps {
  highlights: Highlight[];
  onAdd: () => void;
  onUpdate: (index: number, field: "label" | "value", val: string) => void;
  onRemove: (index: number) => void;
}

export function EnterpriseProfileHighlights({
  highlights,
  onAdd,
  onUpdate,
  onRemove,
}: EnterpriseProfileHighlightsProps) {
  const t = useTranslations("Dashboard.enterprise");

  return (
    <div className="pt-4 border-t border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Star className="w-5 h-5 text-purple-400" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-white">
          {t("highlights") || "Highlights & Stats"}
        </h2>
      </div>

      <div className="space-y-3">
        {highlights.map((item, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Input
                type="text"
                value={item.label}
                onChange={(e) => onUpdate(index, "label", e.target.value)}
                className="h-10"
                placeholder={t("highlightLabel") || "Label (e.g. Students)"}
                aria-label={`${t("highlightLabel") || "Highlight label"} ${index + 1}`}
              />
              <Input
                type="text"
                value={item.value}
                onChange={(e) => onUpdate(index, "value", e.target.value)}
                className="h-10"
                placeholder={t("highlightValue") || "Value (e.g. 500+)"}
                aria-label={`${t("highlightValue") || "Highlight value"} ${index + 1}`}
              />
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-2 text-red-400 hover:text-red-300 transition-colors"
              aria-label={`${t("removeHighlight") || "Remove highlight"} ${index + 1}`}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        <Button
          type="button"
          onClick={onAdd}
          className="bg-emerald-600 hover:bg-emerald-500 text-white w-full"
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          {t("addHighlight") || "Add stat"}
        </Button>
      </div>
    </div>
  );
}
