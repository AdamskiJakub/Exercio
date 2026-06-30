"use client";

import { useTranslations } from "next-intl";
import { Heart, MapPin, Trash2 } from "lucide-react";
import { useToggleFavorite } from "@/hooks/useFavorites";
import { getSpecializationNameById } from "@/hooks/useConfig";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { getMediaUrl } from "@/lib/utils/media";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
import { cardVariants } from "@/lib/animations";
import type { FavoriteInstructor } from "@/types";

interface FavoriteTrainersSectionProps {
  favorites: FavoriteInstructor[] | undefined;
  isLoading: boolean;
}

export function FavoriteTrainersSection({
  favorites,
  isLoading,
}: FavoriteTrainersSectionProps) {
  const t = useTranslations("Favorites");
  const locale = useLocale();
  const toggleMutation = useToggleFavorite();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
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
    );
  }

  return (
    <div className="space-y-3">
      {favorites.map((fav: FavoriteInstructor, index: number) => (
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
    </div>
  );
}

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

  const primarySpec = favorite.specializations?.[0];

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
        <div className="size-14 rounded-full overflow-hidden bg-slate-700 shrink-0 border-2 border-slate-600">
          {favorite.photoUrl ? (
            <img
              src={getMediaUrl(favorite.photoUrl)}
              alt={fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg bg-slate-700">
              {fullName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-white truncate">
              {fullName}
            </h4>
            {favorite.verified && (
              <span className="size-3.5 rounded-full bg-orange-500 shrink-0" />
            )}
          </div>
          {primarySpec && (
            <p className="text-xs text-slate-400 mt-0.5">
              {getSpecializationNameById(primarySpec, locale)}
            </p>
          )}
          {favorite.city && (
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
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
      >
        <Trash2 className="size-4" />
      </button>
    </motion.div>
  );
}
