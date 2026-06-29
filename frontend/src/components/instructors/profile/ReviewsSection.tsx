"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Star, MessageSquare, ChevronDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { pl, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  useInstructorReviews,
  useInstructorReviewStats,
} from "@/hooks/useReviews";

const REVIEWS_PER_PAGE = 10;

interface ReviewsSectionProps {
  instructorProfileId: string;
}

export function ReviewsSection({ instructorProfileId }: ReviewsSectionProps) {
  const t = useTranslations("InstructorProfile");
  const locale = useLocale();
  const dateLocale = locale === "pl" ? pl : enUS;
  const [page, setPage] = useState(1);

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isError: reviewsError,
  } = useInstructorReviews(instructorProfileId, page, REVIEWS_PER_PAGE);
  const { data: stats, isLoading: statsLoading } =
    useInstructorReviewStats(instructorProfileId);

  const isLoading = reviewsLoading || statsLoading;
  const reviews = reviewsData?.data ?? [];
  const totalCount = reviewsData?.totalCount ?? 0;
  const hasMore = reviewsData?.hasMore ?? false;

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-700 rounded" />
          <div className="h-4 w-32 bg-slate-700 rounded" />
          <div className="space-y-3 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (reviewsError) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 lg:p-8">
        <p className="text-slate-400 text-center">{t("errorLoadingReviews")}</p>
      </div>
    );
  }

  const averageRating = stats?.averageRating;
  const reviewCount = stats?.reviewCount || totalCount;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 lg:p-8">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Star className="size-5 text-orange-500 fill-orange-500" />
        {t("reviewsTitle")}
      </h2>

      {/* Rating Summary */}
      {averageRating !== null && averageRating !== undefined && (
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-700">
          <div className="text-center">
            <p className="text-5xl font-bold text-white">
              {averageRating.toFixed(1)}
            </p>
            <div className="flex items-center gap-1 mt-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`size-4 ${
                    star <= Math.round(averageRating)
                      ? "fill-orange-500 text-orange-500"
                      : "fill-slate-600 text-slate-600"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="text-sm text-slate-400">
            <p className="font-medium text-white">
              {reviewCount} {t("verifiedReviews")}
            </p>
            <p>{t("basedOnReviews")}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {reviews.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="size-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">{t("noReviews")}</p>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-slate-900/30 border border-slate-700/50 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {review.author.avatarUrl ? (
                    <img
                      src={review.author.avatarUrl}
                      alt={review.author.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    review.author.displayName.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name + Date */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {review.author.displayName}
                    </p>
                    <span className="text-xs text-slate-500 shrink-0">
                      {review.bookingDate
                        ? format(parseISO(review.bookingDate), "dd.MM.yyyy", {
                            locale: dateLocale,
                          })
                        : format(parseISO(review.createdAt), "dd.MM.yyyy", {
                            locale: dateLocale,
                          })}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`size-3.5 ${
                          star <= review.rating
                            ? "fill-orange-500 text-orange-500"
                            : "fill-slate-600 text-slate-600"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-emerald-400 ml-2">
                      ✓ {t("verifiedReview")}
                    </span>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {review.comment}
                    </p>
                  )}

                  {/* Service Name */}
                  {review.serviceName && (
                    <p className="text-xs text-slate-500 mt-2">
                      {review.serviceName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setPage((p) => p + 1)}
                className="border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <ChevronDown className="size-4 mr-2" />
                {t("showMoreReviews") || "Pokaż więcej opinii"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
