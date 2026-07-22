"use client";

import { Heart, Trash2, Building2, ChevronDown, ChevronUp } from "lucide-react";
import { useToggleFavorite } from "@/hooks/useFavorites";
import { Link } from "@/i18n/routing";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { InstructorCard } from "@/components/ui/instructor-card";
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
  onRemove,
  isRemoving,
}: {
  favorite: FavoriteInstructor;
  index: number;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index * 0.05}
    >
      <InstructorCard
        instructor={{
          username: favorite.user.username,
          firstName: favorite.user.firstName,
          lastName: favorite.user.lastName,
          photoUrl: favorite.photoUrl,
          specializations: favorite.specializations,
          city: favorite.city,
        }}
        avatarSize="md"
        action={
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
            disabled={isRemoving}
            className="p-1.5 rounded-full text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Usuń z ulubionych"
            aria-label="Usuń z ulubionych"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        }
      />
    </motion.div>
  );
}
