"use client";

import { useLocale } from "next-intl";
import { useSpecializations } from "@/hooks/useConfig";
import { UserAvatar } from "@/components/ui/user-avatar";
import { MapPin } from "lucide-react";
import Link from "next/link";

// ─── Types ───

export interface InstructorCardData {
  username: string;
  firstName: string | null;
  lastName: string | null;
  photoUrl?: string | null;
  avatarUrl?: string | null;
  specializations?: string[];
  /** Optional tagline shown instead of specialization name */
  tagline?: string | null;
  city?: string | null;
  /** Price per session – shown as "XXX zł" */
  sessionPrice?: number | null;
  /** Session duration in minutes – shown as "XXX min" */
  sessionDuration?: number | null;
}

type HoverColor = "orange" | "emerald";

interface InstructorCardProps {
  instructor: InstructorCardData;
  /** Optional action rendered in the top-right corner (e.g. remove button) */
  action?: React.ReactNode;
  /** Optional icon rendered on the right side (e.g. clock for recently viewed) */
  rightIcon?: React.ReactNode;
  /** Avatar size (default: "sm") */
  avatarSize?: "sm" | "md";
  /** Hover border color (default: "orange") */
  hoverColor?: HoverColor;
  /** Additional class names for the outer container */
  className?: string;
}

// ─── Helpers ───

/**
 * Convert a raw instructor-like object (from API responses) into InstructorCardData.
 * Handles both nested `user` and flat shapes.
 */
export function toInstructorCardData(source: {
  user?: {
    username?: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  } | null;
  username?: string;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  avatarUrl?: string | null;
  specializations?: string[];
  specializationSlugs?: string[];
  tagline?: string | null;
  city?: string | null;
  sessionPrice?: number | null;
  sessionDuration?: number | null;
}): InstructorCardData {
  return {
    username: source.user?.username || source.username || "",
    firstName: source.user?.firstName ?? source.firstName ?? null,
    lastName: source.user?.lastName ?? source.lastName ?? null,
    photoUrl: source.photoUrl,
    avatarUrl: source.user?.avatarUrl ?? source.avatarUrl,
    specializations: source.specializations ?? source.specializationSlugs,
    tagline: source.tagline,
    city: source.city,
    sessionPrice: source.sessionPrice,
    sessionDuration: source.sessionDuration,
  };
}

const hoverBorderClasses: Record<HoverColor, string> = {
  orange: "hover:border-orange-500/50",
  emerald: "hover:border-emerald-500",
};

const hoverTextClasses: Record<HoverColor, string> = {
  orange: "group-hover:text-orange-400",
  emerald: "group-hover:text-emerald-400",
};

// ─── Component ───

export function InstructorCard({
  instructor,
  action,
  rightIcon,
  avatarSize = "sm",
  hoverColor = "orange",
  className = "",
}: InstructorCardProps) {
  const locale = useLocale();
  const { specializations } = useSpecializations();

  const fullName =
    [instructor.firstName, instructor.lastName].filter(Boolean).join(" ") ||
    instructor.username;

  const primarySpecId = instructor.specializations?.[0];
  const primarySpec = primarySpecId
    ? specializations.find((s) => s.id === primarySpecId)
    : undefined;
  const primarySpecName = primarySpec
    ? locale === "pl"
      ? primarySpec.namePl
      : primarySpec.nameEn
    : null;

  const href = `/instructors/${instructor.username}`;

  return (
    <div
      className={`relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${hoverBorderClasses[hoverColor]} rounded-xl overflow-hidden transition-colors duration-300 ${className}`}
    >
      <Link href={href} className="flex items-center gap-4 p-4 group">
        {/* Avatar */}
        <UserAvatar
          photoUrl={instructor.photoUrl}
          avatarUrl={instructor.avatarUrl}
          firstName={instructor.firstName}
          lastName={instructor.lastName}
          size={avatarSize}
          alt={fullName}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={`text-sm font-semibold text-white truncate ${hoverTextClasses[hoverColor]} transition-colors`}
            >
              {fullName}
            </h4>
          </div>

          {/* Tagline (if provided) takes precedence over specialization */}
          {instructor.tagline ? (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              {instructor.tagline}
            </p>
          ) : primarySpecName ? (
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {primarySpecName}
            </p>
          ) : null}

          {/* City */}
          {instructor.city && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
              <MapPin className="size-3" />
              <span>{instructor.city}</span>
            </div>
          )}
        </div>

        {/* Right side: price/duration, icon, and/or chevron */}
        <div className="flex flex-col items-end shrink-0">
          {instructor.sessionPrice != null && (
            <span className="text-sm text-orange-400 font-medium whitespace-nowrap">
              {instructor.sessionPrice} zł
            </span>
          )}
          {instructor.sessionDuration != null && (
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {instructor.sessionDuration} min
            </span>
          )}
          {rightIcon}
        </div>
      </Link>

      {/* Action button (e.g. remove from favorites) */}
      {action && <div className="absolute top-3 right-3">{action}</div>}
    </div>
  );
}
