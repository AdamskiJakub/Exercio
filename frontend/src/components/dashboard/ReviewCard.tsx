import { Star } from "lucide-react";
import Link from "next/link";

interface ReviewCardAuthor {
  displayName: string;
  href?: string;
}

interface ReviewCardData {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  serviceName: string | null;
}

interface ReviewCardProps {
  review: ReviewCardData;
  author: ReviewCardAuthor;
}

/**
 * Shared card component for displaying a single review.
 * Used by both RecentReviewsSection (instructor dashboard) and MyReviewsSection (client dashboard).
 */
export function ReviewCard({ review, author }: ReviewCardProps) {
  const authorElement = author.href ? (
    <Link
      href={author.href}
      className="text-base font-semibold text-white truncate hover:text-emerald-400 transition-colors"
    >
      {author.displayName}
    </Link>
  ) : (
    <span className="text-base font-semibold text-white truncate">
      {author.displayName}
    </span>
  );

  return (
    <div
      key={review.id}
      className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50"
    >
      <div className="flex items-center justify-between mb-1.5">
        {authorElement}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= review.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-slate-600"
              }`}
            />
          ))}
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-slate-300 line-clamp-2 mt-1.5 leading-relaxed">
          {review.comment}
        </p>
      )}
      <p className="text-xs text-slate-400 mt-1.5">
        {new Date(review.createdAt).toLocaleDateString()}
        {review.serviceName && ` · ${review.serviceName}`}
      </p>
    </div>
  );
}
