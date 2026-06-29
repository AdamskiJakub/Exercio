"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useMyInstructorProfile } from "@/hooks/useMyInstructorProfile";
import { usePublishInstructorProfile } from "@/hooks/usePublishInstructorProfile";
import { useAuthStore } from "@/stores/auth-store";
import { InstructorCard } from "@/components/instructors/instructor-card";
import { NewPublicInstructorProfile } from "@/components/instructors/profile/NewPublicInstructorProfile";
import { BottomNavBar } from "@/components/ui/bottom-nav-bar";
import { Eye, LayoutGrid, User } from "lucide-react";

export default function PreviewProfilePage() {
  const t = useTranslations("InstructorProfile");
  const tDash = useTranslations("Dashboard");
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const {
    data: profile,
    isLoading,
    error,
  } = useMyInstructorProfile({
    enabled: isAuthenticated && user?.role === "INSTRUCTOR",
  });
  const { mutate: publishProfile, isPending: isPublishing } =
    usePublishInstructorProfile();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "INSTRUCTOR") {
      router.push("/dashboard");
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "INSTRUCTOR") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-300">{tDash("loadingProfile")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-400">
          {tDash("errorLoadingProfile")}: {error.message}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400">{t("profileNotFound")}</div>
      </div>
    );
  }

  const handlePublish = () => {
    publishProfile(profile.id, {
      onSuccess: () => {
        router.push("/dashboard");
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl pb-32">
        {/* Header */}
        <div className="mb-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Eye className="size-8 text-orange-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {t("previewTitle")}
            </h1>
          </div>
          <p className="text-slate-400 text-lg">{t("previewSubtitle")}</p>
        </div>

        {profile.isDraft && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-8">
            <p className="text-yellow-400 text-sm text-center">
              ⚠️ {t("draftWarning")}
            </p>
          </div>
        )}

        {/* SECTION 1: Listing Card Preview */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <LayoutGrid className="size-6 text-orange-500" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {t("listingCardPreview")}
            </h2>
          </div>

          <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6">
            <InstructorCard instructor={profile} disableLink />
          </div>
        </div>

        {/* SECTION 2: Full Profile Page Preview */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <User className="size-6 text-orange-500" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {t("profilePagePreview")}
            </h2>
          </div>

          <NewPublicInstructorProfile
            profile={profile}
            isPreview={true}
            isOwnProfile={true}
          />
        </div>
      </div>

      {/* Unified Bottom Navigation */}
      <BottomNavBar
        backText={t("backToEdit")}
        backHref="/dashboard/profile/edit"
        actionButton={{
          text: isPublishing ? t("publishing") : `🚀 ${t("publishProfile")}`,
          onClick: handlePublish,
          disabled: isPublishing,
          variant: "primary",
        }}
      />
    </div>
  );
}
