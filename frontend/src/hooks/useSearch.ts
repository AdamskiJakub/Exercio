"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { InstructorFilters } from "@/types/filters";
import type { InstructorListing } from "@/types";
import type { EnterpriseListing } from "@/types/enterprise";

interface SearchResponse {
  instructors?: {
    data: InstructorListing[];
    total: number;
  };
  enterprises?: {
    data: EnterpriseListing[];
    total: number;
  };
}

interface InstructorProfileResponse {
  id: string;
  userId: string;
  bio: string | null;
  tagline: string | null;
  specializations: string[];
  tags: string[];
  goals: string[];
  location: string | null;
  city: string | null;
  hourlyRate: number | null;
  hourlyRateHidden: boolean;
  packageDealsEnabled: boolean;
  packageDealsDescription: string | null;
  photoUrl: string | null;
  gallery: string[];
  verified: boolean;
  isDraft: boolean;
  yearsExperience: number | null;
  availability: string | null;
  languages: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email?: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnifiedSearchResult {
  /** All items (instructors + enterprises) in a single array */
  items: Array<
    | { type: "instructor"; data: InstructorListing }
    | { type: "enterprise"; data: EnterpriseListing }
  >;
  /** Total count of instructors only (for the counter) */
  total: number;
  /** Total count of enterprises only (for the counter) */
  enterpriseTotal: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
}

function transformToInstructorListing(
  profile: InstructorProfileResponse,
): InstructorListing {
  const fullName =
    [profile.user.firstName, profile.user.lastName].filter(Boolean).join(" ") ||
    profile.user.username;

  return {
    ...profile,
    availability:
      (profile.availability as "online" | "in-person" | "both") || "both",
    username: profile.user.username,
    fullName,
    primarySpecialization: profile.specializations[0] || "personal-training",
    videoUrl: null,
    averageRating: undefined,
    reviewCount: undefined,
  };
}

export function useSearch(filters: InstructorFilters): UnifiedSearchResult {
  const isEnterpriseOnly = filters.type === "enterprises";
  const isMixed = filters.type === "all";

  const query = useQuery({
    queryKey: ["unified-search", filters],
    enabled: true,
    queryFn: async () => {
      if (isEnterpriseOnly || isMixed) {
        // Use /search endpoint (returns both instructors + enterprises)
        const params = new URLSearchParams();

        if (filters.search) params.append("q", filters.search);
        if (filters.city) params.append("city", filters.city);
        if (filters.tags && filters.tags.length > 0) {
          filters.tags.forEach((tag) => params.append("tags", tag));
        }
        if (filters.type && filters.type !== "all")
          params.append("type", filters.type);
        if (filters.page) params.append("page", String(filters.page));
        if (filters.limit) params.append("limit", String(filters.limit));

        const queryString = params.toString();
        const { data } = await apiClient.get<SearchResponse>(
          `/search${queryString ? `?${queryString}` : ""}`,
        );
        return data;
      } else {
        // Use /instructor-profiles endpoint (instructors only with full filtering)
        const params = new URLSearchParams();

        if (filters.search) params.append("q", filters.search);
        if (filters.city) params.append("city", filters.city);
        if (filters.specialization)
          params.append("specialization", filters.specialization);
        if (filters.tags && filters.tags.length > 0) {
          filters.tags.forEach((tag) => params.append("tags", tag));
        }
        if (filters.goals && filters.goals.length > 0) {
          filters.goals.forEach((goal) => params.append("goals", goal));
        }
        if (filters.priceMin !== undefined)
          params.append("priceMin", filters.priceMin.toString());
        if (filters.priceMax !== undefined)
          params.append("priceMax", filters.priceMax.toString());
        if (filters.page !== undefined)
          params.append("page", filters.page.toString());
        if (filters.limit !== undefined)
          params.append("limit", filters.limit.toString());

        const queryString = params.toString();
        const url = `/instructor-profiles${queryString ? `?${queryString}` : ""}`;
        const response = await apiClient.get<PaginatedResponse<any>>(url);

        return {
          instructors: {
            data: response.data.data.map(transformToInstructorListing),
            total: response.data.total,
          },
        };
      }
    },
    staleTime: 2 * 60 * 1000,
  });

  const result = useMemo<UnifiedSearchResult>(() => {
    const data = query.data as SearchResponse | undefined;
    const instructors = data?.instructors?.data ?? [];
    const enterprises = data?.enterprises?.data ?? [];
    const instructorTotal = data?.instructors?.total ?? 0;
    const enterpriseTotal = data?.enterprises?.total ?? 0;

    // Build unified items array
    const items: UnifiedSearchResult["items"] = [
      ...enterprises.map((e) => ({ type: "enterprise" as const, data: e })),
      ...instructors.map((i) => ({ type: "instructor" as const, data: i })),
    ];

    // Total count depends on mode:
    // - enterprises only: show enterprise count
    // - instructors only: show instructor count
    // - mixed: show only instructor count (not enterprises)
    const total = isEnterpriseOnly ? enterpriseTotal : instructorTotal;

    // Pagination from the response
    const page = filters.page || 1;
    const totalPages = total > 0 ? Math.ceil(total / (filters.limit || 10)) : 0;

    return {
      items,
      total,
      enterpriseTotal,
      page,
      totalPages,
      isLoading: query.isLoading,
      error: query.error as Error | null,
    };
  }, [
    query.data,
    query.isLoading,
    query.error,
    isEnterpriseOnly,
    filters.page,
    filters.limit,
  ]);

  return result;
}
