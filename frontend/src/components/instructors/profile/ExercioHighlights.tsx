"use client";

import { useTranslations } from "next-intl";
import { Star, CheckCircle2, Clock, ThumbsUp } from "lucide-react";
import type { InstructorProfile } from "@/types";

interface ExercioHighlightsProps {
  profile: InstructorProfile;
}

export function ExercioHighlights({ profile }: ExercioHighlightsProps) {
  const t = useTranslations("InstructorProfile");

  const items: Array<{ icon: React.ReactNode; label: string }> = [];

  // Rating
  if (profile.averageRating !== null && profile.averageRating !== undefined) {
    items.push({
      icon: <Star className="size-4 fill-orange-500 text-orange-500" />,
      label: `${profile.averageRating.toFixed(1)} ${t("rating")}`,
    });
  }

  // Review count
  if (profile.reviewCount !== null && profile.reviewCount !== undefined) {
    items.push({
      icon: <CheckCircle2 className="size-4 text-emerald-400" />,
      label: `${profile.reviewCount} ${t("verifiedReviews")}`,
    });
  }

  // Years experience
  if (
    profile.yearsExperience !== null &&
    profile.yearsExperience !== undefined
  ) {
    items.push({
      icon: <Clock className="size-4 text-blue-400" />,
      label: `${profile.yearsExperience} ${t("yearsExp")}`,
    });
  }

  // Verified badge
  if (profile.verified) {
    items.push({
      icon: <ThumbsUp className="size-4 text-emerald-400" />,
      label: t("recommended"),
    });
  }

  // Response time
  items.push({
    icon: <Clock className="size-4 text-purple-400" />,
    label: t("respondsWithin"),
  });

  if (items.length === 0) return null;

  return (
    <div className="bg-slate-800/30 border-y border-slate-700/50 py-4">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5 text-slate-300">
            {item.icon}
            <span>{item.label}</span>
            {index < items.length - 1 && (
              <span className="text-slate-600 ml-1 hidden sm:inline">•</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
