"use client";

import { useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { InstructorCard } from "./instructor-card";
import { EnterpriseCard } from "@/components/enterprise/EnterpriseCard";
import { PaginationSection } from "./pagination-section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Users } from "lucide-react";
import type { InstructorFilters } from "@/types/filters";
import type { ResultsSectionProps } from "./types";

/** Sort options available for each type filter */
const SORT_OPTIONS: Record<string, { value: string; labelKey: string }[]> = {
  all: [
    { value: "relevance", labelKey: "sortBy.relevance" },
    { value: "newest", labelKey: "sortBy.newest" },
    { value: "name-asc", labelKey: "sortBy.nameAsc" },
    { value: "name-desc", labelKey: "sortBy.nameDesc" },
  ],
  enterprises: [
    { value: "relevance", labelKey: "sortBy.relevance" },
    { value: "newest", labelKey: "sortBy.newest" },
    { value: "name-asc", labelKey: "sortBy.nameAsc" },
    { value: "name-desc", labelKey: "sortBy.nameDesc" },
  ],
  instructors: [
    { value: "relevance", labelKey: "sortBy.relevance" },
    { value: "rating", labelKey: "sortBy.rating" },
    { value: "most-reviewed", labelKey: "sortBy.mostReviewed" },
    { value: "price-asc", labelKey: "sortBy.priceAsc" },
    { value: "price-desc", labelKey: "sortBy.priceDesc" },
    { value: "name-asc", labelKey: "sortBy.nameAsc" },
    { value: "name-desc", labelKey: "sortBy.nameDesc" },
    { value: "newest", labelKey: "sortBy.newest" },
  ],
};

export function ResultsSection({
  instructors,
  enterprises,
  filters,
  updateFilter,
  total,
  enterpriseTotal,
  page = 1,
  totalPages = 1,
  onPageChange,
  items,
}: ResultsSectionProps) {
  const t = useTranslations("InstructorsPage");
  const isEnterpriseOnly = filters.type === "enterprises";
  const isMixed = filters.type === "all";
  const hasEnterprises = enterprises && enterprises.length > 0;

  // Reset sortBy when type changes to an option that doesn't support current sortBy
  useEffect(() => {
    const typeKey = filters.type || "instructors";
    const allowed = SORT_OPTIONS[typeKey] || SORT_OPTIONS.instructors;
    const isAllowed = allowed.some(
      (opt: { value: string }) => opt.value === filters.sortBy,
    );
    if (!isAllowed) {
      updateFilter("sortBy", "newest" as InstructorFilters["sortBy"]);
    }
  }, [filters.type]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute available sort options based on current type
  const sortOptions = useMemo(() => {
    const typeKey = filters.type || "instructors";
    return SORT_OPTIONS[typeKey] || SORT_OPTIONS.instructors;
  }, [filters.type]);

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
            {isMixed && (total ?? 0) > 0 && (enterpriseTotal ?? 0) > 0
              ? `${t("instructorCount", { count: total ?? 0 })} · ${t("enterpriseCount", { count: enterpriseTotal ?? 0 })}`
              : isEnterpriseOnly
                ? t("enterpriseCount", {
                    count: enterpriseTotal ?? enterprises?.length ?? 0,
                  })
                : total !== undefined
                  ? t("resultsCount", { count: total })
                  : t("resultsCount", {
                      count: instructors.length + (enterprises?.length || 0),
                    })}
          </p>
        </div>

        <div className="w-full sm:w-auto sm:min-w-50">
          <Select
            value={filters.sortBy || sortOptions[0]?.value || "newest"}
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
              {sortOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
                >
                  {t(option.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-8">
        {isMixed && items && items.length > 0 ? (
          /* Mixed feed: single list sorted by createdAt */
          <div className="space-y-4">
            {items.map((item, index) =>
              item.type === "instructor" ? (
                <InstructorCard
                  key={`inst-${item.data.id}`}
                  instructor={item.data}
                />
              ) : (
                <EnterpriseCard
                  key={`ent-${item.data.id}-${index}`}
                  enterprise={item.data}
                />
              ),
            )}
          </div>
        ) : instructors.length > 0 || hasEnterprises ? (
          <>
            {isMixed ? (
              <>
                {/* Instructors section — primary results */}
                {instructors.length > 0 && (
                  <section aria-labelledby="instructors-section-heading">
                    <h3
                      id="instructors-section-heading"
                      className="text-base font-bold text-orange-400 uppercase tracking-wider mb-4 flex items-center gap-2"
                    >
                      <Users className="w-5 h-5 text-orange-400" />
                      {t("instructorsSection")}
                    </h3>
                    <div className="space-y-4">
                      {instructors.map((instructor) => (
                        <InstructorCard
                          key={`inst-${instructor.id}`}
                          instructor={instructor}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Enterprises section — secondary, partner suggestions */}
                {hasEnterprises && (
                  <section aria-labelledby="enterprises-section-heading">
                    <h3
                      id="enterprises-section-heading"
                      className="text-base font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2"
                    >
                      <Building2 className="w-5 h-5 text-emerald-400" />
                      {t("enterprisesSection")}
                    </h3>
                    <div className="space-y-4">
                      {enterprises.map((enterprise) => (
                        <EnterpriseCard
                          key={`ent-${enterprise.id}`}
                          enterprise={enterprise}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              /* Enterprise-only or instructor-only: flat list */
              <div className="space-y-4">
                {instructors.map((instructor) => (
                  <InstructorCard
                    key={`inst-${instructor.id}`}
                    instructor={instructor}
                  />
                ))}
                {enterprises?.map((enterprise) => (
                  <EnterpriseCard
                    key={`ent-${enterprise.id}`}
                    enterprise={enterprise}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* No results */
          <div
            className="bg-slate-900/30 border-2 border-dashed border-slate-700 rounded-xl p-12 text-center"
            role="status"
          >
            <div className="text-6xl mb-4" aria-hidden="true">
              🔍
            </div>
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
