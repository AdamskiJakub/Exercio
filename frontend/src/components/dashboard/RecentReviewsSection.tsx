"use client";

import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { useInstructorReviews } from "@/hooks/useReviews";
import { EmptyStateCard } from "./EmptyStateCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ReviewCard } from "./ReviewCard";

interface RecentReviewsSectionProps {
  instructorProfileId: string | undefined;
}

/**
 * Displays recent reviews received by an instructor.
 * Extracted from InstructorDashboard into a shared component.
 */
export function RecentReviewsSection({
  instructorProfileId,
}: RecentReviewsSectionProps) {
  const t = useTranslations("Dashboard.instructor");
  const { data: reviewsData, isLoading } = useInstructorReviews(
    instructorProfileId,
    1,
    5,
  );
  const reviews = reviewsData?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <EmptyStateCard
        icon={Star}
        title={t("noReviewsYet")}
        description={t("reviewsComingSoon")}
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
            displayName: review.author.displayName,
          }}
        />
      ))}
      {reviewsData && reviewsData.totalCount > 5 && (
        <p className="text-center text-xs text-slate-500 mt-3">
          {t("moreReviews", { count: reviewsData.totalCount - 5 })}
        </p>
      )}
    </div>
  );
}
