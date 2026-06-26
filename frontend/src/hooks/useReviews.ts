import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export interface CreateReviewDto {
  bookingId: string;
  rating: number;
  comment?: string;
  lowRatingReason?: string;
}

export interface CreateGuestReviewDto extends CreateReviewDto {
  token: string;
}

export interface PendingReview {
  bookingId: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  instructorName: string;
  instructorAvatar: string | null;
  instructorProfileId: string | null;
  serviceName: string | null;
}

export interface InstructorReview {
  id: string;
  rating: number;
  comment: string | null;
  lowRatingReason: string | null;
  createdAt: string;
  isGuestReview: boolean;
  author: {
    displayName: string;
    avatarUrl: string | null;
  };
  serviceName: string | null;
  bookingDate: string;
}

export interface InstructorReviewStats {
  averageRating: number | null;
  reviewCount: number;
  ratingLabel: string | null;
}

export function usePendingReviews() {
  return useQuery({
    queryKey: ["reviews", "pending"],
    queryFn: async () => {
      const response = await apiClient.get<PendingReview[]>(
        "/reviews/my-pending",
      );
      return response.data;
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateReviewDto) => {
      const response = await apiClient.post("/reviews", dto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "my"] });
    },
  });
}

export function useInstructorReviews(instructorProfileId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", "instructor", instructorProfileId],
    queryFn: async () => {
      const response = await apiClient.get<InstructorReview[]>(
        `/reviews/instructor/${instructorProfileId}`,
      );
      return response.data;
    },
    enabled: !!instructorProfileId,
  });
}

export function useInstructorReviewStats(
  instructorProfileId: string | undefined,
) {
  return useQuery({
    queryKey: ["reviews", "instructor", instructorProfileId, "stats"],
    queryFn: async () => {
      const response = await apiClient.get<InstructorReviewStats>(
        `/reviews/instructor/${instructorProfileId}/stats`,
      );
      return response.data;
    },
    enabled: !!instructorProfileId,
  });
}

export function useCreateGuestReview() {
  return useMutation({
    mutationFn: async (dto: CreateGuestReviewDto) => {
      const response = await apiClient.post("/reviews/guest", dto);
      return response.data;
    },
  });
}
