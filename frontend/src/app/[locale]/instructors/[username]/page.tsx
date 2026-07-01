"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { InstructorProfile } from "@/types";
import { NewPublicInstructorProfile } from "@/components/instructors/profile/NewPublicInstructorProfile";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useTrackProfileView } from "@/hooks/useRecentlyViewed";

export default function InstructorPublicProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const username = params?.username as string;
  const source = searchParams.get("from");
  const { user, isAuthenticated } = useAuthStore();
  const tProfile = useTranslations("InstructorProfile");
  const trackView = useTrackProfileView();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<InstructorProfile>({
    queryKey: ["instructor", username],
    queryFn: async () => {
      const response = await apiClient.get(`/instructor-profiles/${username}`);
      return response.data;
    },
    enabled: !!username,
  });

  useEffect(() => {
    if (profile?.isDraft) {
      router.push("/instructors");
    }
  }, [profile, router]);

  // Track profile view when authenticated user views an instructor profile
  // Skip if the viewer is the profile owner (instructor viewing their own profile)
  useEffect(() => {
    if (profile && isAuthenticated && !profile.isDraft) {
      const isOwnProfile =
        user?.role === "INSTRUCTOR" && profile.user?.id === user.id;
      if (!isOwnProfile) {
        trackView.mutate(profile.id);
      }
    }
  }, [profile?.id, isAuthenticated, user?.id, user?.role]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">
            {tProfile("instructorNotFound")}
          </h1>
          <p className="text-slate-400">
            {tProfile("instructorNotFoundDescription")}
          </p>
          <button
            onClick={() => router.push("/instructors")}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
          >
            {tProfile("backToInstructors")}
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile =
    isAuthenticated &&
    user?.role === "INSTRUCTOR" &&
    profile.user?.id === user.id;

  return (
    <div className="min-h-screen bg-slate-950 pb-32">
      <div className="container mx-auto px-4 pt-12 pb-4 max-w-7xl">
        <NewPublicInstructorProfile
          profile={profile}
          isPreview={false}
          source={source}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </div>
  );
}
