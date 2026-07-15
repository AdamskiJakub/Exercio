"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCreateReview } from "@/hooks/useReviews";
import { toast } from "sonner";

interface ReviewFormProps {
  bookingId: string;
  instructorName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  reviewIndex?: number;
  totalReviews?: number;
}

const LOW_RATING_REASONS = [
  "no-show",
  "unprofessional",
  "not-as-described",
  "other",
] as const;

export function ReviewForm({
  bookingId,
  instructorName,
  isOpen,
  onClose,
  onSuccess,
  reviewIndex,
  totalReviews,
}: ReviewFormProps) {
  const t = useTranslations("Booking");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [lowRatingReason, setLowRatingReason] = useState<string>("");
  const createReview = useCreateReview();

  if (!isOpen) return null;

  const isLowRating = rating >= 1 && rating <= 3;
  const canSubmit =
    rating > 0 &&
    (!isLowRating || (comment.trim().length > 0 && lowRatingReason));

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      await createReview.mutateAsync({
        bookingId,
        rating,
        comment: comment.trim() || undefined,
        lowRatingReason: isLowRating ? lowRatingReason : undefined,
      });
      toast.success(t("reviewSubmitted") || "Review submitted successfully!");
      // Call onSuccess first, then close — don't close if onSuccess throws
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error(
        t("submitError") || "Failed to submit review. Please try again.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t("reviewTitle") || "Leave a Review"}
    >
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {t("reviewTitle") || "Leave a Review"}
            {totalReviews !== undefined &&
              totalReviews > 1 &&
              reviewIndex !== undefined && (
                <span className="text-sm font-normal text-slate-400 ml-2">
                  ({reviewIndex + 1}/{totalReviews})
                </span>
              )}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label={t("close") || "Close"}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Instructor Name */}
        <p className="text-slate-300 text-sm mb-4">
          {t("reviewFor") || "Review for"}:{" "}
          <span className="text-white font-medium">{instructorName}</span>
        </p>

        {/* Star Rating */}
        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
              aria-label={t("rateStar", { n: star }) || `${star} star`}
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-colors",
                  (hoveredRating || rating) >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-600",
                )}
              />
            </button>
          ))}
        </div>

        {/* Rating Label */}
        <p className="text-center text-sm text-slate-300 mb-4">
          {rating === 0 && (t("tapToRate") || "Tap to rate")}
          {rating === 1 && (t("rating1") || "Poor")}
          {rating === 2 && (t("rating2") || "Below Average")}
          {rating === 3 && (t("rating3") || "Average")}
          {rating === 4 && (t("rating4") || "Good")}
          {rating === 5 && (t("rating5") || "Excellent")}
        </p>

        {/* Low Rating Reason (1-3 stars) */}
        {isLowRating && (
          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-2">
              {t("lowRatingReasonLabel") || "What went wrong?"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LOW_RATING_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setLowRatingReason(reason)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm border transition-colors",
                    lowRatingReason === reason
                      ? "bg-red-500/20 border-red-500 text-red-400"
                      : "bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500",
                  )}
                >
                  {t(`lowRatingReason.${reason}`) || reason}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comment */}
        <div className="mb-4">
          <label className="block text-sm text-slate-300 mb-2">
            {isLowRating
              ? t("commentRequired") || "Comment (required)"
              : t("commentOptional") || "Comment (optional)"}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("commentPlaceholder") || "Share your experience..."}
            rows={3}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none"
          />
        </div>

        {/* Submit Button */}
        <Button
          variant="primary"
          size="xl"
          onClick={handleSubmit}
          disabled={!canSubmit || createReview.isPending}
          className="w-full"
        >
          {createReview.isPending
            ? t("submitting") || "Submitting..."
            : t("submitReview") || "Submit Review"}
        </Button>
      </div>
    </div>
  );
}
