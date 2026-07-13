"use client";

import {
  Building2,
  MapPin,
  BellOff,
  ChevronDown,
  ChevronUp,
  Heart,
} from "lucide-react";
import { useToggleFollowEnterprise } from "@/hooks/useFollow";
import { Link } from "@/i18n/routing";
import NextLink from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getMediaUrl } from "@/lib/utils/media";
import { motion } from "framer-motion";
import { cardVariants } from "@/lib/animations";
import { useShowMore } from "@/hooks/useShowMore";
import type { FollowedEnterprise } from "@/types";

interface FollowedContentProps {
  enterprises: FollowedEnterprise[] | undefined;
  isLoading: boolean;
  tFollow: (
    key: string,
    values?: Record<string, string | number | Date>,
  ) => string;
  toggleFollowMutation: ReturnType<typeof useToggleFollowEnterprise>;
  onBackToFavorites: () => void;
}

export function FollowedContent({
  enterprises,
  isLoading,
  tFollow,
  toggleFollowMutation,
  onBackToFavorites,
}: FollowedContentProps) {
  const { visibleCount, showMore, showLess, isExpanded, initialVisible } =
    useShowMore(enterprises?.length ?? 0, {
      initialVisible: 5,
      batchSize: 5,
    });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 bg-slate-700/50 rounded-lg p-1">
        <button
          onClick={onBackToFavorites}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-600/50 transition-all"
        >
          <Heart className="size-4" />
          {tFollow("favoriteTrainers")}
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-orange-500 text-white shadow-sm">
          <Building2 className="size-4" />
          {tFollow("followedEnterprises")}
        </button>
      </div>

      {!enterprises || enterprises.length === 0 ? (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-slate-700/50 rounded-full">
              <Building2 className="size-8 text-slate-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {tFollow("noFollowedEnterprises")}
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            {tFollow("noFollowedEnterprisesDescription")}
          </p>
          <NextLink
            href="/instructors?type=enterprises&sortBy=relevance&page=1"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
          >
            {tFollow("browseEnterprises")}
          </NextLink>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {enterprises
            .slice(0, visibleCount)
            .map((ent: FollowedEnterprise, index: number) => (
              <FollowedCard
                key={ent.id}
                enterprise={ent}
                index={index}
                onUnfollow={() =>
                  toggleFollowMutation.mutate({
                    enterpriseId: ent.enterpriseId,
                    isFollowing: true,
                  })
                }
                isUnfollowing={toggleFollowMutation.isPending}
                tFollow={tFollow}
              />
            ))}

          {enterprises.length > initialVisible && (
            <div className="text-center pt-2">
              <button
                onClick={isExpanded ? showLess : showMore}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="size-4" />
                    {tFollow("showLess")}
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-4" />
                    {tFollow("showMore", {
                      count: enterprises.length - visibleCount,
                    })}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─── Followed enterprise card ───

function FollowedCard({
  enterprise,
  index,
  onUnfollow,
  isUnfollowing,
  tFollow,
}: {
  enterprise: FollowedEnterprise;
  index: number;
  onUnfollow: () => void;
  isUnfollowing: boolean;
  tFollow: (
    key: string,
    values?: Record<string, string | number | Date>,
  ) => string;
}) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index * 0.05}
      className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-orange-500/50 rounded-xl overflow-hidden transition-colors duration-300"
    >
      <Link
        href={`/enterprise/${enterprise.slug}` as any}
        className="flex items-center gap-4 p-4"
      >
        {/* Logo */}
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white p-1 shrink-0">
          {enterprise.logoUrl ? (
            <img
              src={getMediaUrl(enterprise.logoUrl)}
              alt={enterprise.companyName}
              className="w-full h-full object-contain rounded"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-700 font-bold text-sm">
              {enterprise.companyName.charAt(0)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-left">
          <h4 className="text-sm font-semibold text-white truncate">
            {enterprise.companyName}
          </h4>
          {enterprise.city && (
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
              <MapPin className="size-3" />
              <span>{enterprise.city}</span>
            </div>
          )}
          {enterprise.shortDescription && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              {enterprise.shortDescription}
            </p>
          )}
        </div>
      </Link>

      {/* Unfollow button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onUnfollow();
        }}
        disabled={isUnfollowing}
        className="absolute top-3 right-3 p-1.5 rounded-full text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        title={tFollow("unfollow")}
        aria-label={tFollow("unfollow")}
      >
        <BellOff className="size-4" aria-hidden="true" />
      </button>
    </motion.div>
  );
}
