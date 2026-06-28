"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyStateCard } from "./EmptyStateCard";
import type { PendingReview } from "@/hooks/useReviews";

interface PendingReviewsSectionProps {
  pendingReviews: PendingReview[] | undefined;
  isLoading: boolean;
  onOpenReview: (
    bookingId: string,
    instructorName: string,
    index?: number,
  ) => void;
  t: (key: string, params?: Record<string, string | number | Date>) => string;
  variant?: "client" | "instructor";
}

export function PendingReviewsSection({
  pendingReviews,
  isLoading,
  onOpenReview,
  t,
  variant = "client",
}: PendingReviewsSectionProps) {
  const pendingReviewCount = pendingReviews?.length || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (pendingReviewCount === 0) {
    return (
      <EmptyStateCard
        icon={Star}
        title={t("noPendingReviews")}
        description={t("noPendingReviewsDescription")}
      />
    );
  }

  return (
    <>
      {/* Review Banner */}
      {pendingReviews && pendingReviews[0] && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={
            variant === "instructor"
              ? "bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 mb-4 flex items-center justify-between"
              : "bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center justify-between gap-4"
          }
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Star className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {variant === "instructor"
                  ? t("reviewBannerTitle", { count: pendingReviewCount })
                  : t("reviewBannerTitle")}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                {pendingReviewCount} {t("reviewCompletedSessions")}
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              onOpenReview(
                pendingReviews[0].bookingId,
                pendingReviews[0].instructorName,
                0,
              )
            }
            className={
              variant === "instructor"
                ? "px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-all hover:scale-105 text-sm"
                : "px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            }
          >
            {t("reviewBannerAction")}
          </button>
        </motion.div>
      )}

      {/* Pending Reviews List */}
      <div className="space-y-2">
        {pendingReviews?.slice(0, 3).map((review) => (
          <div
            key={review.bookingId}
            className={
              variant === "instructor"
                ? "flex items-center justify-between bg-slate-700/30 rounded-lg p-3 border border-slate-600/50"
                : "flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
            }
          >
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {review.instructorName}
              </p>
              <p className="text-slate-400 text-xs">
                {new Date(review.startTime).toLocaleDateString()}
                {review.serviceName && ` · ${review.serviceName}`}
              </p>
            </div>
            <button
              onClick={() =>
                onOpenReview(
                  review.bookingId,
                  review.instructorName,
                  pendingReviews?.indexOf(review),
                )
              }
              className={
                variant === "instructor"
                  ? "px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors shrink-0 ml-2"
                  : "px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition-colors ml-2 whitespace-nowrap"
              }
            >
              {t("leaveReview")}
            </button>
          </div>
        ))}
        {pendingReviews && pendingReviews.length > 3 && (
          <p className="text-center text-xs text-slate-500">
            {t("moreReviews", { count: pendingReviews.length - 3 })}
          </p>
        )}
      </div>
    </>
  );
}
