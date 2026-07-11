"use client";

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
}: ResultsSectionProps) {
  const t = useTranslations("InstructorsPage");
  const isEnterpriseOnly = filters.type === "enterprises";
  const isMixed = filters.type === "all";
  const hasEnterprises = enterprises && enterprises.length > 0;

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
            {isMixed && instructors.length > 0 && hasEnterprises
              ? `${t("instructorCount", { count: total ?? 0 })} · ${t("enterpriseCount", { count: enterpriseTotal ?? enterprises.length })}`
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
              {!isEnterpriseOnly && (
                <>
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
                </>
              )}
              <SelectItem
                value="name-asc"
                className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
              >
                {t("sortBy.nameAsc")}
              </SelectItem>
              <SelectItem
                value="name-desc"
                className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
              >
                {t("sortBy.nameDesc")}
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

      <div className="space-y-8">
        {instructors.length > 0 || hasEnterprises ? (
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
