"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { DAYS_OF_WEEK } from "@/lib/constants/enterprise";

interface EnterpriseProfileHoursProps {
  openingHours: Record<string, string>;
  showHours: boolean;
  onToggle: () => void;
  onUpdate: (day: string, value: string) => void;
}

export function EnterpriseProfileHours({
  openingHours,
  showHours,
  onToggle,
  onUpdate,
}: EnterpriseProfileHoursProps) {
  const t = useTranslations("Dashboard.enterprise");

  return (
    <div className="pt-4 border-t border-slate-700">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full"
        aria-expanded={showHours}
        aria-controls="opening-hours-panel"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-blue-400" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-semibold text-white">
            {t("openingHours") || "Opening Hours"}
          </h2>
        </div>
        {showHours ? (
          <ChevronUp className="w-5 h-5 text-slate-400" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" aria-hidden="true" />
        )}
      </button>
      <AnimatePresence>
        {showHours && (
          <motion.div
            id="opening-hours-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-4">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="grid grid-cols-3 gap-3 items-center">
                  <Label className="text-sm font-medium text-slate-300 capitalize">
                    {t(day) || day}
                  </Label>
                  <Input
                    type="text"
                    value={openingHours?.[day] || ""}
                    onChange={(e) => onUpdate(day, e.target.value)}
                    className="h-10 col-span-2"
                    placeholder={t("hoursPlaceholder") || "e.g. 9:00 - 17:00"}
                  />
                </div>
              ))}
              <p className="text-xs text-slate-500 italic pt-1">
                {t("hoursHint") || "Leave empty for closed days"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
