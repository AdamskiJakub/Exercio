"use client";

import { useTranslations } from "next-intl";
import { Bell, BellOff } from "lucide-react";
import { motion } from "framer-motion";
import {
  useIsFollowingInstructor,
  useToggleFollowInstructor,
} from "@/hooks/useFollow";

interface FollowInstructorButtonProps {
  instructorProfileId: string;
}

export function FollowInstructorButton({
  instructorProfileId,
}: FollowInstructorButtonProps) {
  const t = useTranslations("Follow");
  const { data: isFollowing, isLoading: isCheckLoading } =
    useIsFollowingInstructor(instructorProfileId);
  const toggleMutation = useToggleFollowInstructor();

  const handleToggle = () => {
    toggleMutation.mutate({
      instructorProfileId,
      isFollowing: !!isFollowing,
    });
  };

  const isLoading = isCheckLoading || toggleMutation.isPending;
  const isCurrentlyFollowing = !!isFollowing;

  return (
    <motion.button
      onClick={handleToggle}
      disabled={isLoading}
      whileTap={{ scale: 0.97 }}
      animate={{ scale: isCurrentlyFollowing ? [1, 1.05, 1] : 1 }}
      transition={{ duration: 0.3 }}
      className={`cursor-pointer w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all duration-200 border text-sm font-medium ${
        isCurrentlyFollowing
          ? "text-orange-400 bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20"
          : "text-slate-400 bg-transparent border-slate-800 hover:border-orange-500 hover:text-orange-500"
      }`}
    >
      {isLoading ? (
        <div className="size-4 animate-pulse rounded-full bg-slate-600" />
      ) : isCurrentlyFollowing ? (
        <BellOff className="size-4 shrink-0" />
      ) : (
        <Bell className="size-4 shrink-0" />
      )}
      <span>{isCurrentlyFollowing ? t("following") : t("follow")}</span>
    </motion.button>
  );
}
