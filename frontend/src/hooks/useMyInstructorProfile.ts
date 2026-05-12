'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { InstructorListing } from '@/types';
import { useAuthStore } from '@/stores/auth-store';

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
  showPhone: boolean;
  showEmail: boolean;
  contactMessage: string | null;
  // Booking settings
  isBookingEnabled: boolean;
  sessionDuration: number;
  sessionPrice: number | null;
  minNoticeHours: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    role: string;
  };
}

function transformToInstructorListing(profile: InstructorProfileResponse): InstructorListing {
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
    user: {
      id: profile.user.id,
      email: profile.user.email,
      username: profile.user.username,
      firstName: profile.user.firstName,
      lastName: profile.user.lastName,
      phone: profile.user.phone,
      role: profile.user.role,
    },
  };
}

export function useMyInstructorProfile(options?: { enabled?: boolean }) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['instructor-profile', 'me', user?.id],
    queryFn: async () => {
      const response = await apiClient.get<InstructorProfileResponse>('/instructor-profiles/me');
      return transformToInstructorListing(response.data);
    },
    retry: false,
    enabled: options?.enabled ?? true,
  });
}