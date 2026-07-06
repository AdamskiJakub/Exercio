"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import type { InstructorFilters } from "@/types/filters";

export function useInstructorFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const parseNumericParam = (key: string): number | undefined => {
    const value = searchParams.get(key);
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const [filters, setFilters] = useState<InstructorFilters>({
    city: searchParams.get("city") || "",
    specialization: searchParams.get("specialization") || "",
    search: searchParams.get("search") || "",
    type:
      (searchParams.get("type") as InstructorFilters["type"]) || "instructors",
    tags: (() => {
      const tags = searchParams.getAll("tags");
      return tags.length > 0 ? tags : undefined;
    })(),
    goals: (() => {
      const goals = searchParams.getAll("goals");
      return goals.length > 0 ? goals : undefined;
    })(),
    priceMin: parseNumericParam("priceMin"),
    priceMax: parseNumericParam("priceMax"),
    experience: (searchParams.get("experience") as any) || "all",
    availability: (searchParams.get("availability") as any) || "all",
    gender: (searchParams.get("gender") as any) || "all",
    sortBy: (searchParams.get("sortBy") as any) || "relevance",
    page: parseNumericParam("page") || 1,
  });

  const updateURL = useCallback(
    (newFilters: InstructorFilters, scroll = false) => {
      const query: Record<string, string | string[]> = {};

      Object.entries(newFilters).forEach(([key, value]) => {
        if (key === "tags" || key === "goals") {
          if (Array.isArray(value) && value.length > 0) {
            query[key] = value;
          }
        } else if (
          value !== undefined &&
          value !== null &&
          value !== "all" &&
          value !== "instructors" &&
          value !== ""
        ) {
          query[key] = String(value);
        }
      });

      router.push({ pathname: "/instructors", query }, { scroll });
    },
    [router],
  );

  const toggleTag = useCallback(
    (tagId: string) => {
      const current = filters.tags || [];
      const newTags = current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId];

      const newFilters = {
        ...filters,
        tags: newTags.length > 0 ? newTags : undefined,
      };
      setFilters(newFilters);
      updateURL(newFilters, false);
    },
    [filters, updateURL],
  );

  const toggleGoal = useCallback(
    (goalId: string) => {
      const current = filters.goals || [];
      const newGoals = current.includes(goalId)
        ? current.filter((id) => id !== goalId)
        : [...current, goalId];

      const newFilters = {
        ...filters,
        goals: newGoals.length > 0 ? newGoals : undefined,
      };
      setFilters(newFilters);
      updateURL(newFilters, false);
    },
    [filters, updateURL],
  );

  const updateFilter = useCallback(
    <K extends keyof InstructorFilters>(
      key: K,
      value: InstructorFilters[K],
    ) => {
      let newFilters = { ...filters, [key]: value };

      // Clear tags when specialization changes
      if (key === "specialization") {
        newFilters = { ...newFilters, tags: undefined };
      }

      // Reset to page 1 when any filter changes (except page itself)
      if (key !== "page") {
        newFilters = { ...newFilters, page: 1 };
      }

      setFilters(newFilters);
      updateURL(newFilters, false);
    },
    [filters, updateURL],
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters: InstructorFilters = {
      city: "",
      specialization: "",
      type: "instructors",
      experience: "all",
      availability: "all",
      gender: "all",
      sortBy: "relevance",
    };
    setFilters(clearedFilters);
    router.push("/instructors");
  }, [router]);

  const hasActiveFilters =
    filters.city !== "" ||
    filters.specialization !== "" ||
    (filters.search?.trim() && filters.search.trim() !== "") ||
    (filters.tags && filters.tags.length > 0) ||
    (filters.goals && filters.goals.length > 0) ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    (filters.experience && filters.experience !== "all") ||
    (filters.availability && filters.availability !== "all") ||
    (filters.gender && filters.gender !== "all");

  return {
    filters,
    updateFilter,
    toggleTag,
    toggleGoal,
    clearFilters,
    hasActiveFilters,
  };
}
