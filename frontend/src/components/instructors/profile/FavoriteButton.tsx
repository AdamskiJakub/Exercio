"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useIsFavorited, useToggleFavorite } from "@/hooks/useFavorites";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "@/i18n/routing";

interface FavoriteButtonProps {
  instructorProfileId: string;
}

export function FavoriteButton({ instructorProfileId }: FavoriteButtonProps) {
  const t = useTranslations("Favorites");
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { data: isFavorited, isLoading: checkLoading } =
    useIsFavorited(instructorProfileId);
  const toggleMutation = useToggleFavorite();

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    toggleMutation.mutate(
      {
        instructorProfileId,
        isFavorited: !!isFavorited,
      },
      {
        onSuccess: (_data, variables) => {
          if (variables.isFavorited) {
            toast.success(t("removedToast"));
          } else {
            toast.success(t("addedToast"));
          }
        },
        onError: () => {
          toast.error(t("errorToast"));
        },
      },
    );
  };

  const isLoading = checkLoading || toggleMutation.isPending;

  return (
    <motion.button
      onClick={handleClick}
      disabled={isLoading}
      whileTap={{ scale: 0.97 }}
      animate={{ scale: isFavorited ? [1, 1.05, 1] : 1 }}
      transition={{ duration: 0.3 }}
      className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all duration-200 border text-sm font-medium ${
        isFavorited
          ? "text-red-400 bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
          : "text-slate-400 bg-transparent border-slate-800 hover:border-orange-500 hover:text-orange-500"
      }`}
    >
      {isLoading ? (
        <div className="size-4 animate-pulse rounded-full bg-slate-600" />
      ) : (
        <Heart
          className={`size-4 transition-all shrink-0 ${
            isFavorited ? "fill-red-500" : ""
          }`}
        />
      )}
      <span>
        {isFavorited ? t("removeFromFavorites") : t("addToFavorites")}
      </span>
    </motion.button>
  );
}
