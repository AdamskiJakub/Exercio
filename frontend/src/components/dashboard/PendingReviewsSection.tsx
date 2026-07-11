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
              ? "bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-5 flex items-center justify-between gap-4"
              : "bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 flex items-center justify-between gap-4"
          }
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-3 bg-orange-500/10 rounded-lg shrink-0">
              <Star className="w-6 h-6 text-orange-400" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-base">
                {variant === "instructor"
                  ? t("reviewBannerTitle", { count: pendingReviewCount })
                  : t("reviewBannerTitle")}
              </p>
              <p className="text-slate-300 text-sm mt-1 truncate">
                {pendingReviewCount === 1
                  ? pendingReviews[0].instructorName
                  : pendingReviewCount > 1
                    ? t("reviewBannerSubtitle", {
                        names: pendingReviews
                          .slice(0, 3)
                          .map((r) => r.instructorName)
                          .join(", "),
                        count: pendingReviewCount,
                      })
                    : pendingReviews[0].instructorName}
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
                ? "px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-all hover:scale-105 text-base shrink-0 shadow-lg shadow-amber-500/20"
                : "px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
            }
          >
            {t("reviewBannerAction")}
          </button>
        </motion.div>
      )}
    </>
  );
}
