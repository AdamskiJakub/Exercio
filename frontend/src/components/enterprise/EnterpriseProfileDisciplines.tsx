"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface EnterpriseProfileDisciplinesProps {
  disciplines: string[];
  onChange: (values: string[]) => void;
}

const PRESET_DISCIPLINES = [
  "strengthTraining",
  "cardio",
  "yoga",
  "pilates",
  "dance",
  "martialArts",
  "swimming",
  "crossfit",
  "calisthenics",
  "rehabilitation",
  "sportsMassage",
  "nutritionCoaching",
  "boxing",
  "zumba",
  "spinning",
  "functionalTraining",
];

export function EnterpriseProfileDisciplines({
  disciplines,
  onChange,
}: EnterpriseProfileDisciplinesProps) {
  const t = useTranslations("Dashboard.enterprise");
  const dp = useTranslations("Dashboard.enterprise.disciplinesPresets");
  const [customValue, setCustomValue] = useState("");

  const togglePreset = (value: string) => {
    if (disciplines.includes(value)) {
      onChange(disciplines.filter((v) => v !== value));
    } else {
      onChange([...disciplines, value]);
    }
  };

  const addCustom = () => {
    const trimmed = customValue.trim();
    if (trimmed && !disciplines.includes(trimmed)) {
      onChange([...disciplines, trimmed]);
    }
    setCustomValue("");
  };

  const remove = (value: string) => {
    onChange(disciplines.filter((v) => v !== value));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">{t("disciplines")}</h3>
        <p className="text-sm text-slate-400">{t("disciplinesHint")}</p>
      </div>

      {/* Selected tags */}
      {disciplines.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {disciplines.map((value) => (
            <Badge
              key={value}
              variant="secondary"
              className="bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 px-3 py-1 text-sm"
            >
              {dp.has(value) ? dp(value) : value}
              <button
                type="button"
                onClick={() => remove(value)}
                className="ml-2 hover:text-emerald-100"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Preset options */}
      <div className="flex flex-wrap gap-2">
        {PRESET_DISCIPLINES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => togglePreset(value)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              disciplines.includes(value)
                ? "bg-emerald-600 text-white border-emerald-500"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:border-emerald-500/50"
            }`}
          >
            {dp(value)}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="flex gap-2">
        <Input
          placeholder={t("disciplinesHint")}
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          className="bg-slate-900/50 border-slate-700 text-white"
        />
        <button
          type="button"
          onClick={addCustom}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
