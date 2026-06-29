"use client";

import { useTranslations } from "next-intl";
import { Star, Quote } from "lucide-react";
import { useInstructorReviews } from "@/hooks/useReviews";

interface FeaturedReviewProps {
  instructorProfileId: string;
}

export function FeaturedReview({ instructorProfileId }: FeaturedReviewProps) {
  const t = useTranslations("InstructorProfile");
  const {
    data: reviewsData,
    isLoading,
    isError,
  } = useInstructorReviews(instructorProfileId);

  // Pick the best review (highest rating, with a comment)
  const reviews = reviewsData?.data ?? [];
  const bestReview =
    !isLoading && !isError && reviews.length > 0
      ? reviews
          .filter((r) => r.comment && r.rating >= 4)
          .sort((a, b) => b.rating - a.rating)[0]
      : null;

  if (isLoading || isError || !bestReview) return null;

  return (
    <div className="bg-linear-to-br from-slate-800/60 to-slate-800/30 backdrop-blur-sm border border-slate-700/80 rounded-2xl p-8 lg:p-10 relative overflow-hidden">
      {/* Decorative quote icon */}
      <div className="absolute top-4 right-4 text-slate-700/30">
        <Quote className="size-16" />
      </div>

      <div className="flex items-start gap-4 relative z-10">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold text-white shrink-0 ring-2 ring-orange-500/30">
          {bestReview.author.avatarUrl ? (
            <img
              src={bestReview.author.avatarUrl}
              alt={bestReview.author.displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            bestReview.author.displayName.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Stars */}
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`size-4 ${
                  star <= bestReview.rating
                    ? "fill-orange-500 text-orange-500"
                    : "fill-slate-600 text-slate-600"
                }`}
              />
            ))}
          </div>

          {/* Review text */}
          <p className="text-lg text-slate-200 leading-relaxed italic mb-3">
            &ldquo;{bestReview.comment}&rdquo;
          </p>

          {/* Author */}
          <p className="text-sm font-semibold text-white">
            {bestReview.author.displayName}
          </p>
        </div>
      </div>
    </div>
  );
}
