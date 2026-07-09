"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AMENITY_ITEMS } from "@/constants/enterprise";
import type { EnterpriseProfile } from "@/types/enterprise";

interface EnterpriseProfileAmenitiesDisplayProps {
  enterprise: EnterpriseProfile;
}

export function EnterpriseProfileAmenitiesDisplay({
  enterprise,
}: EnterpriseProfileAmenitiesDisplayProps) {
  const t = useTranslations("EnterpriseProfile");

  const hasAnyAmenity = AMENITY_ITEMS.some(
    (a) => enterprise[a.key as keyof EnterpriseProfile],
  );

  if (!hasAnyAmenity) return null;

  return (
    <section aria-labelledby="amenities-heading" className="scroll-mt-24">
      <h2
        id="amenities-heading"
        className="text-2xl font-bold text-white flex items-center gap-2 mb-6"
      >
        <CheckCircle2 className="w-6 h-6 text-emerald-500" aria-hidden="true" />
        {t("amenities")}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {AMENITY_ITEMS.map(({ key, icon: Icon }) => {
          const value = enterprise[key as keyof EnterpriseProfile] as
            | boolean
            | undefined;
          if (!value) return null;
          return (
            <Card
              key={key}
              className="bg-slate-900/50 border-slate-800 px-4 py-3.5 flex flex-col items-center gap-2 text-center"
            >
              <Icon className="w-5 h-5 text-emerald-500" aria-hidden="true" />
              <span className="text-sm font-medium text-slate-200">
                {t(key)}
              </span>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
