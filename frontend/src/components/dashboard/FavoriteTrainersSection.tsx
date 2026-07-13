"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, Building2 } from "lucide-react";
import { useToggleFavorite } from "@/hooks/useFavorites";
import { useToggleFollowEnterprise } from "@/hooks/useFollow";
import { useLocale } from "next-intl";
import { FavoritesContent } from "./FavoritesContent";
import { FollowedContent } from "./FollowedContent";
import type { FavoriteInstructor, FollowedEnterprise } from "@/types";

type FavoritesTab = "favorites" | "followed";

interface FavoriteTrainersSectionProps {
  favorites: FavoriteInstructor[] | undefined;
  isLoading: boolean;
  /** When true, shows tabs to switch between favorites and followed enterprises */
  showFollowedTab?: boolean;
  followedEnterprises?: FollowedEnterprise[] | undefined;
  isFollowedLoading?: boolean;
}

export function FavoriteTrainersSection({
  favorites,
  isLoading,
  showFollowedTab = false,
  followedEnterprises,
  isFollowedLoading,
}: FavoriteTrainersSectionProps) {
  const t = useTranslations("Favorites");
  const tFollow = useTranslations("Follow");
  const locale = useLocale();
  const toggleMutation = useToggleFavorite();
  const toggleFollowMutation = useToggleFollowEnterprise();
  const [activeTab, setActiveTab] = useState<FavoritesTab>("favorites");

  if (showFollowedTab && activeTab === "followed") {
    return (
      <FollowedContent
        enterprises={followedEnterprises}
        isLoading={isFollowedLoading ?? false}
        tFollow={tFollow}
        toggleFollowMutation={toggleFollowMutation}
        onBackToFavorites={() => setActiveTab("favorites")}
      />
    );
  }

  return (
    <FavoritesContent
      favorites={favorites}
      isLoading={isLoading}
      t={t}
      tFollow={tFollow}
      locale={locale}
      toggleMutation={toggleMutation}
      showFollowedTab={showFollowedTab}
      onSwitchToFollowed={() => setActiveTab("followed")}
    />
  );
}
