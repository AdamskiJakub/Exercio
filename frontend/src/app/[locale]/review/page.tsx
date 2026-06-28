"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Star, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { toast } from "sonner";

const LOW_RATING_REASONS = [
  "no-show",
  "unprofessional",
  "not-as-described",
  "other",
] as const;

export default function GuestReviewPage() {
  const t = useTranslations("Booking");
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const token = searchParams.get("token");

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [lowRatingReason, setLowRatingReason] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  // Token from randomBytes(32).toString('hex') is a 64-char hex string
  const isValidTokenFormat = (t: string | null): t is string =>
    typeof t === "string" && /^[0-9a-f]{64}$/i.test(t);

  const {
    data: validation,
    isLoading: isValidating,
    isError: validationError,
  } = useQuery({
    queryKey: ["review-token", bookingId, token],
    queryFn: async () => {
      const response = await apiClient.get<{ valid: boolean }>(
        `/reviews/validate-token?bookingId=${bookingId}&token=${token}`,
      );
      return response.data;
    },
    enabled: !!bookingId && isValidTokenFormat(token),
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/reviews/guest", {
        bookingId,
        token,
        rating,
        comment: comment.trim() || undefined,
        lowRatingReason:
          rating >= 1 && rating <= 3 ? lowRatingReason : undefined,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(t("reviewSubmitted") || "Review submitted successfully!");
      setSubmitted(true);
    },
  });

  const isValid = validation?.valid === true;
  const isLowRating = rating >= 1 && rating <= 3;
  const canSubmit = rating > 0 && (!isLowRating || lowRatingReason.length > 0);

  // Missing params
  if (!bookingId || !token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 w-full max-w-md text-center shadow-2xl">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">
            {t("guestReview.invalidLink") || "Invalid Link"}
          </h1>
          <p className="text-slate-400 mb-6">
            {t("guestReview.invalidLinkDescription") ||
              "The review link is invalid or has expired."}
          </p>
          <Link href="/">
            <Button
              size="xl"
              className="bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              {t("guestReview.goHome") || "Go Home"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Validating token
  if (isValidating) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 w-full max-w-md text-center shadow-2xl">
          <Loader2 className="w-12 h-12 text-orange-400 animate-spin mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-white mb-2">
            {t("guestReview.validating") || "Validating your link..."}
          </h1>
          <p className="text-slate-400 text-sm">
            {t("guestReview.validatingDescription") ||
              "Please wait while we verify your review link."}
          </p>
        </div>
      </div>
    );
  }

  // Token invalid
  if (validationError || !isValid) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 w-full max-w-md text-center shadow-2xl">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">
            {t("guestReview.invalidLink") || "Invalid Link"}
          </h1>
          <p className="text-slate-400 mb-6">
            {t("guestReview.invalidLinkDescription") ||
              "The review link is invalid or has expired."}
          </p>
          <Link href="/">
            <Button
              size="xl"
              className="bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              {t("guestReview.goHome") || "Go Home"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Successfully submitted
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 w-full max-w-md text-center shadow-2xl">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">
            {t("guestReview.thankYou") || "Thank You!"}
          </h1>
          <p className="text-slate-300 mb-6">
            {t("guestReview.reviewSubmitted") ||
              "Your review has been submitted successfully. We appreciate your feedback!"}
          </p>
          <Link href="/">
            <Button
              size="xl"
              className="bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              {t("guestReview.goHome") || "Go Home"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Review form
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-lg font-semibold text-white mb-2">
            {t("guestReview.title") || "Share Your Experience"}
          </h1>
          <p className="text-slate-300 text-sm">
            {t("guestReview.subtitle") ||
              "Your feedback helps other clients make informed decisions."}
          </p>
        </div>

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
          size="xl"
          onClick={() => submitMutation.mutate()}
          disabled={!canSubmit || submitMutation.isPending}
          className="w-full bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
        >
          {submitMutation.isPending
            ? t("submitting") || "Submitting..."
            : t("submitReview") || "Submit Review"}
        </Button>

        {/* Error */}
        {submitMutation.isError && (
          <p className="text-red-400 text-sm text-center mt-3">
            {t("guestReview.submitError") ||
              "Failed to submit review. Please try again."}
          </p>
        )}
      </div>
    </div>
  );
}
