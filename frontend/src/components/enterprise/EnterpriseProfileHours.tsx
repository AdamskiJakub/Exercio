"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { DAYS_OF_WEEK } from "@/lib/constants/enterprise";

interface EnterpriseProfileHoursProps {
  openingHours: Record<string, string>;
  onUpdate: (day: string, value: string) => void;
}

export function EnterpriseProfileHours({
  openingHours,
  onUpdate,
}: EnterpriseProfileHoursProps) {
  const t = useTranslations("Dashboard.enterprise");

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Clock className="w-5 h-5 text-blue-400" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-white">
          {t("openingHours") || "Opening Hours"}
        </h2>
      </div>

      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="grid grid-cols-3 gap-3 items-center">
            <Label className="text-sm font-medium text-slate-300 capitalize">
              {t(day) || day}
            </Label>
            <Input
              type="text"
              value={openingHours?.[day] || ""}
              onChange={(e) => onUpdate(day, e.target.value)}
              className="h-10 col-span-2 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/50"
              placeholder={t("hoursPlaceholder") || "e.g. 9:00 - 17:00"}
            />
          </div>
        ))}
        <p className="text-sm text-slate-400 italic pt-1">
          {t("hoursHint") || "Leave empty for closed days"}
        </p>
      </div>
    </div>
  );
}
