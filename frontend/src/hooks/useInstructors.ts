'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { InstructorFilters } from '@/types/filters';

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
    email?: string; // Not returned in listing endpoints for privacy
    username: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
}

function transformToInstructorListing(profile: InstructorProfileResponse) {
  const fullName = [profile.user.firstName, profile.user.lastName]
    .filter(Boolean)
    .join(' ') || profile.user.username;
  
  return {
    ...profile,
    username: profile.user.username,
    fullName,
    primarySpecialization: profile.specializations[0] || 'personal-training',
    availability: (profile.availability as 'online' | 'in-person' | 'both') || 'both',
    videoUrl: null,
    averageRating: undefined,
    reviewCount: undefined,
  };
}


export function useInstructors(filters: InstructorFilters) {
  return useQuery({
    queryKey: ['instructors', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
        
        if (filters.city) params.append('city', filters.city);
        if (filters.specialization) params.append('specialization', filters.specialization);
        if (filters.tags && filters.tags.length > 0) {
          filters.tags.forEach(tag => params.append('tags', tag));
        }
        if (filters.goals && filters.goals.length > 0) {
          filters.goals.forEach(goal => params.append('goals', goal));
        }
        if (filters.priceMin !== undefined) params.append('priceMin', filters.priceMin.toString());
        if (filters.priceMax !== undefined) params.append('priceMax', filters.priceMax.toString());
        // minRating will be added when backend reviews/ratings are implemented

        const queryString = params.toString();
        const url = `/instructor-profiles${queryString ? `?${queryString}` : ''}`;
        const response = await apiClient.get<InstructorProfileResponse[]>(url);

      return response.data.map(transformToInstructorListing);
    },
    staleTime: 2 * 60 * 1000,
  });
}