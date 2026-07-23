"use client";

import { useTranslations, useLocale } from "next-intl";
import { DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PricingItem {
  label: string;
  price: string | number;
}

interface EnterpriseProfilePricingDisplayProps {
  pricing: PricingItem[];
}

export function EnterpriseProfilePricingDisplay({
  pricing,
}: EnterpriseProfilePricingDisplayProps) {
  const t = useTranslations("EnterpriseProfile");
  const locale = useLocale();

  if (!pricing || pricing.length === 0) return null;

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="scroll-mt-24"
    >
      <h2
        id="pricing-heading"
        className="text-2xl font-bold text-white flex items-center gap-2 mb-6"
      >
        <DollarSign className="w-6 h-6 text-emerald-500" aria-hidden="true" />
        {t("pricing")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {pricing.map((item, index) => (
          <Card
            key={index}
            className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-all duration-300 p-6 flex flex-col"
          >
            <p className="text-sm font-semibold text-white mb-1">
              {item.label}
            </p>
            <p className="text-3xl font-bold text-emerald-500 mt-2">
              {typeof item.price === "number"
                ? new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: "PLN",
                  }).format(item.price)
                : item.price}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
