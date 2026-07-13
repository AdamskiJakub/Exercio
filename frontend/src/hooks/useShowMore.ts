import { useState, useCallback } from "react";

export interface UseShowMoreOptions {
  initialVisible?: number;
  batchSize?: number;
}

export interface UseShowMoreReturn {
  visibleCount: number;
  hasMore: boolean;
  showMore: () => void;
  showLess: () => void;
  reset: () => void;
  isExpanded: boolean;
  initialVisible: number;
}

/**
 * Shared hook for "show more / show less" pagination pattern.
 *
 * Used by:
 * - FollowedInstructorsSection
 * - FavoriteTrainersSection (FavoritesContent + FollowedContent)
 * - EnterpriseNews
 */
export function useShowMore(
  total: number,
  options: UseShowMoreOptions = {},
): UseShowMoreReturn {
  const { initialVisible = 5, batchSize = 5 } = options;
  const [visibleCount, setVisibleCount] = useState(initialVisible);

  const hasMore = total > visibleCount;
  const isExpanded = visibleCount >= total;

  const showMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + batchSize, total));
  }, [batchSize, total]);

  const showLess = useCallback(() => {
    setVisibleCount(initialVisible);
  }, [initialVisible]);

  const reset = useCallback(() => {
    setVisibleCount(initialVisible);
  }, [initialVisible]);

  return {
    visibleCount,
    hasMore,
    showMore,
    showLess,
    reset,
    isExpanded,
    initialVisible,
  };
}
