"use client";

import { useLocale, useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTags, useGoals, getTagName, getGoalName } from "@/hooks/useConfig";
import type { FiltersSidebarProps } from "./types";
import type { InstructorFilters, SearchFilters } from "@/types/filters";

export function FiltersSidebar({
  filters,
  updateFilter,
  toggleTag,
  toggleGoal,
  clearFilters,
  hasActiveFilters,
}: FiltersSidebarProps) {
  const t = useTranslations("InstructorsPage");
  const locale = useLocale();
  const { tags, loading: tagsLoading } = useTags();
  const { goals, loading: goalsLoading } = useGoals();

  const availableTags = filters.specialization
    ? tags.filter((tag) => tag.categories.includes(filters.specialization!))
    : tags;

  const isLoading = tagsLoading || goalsLoading;

  return (
    <aside
      className="lg:col-span-1"
      role="region"
      aria-label={t("filters.ariaLabel")}
    >
      <div className="sticky top-24 space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        )}
        <div className="flex items-center justify-between pt-0 md:pt-2">
          <h2 className="text-xl font-semibold text-white">
            {t("filters.title")}
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-base text-orange-500 hover:text-orange-400 transition-colors font-semibold cursor-pointer"
              aria-label={t("filters.clearAll")}
            >
              {t("filters.clearAll")}
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Type filter - All / Instructors / Enterprises */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-5">
            <label
              htmlFor="type-select"
              className="text-base font-semibold text-white mb-4 block cursor-pointer"
            >
              {t("filters.type")}
            </label>
            <Select
              value={filters.type || "instructors"}
              onValueChange={(value) =>
                updateFilter("type", value as SearchFilters["type"])
              }
            >
              <SelectTrigger
                id="type-select"
                className="w-full h-12 text-base bg-slate-800 border-slate-700 text-white focus-visible:border-orange-500 px-4 cursor-pointer"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={8}
                className="bg-slate-900 border-slate-700 w-(--radix-select-trigger-width)"
              >
                <SelectItem
                  value="all"
                  className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
                >
                  {t("type.all")}
                </SelectItem>
                <SelectItem
                  value="instructors"
                  className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
                >
                  {t("type.instructors")}
                </SelectItem>
                <SelectItem
                  value="enterprises"
                  className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
                >
                  {t("type.enterprises")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags section - Global tags sorted by relevance */}
          {availableTags.length > 0 && (
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-5">
              <h3
                className="text-base font-semibold text-white mb-4"
                id="tags-heading"
              >
                {t("filters.tags")}
              </h3>
              <div
                className="space-y-3 max-h-96 overflow-y-auto pr-2"
                role="group"
                aria-labelledby="tags-heading"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#475569 transparent",
                }}
              >
                {availableTags.map((tag) => {
                  const isChecked = filters.tags?.includes(tag.id) || false;
                  return (
                    <label
                      key={tag.id}
                      htmlFor={`tag-${tag.id}`}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors group"
                    >
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={isChecked}
                        onCheckedChange={() => toggleTag(tag.id)}
                        className="border-slate-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 cursor-pointer"
                        aria-label={getTagName(tag, locale)}
                      />
                      <span
                        className={`text-base select-none transition-colors ${
                          isChecked
                            ? "text-white font-medium"
                            : "text-slate-300 group-hover:text-white"
                        }`}
                      >
                        {getTagName(tag, locale)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-5">
            <h3
              className="text-base font-semibold text-white mb-4"
              id="goals-heading"
            >
              {t("filters.goals")}
            </h3>
            <div
              className="space-y-3"
              role="group"
              aria-labelledby="goals-heading"
            >
              {goals.map((goal) => {
                const isChecked = filters.goals?.includes(goal.id) || false;
                return (
                  <label
                    key={goal.id}
                    htmlFor={`goal-${goal.id}`}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors group"
                  >
                    <Checkbox
                      id={`goal-${goal.id}`}
                      checked={isChecked}
                      onCheckedChange={() => toggleGoal(goal.id)}
                      className="border-slate-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 cursor-pointer"
                      aria-label={getGoalName(goal, locale)}
                    />
                    <span className="text-lg mr-2">{goal.icon}</span>
                    <span
                      className={`text-base select-none transition-colors ${
                        isChecked
                          ? "text-white font-medium"
                          : "text-slate-300 group-hover:text-white"
                      }`}
                    >
                      {getGoalName(goal, locale)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-5">
            <label
              htmlFor="experience-select"
              className="text-base font-semibold text-white mb-4 block cursor-pointer"
            >
              {t("filters.experience")}
            </label>
            <Select
              value={filters.experience || "all"}
              onValueChange={(value) =>
                updateFilter("experience", value as any)
              }
            >
              <SelectTrigger
                id="experience-select"
                className="w-full h-12 text-base bg-slate-800 border-slate-700 text-white focus-visible:border-orange-500 px-4 cursor-pointer"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={8}
                className="bg-slate-900 border-slate-700 w-(--radix-select-trigger-width)"
              >
                <SelectItem
                  value="all"
                  className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
                >
                  {t("experience.all")}
                </SelectItem>
                <SelectItem
                  value="0-2"
                  className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
                >
                  {t("experience.0-2")}
                </SelectItem>
                <SelectItem
                  value="3-5"
                  className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
                >
                  {t("experience.3-5")}
                </SelectItem>
                <SelectItem
                  value="6-10"
                  className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
                >
                  {t("experience.6-10")}
                </SelectItem>
                <SelectItem
                  value="10+"
                  className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
                >
                  {t("experience.10+")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-5">
            <label
              htmlFor="availability-select"
              className="text-base font-semibold text-white mb-4 block cursor-pointer"
            >
              {t("filters.availability")}
            </label>
            <Select
              value={filters.availability || "all"}
              onValueChange={(value) =>
                updateFilter(
                  "availability",
                  value as InstructorFilters["availability"],
                )
              }
            >
              <SelectTrigger
                id="availability-select"
                className="w-full h-12 text-base bg-slate-800 border-slate-700 text-white focus-visible:border-orange-500 px-4 cursor-pointer"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={8}
                className="bg-slate-900 border-slate-700 w-(--radix-select-trigger-width)"
              >
                <SelectItem
                  value="all"
                  className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
                >
                  {t("availability.all")}
                </SelectItem>
                <SelectItem
                  value="online"
                  className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
                >
                  {t("availability.online")}
                </SelectItem>
                <SelectItem
                  value="in-person"
                  className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
                >
                  {t("availability.inPerson")}
                </SelectItem>
                <SelectItem
                  value="both"
                  className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 py-3 cursor-pointer"
                >
                  {t("availability.both")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </aside>
  );
}
