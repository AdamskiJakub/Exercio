"use client";

import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { useDisciplines, getDisciplineNameByKey } from "@/hooks/useCatalog";

interface EnterpriseProfileDisciplinesProps {
  disciplines: string[];
  onChange: (values: string[]) => void;
}

export function EnterpriseProfileDisciplines({
  disciplines,
  onChange,
}: EnterpriseProfileDisciplinesProps) {
  const t = useTranslations("Dashboard.enterprise");
  const locale = useLocale();
  const { disciplines: catalogDisciplines, loading } = useDisciplines();
  const [customValue, setCustomValue] = useState("");

  // Only show enabled disciplines from the catalog
  const presetDisciplines = useMemo(
    () => catalogDisciplines.filter((d) => d.enabled),
    [catalogDisciplines],
  );

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

  const getPresetName = (key: string): string => {
    const name = getDisciplineNameByKey(key, locale);
    if (name !== key) return name;

    try {
      const legacyName = t(`disciplinesPresets.${key}`);
      if (legacyName && !legacyName.startsWith("disciplinesPresets.")) {
        return legacyName;
      }
    } catch {
      // ignore
    }
    // Final fallback: display the key as-is
    return key;
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
              {getPresetName(value)}
              <button
                type="button"
                onClick={() => remove(value)}
                className="ml-2 hover:text-emerald-100"
                aria-label={`${t("removeDiscipline")} ${value}`}
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Preset options from catalog */}
      {loading ? (
        <div className="text-sm text-slate-400">{t("disciplinesLoading")}</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {presetDisciplines.map((discipline) => (
            <button
              key={discipline.key}
              type="button"
              onClick={() => togglePreset(discipline.key)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                disciplines.includes(discipline.key)
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:border-emerald-500/50"
              }`}
            >
              {discipline.icon && (
                <span className="mr-1">{discipline.icon}</span>
              )}
              {getDisciplineNameByKey(discipline.key, locale)}
            </button>
          ))}
        </div>
      )}

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
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}
