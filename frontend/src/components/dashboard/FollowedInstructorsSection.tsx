"use client";

import { useTranslations } from "next-intl";
import { Heart, MapPin, BellOff, ChevronDown, ChevronUp } from "lucide-react";
import {
  useMyFollowedInstructors,
  useToggleFollowInstructor,
} from "@/hooks/useFollow";
import { useLocale } from "next-intl";
import NextLink from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { UserAvatar } from "@/components/ui/user-avatar";
import { motion } from "framer-motion";
import { cardVariants } from "@/lib/animations";
import { useShowMore } from "@/hooks/useShowMore";
import type { FollowedInstructor } from "@/types";

const INITIAL_VISIBLE = 5;

interface FollowedInstructorsSectionProps {
  instructors: FollowedInstructor[] | undefined;
  isLoading: boolean;
}

export function FollowedInstructorsSection({
  instructors,
  isLoading,
}: FollowedInstructorsSectionProps) {
  const t = useTranslations("Follow");
  const locale = useLocale();
  const toggleMutation = useToggleFollowInstructor();
  const { visibleCount, hasMore, showMore, showLess, isExpanded } = useShowMore(
    instructors?.length ?? 0,
    {
      initialVisible: INITIAL_VISIBLE,
      batchSize: 5,
    },
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!instructors || instructors.length === 0) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-slate-700/50 rounded-full">
            <Heart className="size-8 text-slate-500" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          {t("noFollowedInstructors")}
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          {t("noFollowedInstructorsDescription")}
        </p>
        <NextLink
          href="/instructors"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
        >
          {t("browseInstructors")}
        </NextLink>
      </motion.div>
    );
  }

  const visibleInstructors = instructors.slice(0, visibleCount);

  return (
    <div className="space-y-3">
      {visibleInstructors.map((inst: FollowedInstructor, index: number) => {
        const fullName =
          [inst.user.firstName, inst.user.lastName].filter(Boolean).join(" ") ||
          inst.user.username;

        return (
          <motion.div
            key={inst.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={index * 0.05}
            className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-orange-500/50 rounded-xl overflow-hidden transition-colors duration-300"
          >
            <NextLink
              href={`/instructors/${inst.user.username}`}
              className="flex items-center gap-4 p-4"
            >
              {/* Avatar */}
              <UserAvatar
                photoUrl={inst.photoUrl}
                firstName={inst.user?.firstName}
                lastName={inst.user?.lastName}
                size="md"
                alt={fullName}
              />

              {/* Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {fullName}
                  </h4>
                  {inst.verified && (
                    <span className="size-3.5 rounded-full bg-orange-500 shrink-0" />
                  )}
                </div>
                {inst.tagline && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {inst.tagline}
                  </p>
                )}
                {inst.city && (
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                    <MapPin className="size-3" />
                    <span>{inst.city}</span>
                  </div>
                )}
              </div>
            </NextLink>

            {/* Unfollow button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleMutation.mutate({
                  instructorProfileId: inst.instructorProfileId,
                  isFollowing: true,
                });
              }}
              disabled={toggleMutation.isPending}
              className="absolute top-3 right-3 p-1.5 rounded-full text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title={t("unfollow")}
            >
              <BellOff className="size-4" />
            </button>
          </motion.div>
        );
      })}

      {/* Show more / show less */}
      {instructors.length > INITIAL_VISIBLE && (
        <div className="text-center pt-2">
          <button
            onClick={isExpanded ? showLess : showMore}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="size-4" />
                {t("showLess") || "Pokaż mniej"}
              </>
            ) : (
              <>
                <ChevronDown className="size-4" />
                {t("showMore", { count: instructors.length - visibleCount }) ||
                  `Pokaż więcej (${instructors.length - visibleCount})`}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
