"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { useHomeSearch } from "@/hooks/useHomeSearch";
import { useSpecializations, getSpecializationName } from "@/hooks/useConfig";

export function HeroSearchBar() {
  const t = useTranslations("HomePage");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const {
    city,
    setCity,
    specialization,
    search,
    setSearch,
    setSpecialization,
    handleSearch,
  } = useHomeSearch();
  const { specializations, loading } = useSpecializations();

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div>
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("hero.searchPlaceholder")}
          aria-label={t("hero.searchLabel")}
          className="h-14 text-lg bg-slate-800/50 border-2 border-slate-700 text-white placeholder:text-white focus-visible:border-orange-500 cursor-pointer"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <CityAutocomplete
            value={city}
            onChange={setCity}
            placeholder={t("hero.citySearchPlaceholder")}
            size="lg"
          />
        </div>

        <div className="flex-1">
          <Select
            value={specialization}
            onValueChange={setSpecialization}
            disabled={loading}
          >
            <SelectTrigger
              className="h-14 text-lg bg-slate-800/50 border-2 border-slate-700 text-white focus-visible:border-orange-500 w-full px-4 data-placeholder:text-white cursor-pointer"
              aria-label={t("hero.specializationLabel")}
            >
              <SelectValue
                placeholder={
                  loading
                    ? tCommon("loading")
                    : t("hero.specializationPlaceholder")
                }
              />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="bg-slate-900 border-slate-700 w-(--radix-select-trigger-width)"
              sideOffset={8}
            >
              {specializations.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id}
                  className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer py-3"
                >
                  {category.icon} {getSpecializationName(category, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold px-10 py-7 text-xl shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 transition-all cursor-pointer"
      >
        {t("hero.primaryCta")}
      </Button>
    </form>
  );
}
