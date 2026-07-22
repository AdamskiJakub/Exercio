"use client";

import { useTranslations, useLocale } from "next-intl";
import { Heart, BellOff, ChevronDown, ChevronUp } from "lucide-react";
import {
  useMyFollowedInstructors,
  useToggleFollowInstructor,
} from "@/hooks/useFollow";
import NextLink from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { InstructorCard } from "@/components/ui/instructor-card";
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
      {visibleInstructors.map((inst: FollowedInstructor, index: number) => (
        <motion.div
          key={inst.id}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={index * 0.05}
        >
          <InstructorCard
            instructor={{
              username: inst.user.username,
              firstName: inst.user.firstName,
              lastName: inst.user.lastName,
              photoUrl: inst.photoUrl,
              specializations: inst.specializations,
              tagline: inst.tagline,
              city: inst.city,
            }}
            avatarSize="md"
            hoverColor="emerald"
            action={
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
                className="p-1.5 rounded-full text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title={t("unfollow")}
                aria-label={t("unfollow")}
              >
                <BellOff className="size-4" aria-hidden="true" />
              </button>
            }
          />
        </motion.div>
      ))}

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
