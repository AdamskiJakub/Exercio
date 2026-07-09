"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface EnterpriseProfileAmenitiesProps {
  hasParking: boolean | null;
  hasShower: boolean | null;
  hasLockerRoom: boolean | null;
  hasAirConditioning: boolean | null;
  hasDisabledAccess: boolean | null;
  hasFreeTrial: boolean | null;
  onChange: (field: string, value: boolean) => void;
}

const AMENITY_FIELDS = [
  "hasParking",
  "hasShower",
  "hasLockerRoom",
  "hasAirConditioning",
  "hasDisabledAccess",
  "hasFreeTrial",
] as const;

export function EnterpriseProfileAmenities({
  hasParking,
  hasShower,
  hasLockerRoom,
  hasAirConditioning,
  hasDisabledAccess,
  hasFreeTrial,
  onChange,
}: EnterpriseProfileAmenitiesProps) {
  const t = useTranslations("Dashboard.enterprise");

  const values: Record<string, boolean | null> = {
    hasParking,
    hasShower,
    hasLockerRoom,
    hasAirConditioning,
    hasDisabledAccess,
    hasFreeTrial,
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">{t("amenities")}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AMENITY_FIELDS.map((field) => (
          <div
            key={field}
            className="flex items-center gap-3 bg-slate-900/50 border border-slate-700 rounded-lg p-4"
          >
            <Checkbox
              id={field}
              checked={values[field] === true}
              onCheckedChange={(checked: boolean) => onChange(field, checked)}
              className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
            />
            <Label
              htmlFor={field}
              className="text-base font-medium text-slate-300 cursor-pointer"
            >
              {t(field)}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
