"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EnterpriseProfileBusinessTypeProps {
  businessType: string;
  onChange: (value: string) => void;
}

// Map UPPER_SNAKE_CASE enum values to the camelCase i18n keys used in EnterpriseApply.businessTypes
const BUSINESS_TYPE_I18N_MAP: Record<string, string> = {
  DANCE_SCHOOL: "danceSchool",
  GYM: "gym",
  FITNESS_CLUB: "fitnessClub",
  YOGA_STUDIO: "yogaStudio",
  PILATES_STUDIO: "pilatesStudio",
  MARTIAL_ARTS: "martialArts",
  SWIMMING_POOL: "swimmingPool",
  PERSONAL_TRAINING_STUDIO: "personalTrainingStudio",
  SPORTS_CENTER: "sportsCenter",
  OTHER: "other",
};

const BUSINESS_TYPES = Object.keys(BUSINESS_TYPE_I18N_MAP);

export function EnterpriseProfileBusinessType({
  businessType,
  onChange,
}: EnterpriseProfileBusinessTypeProps) {
  const t = useTranslations("Dashboard.enterprise");
  const bt = useTranslations("EnterpriseApply.businessTypes");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">
          {t("businessType")}
        </h3>
      </div>
      <div className="space-y-2">
        <Label
          htmlFor="businessType"
          className="text-base font-medium text-slate-300"
        >
          {t("businessType")}
        </Label>
        <Select value={businessType} onValueChange={onChange}>
          <SelectTrigger className="w-full bg-slate-900/50 border-slate-700 text-white">
            <SelectValue placeholder={t("businessTypePlaceholder")} />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            {BUSINESS_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {bt(BUSINESS_TYPE_I18N_MAP[type])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
