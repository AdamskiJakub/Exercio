"use client";

import { useTranslations } from "next-intl";
import { InstructorCard } from "./instructor-card";
import { PaginationSection } from "./pagination-section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InstructorFilters } from "@/types/filters";
import type { ResultsSectionProps } from "./types";

export function ResultsSection({
  instructors,
  filters,
  updateFilter,
  total,
  page = 1,
  totalPages = 1,
  onPageChange,
}: ResultsSectionProps) {
  const t = useTranslations("InstructorsPage");

  return (
    <main
      className="lg:col-span-3"
      role="main"
      aria-label={t("resultsAriaLabel")}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <p
            className="text-slate-300 text-base font-medium"
            role="status"
            aria-live="polite"
          >
            {total !== undefined
              ? t("resultsCount", { count: total })
              : t("resultsCount", { count: instructors.length })}
          </p>
        </div>

        <div className="w-full sm:w-auto sm:min-w-50">
          <Select
            value={filters.sortBy || "relevance"}
            onValueChange={(value) =>
              updateFilter("sortBy", value as InstructorFilters["sortBy"])
            }
          >
            <SelectTrigger
              className="w-full h-12 text-base bg-slate-800/50 border-slate-700 text-white focus-visible:border-orange-500 px-4 cursor-pointer"
              aria-label={t("sortBy.label")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              position="popper"
              sideOffset={8}
              className="bg-slate-900 border-slate-700 w-(--radix-select-trigger-width)"
            >
              <SelectItem
                value="relevance"
                className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
              >
                {t("sortBy.relevance")}
              </SelectItem>
              <SelectItem
                value="rating"
                className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
              >
                {t("sortBy.rating")}
              </SelectItem>
              <SelectItem
                value="most-reviewed"
                className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
              >
                {t("sortBy.mostReviewed")}
              </SelectItem>
              <SelectItem
                value="price-asc"
                className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
              >
                {t("sortBy.priceAsc")}
              </SelectItem>
              <SelectItem
                value="price-desc"
                className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
              >
                {t("sortBy.priceDesc")}
              </SelectItem>
              <SelectItem
                value="newest"
                className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
              >
                {t("sortBy.newest")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        {instructors.length > 0 ? (
          instructors.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))
        ) : (
          <div className="bg-slate-900/30 border-2 border-dashed border-slate-700 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {t("noResults")}
            </h3>
            <p className="text-slate-400">{t("noResultsDescription")}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {onPageChange && (
        <PaginationSection
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </main>
  );
}
