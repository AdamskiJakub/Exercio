"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { InstructorFilters } from "@/types/filters";
import type { InstructorListing } from "@/types";
import { getMockInstructors } from "@/lib/utils/mock-instructors";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_INSTRUCTORS === "true";

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

interface UseInstructorsResult {
  instructors: InstructorListing[];
  total: number;
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

export function useInstructors(
  filters: InstructorFilters,
): UseInstructorsResult {
  const query = useQuery({
    queryKey: ["instructors", filters],
    queryFn: async () => {
      if (USE_MOCK) {
        // Simulate network delay
        await new Promise((r) => setTimeout(r, 300));
        const result = getMockInstructors({
          page: filters.page,
          limit: filters.limit,
          city: filters.city,
          specialization: filters.specialization,
          tags: filters.tags,
          goals: filters.goals,
          priceMin: filters.priceMin,
          priceMax: filters.priceMax,
          search: filters.search,
        });
        return {
          instructors: result.data,
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        };
      }

      const params = new URLSearchParams();

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
        instructors: response.data.data.map(transformToInstructorListing),
        total: response.data.total,
        page: response.data.page,
        totalPages: response.data.totalPages,
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  return {
    instructors: query.data?.instructors ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? 1,
    totalPages: query.data?.totalPages ?? 0,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}
