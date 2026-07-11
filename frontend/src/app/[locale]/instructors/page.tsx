"use client";

import { useMemo, useCallback } from "react";
import { InstructorSearchBar } from "@/components/instructors/instructor-search-bar";
import { InstructorsPageHeader } from "@/components/instructors/page-header";
import { FiltersSidebar } from "@/components/instructors/filters-sidebar";
import { ResultsSection } from "@/components/instructors/results-section";
import { useInstructorFilters } from "@/hooks/useInstructorFilters";
import { useSearch } from "@/hooks/useSearch";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useTranslations } from "next-intl";

const PAGE_SIZE = 10;

export default function InstructorsPage() {
  const {
    filters,
    updateFilter,
    toggleTag,
    toggleGoal,
    clearFilters,
    hasActiveFilters,
  } = useInstructorFilters();

  const t = useTranslations("InstructorsPage");

  // Unified search hook — handles all modes (all / instructors / enterprises)
  const { items, total, enterpriseTotal, page, totalPages, isLoading, error } =
    useSearch({
      ...filters,
      page: filters.page || 1,
      limit: PAGE_SIZE,
    });

  // Extract instructors and enterprises from unified items for ResultsSection
  const instructors = useMemo(
    () =>
      items
        .filter((item) => item.type === "instructor")
        .map((item) => item.data),
    [items],
  );

  const enterprises = useMemo(
    () =>
      items
        .filter((item) => item.type === "enterprise")
        .map((item) => item.data),
    [items],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateFilter("page", newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [updateFilter],
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <InstructorsPageHeader />

        <div className="mb-8 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <InstructorSearchBar
            city={filters.city}
            specialization={filters.specialization}
            search={filters.search || ""}
            onCityChange={(city) => updateFilter("city", city)}
            onSpecializationChange={(spec) =>
              updateFilter("specialization", spec)
            }
            onSearchChange={(search) => updateFilter("search", search)}
          />
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <FiltersSidebar
            filters={filters}
            updateFilter={updateFilter}
            toggleTag={toggleTag}
            toggleGoal={toggleGoal}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters || false}
          />

          {isLoading && (
            <div className="lg:col-span-3">
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <div className="lg:col-span-3">
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6">
                <p className="text-red-400">{t("instructorsFailed")}</p>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <ResultsSection
              instructors={instructors}
              enterprises={enterprises}
              filters={filters}
              updateFilter={updateFilter}
              total={total}
              enterpriseTotal={enterpriseTotal}
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
