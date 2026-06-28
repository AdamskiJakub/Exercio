"use client";

import { useState, useCallback } from "react";
import type { PendingReview } from "@/hooks/useReviews";

interface SelectedBooking {
  id: string;
  instructorName: string;
}

interface UseReviewFlowReturn {
  reviewFormOpen: boolean;
  selectedBookingForReview: SelectedBooking | null;
  reviewIndex: number;
  handleOpenReview: (
    bookingId: string,
    instructorName: string,
    index?: number,
  ) => void;
  handleReviewSuccess: (pendingReviews?: PendingReview[]) => void;
  handleReviewClose: () => void;
  setReviewFormOpen: (open: boolean) => void;
  setSelectedBookingForReview: (booking: SelectedBooking | null) => void;
  setReviewIndex: (index: number) => void;
}

export function useReviewFlow(): UseReviewFlowReturn {
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] =
    useState<SelectedBooking | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);

  const handleOpenReview = useCallback(
    (bookingId: string, instructorName: string, index?: number) => {
      setReviewIndex(index ?? 0);
      setSelectedBookingForReview({ id: bookingId, instructorName });
      setReviewFormOpen(true);
    },
    [],
  );

  const handleReviewSuccess = useCallback(
    (pendingReviews?: PendingReview[]) => {
      setReviewIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (pendingReviews && nextIndex < pendingReviews.length) {
          const nextReview = pendingReviews[nextIndex];
          setSelectedBookingForReview({
            id: nextReview.bookingId,
            instructorName: nextReview.instructorName,
          });
          // Keep modal open — it will show the next review
          return nextIndex;
        } else {
          // No more reviews — close modal
          setReviewFormOpen(false);
          setSelectedBookingForReview(null);
          return 0;
        }
      });
    },
    [],
  );

  const handleReviewClose = useCallback(() => {
    setReviewFormOpen(false);
    setSelectedBookingForReview(null);
    setReviewIndex(0);
  }, []);

  return {
    reviewFormOpen,
    selectedBookingForReview,
    reviewIndex,
    handleOpenReview,
    handleReviewSuccess,
    handleReviewClose,
    setReviewFormOpen,
    setSelectedBookingForReview,
    setReviewIndex,
  };
}
