"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";

interface FollowButtonProps {
  isFollowing: boolean | undefined;
  isLoading: boolean;
  isPending: boolean;
  onToggle: () => void;
  variant?: "default" | "compact";
  colorScheme?: "emerald" | "orange";
}

export function FollowButton({
  isFollowing,
  isLoading,
  isPending,
  onToggle,
  variant = "default",
  colorScheme = "emerald",
}: FollowButtonProps) {
  const t = useTranslations("Follow");

  const followingClasses =
    colorScheme === "orange"
      ? "bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20 hover:border-orange-400 hover:text-orange-300 gap-2"
      : "bg-emerald-950/50 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/60 hover:border-emerald-400 hover:text-emerald-200 gap-2";

  const notFollowingClasses =
    colorScheme === "orange"
      ? "border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white gap-2"
      : "w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg";

  if (isLoading) {
    return (
      <Button
        variant="outline"
        size={variant === "compact" ? "sm" : "default"}
        disabled
        className="border-slate-700 text-slate-400"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  if (isFollowing) {
    return (
      <Button
        variant="outline"
        size={variant === "compact" ? "sm" : "default"}
        onClick={onToggle}
        disabled={isPending}
        className={followingClasses}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <BellOff className="w-4 h-4" />
        )}
        {variant === "compact" ? null : t("following")}
      </Button>
    );
  }

  return (
    <Button
      variant={variant === "compact" ? "outline" : "default"}
      size={variant === "compact" ? "sm" : "default"}
      onClick={onToggle}
      disabled={isPending}
      className={
        variant === "compact"
          ? "border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white gap-2"
          : notFollowingClasses
      }
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Bell className="w-4 h-4" />
      )}
      {variant === "compact" ? null : t("follow")}
    </Button>
  );
}
