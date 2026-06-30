"use client";

import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { useMyReviews } from "@/hooks/useReviews";
import { EmptyStateCard } from "./EmptyStateCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ReviewCard } from "./ReviewCard";

/**
 * Displays reviews written by the current user (client).
 * Uses the shared ReviewCard component for consistent rendering.
 */
export function MyReviewsSection() {
  const t = useTranslations("Dashboard.client");
  const { data: reviews, isLoading } = useMyReviews();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <EmptyStateCard
        icon={Star}
        title={t("noReviewsYet")}
        description={t("myReviewsDescription")}
      />
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={{
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            serviceName: review.serviceName,
          }}
          author={{
            displayName: review.instructorName || t("unknownTrainer"),
            href: review.instructorProfileId
              ? `/instructors/${review.instructorProfileId}`
              : undefined,
          }}
        />
      ))}
    </div>
  );
}
