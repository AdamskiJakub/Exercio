"use client";

import {
  Heart,
  MapPin,
  Trash2,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToggleFavorite } from "@/hooks/useFavorites";
import { useSpecializations } from "@/hooks/useConfig";
import { Link } from "@/i18n/routing";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { UserAvatar } from "@/components/ui/user-avatar";
import { motion } from "framer-motion";
import { cardVariants } from "@/lib/animations";
import { useShowMore } from "@/hooks/useShowMore";
import type { FavoriteInstructor } from "@/types";

interface FavoritesContentProps {
  favorites: FavoriteInstructor[] | undefined;
  isLoading: boolean;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
  tFollow: (
    key: string,
    values?: Record<string, string | number | Date>,
  ) => string;
  locale: string;
  toggleMutation: ReturnType<typeof useToggleFavorite>;
  showFollowedTab: boolean;
  onSwitchToFollowed: () => void;
}

export function FavoritesContent({
  favorites,
  isLoading,
  t,
  tFollow,
  locale,
  toggleMutation,
  showFollowedTab,
  onSwitchToFollowed,
}: FavoritesContentProps) {
  const { visibleCount, showMore, showLess, isExpanded, initialVisible } =
    useShowMore(favorites?.length ?? 0, {
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
      {showFollowedTab && (
        <div className="flex gap-1 mb-4 bg-slate-700/50 rounded-lg p-1">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-orange-500 text-white shadow-sm">
            <Heart className="size-4" />
            {t("favoriteTrainers")}
          </button>
          <button
            onClick={onSwitchToFollowed}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-600/50 transition-all"
          >
            <Building2 className="size-4" />
            {tFollow("followedEnterprises")}
          </button>
        </div>
      )}

      {!favorites || favorites.length === 0 ? (
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
            {t("noFavorites")}
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            {t("noFavoritesDescription")}
          </p>
          <Link
            href="/instructors"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
          >
            {t("browseTrainers")}
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {favorites
            .slice(0, visibleCount)
            .map((fav: FavoriteInstructor, index: number) => (
              <FavoriteCard
                key={fav.id}
                favorite={fav}
                index={index}
                locale={locale}
                onRemove={() =>
                  toggleMutation.mutate({
                    instructorProfileId: fav.id,
                    isFavorited: true,
                  })
                }
                isRemoving={toggleMutation.isPending}
              />
            ))}

          {favorites.length > initialVisible && (
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
                    {t("showMore", {
                      count: favorites.length - visibleCount,
                    }) || `Pokaż więcej (${favorites.length - visibleCount})`}
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

// ─── Favorite instructor card ───

function FavoriteCard({
  favorite,
  index,
  locale,
  onRemove,
  isRemoving,
}: {
  favorite: FavoriteInstructor;
  index: number;
  locale: string;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  const fullName =
    [favorite.user.firstName, favorite.user.lastName]
      .filter(Boolean)
      .join(" ") || favorite.user.username;

  const { specializations } = useSpecializations();
  const primarySpecId = favorite.specializations?.[0];
  const primarySpec = primarySpecId
    ? specializations.find((s) => s.id === primarySpecId)
    : undefined;
  const primarySpecName = primarySpec
    ? locale === "pl"
      ? primarySpec.namePl
      : primarySpec.nameEn
    : null;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index * 0.05}
      className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-orange-500/50 rounded-xl overflow-hidden transition-colors duration-300"
    >
      <Link
        href={`/instructors/${favorite.user.username}` as any}
        className="flex items-center gap-4 p-4"
      >
        {/* Avatar */}
        <UserAvatar
          photoUrl={favorite.photoUrl}
          firstName={favorite.user?.firstName}
          lastName={favorite.user?.lastName}
          size="md"
          alt={fullName}
        />

        {/* Info */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-white truncate">
              {fullName}
            </h4>
            {favorite.verified && (
              <span className="size-3.5 rounded-full bg-orange-500 shrink-0" />
            )}
          </div>
          {primarySpecName && (
            <p className="text-xs text-slate-400 mt-0.5">{primarySpecName}</p>
          )}
          {favorite.city && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
              <MapPin className="size-3" />
              <span>{favorite.city}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        disabled={isRemoving}
        className="absolute top-3 right-3 p-1.5 rounded-full text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        title="Usuń z ulubionych"
        aria-label="Usuń z ulubionych"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </motion.div>
  );
}
