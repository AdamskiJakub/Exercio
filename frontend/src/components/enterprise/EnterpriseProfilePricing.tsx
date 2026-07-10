"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

interface PricingItem {
  label: string;
  price: number;
}

interface EnterpriseProfilePricingProps {
  pricing: PricingItem[];
  onAdd: () => void;
  onUpdate: (
    index: number,
    field: "label" | "price",
    value: string | number,
  ) => void;
  onRemove: (index: number) => void;
}

export function EnterpriseProfilePricing({
  pricing,
  onAdd,
  onUpdate,
  onRemove,
}: EnterpriseProfilePricingProps) {
  const t = useTranslations("Dashboard.enterprise");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">{t("pricing")}</h3>
      </div>

      <div className="space-y-3">
        {pricing.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-3 bg-slate-900/50 border border-slate-700 rounded-lg p-4"
          >
            <div className="flex-1 space-y-2">
              <Label className="text-sm text-slate-400">
                {t("pricingLabel")}
              </Label>
              <Input
                value={item.label}
                onChange={(e) => onUpdate(index, "label", e.target.value)}
                placeholder={t("pricingLabel")}
                className="bg-slate-900/50 border-slate-700 text-white"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-sm text-slate-400">
                {t("pricingPrice")}
              </Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={item.price || ""}
                onChange={(e) =>
                  onUpdate(index, "price", parseFloat(e.target.value) || 0)
                }
                placeholder={t("pricingPrice")}
                className="bg-slate-900/50 border-slate-700 text-white"
              />
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="mt-7 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
              aria-label={t("removePricingItem")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        onClick={onAdd}
        className="bg-emerald-600 hover:bg-emerald-500 text-white w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        {t("addPricingItem")}
      </Button>
    </div>
  );
}
