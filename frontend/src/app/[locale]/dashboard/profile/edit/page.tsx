"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useMyInstructorProfile } from "@/hooks/useMyInstructorProfile";
import { usePublishInstructorProfile } from "@/hooks/usePublishInstructorProfile";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { InstructorProfileForm } from "@/components/instructors/InstructorProfileForm";
import { BottomNavBar } from "@/components/ui/bottom-nav-bar";
import { Eye } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function EditProfilePage() {
  const t = useTranslations("Dashboard");
  const tProfile = useTranslations("InstructorProfile");
  const router = useRouter();
  const { isChecking, user, isAuthenticated } = useAuthGuard({
    requireAuth: true,
    requireRole: "INSTRUCTOR",
  });
  const {
    data: profile,
    isLoading,
    error,
  } = useMyInstructorProfile({
    enabled: isAuthenticated && user?.role === "INSTRUCTOR",
  });
  const { mutate: publishProfile, isPending: isPublishing } =
    usePublishInstructorProfile({ showToast: false });

  // Show loading while checking auth or loading profile
  if (isChecking || isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-400">
          {t("errorLoadingProfile")}: {error.message}
        </div>
      </div>
    );
  }

  const handleBackWithoutSaving = () => {
    if (profile && profile.isDraft) {
      // Use existing publish endpoint to remove draft flag
      publishProfile(profile.id, {
        onSuccess: () => {
          toast.success(tProfile("profileVisibleAgain"));
          router.push("/dashboard");
        },
        onError: (error: any) => {
          toast.error(tProfile("errorPublishing"), {
            description: error.response?.data?.message || error.message,
          });
        },
      });
    } else {
      // Just go back if not draft
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl pb-32">
        <div className="text-center space-y-3 pb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            {t("editProfile")}
          </h1>
          <p className="text-slate-400 text-lg">{t("profileSubtitle")}</p>
        </div>

        {profile?.isDraft && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-8">
            <p className="text-yellow-400 text-sm text-center">
              ⚠️ {tProfile("draftWarning")}
            </p>
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
          {profile && user && (
            <InstructorProfileForm profile={profile} user={user} />
          )}
        </div>
      </div>

      {/* Unified Bottom Navigation */}
      <BottomNavBar
        backText={
          isPublishing
            ? tProfile("cancelling")
            : tProfile("cancelWithoutSaving")
        }
        backHref="/dashboard"
        backOnClick={handleBackWithoutSaving}
        actionButton={{
          text: tProfile("saveAndPreview"),
          type: "submit",
          form: "instructor-profile-form",
          disabled: isPublishing,
          icon: <Eye className="size-5" />,
          variant: "primary",
        }}
      />
    </div>
  );
}
